/* =============================================================
   Bagas Aria Sativa - portfolio
   Every feature is initialised in isolation, so a missing element
   or a third party script that fails to load can never take the
   rest of the page down with it.
   ============================================================= */

(function () {
    'use strict';

    var $  = function (id) { return document.getElementById(id); };
    var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

    /* Run a feature in isolation. One failure never blocks the next. */
    function feature(name, fn) {
        try {
            fn();
        } catch (err) {
            if (window.console && console.warn) {
                console.warn('[portfolio] "' + name + '" skipped:', err && err.message);
            }
        }
    }

    var prefersReducedMotion = window.matchMedia
        ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
        : false;

    var hasFinePointer = window.matchMedia
        ? window.matchMedia('(hover: hover) and (pointer: fine)').matches
        : false;

    /* ---------------------------------------------------------
       CAROUSEL
       --------------------------------------------------------- */
    var carouselIndex = 0;
    var carouselTotal = 2;

    function carouselGoTo(index) {
        if (index < 0 || index >= carouselTotal) return;
        carouselIndex = index;

        var track = $('carouselTrack');
        if (track) track.style.transform = 'translateX(-' + (carouselIndex * 100) + '%)';

        var dotsEl = $('carouselDots');
        if (dotsEl) {
            $$('.carousel-dot', dotsEl).forEach(function (d, i) {
                d.classList.toggle('active', i === carouselIndex);
                d.setAttribute('aria-current', i === carouselIndex ? 'true' : 'false');
            });
        }

        var prevBtn = $('carouselPrev');
        var nextBtn = $('carouselNext');
        if (prevBtn) prevBtn.disabled = carouselIndex === 0;
        if (nextBtn) nextBtn.disabled = carouselIndex === carouselTotal - 1;
    }

    function carouselMove(dir) { carouselGoTo(carouselIndex + dir); }

    /* ---------------------------------------------------------
       MOBILE MENU
       --------------------------------------------------------- */
    function toggleMobileMenu() {
        var menu = $('mobileMenu');
        var hamburger = $('hamburger');
        if (!menu || !hamburger) return;

        var isOpen = menu.classList.toggle('open');
        hamburger.classList.toggle('open', isOpen);
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    /* ---------------------------------------------------------
       CONTACT FORM (mailto handoff)
       --------------------------------------------------------- */
    function submitForm(e) {
        e.preventDefault();

        var nameEl = $('formName');
        var mailEl = $('formEmail');
        var msgEl  = $('formMessage');
        var okEl   = $('formSuccess');
        var errEl  = $('formError');
        if (!nameEl || !mailEl || !msgEl) return;

        var name    = nameEl.value.trim();
        var email   = mailEl.value.trim();
        var message = msgEl.value.trim();

        if (!name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            if (errEl) {
                errEl.textContent = 'Please fill in your name, a valid email address, and a message.';
                errEl.style.display = 'flex';
            }
            if (okEl) okEl.style.display = 'none';
            return;
        }

        var subject = encodeURIComponent('Portfolio Inquiry from ' + name);
        var body    = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + message);
        window.location.href = 'mailto:bagasativa@gmail.com?subject=' + subject + '&body=' + body;

        if (okEl)  okEl.style.display = 'flex';
        if (errEl) errEl.style.display = 'none';
    }

    /* ---------------------------------------------------------
       INIT
       --------------------------------------------------------- */
    document.addEventListener('DOMContentLoaded', function () {

        feature('footer year', function () {
            var footerCopy = $('footerCopy');
            if (!footerCopy) return;
            footerCopy.textContent = '© ' + new Date().getFullYear() +
                ' Bagas Aria Sativa. All rights reserved.';
        });

        feature('carousel', function () {
            var prev = $('carouselPrev');
            var next = $('carouselNext');
            var dots = $('carouselDots');
            if (!prev && !next && !dots) return;

            carouselGoTo(0);
            if (prev) prev.addEventListener('click', function () { carouselMove(-1); });
            if (next) next.addEventListener('click', function () { carouselMove(1); });
            if (dots) {
                $$('.carousel-dot', dots).forEach(function (dot, i) {
                    dot.addEventListener('click', function () { carouselGoTo(i); });
                });
            }
        });

        feature('mobile menu', function () {
            var hamburger = $('hamburger');
            if (hamburger) hamburger.addEventListener('click', toggleMobileMenu);
            $$('.mobile-menu-link').forEach(function (link) {
                link.addEventListener('click', toggleMobileMenu);
            });
        });

        feature('contact form', function () {
            var contactForm = $('contactForm');
            if (contactForm) contactForm.addEventListener('submit', submitForm);
        });

        /* Custom cursor. Position is handed to CSS as two custom
           properties and flushed once per animation frame, so a fast
           mouse cannot force a layout on every single event. */
        feature('custom cursor', function () {
            var cursor = $('cursor');
            var trail  = $('cursorTrail');
            if (!cursor || !trail || !hasFinePointer || prefersReducedMotion) return;

            var x = 0, y = 0, queued = false;

            function flush() {
                queued = false;
                var px = x + 'px', py = y + 'px';
                cursor.style.setProperty('--cx', px);
                cursor.style.setProperty('--cy', py);
                trail.style.setProperty('--cx', px);
                trail.style.setProperty('--cy', py);
            }

            document.addEventListener('mousemove', function (e) {
                x = e.clientX;
                y = e.clientY;
                if (!queued) {
                    queued = true;
                    requestAnimationFrame(flush);
                }
            }, { passive: true });

            /* One delegated pair of listeners instead of two per element. */
            var hoverSel = 'a, button, .skill-tag, .project-card, .contact-item';

            document.addEventListener('mouseover', function (e) {
                if (e.target.closest && e.target.closest(hoverSel)) {
                    cursor.classList.add('hovering');
                    trail.classList.add('hovering');
                }
            }, { passive: true });

            document.addEventListener('mouseout', function (e) {
                if (e.target.closest && e.target.closest(hoverSel)) {
                    cursor.classList.remove('hovering');
                    trail.classList.remove('hovering');
                }
            }, { passive: true });
        });

        feature('hero spotlight', function () {
            var heroSection   = $('hero');
            var heroSpotlight = $('heroSpotlight');
            if (!heroSection || !heroSpotlight || !hasFinePointer || prefersReducedMotion) return;

            var rect = null, queued = false, px = 0, py = 0;

            function apply() {
                queued = false;
                heroSpotlight.style.setProperty('--spot-x', px + '%');
                heroSpotlight.style.setProperty('--spot-y', py + '%');
            }

            heroSection.addEventListener('mousemove', function (e) {
                rect = rect || heroSection.getBoundingClientRect();
                px = ((e.clientX - rect.left) / rect.width) * 100;
                py = ((e.clientY - rect.top) / rect.height) * 100;
                if (!queued) { queued = true; requestAnimationFrame(apply); }
            }, { passive: true });

            /* The cached rect has to be dropped when the page reflows. */
            window.addEventListener('resize', function () { rect = null; }, { passive: true });
            window.addEventListener('scroll', function () { rect = null; }, { passive: true });
        });

        feature('hero clock', function () {
            var heroClockText = $('heroClockText');
            if (!heroClockText) return;

            function updateHeroClock() {
                var timeStr = new Date().toLocaleTimeString('en-GB', {
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                    timeZone: 'Asia/Jakarta'
                });
                heroClockText.textContent = 'Bekasi, ID · ' + timeStr + ' WIB';
            }

            updateHeroClock();
            var timer = setInterval(updateHeroClock, 1000);

            /* Stop ticking while the tab is in the background. */
            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    clearInterval(timer);
                } else {
                    updateHeroClock();
                    timer = setInterval(updateHeroClock, 1000);
                }
            });
        });

        /* Navbar state and scroll spy, throttled to one read per frame. */
        feature('scroll spy', function () {
            var navbar   = $('navbar');
            var navLinks = $$('.nav-links a');
            var ids      = ['about', 'skills', 'experience', 'education', 'projects', 'testimonials', 'contact'];
            var sections = ids.map($).filter(Boolean);
            if (!navbar && !sections.length) return;

            var queued = false;

            function update() {
                queued = false;
                if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);

                var current = '';
                var limit = window.innerHeight * 0.4;
                for (var i = 0; i < sections.length; i++) {
                    if (sections[i].getBoundingClientRect().top <= limit) current = sections[i].id;
                }
                navLinks.forEach(function (a) {
                    a.classList.toggle('active', a.getAttribute('href') === '#' + current);
                });
            }

            window.addEventListener('scroll', function () {
                if (!queued) { queued = true; requestAnimationFrame(update); }
            }, { passive: true });

            update();
        });

        feature('typing', function () {
            var typingEl = $('typingText');
            if (!typingEl) return;

            var texts = [
                'Laravel Development',
                'React Applications',
                'Database Architecture',
                'REST API Design',
                'ERP Systems',
                'Next.js & TypeScript',
                'Dashboard & Analytics',
                'Business Automation'
            ];

            /* The blinking caret is a real element, so the text can be
               updated with textContent instead of reparsing HTML on
               every keystroke. */
            var out   = document.createTextNode('');
            var caret = document.createElement('span');
            caret.className = 'cursor-blink';
            typingEl.textContent = '';
            typingEl.appendChild(out);
            typingEl.appendChild(caret);

            if (prefersReducedMotion) {
                out.nodeValue = texts[0];
                return;
            }

            var i = 0, ch = 0, deleting = false, timer = null;

            function tick() {
                var current = texts[i];
                ch = deleting ? ch - 1 : ch + 1;
                out.nodeValue = current.substring(0, ch);

                if (!deleting && ch === current.length) {
                    deleting = true;
                    timer = setTimeout(tick, 1800);
                    return;
                }
                if (deleting && ch === 0) {
                    deleting = false;
                    i = (i + 1) % texts.length;
                }
                timer = setTimeout(tick, deleting ? 40 : 80);
            }

            tick();

            document.addEventListener('visibilitychange', function () {
                if (document.hidden) {
                    clearTimeout(timer);
                } else {
                    clearTimeout(timer);
                    timer = setTimeout(tick, 200);
                }
            });
        });

        /* Reveal on scroll. The CSS only hides these once the .js class
           is present, so this is an enhancement rather than a
           requirement for the content to be readable. */
        feature('scroll reveal', function () {
            var reveals = $$('.section-reveal');
            if (!reveals.length) return;

            if (!('IntersectionObserver' in window) || prefersReducedMotion) {
                reveals.forEach(function (el) { el.classList.add('visible'); });
                return;
            }

            var observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                });
            }, { threshold: 0.1, rootMargin: '0px 0px 15% 0px' });

            reveals.forEach(function (el) { observer.observe(el); });
        });

        feature('project card click', function () {
            $$('.project-card').forEach(function (card) {
                card.addEventListener('click', function (e) {
                    if (e.target.closest('.project-link')) return;
                    var link = card.querySelector('.project-link');
                    if (link) window.open(link.href, '_blank', 'noopener');
                });
            });
        });

        /* Icons come from a CDN. If it is blocked or slow the page must
           still work, so the call is guarded and retried once. */
        feature('icons', function () {
            if (window.lucide && typeof window.lucide.createIcons === 'function') {
                window.lucide.createIcons();
                return;
            }
            var tries = 0;
            var poll = setInterval(function () {
                tries++;
                if (window.lucide && typeof window.lucide.createIcons === 'function') {
                    clearInterval(poll);
                    window.lucide.createIcons();
                } else if (tries > 20) {
                    clearInterval(poll);
                    document.documentElement.classList.add('no-icons');
                }
            }, 150);
        });
    });
})();
