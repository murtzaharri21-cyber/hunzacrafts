# Hunza & Co. — Authentic Products from the Heart of Hunza

A modern, premium, fully responsive e-commerce storefront for **Hunza & Co.**, a brand
selling authentic local products from the Hunza Valley in Pakistan — sun-dried apricots,
wild honey, dry fruits, herbal goods, and handmade crafts.

Built with **React 19 + TanStack Start v1**, **Tailwind CSS v4**, and **Supabase (Lovable Cloud)**
for auth, database, and storage. Includes an authenticated **MCP (Model Context Protocol) server**
so AI agents can browse the catalog securely.

---

## ✨ Features

- **Storefront**
  - Home page with hero, category showcase, featured products, bestsellers, new arrivals, and testimonials.
  - Shop page with category filtering, sorting, and quick-view.
  - Product detail page with image gallery, zoom, JSON-LD structured data.
  - About, Contact, Cart, Checkout, Order confirmation, and Wishlist pages.
  - SEO essentials: per-route meta/OG tags, `sitemap.xml`, `robots.txt`.
- **Admin (restricted)**
  - Admin-only login (no public sign-up).
  - Add, edit, hide/restore, and delete products.
  - Editable homepage hero (text + images) and contact details.
  - Product image uploads (auto-resized to data URLs).
  - Audit log tracking who changed the catalog and when.
  - Order requests are recorded and visible to admins for full order audit (contact, shipping, itemized images/text).
- **Cart & Wishlist** persisted in `localStorage`.
- **MCP server** (`/mcp`) with OAuth 2.1 — tools: `list_categories`, `list_products`,
  `search_products`, `get_product`.
- **Auth** via Supabase email/password + Google, gated by a `user_roles` table.

---

## 🧱 Tech Stack

| Area        | Tech                                             |
| ----------- | ------------------------------------------------ |
| Framework   | TanStack Start v1 (React 19, file-based routing)  |
| Build       | Vite 7                                           |
| Styling     | Tailwind CSS v4 (CSS-first `@theme`)             |
| UI          | shadcn/ui (New York style) + lucide-react         |
| State       | TanStack Query + React Context                   |
| Backend     | Supabase (Lovable Cloud) — Postgres, Auth, Storage|
| AI agents   | `@lovable.dev/mcp-js` (MCP, OAuth 2.1)           |

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js 20+** (or [Bun](https://bun.sh) 1.1+)
- A Supabase project (the app expects Lovable Cloud, but any Supabase project works)

### 2. Install dependencies

```bash
npm install
# or
bun install
```

### 3. Configure environment

Copy the example env file and fill in your Supabase project's publishable keys:

```bash
cp .env.example .env
```

```dotenv
SUPABASE_PROJECT_ID="your-project-id"
SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
```

> The publishable/anon keys are safe to expose in the browser bundle. Never commit a
> service-role key.

### 4. Run the database migrations

Apply the SQL files under `supabase/migrations/` to your Supabase project (Database → SQL editor,
or the Supabase CLI). They create the `user_roles` table, the `has_role()` helper, RLS policies,
and the `product_audit_log` table.

### 5. Start the dev server

```bash
npm run dev
# or
bun run dev
```

Open `http://localhost:8080`.

### 6. Build for production

```bash
npm run build
npm run preview
```

---

## 👑 Admin Access

Sign-up is disabled. Only users with an `admin` row in `public.user_roles` can log in.

To make someone an admin, run in SQL:

```sql
insert into public.user_roles (user_id, role)
values ('<auth-user-uuid>', 'admin')
on conflict (user_id, role) do nothing;
```

Admins sign in at `/auth`.

---

## 🗂️ Project Structure

```
.
├── public/                 # favicon, robots.txt
├── src/
│   ├── assets/             # product/hero images
│   ├── components/
│   │   ├── layout/         # Header, Footer, SiteLayout
│   │   ├── ui/             # shadcn/ui primitives
│   │   ├── ProductCard.tsx
│   │   ├── QuickViewDialog.tsx
│   │   ├── AddProductDialog.tsx   # add/edit product (admin)
│   │   ├── EditHeroDialog.tsx     # edit homepage hero (admin)
│   │   └── EditContactDialog.tsx # edit contact details (admin)
│   ├── hooks/
│   ├── integrations/
│   │   ├── lovable/        # error reporting
│   │   └── supabase/       # auto-generated Supabase client (do not edit)
│   ├── lib/
│   │   ├── products.ts     # seed catalog
│   │   ├── admin-context.tsx
│   │   ├── cart-context.tsx
│   │   ├── wishlist-context.tsx
│   │   ├── site-content.tsx
│   │   └── mcp/            # MCP server + tools
│   ├── routes/             # file-based routes (TanStack Router)
│   ├── router.tsx
│   ├── start.ts
│   ├── server.ts
│   └── styles.css          # Tailwind v4 theme tokens
├── supabase/
│   ├── config.toml
│   └── migrations/         # SQL migrations
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 🔌 MCP Server

The app exposes an MCP endpoint at `/mcp` protected by OAuth 2.1 (Supabase auth).
Available tools:

- `list_categories` — list catalog sections
- `list_products` — browse (optionally filtered by category)
- `search_products` — keyword search
- `get_product` — full details on one item

---

## 📝 License

This project is provided for the Hunza & Co. brand. Adjust licensing to your needs
before publishing.
