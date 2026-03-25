# DevStack Studio - Code Showcase

Demo project interaktif yang menampilkan implementasi backend dan DevOps stack dengan konteks data bisnis Indonesia.

## URL Demo

[https://bagasaria93.github.io/demo/09-code-showcase/](https://bagasaria93.github.io/demo/09-code-showcase/)

## Tech Stack

- HTML5, Tailwind CSS, Vanilla JavaScript
- highlight.js 11.9 - syntax highlighting
- Chart.js - visualisasi output Python
- JetBrains Mono, Inter - Google Fonts

## Fitur

- 5 tab utama: Laravel v11, CodeIgniter v4, Python, MySQL, GitHub Actions CI/CD
- 14 script total dengan syntax highlighting via highlight.js
- Line numbers di code editor
- Run button dengan output pre-computed dan animasi
- Copy code ke clipboard
- Output tab: JSON preview, tabel data, Chart.js visualization, pipeline animation
- Explanation panel per script
- Mobile responsive dengan hamburger menu
- Toast notification

## Scripts

### Laravel v11
- REST API Controller (ProductController.php)
- Eloquent Model (Product.php)
- Form Request Validation (StoreProductRequest.php)

### CodeIgniter v4
- RESTful Controller (MahasiswaController.php)
- Model Query Builder (MahasiswaModel.php)
- Database Migration (CreateMahasiswaTable.php)

### Python + PostgreSQL
- Data Cleaning Pipeline (data_cleaning.py)
- PostgreSQL Query & Analisis (analisis_penjualan.py)
- Statistical Analysis (statistik_penjualan.py)

### MySQL
- Schema Design (schema_inventori.sql)
- Complex JOIN Query (laporan_inventori.sql)
- Stored Procedure (procedure_stok.sql)

### GitHub Actions CI/CD
- Deploy Pipeline ke VPS via SSH (deploy.yml)

## Konteks Data

Semua contoh menggunakan data fiktif Indonesia:
- Toko Nusantara Digital (e-commerce)
- Sistem Akademik Mahasiswa
- Inventori Gudang
- CI/CD untuk aplikasi production

---

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo
```

---

Phase 9 selesai. Struktur folder final:
```
demo/09-code-showcase/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── codes.js
│       └── main.js
└── README.md