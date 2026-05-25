// ---- CAROUSEL ----
var carouselIndex = 0;
var carouselTotal = 2;

function carouselMove(dir) {
    carouselGoTo(carouselIndex + dir);
}

function carouselGoTo(index) {
    if (index < 0 || index >= carouselTotal) return;
    carouselIndex = index;
    var track = document.getElementById('carouselTrack');
    if (track) track.style.transform = 'translateX(-' + (carouselIndex * 100) + '%)';
    var dotsEl = document.getElementById('carouselDots');
    if (dotsEl) {
        dotsEl.querySelectorAll('.carousel-dot').forEach(function(d, i) {
            d.classList.toggle('active', i === carouselIndex);
        });
    }
    var prevBtn = document.getElementById('carouselPrev');
    var nextBtn = document.getElementById('carouselNext');
    if (prevBtn) prevBtn.disabled = carouselIndex === 0;
    if (nextBtn) nextBtn.disabled = carouselIndex === carouselTotal - 1;
}

// ---- MOBILE MENU ----
function toggleMobileMenu() {
    var menu = document.getElementById('mobileMenu');
    var hamburger = document.getElementById('hamburger');
    var isOpen = menu.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
}

// ---- FORM SUBMIT ----
async function submitForm(e) {
    e.preventDefault();
    var btn = document.getElementById('btnSubmit');
    var success = document.getElementById('formSuccess');
    var error = document.getElementById('formError');
    success.style.display = 'none';
    error.style.display = 'none';
    btn.disabled = true;
    btn.style.opacity = '0.6';
    try {
        var response = await fetch(e.target.action, {
            method: 'POST',
            body: new FormData(e.target),
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            success.style.display = 'flex';
            e.target.reset();
        } else {
            error.style.display = 'flex';
        }
    } catch (err) {
        error.style.display = 'flex';
    }
    btn.disabled = false;
    btn.style.opacity = '1';
}

// ---- MAIN ----
document.addEventListener('DOMContentLoaded', function() {

    // Footer copyright year
    var footerCopy = document.getElementById('footerCopy');
    if (footerCopy) footerCopy.textContent = new Date().getFullYear() + ' Bagas Aria Sativa. All rights reserved.';

    // Carousel init
    carouselGoTo(0);
    document.getElementById('carouselPrev').addEventListener('click', function() { carouselMove(-1); });
    document.getElementById('carouselNext').addEventListener('click', function() { carouselMove(1); });
    document.getElementById('carouselDots').querySelectorAll('.carousel-dot').forEach(function(dot, i) {
        dot.addEventListener('click', function() { carouselGoTo(i); });
    });

    // Hamburger
    document.getElementById('hamburger').addEventListener('click', toggleMobileMenu);

    // Mobile menu links - close on click
    document.querySelectorAll('.mobile-menu-link').forEach(function(link) {
        link.addEventListener('click', toggleMobileMenu);
    });

    // Contact form
    var contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', submitForm);

    // Custom cursor (desktop only)
    var cursor = document.getElementById('cursor');
    var follower = document.getElementById('cursorFollower');
    var mouseX = 0, mouseY = 0;
    var followerX = 0, followerY = 0;

    if (cursor && follower) {
        document.addEventListener('mousemove', function(e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursor.style.left = mouseX + 'px';
            cursor.style.top = mouseY + 'px';
        });

        function animateFollower() {
            followerX += (mouseX - followerX) * 0.12;
            followerY += (mouseY - followerY) * 0.12;
            follower.style.left = followerX + 'px';
            follower.style.top = followerY + 'px';
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        document.querySelectorAll('a, button, .skill-tag, .project-card, .contact-item').forEach(function(el) {
            el.addEventListener('mouseenter', function() { follower.classList.add('hovering'); });
            el.addEventListener('mouseleave', function() { follower.classList.remove('hovering'); });
        });
    }

    // Navbar scroll state + scroll-spy
    var navbar = document.getElementById('navbar');
    var navSections = ['about', 'skills', 'experience', 'education', 'projects', 'testimonials', 'contact'];
    var navLinks = document.querySelectorAll('.nav-links a');

    function updateScrollSpy() {
        var scrollY = window.scrollY;
        navbar.classList.toggle('scrolled', scrollY > 60);
        var current = '';
        navSections.forEach(function(id) {
            var el = document.getElementById(id);
            if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) {
                current = id;
            }
        });
        navLinks.forEach(function(a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + current);
        });
    }

    window.addEventListener('scroll', updateScrollSpy);
    updateScrollSpy();

    // Typing animation
    var typingEl = document.getElementById('typingText');
    var typingIndex = 0;
    var typingChar = 0;
    var typingDeleting = false;
    var typingSpeed = 80;
    var typingTexts = [
        'Laravel Development',
        'React JS Applications',
        'Full-Stack Solutions',
        'REST API Design',
        'ERP Systems',
        'Next.js & TypeScript',
    ];

    function type() {
        var texts = typingTexts;
        var current = texts[typingIndex];
        var displayed = typingDeleting
            ? current.substring(0, typingChar - 1)
            : current.substring(0, typingChar + 1);
        typingChar = typingDeleting ? typingChar - 1 : typingChar + 1;
        typingEl.innerHTML = displayed + '<span class="cursor-blink"></span>';
        if (!typingDeleting && typingChar === current.length) {
            setTimeout(function() { typingDeleting = true; type(); }, 1800);
            return;
        }
        if (typingDeleting && typingChar === 0) {
            typingDeleting = false;
            typingIndex = (typingIndex + 1) % texts.length;
        }
        setTimeout(type, typingDeleting ? 40 : typingSpeed);
    }
    type();

    // Scroll reveal (Intersection Observer)
    var reveals = document.querySelectorAll('.section-reveal');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.1 });
    reveals.forEach(function(el) { observer.observe(el); });

    // Counter animation
    var counters = document.querySelectorAll('[data-count]');
    var counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                var el = entry.target;
                var target = parseInt(el.getAttribute('data-count'));
                var start = 0;
                var duration = 1200;
                var step = Math.ceil(duration / target);
                var interval = setInterval(function() {
                    start++;
                    el.textContent = start + '+';
                    if (start >= target) {
                        el.textContent = target + '+';
                        clearInterval(interval);
                    }
                }, step);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(function(el) { counterObserver.observe(el); });

    // Project card click (entire card opens demo)
    document.querySelectorAll('.project-card').forEach(function(card) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function(e) {
            if (e.target.closest('.project-link')) return;
            var link = card.querySelector('.project-link');
            if (link) window.open(link.href, '_blank');
        });
    });

    lucide.createIcons();
});
