# 👨‍💻 Guide de développement - FixMyPidge

## 🎯 Environnement de développement

### Prérequis
- **Node.js 18+** : Runtime JavaScript
- **npm 9+** : Gestionnaire de paquets
- **Docker Desktop** : Pour services locaux (optionnel)
- **VS Code** : Éditeur recommandé avec extensions
- **Git** : Contrôle de version

### Extensions VS Code recommandées
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-json"
  ]
}
```

## 🚀 Setup local

### Installation initiale
```bash
# Clone du repository
git clone https://github.com/gillespinault/FixMYPidge.git
cd FixMYPidge

# Installation dépendances
npm install

# Configuration environnement
cp .env.local.example .env.local
# Éditer .env.local avec vos variables
```

### Configuration Supabase locale
```bash
# Option 1: Utilisation du stack Supabase CLI ServerLab (recommandé)
# Vérifier que Supabase est démarré sur ServerLab
curl http://127.0.0.1:54321/health

# Option 2: Instance Supabase dédiée développement
npx supabase init
npx supabase start
npx supabase db reset
```

### Variables d'environnement (.env.local)
```bash
# Supabase (local CLI stack)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# n8n (développement)
NEXT_PUBLIC_N8N_WEBHOOK_URL=http://localhost:5678/webhook/fixmypidge-dev
N8N_WEBHOOK_SECRET=dev-secret-123

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Démarrage développement
```bash
# Mode développement avec hot reload
npm run dev

# L'application sera disponible sur http://localhost:3000
```

## 📁 Structure du projet

```
fixmypidge/
├── src/
│   ├── app/                    # Pages Next.js (App Router)
│   │   ├── (auth)/            # Groupe de routes auth
│   │   ├── api/               # API Routes
│   │   ├── case/              # Pages signalements
│   │   ├── dashboard/         # Page principale
│   │   ├── globals.css        # Styles globaux
│   │   ├── layout.tsx         # Layout racine
│   │   ├── page.tsx           # Page accueil (redirection)
│   │   └── providers.tsx      # Providers React
│   ├── components/            # Composants réutilisables
│   │   ├── ui/               # Composants UI de base
│   │   ├── CaseCard.tsx      # Carte signalement
│   │   ├── MapComponent.tsx  # Géolocalisation
│   │   └── ...
│   ├── lib/                  # Utilitaires et configurations
│   │   ├── supabase.ts      # Client Supabase
│   │   ├── utils.ts         # Fonctions utilitaires
│   │   └── ...
│   ├── store/               # États Zustand
│   │   ├── auth-store.ts    # Authentification
│   │   ├── case-store.ts    # Signalements
│   │   └── ...
│   └── types/               # Types TypeScript
│       ├── database.ts      # Types base de données
│       └── ...
├── public/                  # Assets statiques
│   ├── icons/              # Icônes PWA
│   ├── manifest.json       # Manifest PWA
│   └── ...
├── docs/                   # Documentation
├── supabase/              # Migrations base de données
│   └── migrations/
├── tests/                 # Tests (à créer)
├── .env.local            # Variables environnement (local)
├── docker-compose.yml    # Services développement
├── Dockerfile           # Image production
├── next.config.js       # Configuration Next.js
├── tailwind.config.js   # Configuration Tailwind
├── tsconfig.json        # Configuration TypeScript
└── package.json         # Dépendances et scripts
```

## 🎨 Standards de code

### TypeScript
```typescript
// ✅ Bon : Types explicites
interface CreateCaseRequest {
  title: string
  description?: string
  location: { lat: number; lng: number }
  category?: CaseCategory
}

// ❌ Éviter : any ou types implicites
function createCase(data: any) { ... }

// ✅ Bon : Typage strict des composants
interface CaseCardProps {
  case: CaseWithDetails
  onSelect?: (caseId: string) => void
}

export function CaseCard({ case, onSelect }: CaseCardProps) {
  // ...
}
```

### Composants React
```typescript
// ✅ Bon : Functional components avec hooks
export function Dashboard() {
  const { cases, loading, fetchCases } = useCaseStore()
  
  useEffect(() => {
    fetchCases()
  }, [fetchCases])

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div>
      {cases.map(caseItem => (
        <CaseCard key={caseItem.id} case={caseItem} />
      ))}
    </div>
  )
}

// ❌ Éviter : Class components (sauf cas spéciaux)
class Dashboard extends Component { ... }
```

