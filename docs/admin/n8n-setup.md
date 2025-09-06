# 🤖 Configuration n8n - FixMyPidge

## Vue d'ensemble

n8n est le cœur de l'automatisation FixMyPidge. Il gère la communication entre l'application et les experts via Telegram, permettant une flexibilité maximale des workflows sans redéploiement de code.

## 🎯 Architecture des workflows

### Principe de fonctionnement
```
📱 FixMyPidge → 🪝 Webhook → 🤖 n8n → 📨 Telegram (Experts)
                                    ↓
📧 Notification ← 🪝 Webhook ← 🤖 n8n ← 💬 Réponse Expert
```

### Workflows principaux
1. **Nouveau signalement** : FixMyPidge → n8n → Telegram experts
2. **Réponse expert** : Telegram → n8n → FixMyPidge
3. **Mise à jour statut** : Automatique selon interactions
4. **Notifications utilisateur** : Email/Push selon événements

## 🛠️ Configuration initiale

### Prérequis ServerLab
- **n8n instance** : https://n8n.robotsinlove.be
- **Bot Telegram** : Token configuré dans n8n
- **Groupe experts** : Chat ID Telegram configuré
- **Accès Supabase** : Connexion base de données

### Variables d'environnement n8n
```javascript
// Configuration dans n8n Settings > Environment Variables
TELEGRAM_BOT_TOKEN=1234567890:ABCDEF...  // Token bot Telegram
EXPERTS_GROUP_ID=-1001234567890          // ID groupe experts
SUPABASE_URL=http://127.0.0.1:54321      // URL Supabase local
SUPABASE_SERVICE_KEY=eyJhbG...           // Service role key
FIXMYPIDGE_WEBHOOK_SECRET=fixmypidge-webhook-secret-2025
FIXMYPIDGE_APP_URL=https://fixmypidge.robotsinlove.be
```

## 📥 Workflow 1 : Nouveau signalement

### Déclencheur : Webhook FixMyPidge
```json
// POST https://n8n.robotsinlove.be/webhook/fixmypidge-case-created
{
  "event": "case_created",
  "case_id": "uuid-case-123",
  "case": {
    "id": "uuid-case-123",
    "title": "Pigeon blessé rue de la Paix",
    "description": "Pigeon avec aile pendante, immobile depuis 2h",
    "address": "Rue de la Paix, 1000 Bruxelles",
    "category": "blessure_aile",
    "created_at": "2025-09-06T14:30:00Z"
  }
}
```

### Configuration du workflow

#### Node 1 : Webhook Trigger
```json
{
  "name": "Webhook - Nouveau Cas",
  "type": "webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "/webhook/fixmypidge-case-created",
    "authentication": "headerAuth",
    "headerAuth": {
      "name": "X-Webhook-Secret",
      "value": "={{$env.FIXMYPIDGE_WEBHOOK_SECRET}}"
    }
  }
}
```

#### Node 2 : Validation données
```javascript
// Code Node - Validation
const caseData = $json.case;

if (!caseData || !caseData.id || !caseData.title) {
  throw new Error('Données de signalement invalides');
}

// Formatage pour Telegram
const telegramMessage = `🆕 <b>Nouveau signalement</b>

📋 <b>${caseData.title}</b>
📍 ${caseData.address || 'Localisation non précisée'}
📝 ${caseData.description || 'Pas de description'}
🏷️ Catégorie: ${translateCategory(caseData.category)}
⏰ ${new Date(caseData.created_at).toLocaleString('fr-BE')}

🔗 <a href="${process.env.FIXMYPIDGE_APP_URL}/case/${caseData.id}">Voir le détail</a>

<i>Répondez dans ce groupe pour aider le citoyen</i>`;

function translateCategory(category) {
  const categories = {
    'blessure_aile': '🦅 Blessure à l\'aile',
    'blessure_patte': '🦶 Blessure à la patte',
    'emmele': '🕸️ Emmêlé (fils/filets)',
    'comportement_anormal': '🤔 Comportement anormal',
    'oisillon': '🐣 Oisillon trouvé',
    'autre': '❓ Autre situation'
  };
  return categories[category] || '❓ Non classifié';
}

return {
  case_id: caseData.id,
  telegram_message: telegramMessage,
  telegram_parse_mode: 'HTML'
};
```

#### Node 3 : Envoi Telegram
```json
{
  "name": "Telegram - Notifier Experts",
  "type": "telegram",
  "parameters": {
    "operation": "sendMessage",
    "chatId": "={{$env.EXPERTS_GROUP_ID}}",
    "text": "={{$json.telegram_message}}",
    "parseMode": "HTML",
    "disableWebPagePreview": true
  }
}
```

#### Node 4 : Mise à jour statut
```json
{
  "name": "Supabase - Update Status",
  "type": "supabase",
  "parameters": {
    "operation": "update",
    "table": "cases",
    "updateFields": {
      "status": "en_cours",
      "updated_at": "={{new Date().toISOString()}}"
    },
    "filterType": "manual",
    "conditions": {
      "id": "={{$('Webhook - Nouveau Cas').first().json.case.id}}"
    }
  }
}
```

