document.addEventListener('DOMContentLoaded', function() {

    initLanguage();

    var cursor = document.getElementById('cursor');
    var follower = document.getElementById('cursorFollower');
    var mouseX = 0, mouseY = 0;
    var followerX = 0, followerY = 0;

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

    var navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    var typingTexts = [
        'Laravel Development',
        'React JS Applications',
        'Full-Stack Solutions',
        'REST API Design',
        'ERP Systems',
        'Next.js & TypeScript'
    ];
    var typingEl = document.getElementById('typingText');
    var currentIndex = 0;
    var currentChar = 0;
    var isDeleting = false;
    var typingSpeed = 80;

    function type() {
        var current = typingTexts[currentIndex];
        var displayed = isDeleting ? current.substring(0, currentChar - 1) : current.substring(0, currentChar + 1);
        currentChar = isDeleting ? currentChar - 1 : currentChar + 1;
        typingEl.innerHTML = displayed + '<span class="cursor-blink"></span>';
        if (!isDeleting && currentChar === current.length) {
            setTimeout(function() { isDeleting = true; type(); }, 1800);
            return;
        }
        if (isDeleting && currentChar === 0) {
            isDeleting = false;
            currentIndex = (currentIndex + 1) % typingTexts.length;
        }
        setTimeout(type, isDeleting ? 40 : typingSpeed);
    }
    type();

    var reveals = document.querySelectorAll('.section-reveal');
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    reveals.forEach(function(el) { observer.observe(el); });

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

    document.querySelectorAll('.project-card').forEach(function(card) {
        card.addEventListener('click', function(e) {
            if (e.target.closest('.project-link')) return;
            var link = card.querySelector('.project-link');
            if (link) window.open(link.href, '_blank');
        });
        card.style.cursor = 'pointer';
    });

    lucide.createIcons();
});

function toggleMobileMenu() {
    var menu = document.getElementById('mobileMenu');
    var hamburger = document.getElementById('hamburger');
    menu.classList.toggle('open');
    hamburger.classList.toggle('open');
}