### Styles Tailwind
```tsx
// ✅ Bon : Classes utilitaires composées
<div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
  <h2 className="text-xl font-semibold text-gray-900 mb-4">
    {title}
  </h2>
</div>

// ✅ Bon : Classes conditionnelles avec clsx
import clsx from 'clsx'

const buttonClasses = clsx(
  'px-4 py-2 rounded-md font-medium transition-colors',
  variant === 'primary' && 'bg-emerald-600 text-white hover:bg-emerald-700',
  variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300',
  disabled && 'opacity-50 cursor-not-allowed'
)
```

### Gestion des erreurs
```typescript
// ✅ Bon : Try-catch avec gestion spécifique
try {
  const cases = await fetchCases()
  setCases(cases)
} catch (error) {
  if (error instanceof AuthError) {
    router.push('/auth/signin')
  } else {
    console.error('Failed to fetch cases:', error)
    setError('Impossible de charger les signalements')
  }
}

// ✅ Bon : Error boundaries pour composants
export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundaryComponent
      fallback={<div>Une erreur est survenue</div>}
    >
      {children}
    </ErrorBoundaryComponent>
  )
}
```

## 🧪 Tests

### Configuration Jest (à implémenter)
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx'
  ]
}
```

### Tests unitaires
```typescript
// tests/components/CaseCard.test.tsx
import { render, screen } from '@testing-library/react'
import { CaseCard } from '@/components/CaseCard'

const mockCase = {
  id: 'test-id',
  title: 'Test Case',
  status: 'nouveau' as const,
  created_at: '2025-09-06T14:30:00Z'
}

describe('CaseCard', () => {
  it('renders case title', () => {
    render(<CaseCard case={mockCase} />)
    expect(screen.getByText('Test Case')).toBeInTheDocument()
  })
  
  it('shows correct status badge', () => {
    render(<CaseCard case={mockCase} />)
    expect(screen.getByText('Nouveau')).toBeInTheDocument()
  })
})
```

### Tests d'intégration
```typescript
// tests/api/webhooks.test.ts
describe('Webhook API', () => {
  it('should handle n8n case creation', async () => {
    const response = await fetch('/api/webhooks/n8n-response', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET
      },
      body: JSON.stringify({
        event: 'expert_message',
        case_id: 'test-case-id',
        message: { content: 'Test response' }
      })
    })
    
    expect(response.status).toBe(200)
  })
})
```

## 🔧 Outils de développement

### Scripts npm
```bash
# Développement
npm run dev              # Mode développement avec hot reload
npm run dev:debug        # Mode développement avec debug Node.js

# Build et production  
npm run build            # Build optimisé production
npm run start            # Serveur production local
npm run export           # Export statique (si configuré)

# Qualité code
npm run lint             # ESLint avec auto-fix
npm run lint:check       # ESLint sans modification
npm run type-check       # Vérification TypeScript sans build
npm run format           # Prettier formatting

# Tests (à implémenter)
npm run test             # Tests unitaires Jest
npm run test:watch       # Tests en mode watch
npm run test:coverage    # Coverage report
npm run test:e2e         # Tests end-to-end Playwright

