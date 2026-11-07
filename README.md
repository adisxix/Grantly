# Grantly

### Find it. Fit it. Fund it.

Grantly is a local-first scholarship discovery and management platform that helps students find relevant funding, understand eligibility, prepare applications, track deadlines, and plan their education finances from one calm workspace.

The app learns a student's profile once, matches it against scholarships using transparent eligibility rules, and supports the complete journey:

**Onboard → Match → Understand → Prepare → Track → Submit → Fund**

## Features

- **Personalized onboarding** with profile validation, education details, GPA and income inputs, interests, and match preparation.
- **Scholarship discovery** with fuzzy search, filters, quick chips, sorting, grid/list views, URL-synced queries, and comparison tools.
- **Transparent matching** with 0–100 scores, eligibility explanations, match tiers, unmet requirements, and improvement hints.
- **Scholarship details** with eligibility checklists, required documents, application steps, essay prompts, similar scholarships, and calendar export.
- **Application tracker** with drag-and-drop Kanban columns, table view, checklists, notes, documents, essays, status updates, and readiness scoring.
- **Dashboard** with match statistics, saved applications, deadlines, readiness, next actions, and funding snapshots.
- **Calendar** with monthly deadlines, custom events, agenda information, and `.ics` export.
- **Document Vault** with IndexedDB file storage, drag-and-drop uploads, document categories, previews, tags, expiry tracking, and missing-document reminders.
- **Essay Studio** with a TipTap editor, autosave, version history, writing heuristics, word limits, prompt templates, and `.txt`/`.md` export.
- **Funding Planner** with cost and contribution inputs, funding-gap calculations, projections, and value-per-hour recommendations.
- **Insights** with application status charts, funding analytics, deadline heatmaps, KPIs, and printable reports.
- **Learn center** with searchable articles, glossary browsing, categories, and related content.
- **Command palette** with `Ctrl+K` / `Cmd+K` navigation, scholarship search, themes, and common actions.
- **Notifications** for deadlines at 7, 3, 1, and 0 days.
- **Accessibility and personalization** with keyboard navigation, skip links, semantic landmarks, focus states, reduced motion, high contrast, text sizing, and dark mode.
- **Offline-first experience** with localStorage, IndexedDB, bundled fonts, and no required backend.

## Tech Stack

- React 18
- TypeScript and TSX
- Vite
- Tailwind CSS
- React Router
- Zustand
- Radix UI primitives
- Framer Motion
- Recharts
- dnd-kit
- TipTap
- React Hook Form and Zod
- Fuse.js
- date-fns
- lucide-react
- Sonner
- Vitest and React Testing Library

## Getting Started

### Prerequisites

Make sure you have Node.js 18 or newer and npm installed.

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/adisxix/Grantly.git
cd "Grantly - Unified Scholarship Discovery & Management Platform"
npm install
```

### Development

Start the local development server:

```bash
npm run dev
```

Open the local URL shown by Vite in your browser.

### Production Build

Create and preview an optimized production build:

```bash
npm run build
npm run preview
```

### Quality Checks

Run the project checks:

```bash
npm run typecheck
npm run lint
npm test
```

## Architecture

```text
src/
├── app/
│   ├── layouts/       AppShell and MarketingLayout
│   ├── providers.tsx  Global providers and preferences
│   └── router.tsx     Lazy route configuration
├── components/
│   ├── dashboard/     Dashboard-specific components
│   ├── layout/        Navigation, shell, palette, and notifications
│   ├── scholarship/   Scholarship cards, matching, and eligibility
│   ├── tracker/       Application cards and drawer editor
│   └── ui/            Reusable accessible UI primitives
├── data/              Scholarship, article, glossary, and model data
├── features/
│   ├── calendar/      Calendar export
│   ├── demo/          Demo profile loading
│   ├── match/         Matching engine and tests
│   └── notifications/ Deadline scanning
├── hooks/             Shared React hooks
├── lib/               Formatting, storage, and utility helpers
├── pages/             Route-level page components
├── store/             Persisted Zustand stores
├── styles/            Design tokens, base styles, and print styles
└── main.tsx           Application entry point
```

## Matching Engine

The matching engine in `src/features/match/engine.ts` is pure, memoized, and covered by 25 unit tests. It combines hard eligibility filters with weighted criteria:

- Education level: 20%
- Field of study: 20%
- Academics: 20%
- Financial need: 15%
- Geography: 10%
- Demographics: 10%
- Interests: 5%

Each criterion reports `met`, `partial`, `unmet`, or `unknown`, with plain-language explanations and actionable hints.

## Design and Engineering Principles

- **Local-first:** user data remains on the device through localStorage and IndexedDB.
- **Transparent:** match scores and eligibility decisions are explainable.
- **Accessible:** color is never the only signal, controls are keyboard-operable, and focus states are visible.
- **Responsive:** layouts are tested across desktop and mobile viewport sizes.
- **Performant:** routes are lazy-loaded, selectors are focused, and animations respect reduced-motion preferences.
- **Type-safe:** application source uses TypeScript and TSX with compiler validation.
- **Privacy-conscious:** no account, server, or runtime data service is required.

## Known Limitations

- Scholarship data is fictional and intended for demonstration.
- Students should verify all requirements with the official scholarship provider.
- Currency conversion uses static local rates.
- There is no shared backend or multi-device synchronization.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Author

**Aditya Sharma**

- GitHub: [@adisxix](https://github.com/adisxix)
