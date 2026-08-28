# Changelog

### Danamitra Finance - new company profile demo added, tenth in the collection, hub grid now 5x2

**Added**
- New company profile demo for Danamitra Finance, a fictional multifinance company serving motorcycle credit, car credit, electronics credit, and cash loans against BPKB collateral
- Distinct deep teal and warm gold palette on a cool mist white background, paired with Plus Jakarta Sans and Inter for a trustworthy yet modern fintech feel, kept different from every other demo's colors and fonts
- New interactive mechanic not used anywhere else in the collection: a live installment simulator placed right inside the hero, with a slider for the loan amount and tenor buttons for 12, 24, 36, and 48 months that recalculates the estimated monthly installment in real time, clearly labeled as an estimate and not a formal offer
- Product cards, advantages, and application steps all use custom SVG icons rather than photos, both for a cleaner premium look and to avoid the vehicle brand logo risk that comes with motorcycle and car photos
- Content includes a financing product grid, an advantages section with a consultation photo and a floating stat badge, a four step application flow, a branch network section with city list, star rated testimonials, an application form with inline validation, and an FAQ
- Sourced two lifestyle photos from Unsplash, each checked at full resolution for free license and absence of visible real brand names or logos, with the sourcing log kept in the demo's own notes file
- Added the tenth card to the company profile hub page for Danamitra Finance and widened the hub grid from four columns to five so it now shows a 5 by 2 layout, with adjusted responsive breakpoints for tablet and mobile, exactly as Bagas had planned once both new demos were done
- Added Finance to the industry list on the homepage project description
- Fixed a duplicate id bug found during testing where the financing product section and the form select field shared the same id, which made the jenis pembiayaan field always fail validation, resolved by giving the select a unique id
- Verified HTML tag balance and zero em or en dash on every file touched, confirmed the installment calculator math and form validation behavior, and checked the layout across desktop and simulated mobile widths before delivery

### Karya Presisi - new company profile demo added, ninth in the collection

**Added**
- New company profile demo for Karya Presisi, a fictional contract manufacturing business serving CNC machining, metal fabrication and welding, plastic injection molding, and assembly line services for industrial clients around Bekasi, Cikarang, and Karawang
- Distinct charcoal and industrial safety orange palette on a light steel gray background, paired with Saira Condensed, IBM Plex Sans, and IBM Plex Mono for a technical, engineering feel, kept deliberately different from every other demo's colors and fonts
- New interactive mechanic not used anywhere else in the collection: a numbered five stage production line flow, from raw material through processing, quality control, assembly, and shipping, with a connecting progress line and a detail panel that swaps photo and copy per stage on click
- B2B oriented content structure throughout, including a capability grid, an industries served grid, ISO 9001:2015 and K3 certification badges, a facility photo gallery, B2B style testimonials, and a request for quotation form with company, PIC, need type, and volume fields instead of a consumer booking form
- Sourced seven photos from Unsplash, each checked individually at full resolution for free license and absence of visible real brand names or logos, including checking whether the uploading account itself was a real named company, with the full sourcing log kept in the demo's own notes file
- Added a ninth card to the company profile hub page for Karya Presisi, keeping the existing four column grid and every other demo untouched, and added Manufacturing to the industry list on the homepage project description
- Verified HTML tag balance and zero em or en dash on every file touched, and checked the new page's layout and interactive production line flow across desktop and simulated mobile widths before delivery

### Studio Embun - hero photo still off center, real fix

**Fixed**
- The previous fix shrank the photo and ring to fit the mobile container but Bagas sent a fresh screenshot showing it was still sitting off to the left, not centered
- Traced it properly this time by inspecting live computed styles instead of just eyeballing a screenshot: the hero visual container was rendering at zero width. The container's only children are the photo and the decorative ring, both position absolute, and absolutely positioned elements do not count toward their parent's size when that size is based on content, so once margin auto was added for centering, the container had nothing to size itself against and collapsed to zero width, which threw off every position calculated relative to it
- Fixed by giving the container an explicit width instead of only a max-width, so it has a real size for the centering margins and the photo and ring inside it to be positioned against
- Verified the fix by reading the actual rendered position and width of the container, the photo, and the ring in the browser rather than relying on a screenshot alone, confirmed balanced margins on both sides at a simulated 390px phone width, then re-verified HTML tag balance and zero em or en dash on the updated index.html

