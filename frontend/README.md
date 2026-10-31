# Brightloop 360 — Frontend

This is the frontend client for **Brightloop 360** (Subscription Management System), built with Next.js, TypeScript, Tailwind CSS, and Lucide React.

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

3. Type-check & build:
```bash
npx tsc --noEmit
npm run build
```

## Authentication UI

- **Component:** `components/auth/LoginForm.tsx`
- **Features:**
  - Client-side validation (email format, password min length)
  - Show / hide password toggle
  - Remember me device state
  - "Forgot password?" interaction hook
  - Dynamic loading state with spinner
  - Accessible error and success alert banners
  - Enterprise SaaS theme with Brightloop 360 branding

For comprehensive architectural documentation, see the root [README.md](../README.md).
