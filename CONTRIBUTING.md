# 🤝 Guide de contribution - FixMyPidge

Merci de votre intérêt pour contribuer à FixMyPidge ! Ce guide vous explique comment participer au développement de cette application citoyenne pour sauver les pigeons urbains.

## 🎯 Types de contributions

Nous accueillons différents types de contributions :

- 🐛 **Bug reports** : Signalement de problèmes
- 💡 **Feature requests** : Suggestions d'améliorations
- 📝 **Documentation** : Amélioration des guides
- 🔧 **Code** : Corrections de bugs et nouvelles fonctionnalités
- 🎨 **Design** : Amélioration de l'interface utilisateur
- 🧪 **Tests** : Ajout ou amélioration des tests
- 🌍 **Traductions** : Support multilingue (futur)

## 🚀 Premier pas

### Fork et configuration
```bash
# 1. Fork sur GitHub
# Cliquer sur "Fork" sur https://github.com/gillespinault/FixMYPidge

# 2. Clone de votre fork
git clone https://github.com/VOTRE-USERNAME/FixMYPidge.git
cd FixMYPidge

# 3. Configuration du remote upstream
git remote add upstream https://github.com/gillespinault/FixMYPidge.git

# 4. Installation
npm install
```

### Configuration environnement
```bash
# Copie du template
cp .env.local.example .env.local

# Configuration Supabase local (voir docs/deployment/environment.md)
# Configuration n8n développement
# Test de l'application
npm run dev
```

## 🔄 Workflow de développement

### Synchronisation avec upstream
```bash
# Récupération des dernières modifications
git fetch upstream
git checkout main
git merge upstream/main

# Mise à jour de votre fork sur GitHub
git push origin main
```

### Création d'une feature branch
```bash
# Nouvelle fonctionnalité
git checkout -b feature/add-realtime-notifications

# Correction de bug
git checkout -b fix/case-status-update

# Amélioration documentation
git checkout -b docs/improve-api-reference
```

### Convention de nommage des branches
```bash
# Fonctionnalités
feature/description-courte
feature/add-push-notifications
feature/improve-geolocation

# Corrections
fix/description-courte  
fix/signup-validation-error
fix/webhook-timeout-handling

# Documentation
docs/description-courte
docs/update-installation-guide
docs/add-api-examples

# Refactoring
refactor/description-courte
refactor/simplify-auth-store
refactor/optimize-database-queries

# Tests
test/description-courte
test/add-component-tests
test/improve-api-coverage
```

## 📝 Standards de code