### Studio Embun - hero photo mobile centering fix

**Fixed**
- Bagas sent a screenshot from his own phone showing the hero photo sitting off to the left on mobile instead of centered, with a sliver of the decorative ring visible at the far right edge
- Root cause: the hero photo and its decorative ring are absolutely positioned elements with fixed desktop sized widths, 360px and 320px, anchored from the right edge of their container, the mobile override only shrank and centered the container itself down to 380px but never resized the fixed width photo and ring inside it, so on real phone widths the photo overflowed past the container's left edge instead of sitting centered
- Fixed by shrinking the mobile hero visual container further to 300px and scaling the photo and ring down to fit inside it with balanced margins on both sides, so the whole hero visual now sits genuinely centered on phone screens
- Verified HTML tag balance and zero em or en dash on the updated index.html, and visually confirmed the centered result by rendering the live page inside a sized iframe to simulate a real 390px phone width

### Studio Embun - mobile responsiveness fixes

**Fixed**
- Bagas reported the mobile view of Studio Embun did not look tidy, checked it by rendering the live page inside a sized iframe to simulate real phone width, since the browser's own resize tool does not change the actual page viewport
- Navbar issue: the Booking Sekarang button in the header was not hidden at the mobile breakpoint like it is in every other demo, which squeezed the Studio Embun logo into two cramped lines next to the button and hamburger icon, fixed by hiding that header button under 768px, matching the pattern already used in Torsi Garage and Karsa Bangun
- Treatment list issue: each row in the Treatment Unggulan section kept its thumbnail image and text side by side even on narrow phone screens, leaving only a very cramped column for the title, description, and price, causing heavy word wrapping and a messy look, fixed under 480px by stacking each row vertically, full width photo on top, followed by title, description, duration, price, and the booking link
- Minor polish: the two column feature list in the Cerita Kami section was tight at small phone widths, changed to stack into a single column under 480px for better breathing room
- Verified HTML tag balance and zero em or en dash on the updated index.html, and visually confirmed all three fixes render correctly at simulated phone width in the browser

### Company profile hub page - grid layout changed to 4 columns

**Added**
- Changed the hub page's demo grid from a 2 column by 4 row layout to a 4 column by 2 row layout, at Bagas's request, so all eight demo cards are visible within two rows on desktop
- Widened the grid section's container from the shared 1180px wrap to a new 1560px wide wrap, used only for this section, so each card keeps enough room for its preview image, title, and description
- Reduced card body padding, title font size, description font size, and description line height slightly to keep the narrower cards feeling balanced rather than cramped
- Shortened all eight card descriptions to one focused sentence highlighting each demo's standout interactive mechanic, instead of the longer multi clause descriptions used before
- Added a new tablet breakpoint at 1200px that drops the grid to 2 columns, keeping the existing 768px breakpoint that drops it to 1 column for mobile
- Verified HTML tag balance and zero em or en dash on the hub page after all edits, and visually confirmed the new 4 column layout renders correctly in the browser

### Cendekia Prima - new demo, eighth and final entry completing all seven Tier 1 industries

