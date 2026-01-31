document.addEventListener('DOMContentLoaded', function() {
    const options = {
        strings: [
            'Full Stack Web Developer',
            'Laravel & CodeIgniter Expert',
            'Manufacturing ERP Specialist',
            'React JS Developer',
            'Database Designer'
        ],
        typeSpeed: 50,
        backSpeed: 30,
        backDelay: 2000,
        loop: true,
        showCursor: false
    };

    const typed = new Typed('#typed-text', options);
});