## 📤 Workflow 2 : Réponse expert

### Déclencheur : Message Telegram
```javascript
// Node Telegram Trigger
{
  "name": "Telegram - Messages Groupe",
  "type": "telegramTrigger",
  "parameters": {
    "operation": "message",
    "updates": ["message"]
  }
}
```

### Configuration du workflow

#### Node 1 : Filtrage messages experts
```javascript
// Code Node - Filtre Expert
const message = $json;

// Ignore les messages du bot lui-même
if (message.from.is_bot) {
  return null;
}

// Ignore si pas dans le groupe experts
if (message.chat.id.toString() !== process.env.EXPERTS_GROUP_ID) {
  return null;
}

// Ignore les commandes système
if (message.text && message.text.startsWith('/')) {
  return null;
}

// Recherche référence à un cas dans le message
const caseUrlMatch = message.text?.match(/\/case\/([a-f0-9-]{36})/);
if (!caseUrlMatch && !message.reply_to_message) {
  // Message général, pas de réponse à un cas spécifique
  return null;
}

let case_id = null;

if (caseUrlMatch) {
  case_id = caseUrlMatch[1];
} else if (message.reply_to_message) {
  // Extraction case_id du message original
  const originalUrlMatch = message.reply_to_message.text?.match(/\/case\/([a-f0-9-]{36})/);
  if (originalUrlMatch) {
    case_id = originalUrlMatch[1];
  }
}

if (!case_id) {
  return null;
}

return {
  case_id: case_id,
  expert_message: message.text,
  expert_name: message.from.first_name || message.from.username || 'Expert',
  expert_id: message.from.id.toString(),
  telegram_message_id: message.message_id
};
```

#### Node 2 : Vérification cas existant
```json
{
  "name": "Supabase - Vérifier Cas",
  "type": "supabase", 
  "parameters": {
    "operation": "select",
    "table": "cases",
    "filterType": "manual",
    "conditions": {
      "id": "={{$json.case_id}}"
    }
  }
}
```

#### Node 3 : Ajout message expert
```json
{
  "name": "Supabase - Ajouter Message",
  "type": "supabase",
  "parameters": {
    "operation": "insert",
    "table": "messages",
    "data": {
      "case_id": "={{$('Code - Filtre Expert').first().json.case_id}}",
      "content": "={{$('Code - Filtre Expert').first().json.expert_message}}",
      "sender_type": "expert",
      "sender_id": "={{$('Code - Filtre Expert').first().json.expert_id}}"
    }
  }
}
```

#### Node 4 : Mise à jour statut cas
```json
{
  "name": "Supabase - Update Statut Répondu",
  "type": "supabase",
  "parameters": {
    "operation": "update", 
    "table": "cases",
    "updateFields": {
      "status": "repondu",
      "updated_at": "={{new Date().toISOString()}}"
    },
    "filterType": "manual",
    "conditions": {
      "id": "={{$('Code - Filtre Expert').first().json.case_id}}"
    }
  }
}
```

#### Node 5 : Webhook vers FixMyPidge
```json
{
  "name": "HTTP - Notifier FixMyPidge",
  "type": "httpRequest",
  "parameters": {
    "method": "POST",
    "url": "{{$env.FIXMYPIDGE_APP_URL}}/api/webhooks/n8n-response",
    "headers": {
      "Content-Type": "application/json",
      "X-Webhook-Secret": "{{$env.FIXMYPIDGE_WEBHOOK_SECRET}}"
    },
    "body": {
      "event": "expert_message",
      "case_id": "={{$('Code - Filtre Expert').first().json.case_id}}",
      "message": {
        "content": "={{$('Code - Filtre Expert').first().json.expert_message}}",
        "expert_id": "={{$('Code - Filtre Expert').first().json.expert_id}}",
        "expert_name": "={{$('Code - Filtre Expert').first().json.expert_name}}"
      },
      "status_update": "repondu"
    }
  }
}
```

## 📨 Workflow 3 : Message utilisateur

### Déclencheur : Webhook FixMyPidge
```json
// POST https://n8n.robotsinlove.be/webhook/fixmypidge-message-sent
{
  "event": "message_sent",
  "case_id": "uuid-case-123", 
  "message_id": "uuid-message-456",
  "message": {
    "id": "uuid-message-456",
    "content": "L'oiseau semble aller mieux, il bouge un peu plus",
    "sender_type": "user",
    "created_at": "2025-09-06T16:30:00Z"
  }
}
```

### Configuration du workflow

#### Node 1 : Webhook Message Utilisateur
```json
{
  "name": "Webhook - Message Utilisateur",
  "type": "webhook",
  "parameters": {
    "httpMethod": "POST",
    "path": "/webhook/fixmypidge-message-sent",
    "authentication": "headerAuth",
    "headerAuth": {
      "name": "X-Webhook-Secret",
      "value": "={{$env.FIXMYPIDGE_WEBHOOK_SECRET}}"
    }
  }
}
```