**Added**
- New company profile demo for the Kursus and Bimbel industry, the seventh and last of the Tier 1 industries Bagas listed, built after Bagas replied lanjut giving explicit permission to move on from Torsi Garage
- Business identity: Cendekia Prima, a tutoring center covering SD, SMP, SMA, and UTBK exam prep, positioned around structured modules, small class sizes, and regular try outs to track student progress
- Palette and fonts chosen to stay distinct from all seven prior demos: indigo and coral over a cream background, paired with Baloo 2 and Nunito Sans, a rounded friendly display and a clean humanist body pairing not used anywhere else in the project
- Hero includes an animated stats row, years established, active students, and experienced tutors, counting up on scroll, plus a floating try out rutin highlight card over the hero photo
- New interactive mechanic not present in any other demo: a four option Jenjang tab switcher, SD, SMP, SMA, and UTBK, in the Program dan Harga section that swaps the entire program and pricing grid per jenjang, deliberately shaped as discrete pill tabs rather than the binary toggle used in Torsi Garage to keep the interaction pattern distinct
- Each jenjang panel carries three program cards with one featured program, covering all four jenjang with real pricing content for every tier
- Four card Keunggulan grid, small classes, structured modules, regular try outs, and parent consultations
- Photo gallery of classroom and study scenes
- Testimonial grid with parent and student quotes and star ratings
- Konsultasi Gratis form with fields for full name, WhatsApp number, child's jenjang, school name, subject to consult about, and an optional note, with inline validation per field and no browser alert, tested both the empty submit error state and a full valid submission showing the success message
- FAQ accordion covering trial classes, class size, curriculum, and scheduling
- Education photography needed the same branding diligence as prior demos, several strong candidates were rejected for a visible SAMSUNG logo on a laptop lid and clearly legible GAP and Nike logos on students' clothing in an otherwise excellent classroom series, the accepted hero and gallery photos were each zoomed into uniform badges, bags, and printed material before acceptance, full list kept in the demo folder's image sourcing notes, including a favorable find of an Indonesian context photographer whose free photos of a batik uniform exam scene and a hijab wearing teacher fit the brand and locale well
- New favicon with an indigo gradient square and a CP monogram in coral
- Hub page updated with a new card for Cendekia Prima, and the More industries in progress note removed entirely since this completes all seven Tier 1 industries
- Root portfolio page's company profile collection description updated to include Education alongside the other six industries
- Verified HTML tag balance and zero em or en dash on the new index.html, the new README, the hub page edit, the root page edit, and this changelog entry
- This closes out the full Tier 1 sequence: Gym and Fitness, Restaurant and Cafe, Electronics and Gadget, Beauty, Health, Contractor, Automotive, and Education, all seven live and cross linked from the hub page

### Torsi Garage - new demo, seventh in the company profile collection

**Added**
- New company profile demo for the Bengkel and Otomotif industry, the sixth of the seven Tier 1 industries Bagas listed, built after Bagas replied oke lanjut giving explicit permission to move on from Karsa Bangun to Bengkel, with Kursus and Bimbel still not started
- Business identity: Torsi Garage, a workshop servicing both cars and motorcycles, covering routine service, oil changes, wheel alignment and balancing, electrical and AC repair, and matic or clutch service for motorcycles, positioned around honest pricing and upfront cost estimates
- Palette and fonts chosen to stay distinct from all six live demos: asphalt black and racing yellow over a concrete gray background, paired with Oswald and Mulish, a condensed industrial display and a clean humanist body pairing not used anywhere else in the project
- Hero includes an animated stats row, years of experience, vehicles serviced, and certified mechanics, counting up on scroll, plus a floating service warranty highlight card over the hero photo
- New interactive mechanic not present in any other demo: a Mobil and Motor toggle switch in the Harga Servis section that swaps the entire price list between car and motorcycle services with an animated knob and a fade transition
- Six service cards each tagged Mobil, Motor, or both, a trust badge strip for original parts, experienced mechanics, service warranty, and transparent estimates
- Filterable gallery with category buttons, Semua, Mobil, and Motor, tested and confirmed filtering works correctly
- Testimonial grid with client quotes and star ratings
- Booking Servis form with fields for full name, WhatsApp number, vehicle type, service type, preferred service date, plate number, and an optional note, with inline validation per field and no browser alert, tested both the empty submit error state and a full valid submission showing the success message
- FAQ accordion covering booking requirements, service duration, parts authenticity, warranty coverage, and waiting at the workshop
- Automotive photography carried a higher branding risk than any prior demo, several strong candidates were rejected mid session for a legible engine manufacturer name embossed on a carburetor, a partial motorcycle model badge on a fuel tank, and a clearly readable glove brand wordmark, the accepted hero and gallery photos were each zoomed into grilles, tanks, and printed labels before acceptance, full list kept in the demo folder's image sourcing notes
- New favicon with an asphalt black gradient square and a TG monogram in racing yellow
- Hub page updated with a new card for Torsi Garage, and the More industries in progress note updated to only mention Kursus and Bimbel going forward
- Root portfolio page's company profile collection description updated to include Automotive alongside the other six industries
- Verified HTML tag balance and zero em or en dash on the new index.html, the new README, the hub page edit, the root page edit, and this changelog entry
- Visually and interactively tested in Chrome via the local Laragon server: hero counter animation, Mobil and Motor pricing toggle, gallery filter buttons, booking form validation and success state, FAQ accordion, footer, and the mobile hamburger full screen menu
- Per Bagas's instruction, Kursus and Bimbel remain untouched and will not be started until Torsi Garage is approved and further permission is given

