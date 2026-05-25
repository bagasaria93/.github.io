# Changelog

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
