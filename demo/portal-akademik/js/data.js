'use strict';

const PA_PREFIX = 'pa_';

// ============================================================
// STATIC MOCK DATA
// ============================================================

const INITIAL_USERS = [
  { id:'U001', name:'Administrator',        email:'admin@portal.ac.id',       password:'password123', role:'admin',     nip:'',           nim:'',          status:'aktif', gender:'L', phone:'081200000001', createdAt:'2024-01-01' },
  { id:'U002', name:'Dr. Hamdani, M.Kom',   email:'dosen@portal.ac.id',       password:'password123', role:'dosen',     nip:'198001012005011001', nim:'', status:'aktif', gender:'L', phone:'081200000002', createdAt:'2024-01-02' },
  { id:'U003', name:'Nurmawati, M.Pd',      email:'dosen2@portal.ac.id',      password:'password123', role:'dosen',     nip:'197802202008012002', nim:'', status:'aktif', gender:'P', phone:'081200000003', createdAt:'2024-01-02' },
  { id:'U004', name:'Fahrizal, S.Kom, M.T', email:'dosen3@portal.ac.id',      password:'password123', role:'dosen',     nip:'198505152010011003', nim:'', status:'aktif', gender:'L', phone:'081200000004', createdAt:'2024-01-02' },
  { id:'U005', name:'Giantara Naufal',      email:'mahasiswa@portal.ac.id',   password:'password123', role:'mahasiswa', nip:'', nim:'2021001001',  status:'aktif', gender:'L', phone:'081200000005', createdAt:'2024-08-01' },
  { id:'U006', name:'Siti Rahmawati',       email:'mahasiswa2@portal.ac.id',  password:'password123', role:'mahasiswa', nip:'', nim:'2021001002',  status:'aktif', gender:'P', phone:'081200000006', createdAt:'2024-08-01' },
  { id:'U007', name:'Rizky Pratama',        email:'mahasiswa3@portal.ac.id',  password:'password123', role:'mahasiswa', nip:'', nim:'2021001003',  status:'aktif', gender:'L', phone:'081200000007', createdAt:'2024-08-01' },
  { id:'U008', name:'Dewi Anggraini',       email:'mahasiswa4@portal.ac.id',  password:'password123', role:'mahasiswa', nip:'', nim:'2021001004',  status:'aktif', gender:'P', phone:'081200000008', createdAt:'2024-08-01' },
  { id:'U009', name:'Budi Santoso',         email:'mahasiswa5@portal.ac.id',  password:'password123', role:'mahasiswa', nip:'', nim:'2021001005',  status:'aktif', gender:'L', phone:'081200000009', createdAt:'2024-08-01' },
  { id:'U010', name:'Fitriani Putri',       email:'mahasiswa6@portal.ac.id',  password:'password123', role:'mahasiswa', nip:'', nim:'2021001006',  status:'aktif', gender:'P', phone:'081200000010', createdAt:'2024-08-01' },
  { id:'U011', name:'Ahmad Fauzi',          email:'mahasiswa7@portal.ac.id',  password:'password123', role:'mahasiswa', nip:'', nim:'2021001007',  status:'aktif', gender:'L', phone:'081200000011', createdAt:'2024-08-01' },
  { id:'U012', name:'Maya Sari',            email:'mahasiswa8@portal.ac.id',  password:'password123', role:'mahasiswa', nip:'', nim:'2021001008',  status:'aktif', gender:'P', phone:'081200000012', createdAt:'2024-08-01' },
];