### Klinik Nirmala - structural redesign, breaking the shared template

**Changed**
- Last demo in the redesign queue after Kriya House and Studio Embun. Like Studio Embun, Klinik Nirmala's business concept, a family clinic, was never flagged as a problem, so this was a pure structural and visual redesign, not a content pivot
- All business content preserved verbatim: the four poli descriptions, all 4 doctor profiles with their exact specializations, practice days, and hours, all 6 featured services with their original prices, the 3 facility captions, all 3 testimonials with their exact quote text, all 5 FAQ questions and answers, and every contact detail
- Full color and font swap: dropped the old teal, coral, and mint palette for a blue and violet palette over a cool off white background, and dropped Plus Jakarta Sans and Inter for Outfit and Karla, a rounded geometric sans pairing not used anywhere else in the project, chosen to read as a modern clinic or health app rather than a medical brochure
- Hero rebuilt from the old floating stat card pattern into a rounded photo card over a subtle dot pattern background, paired with a new live status widget that reads the visitor's current time against the clinic's real operating hours and shows Klinik Buka Sekarang or Klinik Sedang Tutup with a pulsing status dot, this is a new interactive feature not present in any other demo
- Hero stat row and the old marquee strip both removed, replaced with a full stat card section below the hero showing 3 icon cards with animated counters, distinct from the strip and dark band patterns used elsewhere
- Poli grid changed from full bleed photo cards with a dark gradient overlay into cards with a solid gradient color block header containing a line icon per poli, Poli Umum, Gigi, Anak, and Kandungan each get a distinct blue or violet toned gradient, no photography used in this section at all
- Jadwal Dokter changed from a 4 column static card grid into a compact schedule table with a doctor avatar, name, specialization, practice days, and a pill shaped time badge per row, reinforcing the appointment app feel started in the hero
- Layanan Unggulan changed from a 3 column static grid into a horizontal scroll snap carousel with no arrow buttons, native touch and mouse wheel scrolling with a visible peek of the next card and a Geser untuk lihat semua hint
- Fasilitas gallery changed from an asymmetric photo grid with dark gradient overlay captions into a simple 3 photo row with captions placed below each photo in plain typography instead of over the image
- Testimonials changed from a static 3 card grid into a single large auto rotating spotlight quote with dot indicators, tested clicking dots to jump between testimonials and confirmed the auto rotation timer restarts correctly
- FAQ changed from a single column plus and cross accordion into a two panel help center style layout, a list of questions on the left and the answer for the selected question on the right, tested switching between all 5 questions
- New favicon with a blue to violet gradient circle, replacing the old solid teal one
- One icon bug caught and fixed during visual verification, the Poli Umum SVG icon initially rendered as a malformed shape instead of a pulse line, replaced with a clean EKG style pulse icon and re verified before shipping
- Verified HTML tag balance and zero em or en dash on the new index.html, the new README, and this changelog entry
- Visually and interactively tested in Chrome via the local Laragon server: hero live status widget accuracy, animated stat counters, poli card gradients and icons, doctor schedule table, layanan carousel scroll snap behavior, facility photo row, testimonial spotlight auto rotate and dot navigation, FAQ sidebar panel switching, contact form inline validation on empty submit, and the mobile hamburger full screen menu
- With this redesign, Nexbyte, the new Kriya House, Studio Embun, and Klinik Nirmala are all now structurally and visually distinct from each other in hero mechanic, stat presentation, category or poli display, product or service presentation, testimonial presentation, and FAQ style, completing the standing rule that nothing should repeat too closely across demos
- This closes out the one industry at a time redesign queue that started with Kriya House, all three flagged demos have now been rebuilt and approved in sequence

