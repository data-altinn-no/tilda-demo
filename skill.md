# AI Agent Instructions - Tilda Demo Project

## Project Context

This is a **Norwegian government service demo application** for Tilda (Tilsynstilsynet Dashboard) - a data sharing service for supervision authorities in Norway. The application is built with React and demonstrates how supervision authorities can share and access supervision data.

**Critical**: All content, UI text, and documentation must be in **Norwegian (Bokmål)**. This is a Norwegian government service.

## Technology Stack

### Core Technologies
- **React 18.3.1** with functional components and hooks
- **Vite 7.2.2** for build tooling
- **React Router DOM 7.10.1** with HashRouter (GitHub Pages compatibility)
- **Tailwind CSS 3.3.5** for styling
- **Framer Motion 10.18.0** for animations
- **Recharts 2.8.0** for data visualization
- **Lucide React 0.294.0** for icons

### Project Structure
```
src/
├── components/
│   ├── charts/          # Recharts visualizations
│   ├── layout/          # Footer, DetailedBox, etc.
│   ├── modals/          # ComplianceModal, InfoModal
│   ├── tabs/            # Tab content components (14 files)
│   └── ui/              # Button, Card, Input, Badge, etc.
├── data/
│   ├── generators.js    # Data generation functions
│   └── aggregators.js   # Data aggregation logic
├── dataSamples/         # Sample data files
├── pages/               # Route-level components (9 pages)
├── utils/               # Helper functions (exportHelpers.js)
└── constants.js         # Norwegian authorities, cities, etc.
```

## Coding Standards

### 1. Language & Localization
- **ALL UI text must be in Norwegian (Bokmål)** - any text visible to users
- **Code, variables, functions, and comments should be in English** - for international development standards
- Exception: Use Norwegian terminology in data/constants when representing Norwegian domain concepts:
  - `tilsyn` = supervision
  - `brudd` = violation/breach
  - `myndighet` = authority
  - `rapport` = report
  - `koordinering` = coordination
- Example:
  ```jsx
  // ✅ CORRECT: English code, Norwegian UI text
  const handleSearch = () => {
    return <button>Søk</button>; // "Søk" is UI text in Norwegian
  };
  
  // ❌ WRONG: Norwegian code
  const håndterSøk = () => {
    return <button>Search</button>; // English UI text
  };
  ```

### 2. Component Patterns
- Use **functional components only** (no class components)
- Use React hooks: `useState`, `useMemo`, `useEffect`
- Export components as named exports: `export function ComponentName() {}`
- Always include JSDoc comments for page-level components

### 3. Styling Guidelines
- Use **Tailwind CSS utility classes** exclusively
- Custom classes defined in `index.css`:
  - `digdir-card` - standard card styling
  - `digdir-button`, `digdir-button-primary`, `digdir-button-secondary`
  - `digdir-input` - form inputs
  - `glass-card` - frosted glass effect
  - `animate-in` - entry animation
