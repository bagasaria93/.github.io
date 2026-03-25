# BookinAja - Seruni Beauty

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo

---

## Deskripsi

BookinAja adalah platform booking layanan spa dan kecantikan untuk Seruni Beauty dengan cabang di Jakarta, Bandung, dan Surabaya. Dibangun menggunakan Tailwind CSS, Chart.js, dan QRCode.js dengan data tersimpan di localStorage.

## Tech Stack

- Tailwind CSS
- Chart.js
- QRCode.js
- JavaScript (Vanilla)
- localStorage

## Fitur

- Booking flow multi-step 4 langkah: pilih layanan, pilih cabang dan terapis, pilih jadwal, isi data diri
- Filter layanan per kategori: Wajah, Tubuh, Rambut, Kuku, Paket
- Kalender custom dengan slot availability per cabang
- Slot sudah terisi ditandai dengan status penuh
- QR code generation untuk konfirmasi booking via QRCode.js
- Status tracking timeline: Pending, Dikonfirmasi, Sedang Berlangsung, Selesai
- Bagikan konfirmasi booking via WhatsApp
- Tab Cek Status untuk tracking booking dengan kode booking
- Admin panel: daftar booking, update status, leaderboard terapis, analitik cabang via Chart.js, manajemen ulasan
- Rating dan ulasan untuk booking yang sudah selesai
- Leaderboard terapis animasi berdasarkan rating dan jumlah booking
- localStorage persistence untuk semua data booking dan ulasan