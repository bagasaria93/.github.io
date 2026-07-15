# PocketWallet - Personal Finance Tracker (PWA)

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo

---

## Deskripsi

PocketWallet adalah aplikasi pencatat keuangan pribadi yang dibangun sebagai Progressive Web App (PWA). Aplikasi ini bisa diinstall langsung ke home screen perangkat mobile maupun desktop, dan tetap berfungsi penuh tanpa koneksi internet berkat service worker yang meng-cache seluruh app shell.

## Tech Stack

- Tailwind CSS
- Chart.js
- Vanilla JavaScript
- Web App Manifest (installable PWA)
- Service Worker (offline caching, cache-first strategy)
- localStorage (data persistence)

## Fitur

- Installable ke home screen (Android, iOS, desktop) via `beforeinstallprompt` dan fallback instruksi untuk iOS
- Mode offline penuh — seluruh app shell (HTML, ikon, manifest) di-cache oleh service worker
- Indikator status koneksi online/offline secara real-time
- Dashboard saldo dengan ringkasan pemasukan dan pengeluaran bulan berjalan
- Grafik donut pengeluaran per kategori (Chart.js)
- Tambah transaksi dengan tipe pemasukan/pengeluaran, kategori, catatan, dan tanggal
- Riwayat transaksi lengkap dengan pencarian dan filter tipe, dikelompokkan per tanggal
- Manajemen anggaran per kategori dengan progress bar dan peringatan saat melebihi batas
- Mode gelap (dark mode) dengan toggle tersimpan di localStorage
- Export data ke file JSON dan reset data
- UI mobile-first dengan bottom navigation dan bottom sheet modal, meniru pola native app

## Catatan

Semua data disimpan secara lokal di perangkat (localStorage), tidak ada backend atau server yang terlibat. Data seed contoh disertakan agar dashboard tidak kosong saat pertama kali dibuka.
