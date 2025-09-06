# FixMyPidge 🐦

**Application PWA citoyenne pour signaler et soigner les pigeons urbains en détresse.**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple)](https://web.dev/progressive-web-apps/)

## 🎯 Vision

FixMyPidge responsabilise le citoyen comme premier maillon de la chaîne de soins pour les oiseaux urbains en détresse. L'application agit comme un portail structuré et un canal de communication direct avec les experts, transformant une situation de détresse en action citoyenne guidée.

## 🏗️ Architecture technique

- **Frontend**: Next.js 14 (App Router) + PWA + TypeScript
- **Base de données**: Supabase (PostgreSQL avec PostGIS)
- **Authentification**: Supabase Auth (obligatoire, pas de signalement anonyme)
- **Stockage**: Supabase Storage (photos)
- **Géolocalisation**: API Géolocation + Mapbox (futur)
- **État global**: Zustand
- **Styling**: Tailwind CSS + Headless UI
- **Backend workflow**: n8n (intégration ServerLab)

### Architecture des données

```sql
-- Utilisateurs : Table auth.users (Supabase Auth)
-- Signalements
CREATE TABLE cases (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  location GEOGRAPHY(POINT),  -- PostGIS
  address TEXT,
  status case_status DEFAULT 'nouveau',
  category case_category,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Messages de conversation  
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  content TEXT NOT NULL,
  sender_type sender_type NOT NULL, -- 'user' | 'expert'
  sender_id TEXT,
  created_at TIMESTAMPTZ
);

-- Photos des signalements
CREATE TABLE case_photos (
  id UUID PRIMARY KEY,
  case_id UUID REFERENCES cases(id),
  message_id UUID REFERENCES messages(id),
  photo_url TEXT NOT NULL,
  created_at TIMESTAMPTZ
);
```

### Workflow avec n8n

```
📱 FixMyPidge → 🔗 Webhook → 🤖 n8n → 📨 Telegram (experts)
     ↑                                           ↓
📧 Notification ← 🔗 Webhook ← 🤖 n8n ← 💬 Réponse expert
```

## 🚀 Installation et développement

### Prérequis
- Node.js 18+
- Docker (déploiement)
- Supabase CLI (si développement local)

### Installation rapide
```bash
git clone https://github.com/gillespinault/FixMYPidge.git
cd FixMYPidge
npm install
```

### Configuration
Copier `.env.local` et configurer :
```bash
# Supabase (utilise le stack CLI local ServerLab)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Géolocalisation (futur)
NEXT_PUBLIC_MAPBOX_API_TOKEN=your_mapbox_token

# Intégration n8n (ServerLab)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n.robotsinlove.be/webhook/fixmypidge
N8N_WEBHOOK_SECRET=fixmypidge-webhook-secret-2025
```

### Développement
```bash
npm run dev    # http://localhost:3000
npm run build  # Test de production
npm run start  # Serveur production
```

## 🐳 Déploiement (Production ServerLab)

### Déploiement Docker
```bash
# Build image locale
docker build -t fixmypidge:latest .

# Déploiement via Docker Compose
cd /workspace/projects
COMPOSE_PROJECT_NAME=serverlab-projects docker compose up -d fixmypidge
```

### URLs d'accès
- **Développement** : http://localhost:3000
- **Interne ServerLab** : http://192.168.1.3:8040
- **Production publique** : https://fixmypidge.robotsinlove.be

## 📱 Fonctionnalités MVP

### ✅ Implémenté
- **Authentification** : Inscription/connexion obligatoire Supabase Auth
- **Dashboard** : Liste personnalisée des signalements utilisateur
- **Création signalement** : Formulaire + géolocalisation + photos
- **Conversation** : Chat temps réel avec experts via n8n/Telegram
- **PWA** : Installation mobile, notifications, mode hors ligne

### 🔄 En développement
- **Géolocalisation avancée** : Intégration Mapbox Interactive
- **Notifications push** : PWA Push API
- **Upload photos avancé** : Drag & drop, redimensionnement
- **Statuts temps réel** : Supabase Realtime subscriptions

## 🤝 Parcours utilisateur

### Utilisateur (Protecteur Citoyen)
1. **Découverte** → Trouve un pigeon blessé
2. **Installation** → PWA depuis navigateur mobile
3. **Inscription** → Email + mot de passe (obligatoire)
4. **Signalement** → Formulaire + photos + localisation
5. **Suivi** → Conversation avec expert via l'app
6. **Résolution** → Statut mis à jour automatiquement

### Expert (Backend)
1. **Notification** → Reçoit cas via Telegram
2. **Analyse** → Examine photos et description
3. **Réponse** → Conseils via Telegram (relayés dans l'app)
4. **Suivi** → Conversation bidirectionnelle
5. **Clôture** → Marque le cas comme résolu

## 🛠️ Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── auth/              # Authentification (signin/signup)
│   ├── dashboard/         # Liste des signalements
│   ├── case/              # Détail + création signalements
│   └── api/               # API routes (webhooks n8n)
├── components/            # Composants réutilisables
├── store/                 # États Zustand
├── lib/                   # Utilitaires (Supabase)
└── types/                 # Types TypeScript
```

## 🔐 Sécurité

- **Row Level Security (RLS)** : Isolation des données par utilisateur
- **Webhooks sécurisés** : Secrets partagés avec n8n
- **RGPD compliant** : Données minimales + droit à l'oubli

---

## 📚 Documentation complète

### Guide par utilisateur
- **👥 Utilisateurs** : [Guide de démarrage](./docs/user/getting-started.md) → [FAQ](./docs/user/faq.md)
- **👨‍💻 Développeurs** : [Guide développement](./docs/technical/development.md) → [Architecture](./docs/technical/architecture.md) 
- **🔧 Administrateurs** : [Configuration n8n](./docs/admin/n8n-setup.md) → [Déploiement Docker](./docs/deployment/docker.md)

### Index complet
📋 **[Documentation centrale](./docs/README.md)** - Point d'entrée vers toute la documentation

## 🤝 Contribution

Nous accueillons toutes les contributions ! Consultez le [Guide de contribution](./CONTRIBUTING.md) pour :
- 🐛 Reporter des bugs
- 💡 Proposer des améliorations  
- 🔧 Contribuer au code
- 📝 Améliorer la documentation

### Quick start contributeurs
```bash
git clone https://github.com/gillespinault/FixMYPidge.git
cd FixMYPidge
npm install
cp .env.local.example .env.local
npm run dev
```

## 🏆 Équipe

### Mainteneurs
- **[gillespinault](https://github.com/gillespinault)** - Creator & Lead Developer
- **Claude Code** - AI Assistant & Documentation

### Contributeurs
_Rejoignez notre hall of fame en contribuant !_

## 📞 Support

- **🐛 Bug reports** : [GitHub Issues](https://github.com/gillespinault/FixMYPidge/issues)
- **💡 Feature requests** : [GitHub Issues](https://github.com/gillespinault/FixMYPidge/issues) avec label `enhancement`
- **📖 Documentation** : [Guides complets](./docs/)
- **❓ Questions** : [GitHub Discussions](https://github.com/gillespinault/FixMYPidge/discussions)

## 📊 Statut du projet

- **Version** : 1.0.0-MVP  
- **Statut** : 🟡 Développement actif
- **Tests** : 🔄 En cours d'implémentation
- **Documentation** : ✅ Complète
- **Production** : 🚀 Prêt pour déploiement

---

**🐦 Ensemble, sauvons les pigeons urbains !**

*FixMyPidge - Application citoyenne développée avec ❤️ pour nos oiseaux urbains*