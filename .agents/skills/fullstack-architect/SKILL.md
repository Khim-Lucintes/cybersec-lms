---
name: fullstack-architect
description: >-
  Expert guidance for full-stack web application development and clean system architecture.
  Use when designing, scaffolding, refactoring, or implementing full-stack features (frontend,
  backend, APIs, database modeling, Supabase, Next.js, state management, security, and clean code principles).
---

# Full-Stack Engineering & Architecture Skill

This skill guides full-stack feature design, architectural decision-making, clean code practices, database schema modeling (including Supabase/PostgreSQL), and robust frontend/backend integration.

---

## 1. Architectural Principles & Layers

When building or refactoring full-stack features, adhere strictly to a clean, decoupled layer structure:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  - UI Components (React / Next.js Pages / Components)       │
│  - Client State, ViewModels, Interactive Hooks              │
├─────────────────────────────────────────────────────────────┤
│                    Application / Route Layer                │
│  - Server Components, Server Actions, Route Handlers (API)  │
│  - Request Validation, Authentication, Session Validation   │
├─────────────────────────────────────────────────────────────┤
│                    Domain / Service Layer                   │
│  - Business logic, computations, orchestrations             │
│  - Independent of UI and external HTTP request wrappers     │
├─────────────────────────────────────────────────────────────┤
│                    Data Access / Persistence Layer          │
│  - Supabase client / ORM / Database queries                 │
│  - Row Level Security (RLS) policies, schema migrations     │
└─────────────────────────────────────────────────────────────┘
```

### Core Rules
1. **Separation of Concerns**: Never embed raw database queries or Supabase service role keys inside client UI components.
2. **Single Source of Truth**: Define data models and types centrally (e.g. `lib/types/` or `types/database.ts`).
3. **Fail Fast & Validate Early**: Validate all client inputs at the boundary using schema validation (e.g., Zod) before domain processing.
4. **Resilience & Graceful Degradation**: Handle loading, empty, and error states explicitly in UI.

---

## 2. Directory & Modular Architecture Pattern

For modern full-stack web applications (e.g. Next.js App Router + Supabase):

```text
├── app/                      # App router (routes, layouts, pages, route handlers)
│   ├── (auth)/               # Auth route group
│   ├── api/                  # Backend REST / webhook endpoints
│   ├── dashboard/            # Protected domain routes
│   └── globals.css           # Global design system & theme tokens
├── components/               # Reusable UI component system
│   ├── ui/                   # Primitive atoms (buttons, inputs, modals, cards)
│   ├── layout/               # Navbars, sidebars, headers, footers
│   └── modules/              # Feature-specific composite components
├── lib/                      # Shared core utilities and configurations
│   ├── supabase/             # Supabase clients (client, server, admin/middleware)
│   ├── services/             # Domain & business logic services
│   ├── hooks/                # Custom React hooks
│   ├── validations/          # Schema validators (Zod schemas)
│   └── utils.ts              # Generic helper utilities
├── types/                    # TypeScript interfaces, database entity types
└── public/                   # Static assets
```

---

## 3. Database & Supabase Architectural Patterns

### A. Client Segregation
Always isolate Supabase client instantiation into specific contexts:
- **Browser Client (`lib/supabase/client.ts`)**: Uses standard public anon key for client-side queries adhering to RLS.
- **Server Component / Server Action Client (`lib/supabase/server.ts`)**: Reads session cookies securely on the server.
- **Admin / Service Role (`lib/supabase/admin.ts`)**: Used ONLY in secure server routes/actions when bypassing RLS is strictly necessary. Never expose service keys to the client.

### B. Row Level Security (RLS) & Schema Design
- Enable RLS on every table by default (`ALTER TABLE tablename ENABLE ROW LEVEL SECURITY;`).
- Always write explicit RLS policies for `SELECT`, `INSERT`, `UPDATE`, `DELETE` operations tied to `auth.uid()`.
- Use relational foreign keys with appropriate `ON DELETE CASCADE` or `ON DELETE SET NULL` constraints.
- Create indexes for foreign keys and frequently queried filter/sort columns.

---

## 4. Frontend & Component Engineering Standards

1. **Server vs. Client Components**:
   - Keep components as Server Components by default for optimal performance and SEO.
   - Use `'use client'` only when utilizing React hooks (`useState`, `useEffect`, event listeners) or browser APIs.
2. **State Management**:
   - **Server State**: Leverage caching, server actions, or SWR/React Query for remote data.
   - **Local State**: `useState` / `useReducer` for UI state.
   - **Global State**: React Context or lightweight store (e.g., Zustand) only when cross-tree sync is required.
3. **Design System & Aesthetics**:
   - Establish cohesive CSS variables for palette, typography, radii, and elevations.
   - Ensure dynamic interactions: hover transitions, active states, loading skeletons, accessible focus rings.

---

## 5. Security & Robustness Checklist

- [ ] **Input Sanitization**: Validate all inputs at API/Server Action boundaries.
- [ ] **Authentication & Authorization**: Verify authenticated user session and role before mutating domain data.
- [ ] **Environment Variables**: Prefix client-accessible envs with `NEXT_PUBLIC_` only when intentional; sensitive keys stay server-only.
- [ ] **Error Handling**: Catch exceptions at service boundaries and return standardized error objects `{ data, error }`.
- [ ] **Optimistic UI Updates**: Apply optimistic updates for fast user feedback with rollback on failure.

---

## 6. Detailed Reference Guides

For in-depth patterns and code templates, refer to:
- [Architecture & Layer Patterns](./references/architecture_patterns.md)
- [Supabase & Data Access Recipes](./references/supabase_recipes.md)
- [API & Server Action Best Practices](./references/api_patterns.md)
