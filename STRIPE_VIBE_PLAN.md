# Stripe Vibe Store - Comprehensive Plan

Based on the [Gemini Vibe Coding Guide](https://gemini.google.com/share/763eeebf82d1), here is the roadmap to build your high-performance digital product store.

## 1. Required Services (The Stack)

To get this "vibe" live, you will need accounts for the following:

-   **Stripe**: The payment processor. You need a `Publishable Key` and `Secret Key`.
-   **Supabase (PostgreSQL)**: The database to store purchase records (who bought what).
    -   *Why?* To verify purchases and prevent unauthorized downloads.
-   **Resend** (or Postmark): The transactional email service.
    -   *Why?* To email the secure download link to the customer after purchase.
-   **Vercel Blob** (or AWS S3/Cloudflare R2): Cloud storage for your digital files.
    -   *Why?* To securely host the actual zip/pdf files.
-   **No CMS Needed**: We will use Stripe Products & Prices as the source of truth for product data.

## 2. Implementation Phases

### Phase 1: Foundation (Current Step)
-   [x] Initialize Next.js 14+ (App Router, TypeScript, Tailwind).
-   [x] Install backend dependencies (`stripe`, `@supabase/supabase-js`, `resend`, `@vercel/blob`).
-   [ ] Configure "Acid Goth" / "Digital Brutalism" design system (colors, fonts).
-   [ ] Set up Environment Variables (`.env.local`).

### Phase 2: The Core Engine (Backend) - **IN PROGRESS**
-   [ ] **Database Schema**: Create `purchases` table in Supabase.
-   [ ] **Stripe Integration**:
    -   Create `lib/stripe.ts` client.
    -   Create `POST /api/checkout`: Generates a Stripe Checkout Session.
    -   Create `POST /api/webhook`: Listens for `checkout.session.completed` event.
-   [ ] **Product Fetching**:
    -   Create utility to fetch active products/prices directly from Stripe API for display.

### Phase 3: The Vibe Interface (Frontend)
-   [ ] **Hero Section**: High-impact visuals.
-   [ ] **Product Display**: Glassmorphic cards with "Buy Now" buttons (fetching data from Stripe).
-   [ ] **Success Page**: A polished post-purchase experience.

### Phase 4: Delivery System
-   [ ] **Secure Downloads**: Generate temporary/signed URLs for the files (from Vercel Blob/S3).
-   [ ] **Email Trigger**: Send the download link via Resend when the webhook fires.

## 3. Immediate Next Steps
1.  **Supabase**: Run SQL query to create tables.
2.  **Env Vars**: Fill in `.env.local` with real keys.
3.  **Code**: Implement the API routes.
