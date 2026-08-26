# Changelog

## [2026-08-26]

### Kriya House - new Company Profile demo, Retail and Toko

**Added**
- Demo 03 Kriya House (`demo/kriya-house/`), a fictional retail company profile for a curated local craft and home decor store, covering Home and Living, Fashion and Aksesoris, Self Care and Fragrance, and Gift and Stationery
  - Sections: hero with scroll triggered stat counters, marquee of category names, bento style category grid, 6 item featured product grid, brand story with three value pillars, horizontal scroll store gallery, testimonials, FAQ accordion, contact section with location and hours plus inline validated contact form, footer, WhatsApp floating button
  - Uses a light cream, rose, and ink color palette with gold accents, Cormorant Garamond and Manrope fonts, deliberately different from ForgeX (dark gold and black) and Rimba Kitchen (forest and terracotta) so each demo feels distinct
  - Self contained HTML, CSS, and JS, hand written CSS with no Tailwind dependency
  - Every product and gallery photo was opened individually on Unsplash and checked for a free license (not Unsplash Plus) and for no visible real brand names or logos before use
  - Verified HTML tag balance and zero em or en dash after the build
  - `preview.jpg` is a real browser screenshot of the live hero (captured via the local Laragon server), not a placeholder

### Company Profile Hub Update - `demo/company-profiles/index.html`

**Changed**
- Added a new hub card linking to Kriya House, industry label Retail and Toko, positioned after the Rimba Kitchen card
- Updated the "more industries in progress" note to remove Retail from the list since it is now live, leaving Beauty, Clinic, and more

### Portfolio Update - `index.html`

**Changed**
- Company Profile project card description updated to mention Retail alongside the existing Gym and Fitness, and Restaurant and Cafe industries

### Company Profile Hub - new picker page

