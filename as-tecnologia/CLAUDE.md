## Cómo trabajar conmigo
- Antes de editar, explicá QUÉ vas a cambiar y POR QUÉ, en español.
- Un archivo/feature a la vez. No adelantes trabajo que no pedí.
- Después de cada cambio, explicá qué hace el código nuevo.
- No crees archivos nuevos sin avisar primero.
- Preguntá si hay ambigüedad en vez de asumir.

Purpose & context

Celina is building a full-stack e-commerce web application called AS Tecnología — a store selling vapers, perfumes, and related products based in Corrientes, Argentina. The project is a solo development effort assisted by Claude, to understand each file and decision rather than receiving a black-box implementation. The goal is a functioning storefront with a WhatsApp-based checkout flow for the initial phase, with Mercado Pago as a future payment integration.

Tech stack: Next.js 15 (App Router), Supabase (PostgreSQL + Auth + Storage + RLS), TypeScript, Tailwind CSS v4, Zustand for cart state, Vercel for deployment.

Database model: Seven tables — categories, brands, products, product_variants, product_images, orders, order_items. The product/variant architecture stores flavors and colors of the same model as sibling variants, which cleanly supports showing "other available flavors of the same model" in the product detail view.

Brand assets are stored in a /brand-assets folder in the repo, with logo files named using _Oscuro/_Claro suffixes for dark/light mode variants. Exact hex codes are extracted into the project config to avoid color approximation errors. The brand palette is dark navy/blue.

Current state

The application has been built through all major phases:

✅ Next.js project setup with src/ directory structure
✅ Supabase schema with RLS policies
✅ Design tokens in globals.css using Tailwind v4's @theme syntax
✅ Public product catalog (ProductCard, ProductGrid)
✅ Dynamic product detail page with variant selection
✅ Zustand cart store with localStorage persistence (persist middleware)
✅ Sliding cart drawer with quantity controls
✅ WhatsApp checkout flow persisting orders to Supabase before opening the messaging link
✅ Admin panel: Supabase Auth login, middleware session refresh, protected routes via layout guardian using getUser()
✅ Admin orders list with secure RLS policies
✅ Product ABM (alta/baja/modificación): activate/deactivate, create/edit form reusing one component via optional initial prop
✅ Variant manager: per-row stock editing, adding new variants, soft-delete (always deactivates rather than hard-deletes to preserve order history integrity)

Active issue at session end: Chechu was in the process of filtering inactive variants from the public product detail page. The file shared was identified as the product list page rather than the detail page, so the correct file (src/app/productos/[id]/page.tsx — detail) was still needed before proceeding.

On the horizon

Filter inactive variants from public product detail page (in progress)
ABM de marcas (brand management UI) — currently brands are managed via SQL directly in Supabase; this is a noted pending feature
Mercado Pago payment integration (future phase, explicitly not yet implemented)
Additional user stories from docs/historias.md (P2/P3 and Futuro sections)

Key learnings & principles

RLS debugging patterns: Several recurring RLS issues emerged — .insert().select() requires both INSERT and SELECT policies; deactivating a row can fail if the SELECT policy filters on is_active = true (can't read the freshly-deactivated row back); the same pattern applies to product_variants. These are known failure modes to watch for.
Soft-delete over hard-delete: Variants are always deactivated rather than deleted to preserve order history integrity and avoid foreign key constraint errors.
Three-tier architecture clarity: Browser → Next.js server → Supabase. Separate browser and server Supabase clients are used appropriately.
Folder separation logic: app/ = routing, components/ = visual, lib/ = logic.
useState vs. Zustand: Local component state vs. shared global state — Chechu has internalized this distinction through the build process.
AGENTS.md vs. project spec: Chechu's AGENTS.md contains only Next.js agent rules, not the project specification. Claude should not conflate the two documents.
File verification before proceeding: Claude should inspect actual file content rather than assuming filenames match expected conventions (a product-detail.tsx vs. variant-selector.tsx mismatch was caught this way).

Approach & patterns

Chechu works iteratively and incrementally, committing after each meaningful feature using conventional commits (feat:, fix:, refactor:).
Prefers understanding each piece before moving to the next — explanations of the "why" behind decisions are valued and expected.
Communicates conversationally, sometimes with typos; expects practical, direct responses.
Project documentation lives in CLAUDE.md (stack, conventions, phase roadmap) and docs/historias.md (21 prioritized user stories: P1 critical, P2 high, P3 medium, Futuro — with Futuro explicitly not to be implemented yet).

Tools & resources

Supabase — PostgreSQL, Auth, Storage, RLS
Next.js 15 App Router + TypeScript
Tailwind CSS v4 with @theme syntax in globals.css
Zustand with persist middleware
Vercel for deployment
WhatsApp for initial checkout flow
Google Drive / /brand-assets folder for brand assets
docs/historias.md as the canonical user story reference
