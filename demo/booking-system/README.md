# BookinAja - Seruni Beauty

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo

---

## Deskripsi

BookinAja adalah platform booking layanan spa dan kecantikan untuk Seruni Beauty dengan cabang di Jakarta, Bandung, dan Surabaya. Dibangun menggunakan Tailwind CSS, Chart.js, dan QRCode.js dengan data tersimpan di localStorage.

## Konsep Desain

Desain mengangkat identitas boutique beauty salon yang premium dan tenang, dengan palet gradasi wine ke rose yang lebih dalam dipadu aksen emas, tipografi serif Fraunces untuk judul dan wordmark dipadu Plus Jakarta Sans untuk isi, serta sistem komponen (tombol, kartu, badge, chip) yang konsisten di seluruh halaman.

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
- QR code generation untuk konfirmasi booking via QRCode.js, dilengkapi catatan pengingat untuk menyimpan kode booking atau QR dengan baik dan menunjukkannya saat tiba di cabang
- Status tracking timeline: Pending, Dikonfirmasi, Sedang Berlangsung, Selesai
- Tab Cek Status untuk tracking booking dengan kode booking
- Admin panel: ringkasan statistik (total booking, menunggu konfirmasi, selesai, estimasi pendapatan), daftar booking, update status, leaderboard terapis, analitik cabang via Chart.js, manajemen ulasan
- Rating dan ulasan untuk booking yang sudah selesai
- Leaderboard terapis animasi berdasarkan rating dan jumlah booking
- localStorage persistence untuk semua data booking dan ulasan

## Cara Menjalankan

Buka file `index.html` langsung di browser, tidak perlu server atau proses build tambahan.