### Convention des commits
Nous utilisons [Conventional Commits](https://www.conventionalcommits.org/) :

```bash
# Format
<type>[scope optionnel]: <description>

# Types principaux
feat: nouvelle fonctionnalité
fix: correction de bug
docs: documentation
style: formatage, pas de changement logique
refactor: refactoring sans ajout de fonctionnalité
test: ajout ou modification de tests
chore: maintenance, dépendances, config

# Exemples
feat(auth): add password reset functionality
fix(api): handle webhook timeout errors
docs(readme): update installation instructions
style(components): format code with prettier
refactor(store): simplify case management logic
test(api): add webhook integration tests
chore(deps): update dependencies to latest versions
```

### Code TypeScript
```typescript
// ✅ Bon : Types explicites
interface CreateCaseData {
  title: string
  description?: string
  location: { lat: number; lng: number }
  category?: CaseCategory
}

async function createCase(data: CreateCaseData): Promise<string> {
  // Implementation
}

// ❌ Éviter : any, types implicites
function createCase(data: any) {
  // ...
}
```

### Composants React
```typescript
// ✅ Bon : Props typées, fonctionnel, exports nommés
interface CaseCardProps {
  case: CaseWithDetails
  onSelect?: (caseId: string) => void
  className?: string
}

export function CaseCard({ case, onSelect, className }: CaseCardProps) {
  return (
    <div className={clsx('bg-white rounded-lg', className)}>
      {/* ... */}
    </div>
  )
}

// ❌ Éviter : Props non typées, default export pour composants
export default function CaseCard(props) {
  // ...
}
```

### Styles Tailwind
```tsx
// ✅ Bon : Classes utilitaires, responsive, dark mode ready
<div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">

// ✅ Bon : Classes conditionnelles avec clsx
const statusClasses = clsx(
  'px-2 py-1 rounded text-sm font-medium',
  status === 'nouveau' && 'bg-blue-100 text-blue-800',
  status === 'resolu' && 'bg-green-100 text-green-800'
)
```

## 🧪 Tests

### Tests requis
```bash
# Avant chaque pull request
npm run lint          # ESLint doit passer
npm run type-check    # TypeScript doit compiler
npm run build         # Build doit réussir
npm run test          # Tests doivent passer (quand implémentés)
```

### Écriture de tests
```typescript
// tests/components/CaseCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { CaseCard } from '@/components/CaseCard'

const mockCase = {
  id: 'test-id',
  title: 'Pigeon blessé',
  status: 'nouveau' as const,
  created_at: '2025-09-06T14:30:00Z'
}

describe('CaseCard', () => {
  it('renders case information correctly', () => {
    render(<CaseCard case={mockCase} />)
    
    expect(screen.getByText('Pigeon blessé')).toBeInTheDocument()
    expect(screen.getByText('Nouveau')).toBeInTheDocument()
  })
  
  it('calls onSelect when clicked', () => {
    const onSelect = jest.fn()
    render(<CaseCard case={mockCase} onSelect={onSelect} />)
    
    fireEvent.click(screen.getByTestId('case-card'))
    expect(onSelect).toHaveBeenCalledWith('test-id')
  })
})
```

## 📋 Pull Request Process

### Checklist avant PR
- [ ] Code suit les standards du projet
- [ ] Tests passent (`npm run test`)
- [ ] Build réussit (`npm run build`) 
- [ ] Lint clean (`npm run lint`)
- [ ] TypeScript compile (`npm run type-check`)
- [ ] Documentation mise à jour si nécessaire
- [ ] Commits suivent la convention
- [ ] Branch à jour avec `main`

### Template de Pull Request
```markdown
## Description
<!-- Décrivez brièvement les changements -->

## Type de changement
- [ ] Bug fix (correction non-breaking)
- [ ] New feature (fonctionnalité non-breaking) 
- [ ] Breaking change (modification de l'API existante)
- [ ] Documentation update

## Comment tester
<!-- Instructions pour tester vos changements -->
1. Aller à '...'
2. Cliquer sur '...'
3. Voir le résultat '...'

## Screenshots (si applicable)
<!-- Ajoutez des screenshots pour les changements UI -->

## Checklist
- [ ] Mon code suit les standards du projet
- [ ] J'ai fait une self-review de mes changements
- [ ] J'ai commenté le code complexe
- [ ] J'ai mis à jour la documentation
- [ ] Mes changements ne génèrent pas de nouveaux warnings
- [ ] J'ai ajouté des tests couvrant mes modifications
- [ ] Tous les tests passent localement
```

### Review process
1. **Automated checks** : GitHub Actions vérifie lint, types, build
2. **Code review** : Review par au moins un mainteneur
3. **Testing** : Test manuel des fonctionnalités affectées
4. **Merge** : Squash and merge vers `main`

## 🐛 Bug Reports

### Template d'issue bug
```markdown
**Describe the bug**
<!-- Description claire et concise du bug -->

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected behavior**
<!-- Comportement attendu -->

**Screenshots**
<!-- Si applicable, ajoutez des screenshots -->

**Environment:**
- OS: [e.g. iOS, Android, Windows, macOS]
- Browser [e.g. chrome, safari, firefox]
- Version [e.g. 22]
- Device: [e.g. iPhone 12, Samsung Galaxy]

**Additional context**
<!-- Contexte additionnel utile -->
```

### Priorités des bugs
- 🔴 **Critical** : App crash, data loss, security issue
- 🟠 **High** : Feature broken, user can't complete main flow
- 🟡 **Medium** : Feature partially broken, workaround exists
- 🟢 **Low** : Minor inconvenience, cosmetic issue

## 💡 Feature Requests

### Template de feature request
```markdown
**Is your feature request related to a problem?**
<!-- Ex: I'm always frustrated when [...] -->

**Describe the solution you'd like**
<!-- Description claire de ce que vous voulez -->

**Describe alternatives you've considered**
<!-- Autres solutions envisagées -->

**Additional context**
<!-- Screenshots, mockups, liens utiles -->

**User story**
<!-- En tant que [type d'utilisateur], je veux [objectif] pour [raison] -->
```

### Évaluation des features
Les nouvelles fonctionnalités sont évaluées selon :
- **Impact utilisateur** : Combien d'utilisateurs bénéficient ?
- **Effort de développement** : Complexité technique
- **Alignement vision** : Cohérence avec les objectifs du projet
- **Maintenance** : Coût de maintenance long terme

## 🎨 Guidelines UI/UX

### Design system
```typescript
// Couleurs principales
const colors = {
  primary: 'emerald-600',      // Actions principales
  secondary: 'gray-600',       // Actions secondaires  
  success: 'green-600',        // Succès, cas résolus
  warning: 'yellow-600',       // Attention, cas en cours
  danger: 'red-600',           // Erreurs, urgences
  info: 'blue-600'             // Information
}

// Espacements
const spacing = {
  xs: 'p-2',    // 8px
  sm: 'p-4',    // 16px  
  md: 'p-6',    // 24px
  lg: 'p-8',    // 32px
  xl: 'p-12'    // 48px
}
```

### Accessibilité
```tsx
// ✅ Bon : Labels, ARIA, contraste, navigation clavier
<button
  aria-label="Créer un nouveau signalement"
  className="bg-emerald-600 hover:bg-emerald-700 focus:ring-2 focus:ring-emerald-500"
  onClick={handleCreate}
>
  <PlusIcon className="h-5 w-5" aria-hidden="true" />
  <span className="sr-only">Nouveau signalement</span>
</button>

// Support navigation clavier
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => e.key === 'Enter' && onClick()}
  onClick={onClick}
>
  Clickable element
</div>
```

### Responsive design
```tsx
// ✅ Mobile-first approach
<div className="p-4 sm:p-6 lg:p-8">
  <h1 className="text-lg sm:text-xl lg:text-2xl">
    Titre responsive
  </h1>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Contenu */}
  </div>
</div>
```

## 📚 Documentation

### Mise à jour documentation
- **Code changes** : Mettre à jour JSDoc si nécessaire
- **API changes** : Mettre à jour `docs/technical/api.md`
- **New features** : Ajouter guide utilisateur si nécessaire
- **Configuration** : Mettre à jour `docs/deployment/environment.md`

### Écriture documentation
```markdown
# Format standard
## Titre principal (H2)
### Sous-section (H3)

<!-- Code blocks avec langage -->
```typescript
const example = 'code example'
```

<!-- Notes importantes -->
> **⚠️ Important** : Information critique

<!-- Listes de tâches -->
- [ ] Tâche à faire
- [x] Tâche terminée

<!-- Liens internes -->
Voir [guide d'installation](./installation.md) pour plus de détails.
```

## 🚀 Release Process

### Semantic Versioning
```bash
# Version format: MAJOR.MINOR.PATCH
1.0.0 # Release initiale
1.0.1 # Bug fix
1.1.0 # Nouvelle fonctionnalité
2.0.0 # Breaking change
```

### Release checklist
- [ ] Toutes les features prêtes
- [ ] Tests passent
- [ ] Documentation mise à jour
- [ ] CHANGELOG.md mis à jour
- [ ] Version bump dans package.json
- [ ] Tag Git créé
- [ ] Build Docker testé
- [ ] Déploiement staging validé

## 🏆 Reconnaissance

### Hall of fame
Les contributeurs sont reconnus dans :
- README.md principal
- Page "À propos" de l'application
- CHANGELOG.md pour contributions significatives

### Types de reconnaissance
- 🥇 **Major contributor** : >10 PRs acceptées
- 🥈 **Regular contributor** : >5 PRs acceptées  
- 🥉 **Contributor** : >1 PR acceptée
- 🌟 **First-time contributor** : Première PR
- 📝 **Documentation** : Contributions documentation
- 🐛 **Bug hunter** : Rapports de bugs de qualité

## 📞 Support et questions

### Où demander de l'aide
- **Questions générales** : GitHub Discussions
- **Bug reports** : GitHub Issues
- **Feature requests** : GitHub Issues avec label `enhancement`
- **Questions techniques** : GitHub Issues avec label `question`

### Canaux de communication
- **GitHub Issues** : Questions publiques, bugs, features
- **GitHub Discussions** : Discussions générales, idées
- **Email** : Contact direct maintainers (voir README)

## 🔒 Sécurité

### Signalement de vulnérabilités
- **Email privé** : sécurité@fixmypidge.be (ne pas créer d'issue publique)
- **Délai de réponse** : 48h maximum
- **Process** : Disclosure responsable selon standards

### Guidelines sécurité
- Jamais de secrets dans le code
- Validation input côté serveur
- Authentification requise pour actions sensibles
- Logs sans données personnelles

---

## 🎯 Conclusion

Merci de contribuer à FixMyPidge ! Chaque contribution, qu'elle soit petite ou grande, aide à sauver plus d'oiseaux urbains en détresse.

**Questions ?** N'hésitez pas à ouvrir une issue ou discussion GitHub.

**Première contribution ?** Regardez les issues avec le label `good first issue`.

---

*Guide de contribution - Version 1.0*