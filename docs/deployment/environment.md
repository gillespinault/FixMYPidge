# ⚙️ Configuration environnement - FixMyPidge

## 🎯 Vue d'ensemble

FixMyPidge utilise des variables d'environnement pour la configuration selon les environnements (développement, staging, production). Cette approche respecte les bonnes pratiques "12-factor app".

## 🏗️ Fichiers de configuration

### Structure des fichiers
```
fixmypidge/
├── .env.local          # Développement local (non commité)
├── .env.example        # Template avec variables factices
├── .env.production     # Production (optionnel, via Docker)
└── .env.test           # Tests (optionnel)
```

## 📋 Variables d'environnement

### Application Core
```bash
# Mode d'exécution
NODE_ENV=production|development|test

# URL publique de l'application
NEXT_PUBLIC_APP_URL=https://fixmypidge.robotsinlove.be

# Configuration HTTPS (pour reverse proxy)
URL=https://fixmypidge.robotsinlove.be
FORCE_HTTPS=false  # nginx gère SSL en amont

# Configuration Next.js
NEXT_TELEMETRY_DISABLED=1
```

### Supabase Backend
```bash
# URL publique Supabase (accessible côté client)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321

# Clé anonyme publique (safe côté client)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0

# Clé service role (SENSIBLE - serveur uniquement)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# Base de données directe (optionnel)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

### Intégration n8n
```bash
# URL webhook n8n (accessible côté client pour les calls)
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n.robotsinlove.be/webhook/fixmypidge

# Secret partagé pour sécuriser webhooks (SENSIBLE)
N8N_WEBHOOK_SECRET=fixmypidge-webhook-secret-2025
```

### Services partagés ServerLab (optionnel)
```bash
# Redis pour cache/sessions (futures fonctionnalités)
REDIS_URL=redis://nocodb-redis:6379/4
FIXMYPIDGE_REDIS_URL=redis://nocodb-redis:6379/4

# MinIO pour stockage objet (alternative à Supabase Storage)
MINIO_ENDPOINT=http://budibase-minio:9000
MINIO_ACCESS_KEY=budibase
MINIO_SECRET_KEY=budibase-minio-2025

# Base de données PostgreSQL partagée (alternative à Supabase)
FIXMYPIDGE_DATABASE_URL=postgresql://n8n:VnBGMrU9LuJupjrXuUWagMjmao2gVotAKfsAZ%2Fvp2D4%3D@postgres:5432/n8n?schema=fixmypidge&sslmode=disable
```

### Email et notifications
```bash
# Configuration SMTP (via Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@robotsinlove.be
SMTP_PASS=${GMAIL_APP_PASSWORD}  # App password Gmail

# Configuration Gmail spécifique
GMAIL_APP_PASSWORD=zzlf yzwu trhz axwu
```

### Géolocalisation (futur)
```bash
# Mapbox pour cartes interactives
NEXT_PUBLIC_MAPBOX_API_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsb3NlZGFjY291bnQifQ.example

# Alternative OpenStreetMap (gratuit)
NEXT_PUBLIC_OSM_TILE_SERVER=https://tile.openstreetmap.org/{z}/{x}/{y}.png
```

### Monitoring et analytics (futur)
```bash
# Sentry pour error tracking
SENTRY_DSN=https://key@organization.ingest.sentry.io/project

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Posthog pour product analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## 🏠 Configuration par environnement

### Développement local (.env.local)
```bash
# Configuration développement
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase local (via CLI ServerLab)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU

# n8n développement
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/fixmypidge-dev
N8N_WEBHOOK_SECRET=dev-secret-123

# Désactiver télémétrie
NEXT_TELEMETRY_DISABLED=1
```