const INITIAL_COURSES = [
  { id:'C001', code:'TI-101', name:'Algoritma & Struktur Data',   sks:3, semester:1, dosenId:'U002', deskripsi:'Mempelajari dasar algoritma, analisis kompleksitas, serta struktur data seperti array, linked list, stack, queue, dan tree.', status:'aktif' },
  { id:'C002', code:'TI-102', name:'Basis Data',                  sks:3, semester:2, dosenId:'U002', deskripsi:'Membahas konsep relational database, perancangan ERD, normalisasi, dan query SQL dari dasar hingga lanjutan.', status:'aktif' },
  { id:'C003', code:'TI-201', name:'Pemrograman Web',             sks:3, semester:3, dosenId:'U003', deskripsi:'Menguasai teknologi web dari HTML/CSS, JavaScript, hingga PHP & MySQL dengan pendekatan framework MVC.', status:'aktif' },
  { id:'C004', code:'TI-202', name:'Jaringan Komputer',           sks:3, semester:3, dosenId:'U003', deskripsi:'Memahami arsitektur jaringan, model OSI, protokol TCP/IP, subnetting, dan keamanan jaringan dasar.', status:'aktif' },
  { id:'C005', code:'TI-301', name:'Sistem Operasi',              sks:3, semester:4, dosenId:'U004', deskripsi:'Mengkaji prinsip kerja sistem operasi meliputi manajemen proses, memori, file system, dan sinkronisasi.', status:'aktif' },
  { id:'C006', code:'TI-302', name:'Rekayasa Perangkat Lunak',    sks:3, semester:5, dosenId:'U004', deskripsi:'Menerapkan SDLC, requirements engineering, desain sistem dengan UML, serta pengujian dan deployment perangkat lunak.', status:'aktif' },
];

const INITIAL_ENROLLMENTS = [
  { id:'E001', userId:'U005', courseId:'C001', enrolledAt:'2025-02-01' },
  { id:'E002', userId:'U005', courseId:'C002', enrolledAt:'2025-02-01' },
  { id:'E003', userId:'U005', courseId:'C003', enrolledAt:'2025-02-01' },
  { id:'E004', userId:'U006', courseId:'C001', enrolledAt:'2025-02-01' },
  { id:'E005', userId:'U006', courseId:'C003', enrolledAt:'2025-02-01' },
  { id:'E006', userId:'U007', courseId:'C002', enrolledAt:'2025-02-01' },
  { id:'E007', userId:'U007', courseId:'C003', enrolledAt:'2025-02-01' },
  { id:'E008', userId:'U008', courseId:'C001', enrolledAt:'2025-02-01' },
  { id:'E009', userId:'U008', courseId:'C004', enrolledAt:'2025-02-01' },
  { id:'E010', userId:'U009', courseId:'C003', enrolledAt:'2025-02-01' },
  { id:'E011', userId:'U009', courseId:'C005', enrolledAt:'2025-02-01' },
  { id:'E012', userId:'U009', courseId:'C006', enrolledAt:'2025-02-01' },
  { id:'E013', userId:'U010', courseId:'C002', enrolledAt:'2025-02-01' },
  { id:'E014', userId:'U010', courseId:'C006', enrolledAt:'2025-02-01' },
  { id:'E015', userId:'U011', courseId:'C001', enrolledAt:'2025-02-01' },
  { id:'E016', userId:'U011', courseId:'C005', enrolledAt:'2025-02-01' },
  { id:'E017', userId:'U012', courseId:'C004', enrolledAt:'2025-02-01' },
  { id:'E018', userId:'U012', courseId:'C006', enrolledAt:'2025-02-01' },
];

