# AbsenKu - PT Karya Sinergi

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo

---

## Deskripsi

AbsenKu adalah aplikasi absensi dan manajemen izin/cuti karyawan untuk PT Karya Sinergi. Dibangun dengan sistem desain custom bernuansa korporat premium, Chart.js untuk analitik, dan data tersimpan di localStorage.

## Konsep Desain

Desain mengangkat identitas korporat yang tegas dan tepercaya, dengan palet indigo tua ke navy dipadu aksen emas, tipografi Sora untuk judul dan Plus Jakarta Sans untuk isi, serta sistem komponen (tombol, kartu, badge, chip) yang konsisten di seluruh halaman.

## Tech Stack

- HTML5, CSS3 (custom design system)
- Chart.js
- JavaScript (Vanilla)
- localStorage

## Fitur

- Login demo dengan 8 akun karyawan lintas 5 departemen dan 1 akun Admin HR
- Absen masuk dan pulang dengan jam real-time, deteksi status telat otomatis, dan verifikasi lokasi kantor
- Dashboard karyawan dengan ringkasan kehadiran bulan berjalan dan sisa cuti tahunan
- Riwayat kehadiran per bulan dengan rekap Hadir, Telat, Izin, Sakit, Cuti, dan Alpha
- Pengajuan izin, sakit, dan cuti dengan validasi sisa saldo cuti dan keterangan wajib diisi
- Dashboard Admin HR: ringkasan harian, tren kehadiran 14 hari, dan daftar pengajuan yang menunggu persetujuan
- Data kehadiran dengan filter departemen, status, dan tanggal, serta ekspor CSV
- Approval izin/cuti dengan catatan untuk karyawan, otomatis memotong saldo cuti saat disetujui
- Direktori karyawan dengan status kehadiran hari ini dan sisa cuti masing-masing
- Analitik kehadiran: distribusi status 30 hari terakhir, kehadiran per departemen, dan peringkat ketepatan waktu
- Tampilan mobile-friendly dengan navigasi tab yang dapat digulir

## Cara Menjalankan

Buka file `index.html` langsung di browser, tidak perlu server atau proses build tambahan.