# Base de données
npm run db:reset         # Reset et migrate Supabase
npm run db:migrate       # Appliquer nouvelles migrations
npm run db:seed          # Données de test (à créer)
```

### Configuration ESLint
```json
// .eslintrc.json
{
  "extends": [
    "next/core-web-vitals",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "prefer-const": "error",
    "no-console": ["warn", { "allow": ["error"] }]
  }
}
```

### Configuration Prettier
```json
// .prettierrc
{
  "semi": false,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

## 🐛 Debugging

### VS Code Debug Configuration
```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    },
    {
      "name": "Next.js: debug client-side",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:3000"
    }
  ]
}
```

### Logs structurés
```typescript
// lib/logger.ts
interface LogContext {
  userId?: string
  caseId?: string
  action?: string
  [key: string]: any
}

export const logger = {
  info: (message: string, context?: LogContext) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...context
    }))
  },
  
  error: (error: Error, context?: LogContext) => {
    console.error(JSON.stringify({
      level: 'error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      ...context
    }))
  }
}

// Usage
logger.info('Case created', { userId: user.id, caseId: newCase.id })
```

### React DevTools
```bash
# Installation extension navigateur
# Chrome: React Developer Tools
# Firefox: React Developer Tools

# Utilisation des hooks dans les DevTools
# - Inspecter état Zustand
# - Profiler performances composants
# - Tracer les re-renders
```

## 🔄 Workflow Git

### Branches
```bash
# Structure des branches
main                 # Production stable
├── develop         # Intégration continue
├── feature/xxx     # Nouvelles fonctionnalités  
├── bugfix/xxx      # Corrections bugs
└── hotfix/xxx      # Corrections urgentes production
```

### Workflow développement
```bash
# Nouvelle fonctionnalité
git checkout develop
git pull origin develop
git checkout -b feature/add-geolocation
# ... développement ...
git add .
git commit -m "feat: add interactive map component"
git push origin feature/add-geolocation
# Créer Pull Request vers develop
```

### Convention commits
```bash
# Format: type(scope): description
feat: add user authentication
fix: correct case status update
docs: update API documentation
style: format code with prettier
refactor: simplify case creation flow
test: add unit tests for CaseCard
chore: update dependencies

# Avec scope
feat(auth): add password reset
fix(api): handle webhook timeout
docs(readme): update installation guide
```

## 🚀 Déploiement

### Build local
```bash
# Test build production
npm run build
npm run start

# Vérification
curl http://localhost:3000/api/health
```

### Docker développement
```bash
# Build image développement
docker build -t fixmypidge:dev .

# Run avec variables d'environnement
docker run -p 3000:3000 --env-file .env.local fixmypidge:dev

# Ou avec docker-compose (si configuré)
docker-compose -f docker-compose.dev.yml up
```

### Intégration continue
```yaml
# .github/workflows/ci.yml (à créer)
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check  
      - run: npm run build
      - run: npm run test
```

## 🎯 Bonnes pratiques

### Performance
```typescript
// ✅ Bon : Lazy loading composants lourds
const MapComponent = lazy(() => import('@/components/MapComponent'))

// ✅ Bon : Memoisation composants couteux  
const CaseList = memo(function CaseList({ cases }: { cases: Case[] }) {
  return (
    <div>
      {cases.map(caseItem => (
        <CaseCard key={caseItem.id} case={caseItem} />
      ))}
    </div>
  )
})

// ✅ Bon : useMemo pour calculs coûteux
const sortedCases = useMemo(() => {
  return cases.sort((a, b) => b.created_at.localeCompare(a.created_at))
}, [cases])
```

### Sécurité
```typescript
// ✅ Bon : Validation côté client ET serveur
const CreateCaseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(['blessure_aile', 'blessure_patte', ...]).optional()
})

// ✅ Bon : Sanitisation des données utilisateur
const sanitizedTitle = DOMPurify.sanitize(userInput.title)

// ✅ Bon : Pas de secrets côté client
// ❌ Éviter: const API_SECRET = 'secret123'
// ✅ Utiliser: process.env.API_SECRET côté serveur uniquement
```

### Accessibilité
```tsx
// ✅ Bon : Labels et ARIA
<button
  aria-label="Créer un nouveau signalement"
  onClick={handleCreateCase}
  className="..."
>
  <PlusIcon className="h-5 w-5" aria-hidden="true" />
  <span className="sr-only">Nouveau signalement</span>
</button>

// ✅ Bon : Navigation clavier
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && onClick()}
  onClick={onClick}
>
  Clickable div
</div>
```

## 📊 Monitoring développement

### Performance monitoring
```typescript
// Performance API pour métriques
const measurePageLoad = () => {
  const navigation = performance.getEntriesByType('navigation')[0]
  console.log('Page load time:', navigation.loadEventEnd - navigation.loadEventStart)
}

// Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)
getFID(console.log)  
getFCP(console.log)
getLCP(console.log)
getTTFB(console.log)
```

### Error tracking (développement)
```typescript
// Error boundary avec reporting
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component error:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })
  }
}
```

## 🤝 Contribution

### Code review checklist
- [ ] Code suit les standards TypeScript/React
- [ ] Composants testés et fonctionnels
- [ ] Pas de console.log oubliés
- [ ] Types corrects et exports propres
- [ ] Performance vérifiée (pas de re-renders inutiles)
- [ ] Accessibilité respectée
- [ ] Documentation mise à jour si nécessaire

### Pull Request template
```markdown
## Description
Brief description of changes

## Type of change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Build succeeds

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
```

---

## 🆘 Support développement

### Resources
- **Next.js Docs** : https://nextjs.org/docs
- **Supabase Docs** : https://supabase.com/docs
- **Tailwind Docs** : https://tailwindcss.com/docs
- **TypeScript Docs** : https://www.typescriptlang.org/docs

### Team communication
- **Issues GitHub** : Bug reports et feature requests
- **Discussions** : Questions techniques et architecture
- **Wiki** : Documentation interne et guides

---

*Guide maintenu avec l'évolution du projet*