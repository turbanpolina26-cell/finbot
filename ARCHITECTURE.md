# Architecture & Development Guide

## Project Structure

```
finbot/
├── components/          # React components
│   ├── UI/             # Shared UI components (Button, Input, Card, etc.)
│   ├── SavingsView.tsx # Savings/Capital view (refactored into subcomponents)
│   ├── SavingsHeader.tsx
│   ├── AccountsList.tsx
│   ├── AddAccountModal.tsx
│   ├── ProjectionChart.tsx
│   ├── TransactionItem.tsx
│   └── ChartsView.tsx
├── services/           # Business logic & API
│   ├── convexClient.ts # Convex client setup
│   ├── geminiService.ts # AI/LLM integration
│   ├── utils.ts        # Utility functions (formatting, calculations)
│   └── __tests__/      # Service tests
├── convex/            # Backend (Convex)
│   ├── functions.ts   # API functions
│   ├── schema.ts      # Data schema
│   └── _generated/    # Auto-generated
├── App.tsx            # Main app component
├── index.tsx          # React root
├── types.ts           # TypeScript types
├── index.css          # Global styles + animations
├── tailwind.config.js # Design tokens
├── DESIGN.md          # Design system documentation
├── ARCHITECTURE.md    # This file
└── README.md          # Project overview
```

## State Management

**Current Approach**: Props drilling + local `useState` hooks

**Pattern**:
- Use `useState` for local UI state (modals, input fields, animations)
- Lift state to `App.tsx` for shared data (transactions, savings accounts)
- Pass callbacks (onAdd, onDelete) down to children

**Future**: Consider Zustand or Context API if state tree grows beyond 2-3 levels.

## Component Architecture

### Page-level Components
- `SavingsView`: Displays capital, income, accounts
- `ChartsView`: Charts and analytics
- `App.tsx`: Main container, state, routing

### Reusable Components (in `components/UI/`)
- `Button`: Primary, secondary, danger, ghost variants
- `Input`: With label, error state, prefix/suffix
- `Card`: Default, glass, outline variants
- `Modal`: Generic modal dialog
- `Badge`, `Alert`, `Skeleton`, `ListItem`, `Spinner`

### Feature Components
- `SavingsHeader`: Header with balance and income
- `AccountsList`: List of savings accounts
- `AddAccountModal`: Form to add new account
- `ProjectionChart`: Chart showing future value
- `TransactionItem`: Individual transaction in list

## Data Flow

### Adding a Transaction
1. User fills modal → calls `handleAddTransaction`
2. Optimistic local update + API call
3. Success → stays in list
4. Error → snackbar notification + rollback

### Deleting a Transaction
1. User clicks delete → animation starts
2. `removingIds` state adds ID
3. After 350ms → API call + item removed from list
4. Undo snackbar appears (5s timeout)

### Calculations
- **Total Balance**: sum of transaction amounts (excludes savings)
- **Total Capital**: sum of all savings amounts
- **Yearly Income**: sum of (savings amount × APY%)
- **Projections**: Compound interest over 12 months

## Styling & Design Tokens

### Colors
- Defined in `index.css` as CSS custom properties (`--tg-*`)
- Mapped to Tailwind via `tailwind.config.js`
- Use: `className="text-tg-text bg-tg-card"`

### Spacing Scale
- `xs` (4px), `sm` (8px), `md` (12px), `lg` (16px), `xl` (24px), `2xl` (32px)
- Use: `className="p-lg gap-md"`

### Animations
- Standard durations: `fast` (150ms), `normal` (300ms), `slow` (500ms)
- Keyframes in `index.css`: `fadeIn`, `slideUp`, `savings-remove`, `savings-enter`
- Apply with: `className="animate-fade-in"` or via Tailwind config

## Testing Strategy

### Unit Tests
- Utility functions: `services/__tests__/utils.test.ts`
- Calculations: `services/__tests__/savings.test.ts`
- Balance logic: `services/__tests__/balance.test.ts`

