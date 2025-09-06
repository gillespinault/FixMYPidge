# 🐳 Déploiement Docker - FixMyPidge

## Vue d'ensemble

FixMyPidge est déployé via Docker dans l'infrastructure ServerLab, utilisant un build multi-stage optimisé pour la production et l'intégration avec les services partagés.

## 🏗️ Architecture Docker

### Structure de déploiement
```
ServerLab Infrastructure:
├── admin/                  # Admin-CLI + outils développement  
├── services/              # Services production (n8n, postgres, redis)
└── projects/              # Applications développement (FixMyPidge)
    └── docker-compose.yml # Stack projets avec FixMyPidge
```

## 📋 Dockerfile optimisé

### Multi-stage build
```dockerfile
# Base image Alpine pour sécurité et taille
FROM node:18-alpine AS base
RUN apk add --no-cache libc6-compat

# === STAGE 1: Dependencies ===
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# === STAGE 2: Builder ===  
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build optimizations
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Generate Prisma client si nécessaire
# RUN npx prisma generate

# Build Next.js avec standalone output
RUN npm run build

# === STAGE 3: Runtime ===
FROM base AS runner
WORKDIR /app

# Sécurité : utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Configuration production
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Copie des assets
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Utilisateur non-root
USER nextjs

# Port exposure
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server.js"]
```

### Optimisations appliquées
- **Multi-stage** : Réduction taille finale (-60%)
- **Alpine Linux** : Base minimale et sécurisée
- **Non-root user** : Sécurité renforcée
- **Standalone output** : Pas besoin de node_modules en prod
- **Health check** : Monitoring automatique

## 🔧 Configuration Docker Compose

### Services Stack (projects/docker-compose.yml)
```yaml
name: serverlab-projects

services:
  fixmypidge:
    image: fixmypidge:latest
    container_name: fixmypidge
    restart: unless-stopped
    
    # Port mapping
    ports:
      - "8040:3000"  # Port disponible après Evolution API (8030)
    
    # Variables d'environnement
    environment:
      # Application
      - NODE_ENV=production
      - URL=https://fixmypidge.robotsinlove.be
      - FORCE_HTTPS=false  # nginx gère SSL
      
      # Supabase Integration 
      - NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      
      # n8n Integration
      - NEXT_PUBLIC_N8N_WEBHOOK_URL=${N8N_WEBHOOK_URL}
      - N8N_WEBHOOK_SECRET=${N8N_WEBHOOK_SECRET}
      
      # Services partagés ServerLab (optionnel - futures fonctionnalités)
      - REDIS_URL=${FIXMYPIDGE_REDIS_URL}
      - MINIO_ENDPOINT=${MINIO_ENDPOINT}
      - MINIO_ACCESS_KEY=${MINIO_ACCESS_KEY}
      - MINIO_SECRET_KEY=${MINIO_SECRET_KEY}
      
      # Email (via n8n principalement)
      - SMTP_HOST=${SMTP_HOST}
      - SMTP_PORT=${SMTP_PORT}
      - SMTP_USER=${SMTP_USER}
      - SMTP_PASS=${GMAIL_APP_PASSWORD}
    
    # Réseaux - Accès services partagés
    networks:
      - serverlab_default   # Services (postgres, n8n, redis)
      - supabase_default    # Stack Supabase CLI
    
    # Dépendances
    depends_on:
      - nocodb-redis  # Service redis partagé
    
    # Volume pour persistence optionnelle
    volumes:
      - fixmypidge_data:/app/data
    
    # Health check
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

# Volumes
volumes:
  fixmypidge_data:
    driver: local

# Réseaux externes (gérés par autres stacks)
networks:
  serverlab_default:
    external: true
  supabase_default:
    external: true
```

## 🚀 Procédures de déploiement

### Build local
```bash
# Depuis le répertoire du projet
cd /workspace/projects/fixmypidge

# Build de l'image
docker build -t fixmypidge:latest .

# Test local (optionnel)
docker run -p 3000:3000 --env-file .env.local fixmypidge:latest
```

### Déploiement ServerLab

#### Depuis admin-cli (recommandé)
```bash
# Accès admin-cli
docker exec -it serverlab-admin-cli bash

# Navigation projet
cd /workspace/projects

# Build + déploiement
docker build -t fixmypidge:latest ./fixmypidge
COMPOSE_PROJECT_NAME=serverlab-projects docker compose up -d fixmypidge

# Vérification
docker compose logs fixmypidge -f
```

#### Depuis host serveur
```bash
# SSH vers serveur ServerLab
ssh user@serverlab

# Navigation
cd /home/gilles/serverlab/projects

# Déploiement
COMPOSE_PROJECT_NAME=serverlab-projects docker compose up -d fixmypidge

# Monitoring
docker compose logs fixmypidge --tail=50
```

### Mise à jour (rolling update)
```bash
# Build nouvelle version
docker build -t fixmypidge:latest ./fixmypidge

# Arrêt progressif
docker compose stop fixmypidge
docker compose rm -f fixmypidge

# Redémarrage avec nouvelle image
docker compose up -d fixmypidge

# Vérification health check
docker compose ps fixmypidge
curl -f http://192.168.1.3:8040/api/health
```

## 🌐 Configuration réseau

### URLs d'accès
- **Développement** : http://localhost:3000
- **Interne ServerLab** : http://192.168.1.3:8040
- **Production publique** : https://fixmypidge.robotsinlove.be