const INITIAL_MATERIALS = [
  { id:'M001', courseId:'C001', judul:'Pengantar Algoritma & Kompleksitas',  deskripsi:'Definisi algoritma, pseudocode, flowchart, dan analisis Big-O notation.', tipe:'pdf',   urutan:1, createdAt:'2025-02-10' },
  { id:'M002', courseId:'C001', judul:'Array & Linked List',                 deskripsi:'Struktur data array statis, dynamic array, single & double linked list beserta operasi CRUD.', tipe:'pdf', urutan:2, createdAt:'2025-02-17' },
  { id:'M003', courseId:'C001', judul:'Stack, Queue & Rekursi',              deskripsi:'Implementasi stack (LIFO) dan queue (FIFO), serta penerapan rekursi dalam pemecahan masalah.', tipe:'video', urutan:3, createdAt:'2025-02-24' },
  { id:'M004', courseId:'C002', judul:'Pengantar Basis Data & ERD',          deskripsi:'Konsep RDBMS, entitas, atribut, relasi, dan perancangan Entity Relationship Diagram.', tipe:'pdf',   urutan:1, createdAt:'2025-02-10' },
  { id:'M005', courseId:'C002', judul:'SQL Dasar: DDL & DML',                deskripsi:'Perintah CREATE, ALTER, DROP (DDL) dan INSERT, SELECT, UPDATE, DELETE (DML).', tipe:'pdf',   urutan:2, createdAt:'2025-02-17' },
  { id:'M006', courseId:'C002', judul:'Normalisasi & Relasi Tabel',          deskripsi:'Anomali data, 1NF, 2NF, 3NF, BCNF, serta JOIN query (INNER, LEFT, RIGHT, FULL).', tipe:'video', urutan:3, createdAt:'2025-02-24' },
  { id:'M007', courseId:'C003', judul:'HTML5 & CSS3 Modern',                 deskripsi:'Struktur dokumen HTML5, semantic elements, Flexbox, CSS Grid, dan responsive design.', tipe:'pdf',   urutan:1, createdAt:'2025-02-10' },
  { id:'M008', courseId:'C003', judul:'JavaScript ES6+',                     deskripsi:'Variable scope, arrow function, destructuring, spread operator, promise, async/await, dan fetch API.', tipe:'pdf', urutan:2, createdAt:'2025-02-17' },
  { id:'M009', courseId:'C003', judul:'PHP & MySQL Server-Side',             deskripsi:'Sintaks PHP, koneksi database, CRUD dengan PDO, session, dan keamanan dasar (SQL injection, XSS).', tipe:'video', urutan:3, createdAt:'2025-02-24' },
  { id:'M010', courseId:'C003', judul:'Framework MVC & REST API',            deskripsi:'Konsep MVC, routing, controller, model, view pada framework PHP modern dan konsep RESTful API.', tipe:'pdf',   urutan:4, createdAt:'2025-03-03' },
  { id:'M011', courseId:'C004', judul:'Pengantar Jaringan Komputer',         deskripsi:'Definisi jaringan, tipe (LAN, WAN, MAN), topologi, media transmisi, dan perangkat jaringan.', tipe:'pdf',   urutan:1, createdAt:'2025-02-10' },
  { id:'M012', courseId:'C004', judul:'Model OSI & TCP/IP',                  deskripsi:'7 layer OSI, 4 layer TCP/IP, fungsi tiap layer, protokol, dan enkapsulasi data.', tipe:'pdf',   urutan:2, createdAt:'2025-02-17' },
  { id:'M013', courseId:'C004', judul:'IP Addressing & Subnetting',          deskripsi:'IPv4, kelas IP, CIDR notation, subnetting, VLSM, dan pengenalan IPv6.', tipe:'video', urutan:3, createdAt:'2025-02-24' },
  { id:'M014', courseId:'C005', judul:'Pengantar Sistem Operasi',            deskripsi:'Sejarah SO, arsitektur, jenis SO (monolithic, microkernel), fungsi, dan layanan sistem operasi.', tipe:'pdf',   urutan:1, createdAt:'2025-02-10' },
  { id:'M015', courseId:'C005', judul:'Manajemen Proses & Penjadwalan',      deskripsi:'PCB, state proses, context switching, algoritma penjadwalan (FCFS, SJF, RR, Priority).', tipe:'pdf',   urutan:2, createdAt:'2025-02-17' },
  { id:'M016', courseId:'C005', judul:'Manajemen Memori & Virtual Memory',   deskripsi:'Partisi memori, paging, segmentasi, TLB, page replacement (FIFO, LRU, OPT), dan thrashing.', tipe:'video', urutan:3, createdAt:'2025-02-24' },
  { id:'M017', courseId:'C005', judul:'File System & I/O Management',        deskripsi:'Struktur file, direktori, mounting, disk scheduling (FCFS, SSTF, SCAN), dan proteksi file.', tipe:'pdf',   urutan:4, createdAt:'2025-03-03' },
  { id:'M018', courseId:'C006', judul:'SDLC & Requirements Engineering',     deskripsi:'Model SDLC (Waterfall, Agile, Spiral), teknik pengumpulan kebutuhan, dan dokumen SRS.', tipe:'pdf',   urutan:1, createdAt:'2025-02-10' },
  { id:'M019', courseId:'C006', judul:'Desain Sistem & UML',                 deskripsi:'Use Case, Class, Sequence, Activity, dan Component Diagram menggunakan notasi UML 2.x.', tipe:'pdf',   urutan:2, createdAt:'2025-02-17' },
  { id:'M020', courseId:'C006', judul:'Software Testing & Deployment',       deskripsi:'Unit testing, integration testing, black-box, white-box, CI/CD pipeline, dan strategi deployment.', tipe:'video', urutan:3, createdAt:'2025-02-24' },
];

