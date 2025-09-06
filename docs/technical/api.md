# 🔌 API Reference - FixMyPidge

## Vue d'ensemble

FixMyPidge expose une API REST simple via Next.js App Router, principalement constituée de webhooks pour l'intégration avec n8n et de endpoints utilitaires.

## 🏗️ Architecture API

### Stack technique
- **Next.js 15 App Router** : API Routes natives
- **TypeScript** : Typage strict des requêtes/réponses
- **Validation** : Middleware de validation des données
- **Authentification** : JWT Supabase + Row Level Security

### Base URL
```
Production: https://fixmypidge.robotsinlove.be/api
Development: http://localhost:3000/api
Internal: http://192.168.1.3:8040/api
```

## 🔌 Endpoints disponibles

### Health Check
```http
GET /api/health
```

**Description** : Endpoint de santé pour monitoring et health checks Docker.

**Réponse** :
```json
{
  "status": "healthy",
  "timestamp": "2025-09-06T14:30:00.000Z",
  "service": "fixmypidge",
  "version": "1.0.0"
}
```

**Status codes** :
- `200` : Service opérationnel
- `503` : Service indisponible (base de données inaccessible, etc.)

**Usage** :
```bash
# Health check simple
curl -f https://fixmypidge.robotsinlove.be/api/health

# Health check avec détails
curl -s https://fixmypidge.robotsinlove.be/api/health | jq
```

## 🪝 Webhooks n8n

### Webhook sortant : Notification n8n
```http
POST /api/webhooks/notify-n8n
Content-Type: application/json
X-Webhook-Secret: fixmypidge-webhook-secret-2025
```

**Description** : Endpoint interne utilisé par FixMyPidge pour notifier n8n d'événements utilisateur.

**Authentification** : Secret partagé dans header `X-Webhook-Secret`

**Body pour création de cas** :
```json
{
  "event": "case_created",
  "case_id": "550e8400-e29b-41d4-a716-446655440000",
  "case": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Pigeon blessé rue de la Paix",
    "description": "Pigeon avec aile pendante, immobile depuis 2h",
    "address": "Rue de la Paix, 1000 Bruxelles",
    "category": "blessure_aile",
    "created_at": "2025-09-06T14:30:00.000Z",
    "user_id": "550e8400-e29b-41d4-a716-446655440001"
  }
}
```

**Body pour message utilisateur** :
```json
{
  "event": "message_sent", 
  "case_id": "550e8400-e29b-41d4-a716-446655440000",
  "message_id": "550e8400-e29b-41d4-a716-446655440002",
  "message": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "content": "L'oiseau semble aller mieux, il bouge un peu plus",
    "sender_type": "user",
    "created_at": "2025-09-06T16:30:00.000Z"
  }
}
```

**Réponses** :
```json
// Succès
{ "success": true }

// Erreur authentification
{ "error": "Unauthorized" }

// Erreur configuration
{ "error": "N8N webhook URL not configured" }

// Erreur réseau
{ "error": "Internal server error" }
```

**Status codes** :
- `200` : Webhook envoyé avec succès
- `401` : Authentification échouée
- `500` : Erreur serveur ou configuration

### Webhook entrant : Réponse n8n
```http
POST /api/webhooks/n8n-response
Content-Type: application/json
X-Webhook-Secret: fixmypidge-webhook-secret-2025
```

**Description** : Endpoint pour recevoir les réponses d'experts via n8n.

**Authentification** : Secret partagé dans header `X-Webhook-Secret`

**Body pour message d'expert** :
```json
{
  "event": "expert_message",
  "case_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": {
    "content": "Placez l'oiseau dans un carton aéré, au calme. Ne donnez ni eau ni nourriture pour l'instant.",
    "expert_id": "telegram_123456789",
    "expert_name": "Dr. Martin"
  },
  "status_update": "repondu"
}
```

**Body pour mise à jour statut** :
```json
{
  "event": "case_status_update",
  "case_id": "550e8400-e29b-41d4-a716-446655440000", 
  "status_update": "resolu"
}
```

**Traitement** :
1. Validation du secret
2. Insertion message en base (si `expert_message`)
3. Mise à jour statut du cas (si `status_update`)
4. Notification temps réel utilisateur (Supabase Realtime)

**Réponses** :
```json
// Succès
{ "success": true }

// Événement inconnu
{ "error": "Unknown event type" }

// Erreur base de données
{ "error": "Internal server error" }
```

## 🔒 Sécurité API

### Authentification webhooks
```typescript
// Validation secret partagé
const secret = request.headers.get('x-webhook-secret')
if (secret !== process.env.N8N_WEBHOOK_SECRET) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Rate limiting (futur)
```typescript
// À implémenter selon besoins
interface RateLimitConfig {
  windowMs: number    // 15 * 60 * 1000 = 15 minutes
  maxRequests: number // 100 requests per windowMs
  skipSuccessfulRequests: boolean
}
```

### Validation des données
```typescript
// Exemple validation body webhook
interface WebhookBody {
  event: 'case_created' | 'message_sent' | 'expert_message' | 'case_status_update'
  case_id: string  // UUID format
  message?: {
    id?: string
    content: string
    sender_type?: 'user' | 'expert'
    expert_id?: string
  }
  status_update?: CaseStatus
}
```

## 📡 Intégration Supabase

### Client API Supabase
```typescript
// Configuration client serveur
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Clé service pour API
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)
```

### Opérations base de données
```typescript
// Insertion message expert
const { error } = await supabase
  .from('messages')
  .insert({
    case_id: caseId,
    content: message.content,
    sender_type: 'expert' as const,
    sender_id: message.expert_id || 'unknown'
  })