#### Node 2 : Récupération détails cas
```json
{
  "name": "Supabase - Détails Cas",
  "type": "supabase",
  "parameters": {
    "operation": "select",
    "table": "cases", 
    "filterType": "manual",
    "conditions": {
      "id": "={{$json.case_id}}"
    }
  }
}
```

#### Node 3 : Formatage message Telegram
```javascript
// Code Node - Format Message
const messageData = $('Webhook - Message Utilisateur').first().json.message;
const caseData = $('Supabase - Détails Cas').first().json[0];

const telegramMessage = `💬 <b>Message utilisateur</b>

📋 Cas: <b>${caseData.title}</b>
👤 Message: ${messageData.content}
⏰ ${new Date(messageData.created_at).toLocaleString('fr-BE')}

🔗 <a href="${process.env.FIXMYPIDGE_APP_URL}/case/${caseData.id}">Voir la conversation</a>

<i>Répondez pour continuer l'accompagnement</i>`;

return {
  telegram_message: telegramMessage,
  case_id: caseData.id
};
```

#### Node 4 : Envoi Telegram
```json
{
  "name": "Telegram - Message Groupe",
  "type": "telegram",
  "parameters": {
    "operation": "sendMessage",
    "chatId": "={{$env.EXPERTS_GROUP_ID}}",
    "text": "={{$json.telegram_message}}",
    "parseMode": "HTML",
    "disableWebPagePreview": true
  }
}
```

## 🔧 Commandes experts Telegram

### Commandes disponibles
```
/help - Afficher l'aide
/status - Statistiques des signalements
/cas <id> - Afficher détails d'un cas  
/resolu <id> - Marquer un cas comme résolu
/fermer <id> - Fermer définitivement un cas
```

### Workflow commandes

#### Node 1 : Détection commandes
```javascript
// Code Node - Parser Commandes
const message = $json;

if (!message.text || !message.text.startsWith('/')) {
  return null;
}

const parts = message.text.split(' ');
const command = parts[0].toLowerCase();
const args = parts.slice(1);

const commands = {
  '/help': { action: 'help' },
  '/status': { action: 'status' },
  '/cas': { action: 'case_detail', case_id: args[0] },
  '/resolu': { action: 'resolve_case', case_id: args[0] },
  '/fermer': { action: 'close_case', case_id: args[0] }
};

if (!commands[command]) {
  return null;
}

return {
  command: command,
  action: commands[command].action,
  case_id: commands[command].case_id,
  expert_id: message.from.id.toString(),
  expert_name: message.from.first_name || message.from.username
};
```

#### Switch selon action
Utiliser un **Switch node** pour router selon `$json.action`.

## 📊 Monitoring et logs

### Métriques importantes
```javascript
// Node Code - Métriques
// À exécuter périodiquement (cron)

// Récupération statistiques
const stats = await fetch(`${process.env.SUPABASE_URL}/rest/v1/cases?select=status,created_at&created_at=gte.${getToday()}`, {
  headers: {
    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
    'apikey': process.env.SUPABASE_SERVICE_KEY
  }
}).then(r => r.json());

const summary = {
  total_today: stats.length,
  nouveau: stats.filter(c => c.status === 'nouveau').length,
  en_cours: stats.filter(c => c.status === 'en_cours').length,
  repondu: stats.filter(c => c.status === 'repondu').length,
  resolu: stats.filter(c => c.status === 'resolu').length
};

function getToday() {
  return new Date().toISOString().split('T')[0];
}

return { daily_stats: summary };
```

### Alertes automatiques
- **Pas de réponse > 2h** : Alerte dans groupe Telegram
- **Erreur webhook** : Notification admin
- **Volume inhabituel** : Alerte si >20 signalements/jour

## 🚨 Gestion des erreurs

### Retry automatique
```json
{
  "settings": {
    "errorWorkflow": {
      "workflowId": "error-handler-workflow"
    },
    "retryOnFailure": {
      "enabled": true,
      "maxTries": 3,
      "waitBetweenTries": 1000
    }
  }
}
```

### Logs d'erreurs
Toutes les erreurs sont loggées avec contexte :
- Timestamp
- Workflow concerné  
- Données d'entrée
- Message d'erreur
- Stack trace

## 🔄 Évolutions workflows

### Phase 2 - Améliorations
- **Classification automatique** : IA pour catégoriser les signalements
- **Routage intelligent** : Expert spécialisé selon catégorie
- **Notifications SMS** : Urgences via SMS
- **Integration calendrier** : Suivi rendez-vous vétérinaires

### Phase 3 - Intelligence
- **Chatbot initial** : Première réponse automatique
- **Apprentissage** : Amélioration réponses selon historique
- **Prédiction** : Identification signalements urgents
- **Multi-canal** : WhatsApp, Facebook Messenger

---

## 📞 Support technique n8n

### Troubleshooting
1. **Vérifier variables** d'environnement
2. **Tester webhooks** manuellement
3. **Consulter logs** d'exécution
4. **Valider permissions** Supabase et Telegram

### Contacts
- **Documentation n8n** : https://docs.n8n.io
- **Community** : https://community.n8n.io
- **ServerLab admin** : Via Portainer ou admin-cli

---

*Configuration maintenue par l'équipe technique FixMyPidge*