### Karsa Bangun - new demo, sixth in the company profile collection

**Added**
- New company profile demo for the Kontraktor and Konstruksi industry, the fifth of the seven Tier 1 industries Bagas listed, built after explicit approval to start with Kontraktor and not begin Bengkel or Kursus/Bimbel without further permission
- Business identity: Karsa Bangun, a contractor handling new construction, renovation, and interior finishing for houses and small shops across Jabodetabek, with a RAB transparent positioning, clear cost planning with no surprise charges mid project
- Palette and fonts chosen to stay distinct from all five live demos: graphite and charcoal with a steel blue gray accent over a warm stone background, paired with Archivo and Source Sans 3, a bold industrial display and body pairing not used anywhere else in the project
- Hero includes an animated credential row, years of experience, projects completed, permanent team size, and warranty period, counting up on scroll, plus a floating RAB Transparan highlight card over the hero photo
- New interactive mechanic not present in any other demo: a draggable before and after comparison slider showing a real renovation project, mouse and touch dragging both supported, with Sebelum and Sesudah tags
- Four service cards, a horizontal four step process timeline with a dashed connector line, Konsultasi Awal, Survey and RAB, Pengerjaan, and Serah Terima
- Filterable project portfolio gallery with category buttons, Semua, Renovasi Rumah, Bangun Baru, and Interior, tested and confirmed filtering works correctly
- Testimonial grid with client quotes tagged by project type
- Minta Penawaran Gratis quote request form instead of a booking form, fields for name, WhatsApp number, project type, project location, an optional budget range, and project details, with inline validation per field and no browser alert, tested both the empty submit error state and a full valid submission showing the success message
- FAQ accordion covering survey cost, project timeline, material sourcing, warranty, payment terms, and commercial projects
- All six photos sourced from Unsplash and individually checked for free license, not Unsplash Plus, and absence of visible real brand names or logos before use, one candidate was rejected mid session for a tight, low quality crop despite being free licensed, and a kitchen candidate with an unreadable stove badge was swapped for a cleaner alternative out of caution, full list kept in the demo folder's image sourcing notes
- One bug caught and fixed during visual verification: the before and after slider's Sebelum and Sesudah tags were initially swapped relative to which image actually displayed on each side, corrected before delivery
- New favicon with a charcoal to steel blue gradient square and a KB monogram
- Hub page updated with a new card for Karsa Bangun, and the More industries in progress note updated to only mention Bengkel and Kursus/Bimbel going forward
- Root portfolio page's company profile collection description updated to include Contractor alongside the other five industries
- Verified HTML tag balance and zero em or en dash on the new index.html, the new README, the hub page edit, the root page edit, and this changelog entry
- Visually and interactively tested in Chrome via the local Laragon server: hero counter animation, before and after slider drag interaction, portfolio filter buttons, quote form validation and success state, FAQ accordion, footer, and the mobile hamburger full screen menu
- Per Bagas's instruction, Bengkel and Kursus/Bimbel remain untouched and will not be started until Karsa Bangun is approved and further permission is given

## [2026-08-27]

### Kriya House - structural redesign, breaking the shared template with Studio Embun and Klinik Nirmala

