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

            var badge = $('cursorBadge');
            var x = 0, y = 0, queued = false;

            function flush() {
                queued = false;
                var px = x + 'px', py = y + 'px';
                cursor.style.setProperty('--cx', px);
                cursor.style.setProperty('--cy', py);
                trail.style.setProperty('--cx', px);
                trail.style.setProperty('--cy', py);
                if (badge) {
                    badge.style.setProperty('--cx', px);
                    badge.style.setProperty('--cy', py);
                }
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

            /* Over a project card the pointer says what a click will do. */
            if (badge) {
                document.addEventListener('mouseover', function (e) {
                    if (e.target.closest && e.target.closest('.project-card')) {
                        badge.classList.add('is-on');
                        cursor.classList.add('is-hidden');
                        trail.classList.add('is-hidden');
                    }
                }, { passive: true });

                document.addEventListener('mouseout', function (e) {
                    if (e.target.closest && e.target.closest('.project-card')) {
                        badge.classList.remove('is-on');
                        cursor.classList.remove('is-hidden');
                        trail.classList.remove('is-hidden');
                    }
                }, { passive: true });
            }
        });

        /* Primary buttons lean slightly toward the pointer as it
           approaches, then spring back when it leaves. */
        feature('magnetic buttons', function () {
            if (!hasFinePointer || prefersReducedMotion) return;

            var magnets = $$('.btn-primary, .btn-secondary');
            if (!magnets.length) return;

            var STRENGTH = 0.28;
            var RADIUS = 70;

            magnets.forEach(function (el) {
                var queued = false, mx = 0, my = 0;

                function apply() {
                    queued = false;
                    el.style.setProperty('--mx', mx.toFixed(1) + 'px');
                    el.style.setProperty('--my', my.toFixed(1) + 'px');
                }

                el.addEventListener('mousemove', function (e) {
                    var r = el.getBoundingClientRect();
                    mx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
                    my = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
                    var cap = RADIUS * STRENGTH;
                    mx = Math.max(-cap, Math.min(cap, mx));
                    my = Math.max(-cap, Math.min(cap, my));
                    if (!queued) { queued = true; requestAnimationFrame(apply); }
                }, { passive: true });

                el.addEventListener('mouseleave', function () {
                    mx = 0; my = 0;
                    apply();
                }, { passive: true });
            });
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

        /* Numbers count up once they scroll into view. The original
           text is restored at the end so the markup stays the source
           of truth for the final value. */
        feature('count up', function () {
            function countUp(el) {
                var raw = el.textContent.trim();
                var parts = raw.match(/^([^\d]*)([\d.,]+)(.*)$/);
                if (!parts) return;

                var prefix = parts[1];
                var numStr = parts[2].replace(/,/g, '');
                var suffix = parts[3];
                var target = parseFloat(numStr);
                if (isNaN(target)) return;

                var decimals = (numStr.split('.')[1] || '').length;
                var duration = 1500;
                var start = null;

                function tick(now) {
                    if (start === null) start = now;
                    var t = Math.min((now - start) / duration, 1);
                    var eased = 1 - Math.pow(1 - t, 3);
                    el.textContent = prefix + (target * eased).toFixed(decimals) + suffix;
                    if (t < 1) requestAnimationFrame(tick);
                    else el.textContent = raw;
                }
                requestAnimationFrame(tick);
            }

            var numbers = $$('.stat-number, .hero-stat-number');
            if (!numbers.length || prefersReducedMotion) return;

            if (!('IntersectionObserver' in window)) return;

            var obs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    countUp(entry.target);
                    obs.unobserve(entry.target);
                });
            }, { threshold: 0.6 });

            numbers.forEach(function (el) { obs.observe(el); });
        });

        /* Tag the containers whose children should arrive one after the
           other, and hand each child its index so CSS can turn that into
           a delay. Must run before the reveal observer is wired up. */
        feature('stagger children', function () {
            var containers = $$(
                '.projects-grid, .testi-grid, .contact-info, ' +
                '.edu-grid.section-reveal, .stats-grid, .skills-container'
            );

            containers.forEach(function (el) {
                el.classList.add('stagger-children');
                if (!el.classList.contains('section-reveal')) {
                    el.classList.add('section-reveal');
                }
                Array.prototype.forEach.call(el.children, function (child, i) {
                    child.style.setProperty('--i', i);
                });
            });
        });

        /* Scroll progress. Modern browsers drive this straight from CSS,
           so the script only steps in where that is unsupported. */
        feature('scroll progress', function () {
            var bar = $('scrollProgress');
            if (!bar) return;

            var native = window.CSS && CSS.supports &&
                CSS.supports('animation-timeline', 'scroll()');
            if (native) return;

            var queued = false;

            function update() {
                queued = false;
                var doc = document.documentElement;
                var max = doc.scrollHeight - doc.clientHeight;
                var ratio = max > 0 ? window.scrollY / max : 0;
                bar.style.setProperty('--progress', Math.min(Math.max(ratio, 0), 1));
            }

            window.addEventListener('scroll', function () {
                if (!queued) { queued = true; requestAnimationFrame(update); }
            }, { passive: true });

            window.addEventListener('resize', update, { passive: true });
            update();
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

        /* Images ease in once they have actually decoded. A failsafe
           reveals everything after a few seconds so a stalled image can
           never leave a permanent blank. */
        feature('image fade in', function () {
            var imgs = $$('img');
            if (!imgs.length || prefersReducedMotion) return;

            imgs.forEach(function (img) {
                if (img.complete && img.naturalWidth > 0) return;
                img.classList.add('img-fade');
                var show = function () { img.classList.add('is-loaded'); };
                img.addEventListener('load', show, { once: true });
                img.addEventListener('error', show, { once: true });
            });

            /* Catches an image that finished before its listener was
               attached, without cancelling the fade for lazy images
               further down that legitimately load later. */
            setTimeout(function () {
                $$('img.img-fade').forEach(function (img) {
                    if (img.complete) img.classList.add('is-loaded');
                });
            }, 2000);

            /* Absolute safety net: nothing stays hidden, whatever happens. */
            setTimeout(function () {
                $$('img.img-fade').forEach(function (img) {
                    img.classList.add('is-loaded');
                });
            }, 10000);
        });

        feature('back to top', function () {
            var btn = $('toTop');
            if (!btn) return;

            var queued = false;

            function update() {
                queued = false;
                btn.classList.toggle('is-visible', window.scrollY > 700);
            }

            window.addEventListener('scroll', function () {
                if (!queued) { queued = true; requestAnimationFrame(update); }
            }, { passive: true });

            btn.addEventListener('click', function (e) {
                e.preventDefault();
                window.scrollTo({
                    top: 0,
                    behavior: prefersReducedMotion ? 'auto' : 'smooth'
                });
            });

            update();
        });

        /* A single underline that slides to whichever section is in
           view, rather than one underline per link blinking on and off. */
        feature('nav indicator', function () {
            var list = document.querySelector('.nav-links');
            if (!list) return;

            var indicator = document.createElement('span');
            indicator.className = 'nav-indicator';
            indicator.setAttribute('aria-hidden', 'true');
            list.appendChild(indicator);

            function move() {
                var active = list.querySelector('a.active');
                if (!active) {
                    indicator.classList.remove('is-on');
                    return;
                }
                var host = active.offsetParent === list ? active : active;
                var left = host.offsetLeft;
                var width = host.offsetWidth;
                indicator.style.setProperty('--nav-x', left + 'px');
                indicator.style.setProperty('--nav-w', width + 'px');
                indicator.classList.add('is-on');
            }

            /* The scroll spy swaps the active class, so watch for that
               instead of duplicating its logic here. */
            var mo = new MutationObserver(move);
            $$('.nav-links a').forEach(function (a) {
                mo.observe(a, { attributes: true, attributeFilter: ['class'] });
            });

            window.addEventListener('resize', move, { passive: true });
            setTimeout(move, 200);
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
