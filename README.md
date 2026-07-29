# The Observation Files

A production-quality detective game web application built with Next.js, React, TypeScript, and modern web technologies.

## Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js 16** (App Router) | React framework with server components |
| **React 19** | UI library |
| **TypeScript** | Type safety |
| **TailwindCSS v4** | Utility-first styling |
| **Framer Motion** | Animation library |
| **Zustand** | State management |
| **TanStack React Query** | Server state management |
| **Supabase** | Backend as a Service (auth, database, storage) |
| **PostgreSQL** | Database |
| **Vitest** | Unit testing |
| **Playwright** | E2E testing |
| **ESLint / Prettier** | Code quality |
| **Husky / lint-staged** | Git hooks |

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm lint` | Lint all files |
| `pnpm lint:fix` | Lint and fix all files |
| `pnpm format` | Format all files with Prettier |
| `pnpm format:check` | Check formatting |
| `pnpm typecheck` | TypeScript type checking |
| `pnpm test` | Run unit tests (watch mode) |
| `pnpm test:run` | Run unit tests (single run) |
| `pnpm test:coverage` | Run unit tests with coverage |
| `pnpm test:e2e` | Run E2E tests |
| `pnpm clean` | Remove `.next` and `node_modules` |

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── (auth)/             # Authentication routes (login, signup)
│   ├── (main)/             # Main app routes (dashboard, cases, etc.)
│   ├── layout.tsx          # Root layout with providers
│   ├── error.tsx           # Error boundary
│   ├── loading.tsx         # Loading screen
│   └── not-found.tsx       # 404 page
├── components/             # Shared UI components
│   ├── ui/                 # Primitive UI components (Button, Card, Modal, etc.)
│   └── layout/             # Layout components (Sidebar, Navbar)
├── config/                 # Centralized application configuration
├── constants/              # Application constants
├── contexts/               # React contexts
├── features/               # Feature modules (feature-first architecture)
│   ├── authentication/
│   ├── dashboard/
│   ├── cases/
│   ├── investigation/
│   ├── observation/
│   ├── evidence/
│   ├── inventory/
│   ├── interrogation/
│   ├── dialogue/
│   ├── timeline/
│   ├── theory-board/
│   ├── contradictions/
│   ├── scoring/
│   ├── hints/
│   ├── achievements/
│   ├── profile/
│   ├── settings/
│   └── analytics/
├── hooks/                  # Shared React hooks
├── lib/                    # Core library utilities (Supabase client, logger)
├── providers/              # React context providers (Theme, Query, Supabase)
├── services/               # Service layer (API client, auth, storage, etc.)
├── stores/                 # Zustand state stores
├── styles/                 # Global styles
├── types/                  # TypeScript type definitions
│   ├── api/
│   ├── auth/
│   ├── case/
│   ├── database/
│   ├── evidence/
│   ├── inventory/
│   ├── npc/
│   ├── settings/
│   ├── timeline/
│   └── ui/
└── utils/                  # Utility functions
    ├── animations/
    ├── date/
    ├── errors/
    ├── formatting/
    ├── helpers/
    ├── math/
    ├── storage/
    └── validation/
supabase/                   # Database infrastructure
├── migrations/
├── schemas/
├── seed/
└── types/
tests/                      # Test files
├── unit/
├── integration/
├── e2e/
├── mocks/
└── utils/
```

## Architecture

### Feature-First Organization

Each domain feature is self-contained in `src/features/` with its own:

- `components/` - Feature-specific React components
- `hooks/` - Feature-specific React hooks
- `services/` - Feature-specific data access
- `types/` - Feature-specific TypeScript types
- `utils/` - Feature-specific utilities

### Service Layer

All external service interactions go through `src/services/`, not directly from components.

### State Management

- **Client state** (UI, auth, settings): Zustand stores in `src/stores/`
- **Server state** (API data): TanStack React Query
- **Persistent state** (user progress, preferences): Zustand with persist middleware

### Adding a New Feature

1. Create a new folder in `src/features/[feature-name]/`
2. Add subfolders: `components/`, `hooks/`, `services/`, `types/`, `utils/`
3. Create `index.ts` barrel files in each subfolder and the feature root
4. Register any new routes in `src/config/routes.ts`
5. Add navigation items in `src/config/navigation.ts` if needed

## Environment Variables

Copy `.env.example` to `.env`:

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | No | Supabase project URL (leave blank for offline/demo mode) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Supabase anonymous key (leave blank for offline/demo mode) |
| `NEXT_PUBLIC_APP_URL` | No | Application URL |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog analytics key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog host URL |

## Best Practices

1. **TypeScript strict mode** is enabled. Avoid `any` and unsafe type assertions.
2. **Absolute imports** with `@/` prefix (configured in `tsconfig.json`).
3. **Use Zustand for client state**, React Query for server state.
4. **Feature folders should be self-contained**. Cross-feature imports should go through the service layer.
5. **Components should be small and focused**. Use the shared UI components in `src/components/ui/`.
6. **Commit messages** should follow [Conventional Commits](https://www.conventionalcommits.org/).
7. **Always run `pnpm typecheck` and `pnpm lint` before committing.**

## License

Private - All rights reserved.