- Color palette from `tailwind.config.js`:
  - Primary: `primary-{50-900}` (main brand: `primary-500` = #0062BA)
  - Neutral: `neutral-{50-900}`
  - Semantic: `success`, `warning`, `danger`
- Responsive design: use `md:`, `lg:` breakpoints

### 4. Data Generation
- All data is **generated/synthetic** - no real API calls
- Data generators in `src/data/generators.js`:
  - `genTilsynsrapportFor(orgnr, fromDate, toDate)` - supervision reports
  - `genTilsynskoordineringFor(orgnr)` - coordination data
  - `genMeldingerFor(orgnr)` - messages
  - `genOrganisationDetailsFor(orgnr, name)` - org details
  - `genKjoretoyFor(orgnr)` - vehicles
  - `genEiendommerFor(orgnr)` - properties
  - `genRollerFor(orgnr)` - roles
  - `genOkInfoFor(orgnr, orgDetails)` - financial data
  - `genRelatedCompaniesFor(orgnr, name)` - related companies
- Use constants from `src/constants.js` for Norwegian data (cities, authorities, etc.)

### 5. Routing
- Use **HashRouter** for GitHub Pages compatibility
- Route structure:
  - `/` - LandingPage
  - `/tilda` - TildaPage (main dashboard)
  - `/datamodeller` - DataModelsPage
  - `/api` - ApiPage
  - `/veiledninger` - GuidesPage
  - `/kontakt` - ContactPage
  - `/kode` - CodePage
  - `/statistikk` - StatisticsPage
  - `/testdata` - TestDataPage
- Always use `<Link>` from `react-router-dom` for internal navigation

### 6. State Management
- Use local state with `useState` for component-specific state
- Use `useMemo` for expensive computations (e.g., data aggregation)
- Pass data via props (prop drilling pattern)
- No global state management library (Redux, Context, etc.)

### 7. Accessibility
- Include ARIA labels: `aria-label`, `aria-describedby`, `aria-invalid`
- Use semantic HTML: `<main>`, `<nav>`, `<footer>`, `<section>`
- Include skip links for keyboard navigation
- Proper focus management in modals
- Use `role="tablist"`, `role="tab"`, `role="tabpanel"` for tabs

### 8. Animation
- Use Framer Motion for page transitions:
  ```jsx
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
  ```
- Stagger animations for lists with `delay` in transition
- Loading states with spinner: `<div className="spinner w-6 h-6 border-blue-200 border-t-blue-600"></div>`

### 9. Icons
- Use **Lucide React** icons exclusively
- Import specific icons: `import { IconName } from "lucide-react"`
- Standard size: `w-4 h-4` or `w-5 h-5`
- Add `aria-hidden="true"` to decorative icons

### 10. Forms & Validation
- Organization number validation: exactly 9 digits
- Date inputs with Norwegian format
- Visual feedback for invalid inputs: `border-danger text-danger`
- Disable buttons when invalid: `disabled={!isValid}`

## Key Features to Maintain

### Dashboard (TildaPage)
- Organization lookup with 9-digit validation
- Date range filtering (default: last 3 years)
- Simulated API delay (1-2 seconds) on search
- Tab-based navigation (6 base tabs + 4 "mulighetsrom" tabs)
- Authority filtering with badge display
- Status indicator (colored circle) based on violation count
- Export functionality (CSV/JSON)

### Data Visualization
- Interactive Norway map (`src/components/charts/NorwayMap.jsx`)
- City coordinates from `CITY_COORDINATES` constant
- Recharts for trend analysis and statistics
- Violation distribution by authority

### Export System
- CSV export with proper formatting
- JSON export with indentation
- Authority-based filtering before export
- Functions in `src/utils/exportHelpers.js`

## Common Tasks

### Adding a New Page
1. Create component in `src/pages/NewPage.jsx`
2. Export from `src/pages/index.js`
3. Add route in `src/App.jsx`
4. Add navigation card in `LandingPage.jsx`
5. Use Norwegian text for all UI elements

### Adding a New Tab
1. Create tab component in `src/components/tabs/NewTab.jsx`
2. Export from `src/components/tabs/index.js`
3. Add tab definition in `TildaPage.jsx` tabs array
4. Add tab content rendering in tab panel section
5. Pass necessary props from TildaPage state

### Adding a New Data Generator
1. Add function to `src/data/generators.js`
2. Use constants from `src/constants.js` for Norwegian data
3. Generate realistic Norwegian data (names, addresses, dates)
4. Return consistent data structure
5. Call from `handleLookup` in `TildaPage.jsx`

### Modifying Styles
1. Use Tailwind utilities first
2. Add custom classes to `src/index.css` if needed
3. Follow existing patterns: `digdir-*` prefix for custom classes
4. Maintain responsive design with breakpoints
5. Test on mobile, tablet, and desktop

## Important Constraints

### DO NOT:
- ❌ Use English text in UI (must be Norwegian)
- ❌ Make real API calls (use generators)
- ❌ Use class components (functional only)
- ❌ Add global state management libraries
- ❌ Use CSS-in-JS libraries (Tailwind only)
- ❌ Change HashRouter to BrowserRouter (breaks GitHub Pages)
- ❌ Remove accessibility features
- ❌ Hard-code data (use generators)

### DO:
- ✅ Keep all UI text in Norwegian
- ✅ Use functional components with hooks
- ✅ Follow existing component patterns
- ✅ Maintain accessibility standards
- ✅ Use Tailwind CSS utilities
- ✅ Generate realistic Norwegian data
- ✅ Add JSDoc comments for components
- ✅ Test responsive design
- ✅ Use Framer Motion for animations
- ✅ Follow existing naming conventions

## Norwegian Government Design Guidelines

This project approximates **Digdir (Digitaliseringsdirektoratet)** design patterns:
- Clean, professional aesthetic
- High contrast for accessibility
- Consistent spacing and typography
- Blue primary color (#0062BA)
- Clear hierarchy and navigation
- Mobile-first responsive design

## Testing Checklist

When making changes, verify:
- [ ] All text is in Norwegian
- [ ] Responsive on mobile/tablet/desktop
- [ ] Accessibility features work (keyboard nav, screen readers)
- [ ] Data generation produces realistic Norwegian data
- [ ] Export functions work correctly
- [ ] Animations are smooth
- [ ] No console errors
- [ ] HashRouter navigation works
- [ ] Loading states display correctly
- [ ] Form validation works

## Build & Deployment

```bash
npm run dev      # Development server (localhost:5173)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # ESLint check
```

- Deployed to GitHub Pages via GitHub Actions
- Base path configured in `vite.config.js`
- Build artifacts in `dist/` directory

## Contact & Context

- **Service**: Tilda @ data.altinn.no
- **Owner**: Brønnøysundregistrene
- **Developer**: Digitaliseringsdirektoratet
- **Purpose**: Demo application for supervision authority data sharing
- **Data**: All data is synthetic/generated for demonstration

---

**Remember**: This is a Norwegian government service demo. Maintain professional standards, accessibility, and Norwegian language throughout all development work.