**Changed**
- Bagas flagged that Kriya House, Studio Embun, and Klinik Nirmala looked too similar to each other, same hero pattern with a floating badge card and stat row, same marquee strip right after the hero, same 3 card testimonial grid, same accordion FAQ style, same base cream background tone across 3 of the 5 demos. He was right, colors and fonts differed but the underlying structure was templated, not genuinely unique per industry as originally requested
- Full color and font swap for Kriya House: dropped the cream, rose, and gold palette (too close to Rimba Kitchen's cream and terracotta, and to Studio Embun's cream and blush) for a deep indigo, warm stone, and rust palette, and dropped the elegant italic serif pairing (Cormorant Garamond, shared visual family with Rimba Kitchen's Fraunces and Studio Embun's Marcellus) for a bold slab serif Bitter paired with Work Sans
- Hero rebuilt from the shared text-left, image-right, floating badge card pattern into a shop window collage, 3 staggered postcard style photos with white borders and slight rotation, no floating card at all
- Stat counters moved out of the hero copy block into their own full width dark band below the hero with icons, instead of a plain number row with a top border
- Marquee strip removed entirely, replaced with a sticky category tab bar (Semua Kategori, Home and Living, Fashion and Aksesoris, Self Care and Fragrance, Gift and Stationery) that functions as an in page filter link row
- Testimonial grid of 3 identical cards replaced with a single large editorial quote carousel, prev and next arrow buttons plus dot indicators, tested and confirmed working
- FAQ changed from a single column accordion with a plus and cross icon to a two column layout with a chevron icon that rotates on open
- Story section's floating overlapping quote card (a second instance of the same floating card trick used in the old hero) replaced with an inline pull quote with a left border accent, no overlap
- Favicon recolored to match the new indigo and rust identity
- Verified HTML tag balance and zero em or en dash after the rebuild
- Product catalog, category descriptions, story copy, FAQ answers, and contact details were kept as is since Bagas did not flag the content itself, only the structure and color repetition
- Studio Embun and Klinik Nirmala are next in line for the same treatment, one at a time with approval before moving to the next, per the existing workflow

### Kriya House replaced by Nexbyte - retail concept swap, structure kept

**Changed**
- Right after the Kriya House structural redesign above, Bagas said the new version still did not feel right. Not the colors or layout this time, the underlying business idea itself. Kriya House was a curated craft and artisan boutique selling things like meditation stones and home decor trinkets, and Bagas pointed out that is not a common or relatable retail business, most people have never shopped at a store like that
- Asked Bagas to pick a more common retail type instead, options offered were Fashion and Pakaian, Elektronik and Gadget, Sepatu and Tas, and Perlengkapan Rumah Tangga. He chose Elektronik and Gadget
- Kriya House retired, replaced with a new fictional demo, Nexbyte, an electronics and gadget store, at `demo/nexbyte/`
- Kept the structural redesign patterns from the Kriya House rebuild that were never criticized, diagonal hero panel treatment was reworked further for Nexbyte specifically rather than copied as is, see below
- New color palette for Nexbyte: deep navy and amber over a cool light gray paper background, distinct from every other demo's palette so far, and new font pairing Space Grotesk and Manrope, a geometric sans display face not used anywhere else in the project
- Deliberately varied the layout further from the Kriya House structure so the two do not become a new templated pair, since Bagas asked that nothing repeat too closely in color, layout, or anything else going forward
  - Hero changed from Kriya House's 3 photo shop window collage to a single product photo inside a diagonal clipped navy panel with an amber glow spotlight and a small floating garansi chip
  - Stats moved from a full width dark icon band into a plain light numeric strip with thin dividers, no icons
  - Categories changed from a photo bento grid into 4 flat icon tiles, no photography, matching how electronics retailers usually present categories
  - Products changed from a static 3 column grid into a horizontal scroll carousel with prev and next arrow buttons, cards include a star rating row
  - Testimonials changed from Kriya House's single quote carousel into a static 2 column grid of rating cards
  - FAQ changed from Kriya House's 2 column chevron accordion into a single column numbered accordion with a plus and minus icon
  - Story image and text columns were swapped left to right compared to Kriya House, and the pull quote became a solid amber highlight box instead of a left border quote
