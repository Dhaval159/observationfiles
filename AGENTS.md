# The Observation Files - Agent Guide

This guide helps AI agents understand the project structure and conventions.

## Project Overview

A detective game web application built with Next.js 16 (App Router), React 19, TypeScript, and Supabase.

## Architecture Rules

1. **Feature isolation**: Each feature in `src/features/` owns its components, hooks, services, types, and utils. Cross-feature communication goes through the service layer or stores.

2. **Component hierarchy**: Use `src/components/ui/` for reusable primitives (Button, Modal, Card). Use `src/components/layout/` for layout components. Use `src/features/*/components/` for feature-specific components.

3. **State management**: 
   - Zustand stores in `src/stores/` for client state (UI, auth, settings, progress)
   - React Query for server state (API calls, Supabase queries)
   - Persist middleware for data that needs to survive page reloads

4. **Service layer**: All external API calls go through `src/services/`. Components never directly call Supabase or fetch.

5. **Config centralization**: App configuration lives in `src/config/`. Never hardcode routes, theme values, or feature flags in components.

## Common Tasks

### Adding a route
1. Create page file in `src/app/` under appropriate route group
2. Add path to `src/config/routes.ts`
3. Add to navigation in `src/config/navigation.ts` if needed

### Adding a new feature
1. Create `src/features/[name]/` with subfolders
2. Create barrel exports in each subfolder
3. Export from `src/features/index.ts`

### Adding shared UI
1. Create component in `src/components/ui/`
2. Export from `src/components/ui/index.ts`

## Build Commands

```bash
pnpm typecheck  # Always run before committing
pnpm lint       # ESLint
pnpm build      # Production build
pnpm test:run   # Unit tests
```

## Environment

Required env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