### Production ServerLab
```bash
# Configuration production
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://fixmypidge.robotsinlove.be
URL=https://fixmypidge.robotsinlove.be
FORCE_HTTPS=false

# Supabase production (via CLI stack ServerLab)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}

# n8n production
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n.robotsinlove.be/webhook/fixmypidge
N8N_WEBHOOK_SECRET=${FIXMYPIDGE_N8N_SECRET}

# Services partagés
REDIS_URL=redis://nocodb-redis:6379/4
SMTP_HOST=smtp.gmail.com
SMTP_PASS=${GMAIL_APP_PASSWORD}

# Optimisations production
NEXT_TELEMETRY_DISABLED=1
```

### Test/CI (.env.test)
```bash
# Configuration tests
NODE_ENV=test
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Supabase test (base dédiée ou mock)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key
SUPABASE_SERVICE_ROLE_KEY=test-service-key

# n8n mock pour tests
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:3001/mock/webhook
N8N_WEBHOOK_SECRET=test-secret

# Désactiver services externes
SMTP_HOST=localhost
REDIS_URL=redis://localhost:6379/15
```

## 🔐 Gestion des secrets

### Variables sensibles
```bash
# ⚠️ SENSIBLE - Ne jamais commiter
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiI...
N8N_WEBHOOK_SECRET=fixmypidge-webhook-secret-2025
GMAIL_APP_PASSWORD=zzlf yzwu trhz axwu

# ✅ PUBLIC - Safe côté client
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiI...
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://n8n.robotsinlove.be/webhook/fixmypidge
```

### Génération de secrets
```bash
# Secret webhook (32 caractères aléatoires)
openssl rand -hex 32

# JWT secret (si nécessaire)
openssl rand -base64 32

# Password sécurisé
openssl rand -base64 24
```

### Rotation des secrets
```bash
# Processus de rotation (exemple N8N_WEBHOOK_SECRET)
1. Générer nouveau secret
2. Mettre à jour n8n avec nouveau secret
3. Mettre à jour FixMyPidge avec nouveau secret  
4. Redéployer les deux services
5. Tester la communication
6. Supprimer l'ancien secret
```

## 📂 Chargement des variables

### Next.js automatique
```typescript
// Variables NEXT_PUBLIC_* disponibles côté client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const appUrl = process.env.NEXT_PUBLIC_APP_URL

// Variables sans préfixe disponibles côté serveur uniquement
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // undefined côté client
```

### Docker Compose
```yaml
# docker-compose.yml
services:
  fixmypidge:
    environment:
      # Depuis variables d'environnement host
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      
    # Ou depuis fichier .env
    env_file:
      - .env.production
```

### Kubernetes (futur)
```yaml
# ConfigMap pour variables non-sensibles
apiVersion: v1
kind: ConfigMap
metadata:
  name: fixmypidge-config
data:
  NODE_ENV: "production"
  NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321"

---
# Secret pour variables sensibles
apiVersion: v1
kind: Secret
metadata:
  name: fixmypidge-secrets
data:
  SUPABASE_SERVICE_ROLE_KEY: ZXlKaGJHY2lPaUZJVXpJMU5pSXNJblI1Y0dVaU9pSktWMVFpZlE9PQ==
```

## 🧪 Validation et tests

### Validation au démarrage
```typescript
// lib/env.ts - Validation des variables requises
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'N8N_WEBHOOK_SECRET'
]

export function validateEnvironment() {
  const missing = requiredEnvVars.filter(
    varName => !process.env[varName]
  )
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
}

// Dans app/layout.tsx ou API routes
validateEnvironment()
```

### Tests de connectivité
```bash
# Script de test des services externes
#!/bin/bash
# scripts/test-environment.sh

echo "Testing Supabase connection..."
curl -f ${NEXT_PUBLIC_SUPABASE_URL}/health || echo "❌ Supabase unreachable"

echo "Testing n8n webhook..."
curl -f ${NEXT_PUBLIC_N8N_WEBHOOK_URL%/*}/healthz || echo "❌ n8n unreachable"

echo "Testing Redis (if configured)..."
redis-cli -u ${REDIS_URL} ping || echo "⚠️ Redis optional service unreachable"

echo "✅ Environment test completed"
```