**Added**
- New hub page `demo/company-profiles/` (plural, separate from ForgeX's own `demo/company-profile/` folder), a picker page listing every Company Profile demo by industry. Visitors land here first, then choose which industry demo to open
- Demo 02 Rimba Kitchen & Co. (`demo/rimba-kitchen/`), a fictional modern Indonesian restaurant and cafe company profile landing page
  - Sections: hero with scroll triggered stat counters, marquee, 6 item signature menu grid, ambience gallery, testimonials, FAQ accordion, reservation form with inline validation, contact and location, footer
  - Self contained HTML, CSS, and JS, hand written CSS with no Tailwind dependency, Google Fonts Fraunces and Outfit
  - Fully responsive on mobile, tablet, and desktop, verified with Playwright at desktop and mobile viewports plus interaction tests for the FAQ accordion, mobile menu, and form validation
  - `preview.jpg` is a real browser screenshot of the live hero (captured via the local Laragon server), not a placeholder

### Portfolio Restructure - `index.html`

**Changed**
- The ForgeX card in the Projects grid was replaced by a single "Company Profile" card, linking to the new `demo/company-profiles/` hub instead of straight to ForgeX. This keeps the whole thing inside the existing Projects section and grid, no separate section was added
- Card copy: title "Company Profile", subtitle "Multi-Industry Landing Page Demos", explains it currently covers Gym and Fitness plus Restaurant and Cafe
- Projects grid stays at 17 cards total (01 to 17), same count as before, card 01 is now the Company Profile hub card and the rest shifted down by one number, no other card content changed
- `assets/css/style.css` had a scoped rule added for a separate `#company-profile` section during an earlier draft of this change, then removed again once the section was folded back into Projects
- `demo/company-profiles/preview.jpg` also replaced with a real screenshot of the hub page hero, same reasoning as above

### Rimba Kitchen Image Fix - `demo/rimba-kitchen/index.html`

**Changed**
- All 6 menu item photos were mismatched to their dish names (for example a burger photo labeled as grilled fish). Replaced all 6 with visually accurate photos matching each dish: Nasi Bakar Rimba, Sate Rempah Nusantara, Ikan Bakar Sambal Matah, Rendang Daun Singkong, Es Kelapa Kopyor Gula Aren, Kopi Susu Gula Aren
- The 4 ambience gallery photos had the same issue (for example a pancake stack captioned as an outdoor table). Replaced all 4 with photos that actually match their captions: dining room, outdoor table, coffee corner, interior
- Every replacement photo was opened and visually checked on Unsplash before use, not just checked for a valid URL
- Verified HTML tag balance and zero em or en dash after the edit

### Rendang Daging Sapi - `demo/rimba-kitchen/index.html`

**Changed**
- Renamed the menu item "Rendang Daun Singkong" to "Rendang Daging Sapi" per Bagas's request, and swapped in a photo he picked directly on Unsplash showing shredded beef in thick spiced gravy
- Category tag changed from Vegetarian to Signature since the dish is no longer vegetarian
- Description rewritten for the beef version, still crediting the Minang rendang style
- Price adjusted from Rp 32.000 to Rp 55.000 to sit correctly among the other signature mains
- The FAQ answer that listed Rendang Daun Singkong as a vegetarian option was corrected so it no longer references this dish
- Renamed in both marquee loops and the image alt text as well, no leftover references to the old name
- Verified HTML tag balance and zero em or en dash after the edit

## [2026-05-28]

### Portfolio Restructure — `index.html`

**Removed**
- Demo #07 DevStack Studio (`demo/code-showcase/`) — deleted from portfolio and folder removed
- Demo #13 RoleGate (`demo/roleauth/`) — deleted from portfolio and folder removed
- Demo #10 StokKu (`demo/inventory/`) — replaced by MitraCRM; folder removed

**Added**
- Demo #09 MitraCRM (`demo/crm-system/`) — new CRM SPA replacing StokKu slot

**Changed**
- ErpCore renumbered #08 → #07
- TopUpKu renumbered #09 → #08
- BlazeNotif renumbered #11 → #10
- CerdasKu renumbered #12 → #11
- Portfolio now has 11 demos total (#01–#11)

### New Demo — MitraCRM (`demo/crm-system/`)

**Added**
- Single-file CRM SPA for PT Nusantara Digital, localStorage key `crm_mitra_v1`
- 4 modules: Dashboard, Kontak (contacts), Pipeline (Kanban), Laporan (analytics)
- Kanban pipeline with 5 stages: Prospek → Proposal → Negosiasi → Won / Lost
- Seed data: 12 contacts, 15 deals across all stages, 8 activities
- 4 Chart.js charts: pipeline bar, win/loss donut, monthly revenue bar, stage donut
- Full CRUD for contacts and deals via modals; "Maju" button advances deal stage
- Login: `sales@nusantaradigital.co.id` / `Demo@123`
- Color scheme: blue (#2563eb) primary, slate sidebar (#1e293b), light body (#f1f5f9)

### ForgeX Scroll-Snap — `demo/company-profile/index.html`

**Changed**
- `html` element: added `scroll-snap-type: y mandatory; scroll-padding-top: 72px;`
- `#hero`: set `height: 100vh; height: 100dvh; scroll-snap-align: start;`
- Marquee strip moved inside `#hero` (no longer a standalone section)
- All 4 `<div class="divider">` elements removed
- 7 sections (Program, Trainer, Harga, Testimoni, FAQ, CTA, Kontak) converted to full-viewport snap sections
- CTA banner: restyled via `#cta-section` CSS rule instead of inline padding
- Added `.snap-section` density overrides: `mb-14 → 1.5rem`, program card padding `→ 1.25rem`, trainer avatar `height: 160px`

### Portfolio Card Redesign — `assets/css/style.css` & `index.html`

**Changed**
- `.project-number` promoted to 8rem absolute watermark (`opacity: 0.05`, `bottom-right`) — no longer inline
- `.project-title` (brand name) now renders as small `0.68rem` gold uppercase label with `::before` dash accent
- `.project-subtitle` (descriptive name) promoted to large `1.3rem` white headline — primary read
- `.project-card:hover` now adds `inset box-shadow` gold border glow + `0 24px 64px` drop shadow
- Updated subtitles for 9 project cards to be fully descriptive:
  - KasirKu → "Point of Sale Cashier App"
  - APIJelajah → "REST API Testing & Explorer Tool"
  - ChatCerdas → "AI Chatbot App with Claude API"
  - BookinAja → "Spa Appointment & Booking System"
  - DevStack Studio → "Backend Code Showcase (PHP, Laravel, Python)"
  - ErpCore → "Multi-Module Enterprise Resource Planning (ERP)"
  - TopUpKu → "Game Voucher Top-Up & Payment Platform"
  - StokKu → "Inventory & Stock Management System"
  - CerdasKu → "Online IQ Test & Score Analysis Platform"
  - RoleGate → "Role-Based Access Control (RBAC) System"

### Demo Premium Enhancements

**Added**
- Favicon (`assets/img/favicon.svg`) added to all 10 demo HTML files
- Floating pill credit badge (glassmorphism, fixed bottom-right) replaced old inline footer banners in all demos
- Premium CSS blocks (`/* Premium Enhancements */`) added to demos not yet enhanced:
  - KasirKu: radial gradient bg, brand icon pulse animation, product card spring hover + `::before` overlay, cart slide-in, checkout gradient glow
  - StokKu: sidebar gradient + teal glow, brand logo gradient, stat card lift + shadow, page section slide-in animation
  - BookinAja, ChatCerdas, BlazeNotif, RoleGate: various gradient + glow + spring animation treatments

**Removed**
- Inline "Portfolio Demo" footer strip (`<div style="text-align:center...">`) from all demos
- `demo/hrd-dashboard/` entirely deleted (superseded by CG HRIS)

### HRIS System Fixes

**Changed**
- `js/modules/announcements.js`, `payroll.js`, `reports.js`, `settings.js`, `organization.js`, `training.js`, `employees.js`, `attendance.js`, `performance.js`: multiple bug fixes and refinements
- `js/data.js`, `js/app.js`, `js/auth.js`: data integrity and routing fixes
- `test_rbac.js`: updated to match auth fixes

---

## [2026-05-26]

### New Demo — CG HRIS (`demo/hris-system/`)

**Added**
- Full-featured HR Management System SPA for PT Cakrawala Gemilang (project #05)
- 12 modules: Dashboard, Karyawan, Kehadiran, Cuti, Penggajian, Rekrutmen, Kinerja, Pelatihan, Pengumuman, Organisasi, Laporan, Pengaturan
- Pure frontend SPA with hash-based routing and `localStorage` (prefix `hris_cg_`)
- RBAC with 4 roles: superadmin, hrmanager, hrstaff, employee — full permission matrix
- PPh21 (Indonesian income tax) calculation engine
- Chart.js analytics in Dashboard and Laporan modules
- 15 seed employees with full payroll, leave balance, attendance, and KPI data
- `CC BY-NC-ND 4.0` license
- Portfolio `index.html` updated: project #05 card added pointing to `demo/hris-system/`

### Automated Test Suite — `demo/hris-system/`

**Added**
- `test_runner.js` (246 lines) — Data layer: DB CRUD, seed integrity, payroll math, leave balance structure, field names, PPh21 calculation, reset/reseed
- `test_utils.js` (182 lines) — Utility functions: `formatDate`, `formatCurrency`, badge, paginate, `validateRequired` (string + object), `escapeHtml`, `generateId`
- `test_rbac.js` (210 lines) — RBAC & Auth: full permission matrix, menu access per role, all 4 login accounts, case-insensitive auth, `Auth.can` / `getSession` / `getUser`
- 108 tests total, 0 failures

---

## [2026-05-25]

### Design Improvements - `index.html` & `style.css`

**Added**
- Project cards #12 CerdasKu (`demo/iq-test/`) and #13 RoleGate (`demo/roleauth/`)
- Scroll-spy on navbar: active link highlights as user scrolls through sections (`.nav-links a.active`)
- Testimonial initials avatars (DR, AP, YZ) with `.testi-avatar` CSS
- Project grid orphan fix: `.project-card:last-child:nth-child(3n + 1) { grid-column: 1 / 2; }` prevents the 13th card from stretching full-width

**Changed**
- PT Ganzu experience bullets trimmed from 9 to 4 (kept bullets 1, 3, 5, 9)
- Contact form textarea height increased from `130px` to `160px`
- `about-photo-wrap` now centers on mobile (`margin: 0 auto`)

**Removed**
- Dead CSS: `#certifications`, `.cert-list`, `.cert-item` and all sub-rules (~64 lines)
- Dead CSS: `.project-difficulty`, `.difficulty-beginner` through `.difficulty-very-hard` (~46 lines)
- Duplicate CSS definitions for `.footer-links` and `.footer-source-link`
- Dead CSS: `.lang-toggle` and `.lang-btn` (removed alongside i18n system)

---

### Phase 1 - i18n Removal & Portfolio Cleanup

**Removed**
- `planning.md`
- `assets/js/i18n.js` (full bilingual EN/ID translation system)
- 143 `data-i18n` / `data-i18n-placeholder` attributes from `index.html`
- Language toggle buttons (EN/ID) from desktop navbar and mobile menu
- i18n-related JS from `main.js`: `initLanguage()`, `setLanguage()` event listeners, `getTypingTexts()`, `languageChanged` event listener

**Changed**
- Typing animation in `main.js` now uses hardcoded English strings (no more `translations` dependency)
- About text em dash replaced with commas
- `main.js` script version bumped to `?v=3`

---

### Phase 2 - Em Dash Cleanup (zero em dashes across entire project)

- `index.html`: 2 em dashes in about text fixed
- `assets/js/main.js`: em dash in comment fixed
- `demo/company-profile/index.html`: 3 em dashes replaced with hyphens
- `demo/iq-test/index.html`: 3 em dashes fixed (blurred placeholders now show `??`, 1 in inline comment)
- `demo/topup/index.html`: 5 em dashes replaced with hyphens
- `demo/roleauth/index.html`: 7 em dashes replaced with hyphens
