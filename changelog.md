# Changelog

## [2026-05-28]

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
