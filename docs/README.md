# 📚 Documentation FixMyPidge

Cette documentation complète couvre tous les aspects du projet FixMyPidge, de l'architecture technique au déploiement en production.

## 🗂️ Structure de la documentation

### 📖 [Guide utilisateur](./user/)
- **[Guide de démarrage](./user/getting-started.md)** - Première utilisation de l'application
- **[Créer un signalement](./user/creating-reports.md)** - Guide pas à pas
- **[Suivre ses signalements](./user/tracking-reports.md)** - Dashboard et conversations
- **[Installation PWA](./user/pwa-installation.md)** - Installation sur mobile/desktop
- **[FAQ utilisateur](./user/faq.md)** - Questions fréquentes

### 🔧 [Documentation technique](./technical/)
- **[Architecture générale](./technical/architecture.md)** - Vue d'ensemble du système
- **[Base de données](./technical/database.md)** - Schéma et relations
- **[API Reference](./technical/api.md)** - Endpoints et webhooks
- **[Authentification](./technical/authentication.md)** - Supabase Auth flows
- **[États et stores](./technical/state-management.md)** - Zustand stores
- **[Composants](./technical/components.md)** - Architecture frontend
- **[Types TypeScript](./technical/types.md)** - Interfaces et types

### 🏗️ [Déploiement](./deployment/)
- **[Configuration environnement](./deployment/environment.md)** - Variables et secrets
- **[Docker](./deployment/docker.md)** - Build et déploiement conteneurisé
- **[ServerLab Integration](./deployment/serverlab.md)** - Infrastructure partagée
- **[Supabase Setup](./deployment/supabase.md)** - Configuration base de données
- **[Monitoring](./deployment/monitoring.md)** - Logs et métriques

### ⚙️ [Administration](./admin/)
- **[Configuration n8n](./admin/n8n-setup.md)** - Workflows automatisés
- **[Gestion des experts](./admin/expert-management.md)** - Workflow Telegram
- **[Modération](./admin/moderation.md)** - Gestion des signalements
- **[Maintenance](./admin/maintenance.md)** - Opérations récurrentes
- **[Backup & Recovery](./admin/backup.md)** - Stratégies de sauvegarde

### 🚀 [Guide de développement](./technical/development.md)
- **[Setup local](./technical/development.md#setup-local)** - Environnement de dev
- **[Standards de code](./technical/development.md#standards)** - Conventions et bonnes pratiques
- **[Tests](./technical/development.md#tests)** - Stratégie de test
- **[Contribution](./technical/development.md#contribution)** - Workflow Git
- **[Debugging](./technical/development.md#debugging)** - Outils de débogage

---

## 🎯 Documentation par rôle

### 👨‍💻 **Développeurs**
1. [Architecture technique](./technical/architecture.md)
2. [Guide de développement](./technical/development.md)
3. [API Reference](./technical/api.md)
4. [Déploiement Docker](./deployment/docker.md)

### 🔧 **Administrateurs système**
1. [ServerLab Integration](./deployment/serverlab.md)
2. [Configuration environnement](./deployment/environment.md)
3. [Monitoring](./deployment/monitoring.md)
4. [Backup & Recovery](./admin/backup.md)

### 📊 **Administrateurs métier**
1. [Configuration n8n](./admin/n8n-setup.md)
2. [Gestion des experts](./admin/expert-management.md)
3. [Modération](./admin/moderation.md)
4. [FAQ utilisateur](./user/faq.md)

### 👥 **Utilisateurs finaux**
1. [Guide de démarrage](./user/getting-started.md)
2. [Créer un signalement](./user/creating-reports.md)
3. [Installation PWA](./user/pwa-installation.md)
4. [FAQ](./user/faq.md)

---

## 📋 Index des ressources

### 🔗 Liens rapides
- **Application** : https://fixmypidge.robotsinlove.be
- **Dashboard admin** : https://portainer.robotsinlove.be
- **n8n Workflows** : https://n8n.robotsinlove.be
- **Repository** : https://github.com/gillespinault/FixMYPidge

### 📞 Support et maintenance
- **Issues GitHub** : [Créer un ticket](https://github.com/gillespinault/FixMYPidge/issues)
- **Documentation mise à jour** : Cette documentation est maintenue avec le code
- **Contact technique** : Via les issues GitHub ou signalement dans l'app

---

## 📝 Conventions de documentation

### Structure des fichiers
```
docs/
├── README.md                    # Index général (ce fichier)
├── user/                        # Documentation utilisateur
├── technical/                   # Documentation technique
├── deployment/                  # Guides de déploiement
├── admin/                       # Documentation administration
└── assets/                      # Images et diagrammes
```

### Maintenance
- **Mise à jour** : Documentation maintenue avec les évolutions du code
- **Versioning** : Suit le versioning de l'application
- **Validation** : Vérification lors des pull requests
- **Format** : Markdown avec standards GitHub

---

*Dernière mise à jour : 6 septembre 2025*