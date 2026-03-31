# 🎵 MelodyMasters

A full-stack music class booking and management platform where students can browse and enroll in music classes, instructors can publish and manage their courses, and admins oversee the entire platform — all backed by Stripe payments.

---

## 🌐 Live URLs

| Service           | URL                                          |
| ----------------- | -------------------------------------------- |
| Frontend (Client) | `https://melodymaster-app.vercel.app`        |
| Backend (API)     | `https://melodymaster-api.vercel.app`        |
| API Health Check  | `https://melodymaster-api.vercel.app/health` |

> Replace the placeholders above with your actual deployed URLs.

---

## ✨ Features

### 🎓 Student

- Browse all available music classes with filtering and search
- View class details (instructor, seats, ratings, price)
- Select classes and add them to a personal cart
- Enroll via Stripe-powered checkout
- View enrolled classes and full payment history

### 🎤 Instructor

- Submit new music classes for admin review
- Manage personal class listings (edit, view stats)
- Track student enrollment counts per class

### 🛡️ Admin

- Approve or deny submitted classes with optional feedback
- Manage all platform users (view, update roles)
- Full visibility across classes, enrollments, and payments

### 🔐 Authentication & Security

- JWT-based access tokens (15 min) + refresh tokens (7 days)
- Secure `HttpOnly` cookie handling for refresh tokens
- Role-based route protection (Student / Instructor / Admin)
- Helmet, CORS, and request-size guards on the API

### 💳 Payments

- Stripe Checkout integration with success and cancel flows
- Stripe Webhook verification for reliable enrollment confirmation
- Per-student payment history with timestamps

### 🎨 UI / UX

- Responsive design with Tailwind CSS v4
- Animated page transitions via Framer Motion
- Accessible component library via Shadcn UI + Radix UI
- Real-time data with TanStack Query (server-state) and Zustand (client-state)

---

## 🛠 Technologies Used

### Client (`melodymaster_client`)

| Category      | Technology              |
| ------------- | ----------------------- |
| Framework     | Next.js 16 (App Router) |
| Language      | TypeScript 5            |
| Styling       | Tailwind CSS v4         |
| UI Components | Shadcn UI, Radix UI     |
| Animations    | Framer Motion           |
| Server State  | TanStack Query v5       |
| Forms         | TanStack Form v1        |
| Client State  | Zustand v5              |
| Validation    | Zod v4                  |
| HTTP Client   | Axios                   |
| Payments      | Stripe.js               |
| Icons         | Lucide React            |

### Server (`MelodyMaster_Server`)