- Sourced 7 new product and store photos for Nexbyte (TWS earbuds, smartwatch, power bank and cable set, mechanical keyboard, audio store display wall, gaming mouse, phone case), each checked individually for a free Unsplash license and for no visible real brand names or logos
  - Rejected several Apple associated results during sourcing even when license was free, including a phone case wall display with visible Designed in California text, an iPhone X shaped screen mockup, a photo with a visible Apple logo on a phone back, and multiple unboxing shots that were clearly iPhone or iPad. Full list kept in the working sourcing notes for this demo
  - No dedicated Smartphone and Tablet device photo could be found without Apple branding or an Unsplash Plus lock after extensive searching, so the phone case product photo doubles as that category's card image instead
- Updated the Company Profile hub page card and the root portfolio project description to reference Nexbyte and Electronics and Gadget instead of Kriya House and Retail
- Verified HTML tag balance and zero em or en dash on the new index.html, the updated README, and this changelog entry
- Studio Embun and Klinik Nirmala are still next in line for their own structural redesign, one at a time with approval before moving to the next, per the existing workflow

### Studio Embun - structural redesign, breaking the shared template

**Changed**
- Following the same approval pattern used for Kriya House, moved on to Studio Embun next. Unlike Kriya House, Bagas never flagged Studio Embun's business concept as uncommon or unrelatable, a beauty and skincare studio is a normal business, so this was a pure structural and visual redesign, not a content or concept pivot
- All business content preserved verbatim from the old version: services (Facial and Skincare, Makeup and Styling, Brow and Lash, Body and Spa), all 6 treatments with their original durations and prices, all 3 pricing packages with their original bullet lists, the story quote, the 3 brand pillars, all 3 testimonials with their exact quote text, all 5 FAQ questions and answers, and every contact detail
- Full color and font swap: dropped the old cream and blush palette (shared visual family with Rimba Kitchen and the old Kriya House) for a wine and gold palette over a warm greige background, and dropped the old font pairing for Playfair Display and DM Sans, a serif and sans pairing not repeated anywhere else in the project
- Hero rebuilt from the old text-left image-right floating badge card pattern into an organic blob shaped photo (asymmetric border radius) with a thin gold ring accent behind it and a hand drawn gold underline SVG beneath the emphasis word in the headline, no floating badge card at all
- Hero stat row and the old auto scrolling marquee strip both removed, replaced with a single thin credential strip band below the hero showing 4 static figures (klien puas, terapis bersertifikat, treatment signature, keamanan produk untuk kulit sensitif), no counting animation this time since the strip is meant to read as a quiet trust line rather than a big number showcase
- Categories changed from a bento photo grid into a tabbed category showcase, clicking a category name on the left swaps the photo and suasana tag on the right, built with plain JavaScript, tested and confirmed switching correctly for all 4 categories
- Treatments changed from a 3 column card grid into a list of horizontal rows, each with a small thumbnail, name, description, duration, price, and a booking link, all 6 treatments kept
- Pricing kept its 3 column layout but the featured package card changed from a scale transform with a floating pill badge into a flat card with a 4px gold top border strip and a corner ribbon style tag reading Paling Diminati
- Story section gained a new photo (reused from the Facial category) inside an offset gold bordered frame, something the old version did not have, and the 3 pillars moved from a vertical stack into a horizontal row
- Gallery changed from a horizontal scroll strip into a 2x2 plus 1 mosaic grid built with CSS Grid, each tile reveals a bottom right label on hover, reused the original 3 gallery photos plus the Body & Spa massage photo as a 4th tile
- Testimonials changed from a static grid into an auto scrolling marquee that pauses on hover, content duplicated for a seamless loop, all 3 original testimonials kept with their exact wording
- FAQ changed from a rotate-45 plus and cross icon into a circular chevron icon that rotates on open, with a wine tinted background on the active item
- New favicon in the wine and gold identity, replacing the old blush toned one
- Verified HTML tag balance and zero em or en dash on the new index.html, the new README, and this changelog entry
- Visually and interactively tested in Chrome via the local Laragon server: hero blob and underline rendering, credential strip, category tab switching, treatment list rows, pricing cards, story photo and pillar row, gallery mosaic hover tags, testimonial marquee auto scroll and hover pause, FAQ chevron accordion open and close, contact form inline validation on empty submit, and the mobile hamburger full screen menu
- Nexbyte, the new Kriya House rebuild, and Studio Embun are now visually and structurally distinct from each other in hero treatment, stat or credential presentation, category display, product or treatment presentation, testimonial presentation, and FAQ style, honoring the standing rule that nothing should repeat too closely across demos
- Klinik Nirmala is next in line for the same treatment, pending approval before starting