const INITIAL_ASSIGNMENTS = [
  { id:'A001', courseId:'C001', judul:'Implementasi Sorting Algorithm', deskripsi:'Implementasikan Bubble Sort, Selection Sort, dan Merge Sort dalam bahasa pemrograman pilihan. Analisis kompleksitas waktu dan ruang untuk setiap algoritma. Sertakan test case minimal 5 dataset.', deadline:'2025-03-15', bobot:30, createdAt:'2025-02-24' },
  { id:'A002', courseId:'C001', judul:'Praktik Linked List & Stack',    deskripsi:'Buat program linked list yang mendukung operasi insert, delete, search, dan reverse. Kemudian implementasikan stack menggunakan linked list tersebut untuk evaluasi ekspresi matematika sederhana.', deadline:'2025-04-01', bobot:30, createdAt:'2025-03-10' },
  { id:'A003', courseId:'C002', judul:'Perancangan ERD Database Toko',  deskripsi:'Rancang ERD untuk sistem manajemen toko online dengan entitas: Produk, Kategori, Pelanggan, Pesanan, Detail Pesanan, dan Pembayaran. Sertakan kamus data dan konversi ke relational model.', deadline:'2025-03-20', bobot:35, createdAt:'2025-03-03' },
  { id:'A004', courseId:'C002', judul:'Query SQL Lanjutan & View',      deskripsi:'Implementasikan minimal 10 query SQL kompleks menggunakan JOIN, subquery, aggregate function, dan GROUP BY. Buat minimal 2 VIEW dan 1 stored procedure sederhana.', deadline:'2025-04-10', bobot:35, createdAt:'2025-03-17' },
  { id:'A005', courseId:'C003', judul:'Buat Website Profil Pribadi',    deskripsi:'Rancang dan implementasikan website profil pribadi menggunakan HTML5, CSS3, dan JavaScript. Harus responsive (mobile-first), menggunakan minimal 3 animasi CSS, dan form kontak yang tervalidasi.', deadline:'2025-03-18', bobot:25, createdAt:'2025-02-24' },
  { id:'A006', courseId:'C003', judul:'CRUD Sederhana PHP & MySQL',     deskripsi:'Buat aplikasi manajemen data mahasiswa menggunakan PHP dan MySQL dengan fitur: tambah, tampilkan (dengan pagination 10 data/halaman), edit, dan hapus data. Gunakan PDO dan validasi input.', deadline:'2025-04-15', bobot:40, createdAt:'2025-03-17' },
  { id:'A007', courseId:'C004', judul:'Analisis Paket Jaringan',        deskripsi:'Gunakan Wireshark untuk menangkap dan menganalisis paket jaringan. Identifikasi minimal 5 protokol berbeda, jelaskan header tiap protokol, dan buat laporan analisis traffic jaringan kampus.', deadline:'2025-03-25', bobot:40, createdAt:'2025-03-03' },
  { id:'A008', courseId:'C005', judul:'Simulasi Penjadwalan Proses',    deskripsi:'Buat simulasi algoritma penjadwalan CPU (FCFS, SJF non-preemptive, Round Robin dengan quantum=3) menggunakan bahasa pemrograman apapun. Tampilkan Gantt chart dan hitung average waiting time & turnaround time.', deadline:'2025-03-22', bobot:35, createdAt:'2025-02-24' },
  { id:'A009', courseId:'C005', judul:'Manajemen Memori: Paging',       deskripsi:'Implementasikan simulasi sistem paging sederhana dengan ukuran page 4KB. Simulasikan page replacement menggunakan algoritma FIFO dan LRU. Hitung page fault rate untuk sequence akses memori yang diberikan.', deadline:'2025-04-08', bobot:35, createdAt:'2025-03-10' },
  { id:'A010', courseId:'C006', judul:'Dokumen SRS Aplikasi',           deskripsi:'Buat dokumen Software Requirements Specification (SRS) menggunakan template IEEE 830 untuk aplikasi yang telah dipilih bersama dosen. Sertakan use case diagram, deskripsi use case, dan non-functional requirements.', deadline:'2025-04-20', bobot:50, createdAt:'2025-03-03' },
];