// Mise à jour statut
const { error: statusError } = await supabase
  .from('cases')
  .update({ 
    status: statusUpdate,
    updated_at: new Date().toISOString()
  })
  .eq('id', caseId)
```

## 🔍 Monitoring et logs

### Logs structurés
```typescript
// Format de log standard
const logEntry = {
  level: 'info' | 'warn' | 'error',
  message: string,
  timestamp: new Date().toISOString(),
  service: 'fixmypidge',
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  userId?: string,
  caseId?: string,
  error?: {
    message: string,
    stack: string
  }
}
```

### Métriques importantes
```typescript
// Compteurs à tracker
interface APIMetrics {
  webhook_calls_total: number
  webhook_errors_total: number
  case_created_total: number
  expert_messages_total: number
  response_time_seconds: number[]
  active_users: number
}
```

## 🧪 Tests et validation

### Tests unitaires
```typescript
// Test webhook n8n-response
describe('POST /api/webhooks/n8n-response', () => {
  it('should accept valid expert message', async () => {
    const response = await fetch('/api/webhooks/n8n-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': 'test-secret'
      },
      body: JSON.stringify({
        event: 'expert_message',
        case_id: 'test-uuid',
        message: { content: 'Test message' }
      })
    })
    
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ success: true })
  })
  
  it('should reject invalid secret', async () => {
    const response = await fetch('/api/webhooks/n8n-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': 'wrong-secret'
      },
      body: JSON.stringify({})
    })
    
    expect(response.status).toBe(401)
  })
})
```

### Tests d'intégration
```bash
# Test health endpoint
curl -f https://fixmypidge.robotsinlove.be/api/health

# Test webhook avec secret correct
curl -X POST https://fixmypidge.robotsinlove.be/api/webhooks/n8n-response \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: correct-secret" \
  -d '{"event":"test"}'

# Test webhook avec secret incorrect (doit retourner 401)
curl -X POST https://fixmypidge.robotsinlove.be/api/webhooks/n8n-response \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: wrong-secret" \
  -d '{"event":"test"}'
```

## 🔮 API futures

### Endpoints prévus (Phase 2)

#### Statistiques publiques
```http
GET /api/stats
```
```json
{
  "total_cases": 1247,
  "cases_this_month": 89,
  "average_response_time_hours": 1.2,
  "resolution_rate_percent": 78
}
```

#### Recherche géospatiale
```http
GET /api/cases/nearby?lat=50.8476&lng=4.3572&radius=1000
```
```json
{
  "cases": [
    {
      "id": "uuid",
      "title": "Pigeon blessé",
      "distance_meters": 245,
      "status": "resolu",
      "created_at": "2025-09-06T14:30:00Z"
    }
  ]
}
```

#### API publique pour intégrations
```http
GET /api/v1/cases
Authorization: Bearer api_key_here
```

### Évolutions sécurité

#### Rate limiting avec Redis
```typescript
// Implémentation avec Redis partagé
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100,
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:fixmypidge:'
  })
}
```

#### API Keys pour intégrations
```typescript
// Table api_keys pour partenaires
interface ApiKey {
  id: string
  name: string          // Nom organisation
  key_hash: string      // Hash de la clé
  permissions: string[] // ['read:cases', 'write:cases']
  rate_limit: number    // Requests par minute
  expires_at: string    // Expiration
}
```

## 📊 Documentation interactive

### OpenAPI/Swagger (futur)
```yaml
openapi: 3.0.0
info:
  title: FixMyPidge API
  version: 1.0.0
  description: API pour signalement et suivi de pigeons urbains

paths:
  /health:
    get:
      summary: Health check
      responses:
        '200':
          description: Service opérationnel
          content:
            application/json:
              schema:
                type: object
                properties:
                  status:
                    type: string
                    example: healthy
```

### Postman Collection
Collection Postman disponible pour tests manuels :
- Endpoints authentifiés
- Variables d'environnement  
- Tests automatisés
- Documentation intégrée

## 🚨 Troubleshooting API

### Problèmes courants

#### Webhook timeout
```javascript
// Vérification connectivité n8n
const controller = new AbortController()
const timeoutId = setTimeout(() => controller.abort(), 5000)

const response = await fetch(n8nWebhookUrl, {
  method: 'POST',
  signal: controller.signal,
  // ...
})
```

#### Erreurs Supabase
```typescript
// Gestion erreurs RLS
if (error?.code === 'PGRST116') {
  return NextResponse.json(
    { error: 'Resource not found or access denied' },
    { status: 404 }
  )
}
```

#### Debug mode
```typescript
// Variables d'environnement pour debug
if (process.env.NODE_ENV === 'development') {
  console.log('API Debug:', { endpoint, body, headers })
}
```

---

## 📞 Support API

### Documentation
- **Code source** : `/src/app/api/` dans le repository
- **Types** : `/src/types/database.ts` pour les interfaces
- **Tests** : `/tests/api/` pour exemples d'usage

### Contact technique
- **Issues GitHub** : Bug reports et améliorations
- **Admin-cli** : Test direct des endpoints via admin-cli ServerLab

---

*API maintenue avec le développement de l'application*