## 📊 Configuration par feature flags

### Feature toggles (futur)
```bash
# Activation progressive des fonctionnalités
NEXT_PUBLIC_FEATURE_REALTIME_UPDATES=true
NEXT_PUBLIC_FEATURE_PUSH_NOTIFICATIONS=false
NEXT_PUBLIC_FEATURE_GEOFENCING=false
NEXT_PUBLIC_FEATURE_OFFLINE_MODE=true

# Intégrations optionnelles
ENABLE_SENTRY=true
ENABLE_ANALYTICS=false
ENABLE_MAPBOX=false  # Utilise OpenStreetMap en fallback
```

### Configuration dynamique
```typescript
// lib/features.ts
export const features = {
  realtimeUpdates: process.env.NEXT_PUBLIC_FEATURE_REALTIME_UPDATES === 'true',
  pushNotifications: process.env.NEXT_PUBLIC_FEATURE_PUSH_NOTIFICATIONS === 'true',
  geofencing: process.env.NEXT_PUBLIC_FEATURE_GEOFENCING === 'true',
  offlineMode: process.env.NEXT_PUBLIC_FEATURE_OFFLINE_MODE === 'true'
}

// Usage dans composants
if (features.realtimeUpdates) {
  // Activer subscriptions Supabase Realtime
}
```

## 🔄 Migration et mise à jour

### Ajout de nouvelles variables
```bash
# 1. Ajouter à .env.example avec valeur factice
NEXT_PUBLIC_NEW_FEATURE_URL=https://example.com

# 2. Documenter dans ce fichier
# 3. Ajouter validation si critique
# 4. Mettre à jour docker-compose.yml si nécessaire
# 5. Communiquer aux équipes déploiement
```

### Suppression de variables obsolètes
```bash
# 1. Marquer comme deprecated dans code
console.warn('LEGACY_VAR is deprecated, use NEW_VAR instead')

# 2. Période de transition (2 semaines minimum)
# 3. Supprimer du code
# 4. Supprimer de .env.example
# 5. Mettre à jour documentation
```

## 🚨 Troubleshooting

### Variables non chargées
```typescript
// Debug des variables d'environnement
console.log('Environment check:', {
  NODE_ENV: process.env.NODE_ENV,
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  HAS_SERVICE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  N8N_WEBHOOK: process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL
})
```

### Erreurs de chargement courantes
```bash
# Variable côté client non préfixée NEXT_PUBLIC_
❌ const apiUrl = process.env.API_URL // undefined côté client
✅ const apiUrl = process.env.NEXT_PUBLIC_API_URL

# Variable sensible exposée côté client
❌ NEXT_PUBLIC_DATABASE_PASSWORD=secret123 // Visible dans le bundle !
✅ DATABASE_PASSWORD=secret123 // Serveur uniquement

# Fichier .env non chargé
❌ .env.prod (nom non reconnu)
✅ .env.local ou .env.production
```

### Validation en runtime
```typescript
// Middleware pour vérifier configuration
export function middleware(request: NextRequest) {
  const requiredVars = ['NEXT_PUBLIC_SUPABASE_URL']
  
  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      return new Response(`Configuration error: ${varName} missing`, {
        status: 503
      })
    }
  }
}
```

---

## 📞 Support configuration

### Checklist de déploiement
- [ ] Variables d'environnement définies
- [ ] Secrets sécurisés (pas de commit)
- [ ] Services externes accessibles
- [ ] Tests de connectivité réussis
- [ ] Feature flags configurés
- [ ] Documentation mise à jour

### Contact
- **Issues de config** : GitHub Issues avec label `configuration`
- **Secrets perdus** : Contact admin ServerLab
- **Nouvelles variables** : Pull Request avec documentation

---

*Configuration maintenue avec l'évolution de l'infrastructure*