const INITIAL_SUBMISSIONS = [
  { id:'S001', assignmentId:'A001', userId:'U005', konten:'Telah mengimplementasikan ketiga algoritma sorting menggunakan Python. Bubble Sort: O(n²), Selection Sort: O(n²), Merge Sort: O(n log n). Link repository GitHub terlampir.', submittedAt:'2025-03-14', nilai:88, feedback:'Implementasi sangat baik, analisis kompleksitas tepat. Merge Sort sudah dioptimalkan. Tambahkan visualisasi untuk memperjelas.' },
  { id:'S002', assignmentId:'A001', userId:'U006', konten:'Menggunakan Java untuk implementasi ketiga algoritma. Sudah disertai JUnit test untuk setiap fungsi dengan 7 dataset berbeda.', submittedAt:'2025-03-15', nilai:92, feedback:'Excellent! Test coverage sangat baik. Analisis kompleksitas detail dan akurat. Kerja bagus.' },
  { id:'S003', assignmentId:'A001', userId:'U008', konten:'Implementasi menggunakan C++. Semua algoritma berjalan dengan benar, sudah diuji dengan dataset 100, 500, dan 1000 elemen.', submittedAt:'2025-03-13', nilai:85, feedback:'Baik. Implementasi benar, namun analisis kompleksitas kurang mendalam untuk kasus best/worst/average.' },
  { id:'S004', assignmentId:'A001', userId:'U011', konten:'Program Python dengan visualisasi menggunakan matplotlib. Dapat membandingkan performa ketiga algoritma secara visual.', submittedAt:'2025-03-12', nilai:95, feedback:'Luar biasa! Visualisasi sangat membantu pemahaman. Ini adalah pendekatan terbaik di kelas.' },
  { id:'S005', assignmentId:'A003', userId:'U005', konten:'ERD dirancang menggunakan Draw.io. Terdapat 6 entitas dengan 8 relasi. Telah dinormalisasi hingga 3NF. Kamus data tersedia dalam format tabel.', submittedAt:'2025-03-19', nilai:80, feedback:'ERD sudah baik, namun relasi antara Pesanan dan Pembayaran perlu diperjelas (1:1 atau 1:N). Normalisasi sudah benar.' },
  { id:'S006', assignmentId:'A003', userId:'U007', konten:'Menggunakan Lucidchart untuk perancangan ERD. Sudah ada entitas lemah untuk Detail Pesanan. Kamus data lengkap.', submittedAt:'2025-03-20', nilai:87, feedback:'ERD lengkap dan benar. Penggunaan entitas lemah sudah tepat. Konversi ke relational model sudah baik.' },
  { id:'S007', assignmentId:'A005', userId:'U005', konten:'Website profil menggunakan HTML5, CSS3, dan JavaScript vanilla. Responsive dengan mobile-first approach. Ada animasi scroll reveal dan typing effect.', submittedAt:'2025-03-17', nilai:90, feedback:'Desain modern dan clean. Animasi smooth. Form validasi bekerja dengan baik. Sangat memuaskan.' },
  { id:'S008', assignmentId:'A005', userId:'U006', konten:'Website menggunakan framework CSS Bootstrap 5 dengan JavaScript untuk interaktivitas. Ada dark mode toggle dan animasi transisi halaman.', submittedAt:'2025-03-18', nilai:88, feedback:'Kreativitas tinggi dengan fitur dark mode. Responsivitas baik di semua ukuran layar.' },
  { id:'S009', assignmentId:'A005', userId:'U007', konten:'Website profil minimalis dengan CSS Grid dan Flexbox. Animasi CSS murni tanpa JavaScript library. Loading time sangat cepat.', submittedAt:'2025-03-16', nilai:82, feedback:'Pendekatan pure CSS bagus untuk performa. Desain cukup baik, namun bisa diperkaya dengan lebih banyak konten.' },
  { id:'S010', assignmentId:'A007', userId:'U008', konten:'Analisis menggunakan Wireshark selama 30 menit di jaringan kampus. Teridentifikasi protokol: HTTP, HTTPS, DNS, ARP, ICMP, TCP, UDP. Laporan 15 halaman tersedia.', submittedAt:'2025-03-24', nilai:88, feedback:'Analisis komprehensif. Identifikasi protokol lengkap. Laporan terstruktur dengan baik. Tambahkan lebih banyak screenshot sebagai bukti.' },
  { id:'S011', assignmentId:'A007', userId:'U012', konten:'Capture paket menggunakan Wireshark di lab kampus. Mengidentifikasi 7 protokol berbeda. Fokus analisis pada three-way handshake TCP.', submittedAt:'2025-03-25', nilai:85, feedback:'Analisis three-way handshake sangat baik dan detail. Overall laporan bagus.' },
  { id:'S012', assignmentId:'A008', userId:'U009', konten:'Simulasi menggunakan Python dengan output Gantt chart berbasis teks. Hasil: FCFS avg WT=12ms, SJF avg WT=7ms, RR(q=3) avg WT=9ms.', submittedAt:'2025-03-21', nilai:83, feedback:'Simulasi benar dan hasil perhitungan akurat. Gantt chart berbasis teks kurang visual. Coba gunakan library matplotlib.' },
  { id:'S013', assignmentId:'A008', userId:'U011', konten:'Aplikasi desktop Java Swing dengan visualisasi Gantt chart berwarna. User dapat input burst time dan lihat hasil semua algoritma sekaligus.', submittedAt:'2025-03-22', nilai:96, feedback:'Implementasi terbaik di kelas! GUI sangat intuitif, visualisasi Gantt chart sangat jelas. Excellent work!' },
  { id:'S014', assignmentId:'A010', userId:'U009', konten:'Dokumen SRS untuk aplikasi sistem perpustakaan digital. Menggunakan template IEEE 830. Berisi 20 use case dengan deskripsi lengkap dan 12 non-functional requirements.', submittedAt:'2025-04-18', nilai:89, feedback:'Dokumen SRS sangat lengkap dan terstruktur. Use case diagram jelas. Non-functional requirements terukur (SMART). Sangat baik.' },
];