### E2E Tests (Cypress)
- Add transaction → verify in list
- Delete transaction → verify animation + undo
- Add savings → calculate income
- Verify total balance excludes savings

### Manual Testing
- **Mobile** (375px): modal fit, no page scroll
- **Desktop** (1024px+): layouts and interactions
- **Accessibility**: keyboard-only navigation, screen reader tests
- **Performance**: Lighthouse green (>90), no console errors

## Accessibility (a11y)

### Requirements
- ✅ Color contrast: 4.5:1 minimum (WCAG AA)
- ✅ Focus indicators: visible outline or ring
- ✅ ARIA labels: buttons, modals, charts
- ✅ Keyboard nav: Tab, Enter, Escape
- ✅ Reduced motion: respect `prefers-reduced-motion`

### Implementation
- Use semantic HTML (`<button>`, `<input>`, `<label>`)
- Add `aria-label` or visible text to interactive elements
- Test with keyboard-only interaction
- Use `focus:ring-2` for visible focus states

## Performance Optimization

### Code Splitting
- Lazy-load heavy components: `ProjectionChart` (Recharts ~100KB)
- Use `React.lazy` + `Suspense` + `Skeleton`

### Bundle Size
- Monitor with: `npm run build --report`
- Target: <500KB gzipped total

### Image/Icon Optimization
- Use `lucide-react` icons (tree-shakeable, 24x24px)
- SVG sprites for custom icons
- Avoid loading all icons at once

## API Integration (Convex)

### Queries
```tsx
const transactions = useQuery(api.transactions.list, {});
const savings = useQuery(api.savings.list, {});
```

### Mutations
```tsx
const addTransaction = useMutation(api.transactions.create);
await addTransaction({ amount, category, date });
```

### Error Handling
- Wrap calls in try/catch
- Show user-friendly error message
- Retry on network failure (exponential backoff)

## Git Workflow

### Branches
- `main` → production
- `develop` → staging
- `feature/...` → feature work

### Commits
```
feat: add savings delete animation
fix: resolve modal overflow on mobile
docs: update DESIGN.md
refactor: extract SavingsView components
```

### Pull Requests
- Run tests locally before pushing
- Ensure Lighthouse green
- Get code review before merge

## Deployment

### Staging
```bash
npm run build
npm run deploy:staging
```

### Production
```bash
npm run build
npm run deploy:prod
npm run monitor  # check Sentry for errors
```

## Documentation

- **DESIGN.md**: Color tokens, spacing, motion, typography, components
- **README.md**: Setup, installation, running locally
- **CONTRIBUTING.md**: PR guidelines, code style, testing
- **ARCHITECTURE.md**: This file
- **Component JSDoc**: Inline comments with @param, @returns

## Key Files & Responsibilities

| File | Responsibility |
|------|---|
| `App.tsx` | Main app state, route/view logic |
| `types.ts` | Shared TypeScript interfaces |
| `index.css` | Global styles, animations, theme |
| `tailwind.config.js` | Design tokens (colors, spacing, etc.) |
| `services/utils.ts` | Utility functions (format, calc, parse) |
| `services/convexClient.ts` | Convex setup & API client |
| `components/UI/index.tsx` | Reusable component library |
| `DESIGN.md` | Design system documentation |

## Debugging

### Console Logging
- Use sparingly; prefer React DevTools
- Log structured data: `console.log({ action, data })`

### React DevTools
- Inspect component tree
- Profile render performance
- Check prop values

### Network Tab
- Monitor API calls to Convex
- Check request/response payloads
- Look for failed requests (4xx, 5xx)

### Lighthouse
```bash
npm run build
npm run preview  # serve build locally
# Open DevTools → Lighthouse tab
```

---

**Last Updated**: November 2025  
**Maintainer**: @turbanpolina26-cell
