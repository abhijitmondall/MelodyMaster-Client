# 🎵 MelodyMasters — Client

Modern music school frontend

**Stack:** Next.js · React · TypeScript · Tailwind CSS · Shadcn UI (Radix) · TanStack Query v5 · TanStack Form · Axios · Zustand · Zod

---

## Project Structure

```
src/
├── app/
│   ├── (public)/               # Public routes (Navbar + Footer layout)
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Home — Hero, About, Classes, Instructors, Testimonials
│   │   ├── classes/page.tsx    # All approved classes — search, sort, select
│   │   └── instructors/page.tsx
│   ├── auth/
│   │   ├── login/page.tsx      # Sign in — TanStack Form + Zod
│   │   └── signup/page.tsx     # Register — role selection (Student / Instructor)
│   ├── dashboard/
│   │   ├── layout.tsx          # Role-based sidebar (Admin / Instructor / Student)
│   │   ├── page.tsx            # Dynamic overview with role-aware stats
│   │   ├── admin/
│   │   │   ├── manage-users/page.tsx    # Role updates, user deletion
│   │   │   └── manage-classes/page.tsx  # Approve / Deny with feedback
│   │   ├── instructor/
│   │   │   ├── my-classes/page.tsx      # View own classes + status + feedback
│   │   │   └── add-class/page.tsx       # Submit new class for review
│   │   └── student/
│   │       ├── selected-classes/page.tsx  # Pay & enroll flow
│   │       ├── enrolled-classes/page.tsx  # Active enrollments
│   │       └── payment-history/page.tsx   # Full transaction table + totals
│   ├── layout.tsx              # Root layout — fonts, Providers wrapper
│   ├── loading.tsx             # Global loading state
│   └── not-found.tsx           # 404 page
├── components/
│   ├── home/                   # HeroSection, AboutUs, PopularClasses, PopularInstructors, Testimonials
│   ├── layout/                 # Navbar (sticky, mobile-friendly, role-aware), Footer
│   ├── providers/              # Providers.tsx — QueryClient + auth initializer
│   ├── shared/                 # ClassCard, InstructorCard, SectionTitle
│   └── ui/                     # 14 Shadcn primitives (Button, Input, Card, Badge, Avatar…)
├── hooks/                      # Custom React hooks
├── lib/
│   ├── api.ts                  # All API calls grouped by module (auth, classes, users…)
│   ├── axios.ts                # Axios instance + access/refresh token interceptors
│   ├── queryClient.ts          # TanStack Query client config
│   └── utils.ts                # cn, formatPrice, formatDate, getInitials…
├── stores/
│   └── authStore.ts            # Zustand — user, tokens, login, logout, initialize
└── types/
    └── index.ts                # All TypeScript interfaces matching the backend schema
```

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL to your backend URL
```

### 3. Start development server

```bash
npm run dev
# App runs on http://localhost:3001
```

### 4. Build for production

```bash
npm run build
npm start
```

---

## Pages & Features

### Public

| Route          | Description                                                                            |
| -------------- | -------------------------------------------------------------------------------------- |
| `/`            | Home — hero, about, popular classes (TanStack Query), instructors, testimonials        |
| `/classes`     | All approved classes — search, sort (popular/rating/price), select button for students |
| `/instructors` | All instructors — search by name/email                                                 |

### Auth

| Route          | Description                                               |
| -------------- | --------------------------------------------------------- |
| `/auth/login`  | Email + password sign-in — TanStack Form + Zod validation |
| `/auth/signup` | Registration with role selection (Student / Instructor)   |

### Dashboard — All Roles

| Route        | Description                                         |
| ------------ | --------------------------------------------------- |
| `/dashboard` | Role-aware overview: stat cards + recent data table |

### Dashboard — Admin

| Route                             | Description                                                |
| --------------------------------- | ---------------------------------------------------------- |
| `/dashboard/admin/manage-users`   | View all users, change roles, delete accounts              |
| `/dashboard/admin/manage-classes` | Approve or deny class submissions with instructor feedback |

### Dashboard — Instructor

| Route                              | Description                                              |
| ---------------------------------- | -------------------------------------------------------- |
| `/dashboard/instructor/my-classes` | View own classes with approval status and admin feedback |
| `/dashboard/instructor/add-class`  | Submit a new class for admin review                      |

### Dashboard — Student

| Route                                 | Description                                          |
| ------------------------------------- | ---------------------------------------------------- |
| `/dashboard/student/selected-classes` | Cart-like view — pay to enroll, remove selections    |
| `/dashboard/student/enrolled-classes` | Active course grid with enrollment date              |
| `/dashboard/student/payment-history`  | Full transaction table with totals and summary stats |

---

## Authentication Flow

```
POST /auth/signup  →  { user, tokens: { accessToken, refreshToken } }
POST /auth/signin  →  { user, tokens: { accessToken, refreshToken } }

Tokens stored in localStorage
Every request:  Authorization: Bearer <accessToken>

On 401:
  Axios interceptor auto-calls POST /auth/refresh
  Gets new token pair (rotation)
  Retries the original request transparently

On refresh failure:
  Clears localStorage
  Redirects to /auth/login
```

---

## Key Design Decisions

- **Zustand** manages auth state; `initialize()` is called once in `Providers.tsx` on mount to hydrate from `localStorage`
- **TanStack Query** handles all server state — queries are co-located with pages, keys are scoped by user email/role for correct cache isolation
- **TanStack Form** with Zod inline validators for login and signup — no extra form library dependencies
- **Axios interceptor** handles silent token refresh transparently — components never deal with auth errors directly
- **Role-based routing** in `dashboard/layout.tsx` — sidebar nav items and content are dynamically selected by `user.role`
- **Shadcn UI** primitives are hand-implemented (no CLI), following Tailwind v4 `@theme inline` token system with teal as primary
- **`availableSeats`** is a backend-computed virtual field — displayed directly without client-side calculation

---

## npm Scripts

| Script          | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start Next.js dev server (port 3000) |
| `npm run build` | Production build                     |
| `npm start`     | Start production server              |
| `npm run lint`  | Run ESLint                           |