// ============================================================
// DB LAYER
// ============================================================

function lsGet(key) { try { return JSON.parse(localStorage.getItem(PA_PREFIX + key)); } catch { return null; } }
function lsSet(key, val) { try { localStorage.setItem(PA_PREFIX + key, JSON.stringify(val)); } catch {} }

const DB = {
  init() {
    if (!lsGet('initialized')) {
      lsSet('users', INITIAL_USERS);
      lsSet('courses', INITIAL_COURSES);
      lsSet('enrollments', INITIAL_ENROLLMENTS);
      lsSet('materials', INITIAL_MATERIALS);
      lsSet('assignments', INITIAL_ASSIGNMENTS);
      lsSet('submissions', INITIAL_SUBMISSIONS);
      lsSet('initialized', true);
    }
  },

  reset() {
    ['users','courses','enrollments','materials','assignments','submissions','initialized'].forEach(k => localStorage.removeItem(PA_PREFIX + k));
    this.init();
  },

  users: {
    getAll()     { return lsGet('users') || []; },
    getById(id)  { return this.getAll().find(u => u.id === id) || null; },
    getByEmail(e){ return this.getAll().find(u => u.email.toLowerCase() === e.toLowerCase()) || null; },
    getByRole(r) { return this.getAll().filter(u => u.role === r); },
    save(list)   { lsSet('users', list); },
    add(user)    { const list = this.getAll(); list.push(user); this.save(list); },
    update(id, patch) {
      const list = this.getAll().map(u => u.id === id ? { ...u, ...patch } : u);
      this.save(list);
    },
    delete(id)   { this.save(this.getAll().filter(u => u.id !== id)); },
    nextId()     { const ids = this.getAll().map(u => parseInt(u.id.replace('U',''))); return 'U' + String(Math.max(0,...ids)+1).padStart(3,'0'); },
  },

  courses: {
    getAll()    { return lsGet('courses') || []; },
    getById(id) { return this.getAll().find(c => c.id === id) || null; },
    getByDosen(dosenId) { return this.getAll().filter(c => c.dosenId === dosenId); },
    save(list)  { lsSet('courses', list); },
    add(c)      { const list = this.getAll(); list.push(c); this.save(list); },
    update(id, patch) {
      const list = this.getAll().map(c => c.id === id ? { ...c, ...patch } : c);
      this.save(list);
    },
    delete(id)  { this.save(this.getAll().filter(c => c.id !== id)); },
    nextId()    { const ids = this.getAll().map(c => parseInt(c.id.replace('C',''))); return 'C' + String(Math.max(0,...ids)+1).padStart(3,'0'); },
  },

  enrollments: {
    getAll()                  { return lsGet('enrollments') || []; },
    getByCourse(courseId)     { return this.getAll().filter(e => e.courseId === courseId); },
    getByUser(userId)         { return this.getAll().filter(e => e.userId === userId); },
    isEnrolled(userId, courseId) { return this.getAll().some(e => e.userId === userId && e.courseId === courseId); },
    save(list)                { lsSet('enrollments', list); },
    add(e)                    { const list = this.getAll(); list.push(e); this.save(list); },
    delete(userId, courseId)  { this.save(this.getAll().filter(e => !(e.userId === userId && e.courseId === courseId))); },
    deleteById(id)            { this.save(this.getAll().filter(e => e.id !== id)); },
    nextId()                  { const ids = this.getAll().map(e => parseInt(e.id.replace('E',''))); return 'E' + String(Math.max(0,...ids)+1).padStart(3,'0'); },
  },

  materials: {
    getAll()           { return lsGet('materials') || []; },
    getById(id)        { return this.getAll().find(m => m.id === id) || null; },
    getByCourse(courseId) { return this.getAll().filter(m => m.courseId === courseId).sort((a,b) => a.urutan - b.urutan); },
    save(list)         { lsSet('materials', list); },
    add(m)             { const list = this.getAll(); list.push(m); this.save(list); },
    update(id, patch)  { lsSet('materials', this.getAll().map(m => m.id === id ? { ...m, ...patch } : m)); },
    delete(id)         { this.save(this.getAll().filter(m => m.id !== id)); },
    nextId()           { const ids = this.getAll().map(m => parseInt(m.id.replace('M',''))); return 'M' + String(Math.max(0,...ids)+1).padStart(3,'0'); },
  },

  assignments: {
    getAll()              { return lsGet('assignments') || []; },
    getById(id)           { return this.getAll().find(a => a.id === id) || null; },
    getByCourse(courseId) { return this.getAll().filter(a => a.courseId === courseId); },
    save(list)            { lsSet('assignments', list); },
    add(a)                { const list = this.getAll(); list.push(a); this.save(list); },
    update(id, patch)     { lsSet('assignments', this.getAll().map(a => a.id === id ? { ...a, ...patch } : a)); },
    delete(id)            { this.save(this.getAll().filter(a => a.id !== id)); },
    nextId()              { const ids = this.getAll().map(a => parseInt(a.id.replace('A',''))); return 'A' + String(Math.max(0,...ids)+1).padStart(3,'0'); },
  },

  submissions: {
    getAll()                    { return lsGet('submissions') || []; },
    getById(id)                 { return this.getAll().find(s => s.id === id) || null; },
    getByAssignment(assignmentId) { return this.getAll().filter(s => s.assignmentId === assignmentId); },
    getByUser(userId)           { return this.getAll().filter(s => s.userId === userId); },
    getByUserAssignment(userId, assignmentId) { return this.getAll().find(s => s.userId === userId && s.assignmentId === assignmentId) || null; },
    save(list)                  { lsSet('submissions', list); },
    add(s)                      { const list = this.getAll(); list.push(s); this.save(list); },
    update(id, patch)           { lsSet('submissions', this.getAll().map(s => s.id === id ? { ...s, ...patch } : s)); },
    nextId()                    { const ids = this.getAll().map(s => parseInt(s.id.replace('S',''))); return 'S' + String(Math.max(0,...ids)+1).padStart(3,'0'); },
  },
};