### Reverse proxy (nginx)
Configuration automatique via infrastructure ServerLab :
```nginx
# VPS nginx (185.158.132.168) → Tailscale → ServerLab
server {
    listen 443 ssl;
    server_name fixmypidge.robotsinlove.be;
    
    # SSL géré par Certbot
    ssl_certificate /etc/letsencrypt/live/fixmypidge.robotsinlove.be/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fixmypidge.robotsinlove.be/privkey.pem;
    
    location / {
        proxy_pass http://100.80.12.35:8040;  # ServerLab via Tailscale
        
        # Headers standard
        proxy_set_header Host $http_host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
        proxy_set_header X-Forwarded-Host $http_host;
        
        # Support WebSocket (futures fonctionnalités)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📊 Monitoring et logs

### Health checks
```bash
# Vérification santé container
docker compose exec fixmypidge curl -f http://localhost:3000/api/health

# Response attendue:
# {
#   "status": "healthy",
#   "timestamp": "2025-09-06T...",
#   "service": "fixmypidge"
# }
```

### Logs structurés
```bash
# Logs temps réel
docker compose logs fixmypidge -f

# Logs avec timestamps
docker compose logs fixmypidge -f -t

# Derniers logs seulement
docker compose logs fixmypidge --tail=100

# Logs JSON pour parsing
docker compose logs fixmypidge --json
```

### Métriques container
```bash
# Utilisation ressources
docker stats fixmypidge

# Inspection détaillée
docker compose exec fixmypidge ps aux
docker compose exec fixmypidge free -h
docker compose exec fixmypidge df -h
```

## 🔐 Sécurité

### Variables d'environnement
```bash
# Secrets dans .env (non commité)
N8N_WEBHOOK_SECRET=fixmypidge-webhook-secret-2025
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsI...

# Chargement sécurisé
docker compose --env-file .env up -d fixmypidge
```

### Utilisateur non-root
```dockerfile
# Création utilisateur dédié
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Permissions fichiers
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Exécution non-root
USER nextjs
```

### Isolation réseau
```yaml
# Réseaux séparés par fonction
networks:
  serverlab_default:    # Services partagés
    external: true
  supabase_default:     # Base données
    external: true
# Pas d'accès direct à Internet depuis l'app
```

## 🧪 Tests et validation

### Tests avant déploiement
```bash
# Build et test local
docker build -t fixmypidge:test .
docker run -d -p 3001:3000 --name fixmypidge-test fixmypidge:test

# Tests fonctionnels
curl -f http://localhost:3001/api/health
curl -f http://localhost:3001/

# Cleanup test
docker stop fixmypidge-test && docker rm fixmypidge-test
```

### Validation post-déploiement
```bash
# Health check
curl -f https://fixmypidge.robotsinlove.be/api/health

# Test authentification
curl -X POST https://fixmypidge.robotsinlove.be/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass"}'

# Test webhook n8n (depuis admin-cli)
curl -X POST http://fixmypidge:3000/api/webhooks/n8n-response \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: fixmypidge-webhook-secret-2025" \
  -d '{"event":"test"}'
```

## 🔄 Maintenance et updates

### Backup avant mise à jour
```bash
# Sauvegarde image actuelle
docker tag fixmypidge:latest fixmypidge:backup-$(date +%Y%m%d)

# Export configuration
docker compose config > docker-compose.backup.yml
```

### Rollback en cas de problème
```bash
# Retour version précédente
docker tag fixmypidge:backup-20250906 fixmypidge:latest
docker compose up -d fixmypidge

# Ou pull depuis registry si configuré
docker pull fixmypidge:v1.0.0
docker tag fixmypidge:v1.0.0 fixmypidge:latest
docker compose up -d fixmypidge
```

### Maintenance planifiée
```bash
# Arrêt gracieux (30s timeout)
docker compose stop fixmypidge

# Nettoyage images obsolètes  
docker image prune -f

# Redémarrage
docker compose up -d fixmypidge
```

## 📈 Optimisations production

### Performance
```yaml
# Configuration container optimisée
services:
  fixmypidge:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'
        reservations:
          memory: 256M
          cpus: '0.25'
```

### Cache et CDN (futur)
```yaml
# Variables pour optimisations futures
environment:
  - NEXT_PUBLIC_CDN_URL=${CDN_URL}
  - REDIS_CACHE_URL=${REDIS_URL}/5  # DB 5 pour cache FixMyPidge
```

## 🚨 Troubleshooting

### Problèmes courants

#### Container ne démarre pas
```bash
# Vérifier logs
docker compose logs fixmypidge

# Problèmes fréquents:
# - Variables d'environnement manquantes
# - Port déjà utilisé
# - Problème de réseau avec services

# Test configuration
docker compose config
```

#### Performance dégradée
```bash
# Ressources
docker stats fixmypidge

# Logs d'erreur
docker compose logs fixmypidge | grep -i error

# Test health endpoint
curl -w "@curl-format.txt" http://192.168.1.3:8040/api/health
```

#### Problème réseau
```bash
# Test connectivité services
docker compose exec fixmypidge nslookup postgres
docker compose exec fixmypidge wget -qO- http://n8n:5678/healthz

# Vérification réseaux
docker network ls
docker network inspect serverlab_default
```

### Support et escalade
1. **Logs container** : `docker compose logs fixmypidge`
2. **Health checks** : `/api/health` endpoint
3. **Portainer** : https://portainer.robotsinlove.be
4. **Admin-cli** : Accès debug via `docker exec -it serverlab-admin-cli bash`

---

## 🎯 Roadmap Docker

### Phase 2
- **Registry privé** : Push/pull automatisé
- **Secrets management** : Docker secrets vs env vars
- **Multi-stage avec cache** : Build optimisé CI/CD

### Phase 3  
- **Kubernetes migration** : Si scale nécessaire
- **Service mesh** : Istio pour microservices
- **Auto-scaling** : Selon charge

---

*Documentation maintenue avec l'infrastructure ServerLab*