## [2026-08-26]

### Klinik Nirmala - new Company Profile demo, Klinik and Kesehatan

**Added**
- Demo 05 Klinik Nirmala (`demo/klinik-nirmala/`), a fictional family clinic company profile, covering Poli Umum, Poli Gigi, Poli Anak, and Poli Kandungan
  - Sections: hero with trust badges for Izin Praktik Resmi and BPJS Kesehatan plus scroll triggered stat counters, marquee of poli and service names, four card poli grid, Jadwal Dokter section (unique feature) showing 4 doctor profile cards with practice days and hours, 6 item Layanan Unggulan grid with photo, description, and price, asymmetric facility gallery, testimonials, FAQ accordion, appointment booking section with inline validated form, footer, WhatsApp floating button
  - Uses a medical teal, mint, and warm coral accent color palette, Plus Jakarta Sans and Inter fonts, deliberately dropping the italic serif editorial look used by Rimba Kitchen, Kriya House, and Studio Embun so the demo reads as clinical and modern instead
  - Self contained HTML, CSS, and JS, hand written CSS with no Tailwind dependency
  - Every doctor and clinic photo was opened individually on Unsplash and checked for a free license (not Unsplash Plus) and for no visible real brand names, logos, or readable patient information before use
  - Verified HTML tag balance and zero em or en dash after the build
  - `preview.jpg` is a real browser screenshot of the live hero (captured via the local Laragon server), not a placeholder

### Company Profile Hub Update - `demo/company-profiles/index.html`

**Changed**
- Added a new hub card linking to Klinik Nirmala, industry label Klinik and Kesehatan, positioned after the Studio Embun card
- Updated the "more industries in progress" note to remove Clinic from the list since it is now live, leaving Contractor, Bengkel, and more

### Portfolio Update - `index.html`

**Changed**
- Company Profile project card description updated to mention Health alongside the existing Gym and Fitness, Restaurant and Cafe, Retail, and Beauty industries

### Studio Embun - new Company Profile demo, Kecantikan and Skincare

**Added**
- Demo 04 Studio Embun (`demo/studio-embun/`), a fictional beauty and skincare studio company profile, covering Facial and Skincare, Makeup and Styling, Brow and Lash, and Body and Spa
  - Sections: hero with scroll triggered stat counters, marquee of service names, bento style category grid, 6 item featured treatment grid with duration and price, three tier paket and membership pricing with one tier highlighted as most popular, brand story with three value pillars, studio ambience gallery, testimonials, FAQ accordion, booking style contact section with inline validated form, footer, WhatsApp floating button
  - Uses a blush pink, sage green, cream, and ink charcoal color palette with no gold accent, Marcellus and Jost fonts, deliberately different from ForgeX, Rimba Kitchen, and Kriya House so each demo feels distinct
  - Self contained HTML, CSS, and JS, hand written CSS with no Tailwind dependency
  - Every treatment and gallery photo was opened individually on Unsplash and checked for a free license (not Unsplash Plus) and for no visible real brand names or logos before use
  - Verified HTML tag balance and zero em or en dash after the build
  - `preview.jpg` is a real browser screenshot of the live hero (captured via the local Laragon server), not a placeholder

### Company Profile Hub Update - `demo/company-profiles/index.html`

**Changed**
- Added a new hub card linking to Studio Embun, industry label Kecantikan and Skincare, positioned after the Kriya House card
- Updated the "more industries in progress" note to remove Beauty from the list since it is now live, leaving Clinic, Contractor, and more

### Portfolio Update - `index.html`

**Changed**
- Company Profile project card description updated to mention Beauty alongside the existing Gym and Fitness, Restaurant and Cafe, and Retail industries

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