| Category   | Technology            |
| ---------- | --------------------- |
| Runtime    | Node.js ≥ 22          |
| Framework  | Express v5            |
| Language   | TypeScript 6          |
| ORM        | Prisma v7             |
| Database   | PostgreSQL (Neon)     |
| Auth       | JSON Web Tokens (JWT) |
| Payments   | Stripe SDK v21        |
| Validation | Zod v4                |
| Security   | Helmet, CORS          |
| Logging    | Morgan                |
| Build      | tsup                  |

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js **≥ 22**
- PostgreSQL database (local or [Neon](https://neon.tech))
- A [Stripe](https://stripe.com) account (test mode is fine)
- Stripe CLI installed (for local webhook forwarding)

---

### 1. Clone the repositories

```bash
git clone https://github.com/abhijitmondall/MelodyMaster-Server.git
git clone https://github.com/abhijitmondall/MelodyMaster-Client.git
```

---

### 2. Server Setup

```bash
cd MelodyMaster_Server
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Fill in `.env`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/melodymasters?schema=public"

# App
NODE_ENV=development
PORT=5000

# JWT – Access Token
JWT_SECRET=your-access-token-secret-min-32-chars
JWT_EXPIRES_IN=15m

# JWT – Refresh Token
JWT_REFRESH_SECRET=your-refresh-token-secret-different-from-above
JWT_REFRESH_EXPIRES_IN=7d
REFRESH_TOKEN_TTL_MS=604800000

# Stripe
PAYMENT_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend (for Stripe redirect URLs)
FRONTEND_URL=http://localhost:3000

# CORS
ALLOWED_ORIGINS=http://localhost:3000
```

Run database migrations and seed data:

```bash
npm run db:migrate       # Apply Prisma migrations
npm run db:seed          # Seed initial data
npm run seed:admin       # Create the admin user
```

Start the development server:

```bash
npm run dev              # Starts on http://localhost:5000
```

Forward Stripe webhooks in a separate terminal:

```bash
npm run stripe:webhook   # Requires Stripe CLI to be installed
```

---

### 3. Client Setup

```bash
cd melodymaster_client
npm install
```

Create the environment file:

```bash
cp .env.example .env
```

Fill in `.env`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Start the development server:

```bash
npm run dev              # Starts on http://localhost:3000
```

---

### 4. Available Scripts

#### Server

| Script                   | Description                   |
| ------------------------ | ----------------------------- |
| `npm run dev`            | Start in watch mode (tsx)     |
| `npm run build`          | Compile for production        |
| `npm run start`          | Run the compiled build        |
| `npm run db:migrate`     | Run Prisma migrations         |
| `npm run db:studio`      | Open Prisma Studio GUI        |
| `npm run db:seed`        | Seed sample data              |
| `npm run stripe:webhook` | Forward Stripe events locally |

#### Client

| Script          | Description                |
| --------------- | -------------------------- |
| `npm run dev`   | Start Next.js dev server   |
| `npm run build` | Build for production       |
| `npm run start` | Serve the production build |
| `npm run lint`  | Run ESLint                 |

---

## 📁 Project Structure

```
MelodyMaster_Server/
├── prisma/
│   ├── schema/          # Split Prisma schema files (user, class, auth…)
│   ├── migrations/
│   └── seed.ts
└── src/
    ├── modules/         # Feature modules (auth, users, classes, payment…)
    │   └── <module>/    # controller · service · routes · validation · types
    ├── middleware/       # Auth, error handler, validation
    ├── utils/           # AppError, catchAsync, queryBuilder, sendResponse
    ├── config/
    └── server.ts

melodymaster_client/
└── src/
    ├── app/
    │   ├── (public)/    # Home, classes, instructors (unauthenticated)
    │   ├── auth/        # Login, signup
    │   ├── dashboard/   # Student · Instructor · Admin dashboards
    │   └── payment/     # Success & cancel pages
    ├── components/
    │   ├── home/        # HeroSection, PopularClasses, Instructors, Testimonials
    │   ├── layout/      # Navbar, Footer
    │   └── shared/      # ClassCard and other reusable components
    └── components/providers/
```

---

## 🔑 API Routes

| Method    | Endpoint                   | Description                    |
| --------- | -------------------------- | ------------------------------ |
| POST      | `/api/v1/auth/signup`      | Register a new user            |
| POST      | `/api/v1/auth/login`       | Login and receive tokens       |
| POST      | `/api/v1/auth/refresh`     | Refresh the access token       |
| GET       | `/api/v1/users`            | List all users (Admin)         |
| GET/PATCH | `/api/v1/users/:id`        | Get or update a user           |
| GET       | `/api/v1/classes`          | Browse all classes             |
| POST      | `/api/v1/classes`          | Create a class (Instructor)    |
| PATCH     | `/api/v1/classes/:id`      | Update class status (Admin)    |
| POST      | `/api/v1/selectedClasses`  | Add class to cart (Student)    |
| GET       | `/api/v1/selectedClasses`  | View cart                      |
| POST      | `/api/v1/payment/checkout` | Create Stripe checkout session |
| POST      | `/api/v1/payment/webhook`  | Stripe webhook handler         |
| GET       | `/api/v1/enrolledUsers`    | View enrolled classes          |
| GET       | `/health`                  | API health check               |

---

## 📄 License

ISC © MelodyMasters
