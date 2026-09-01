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

### Karyawan
- Login demo dengan 8 akun karyawan lintas 5 departemen dan 1 akun Admin HR, masing-masing dengan shift kerja sendiri (Reguler atau Shift Sore)
- Absen masuk dan pulang dengan jam real-time, deteksi status telat otomatis sesuai jam shift, dan verifikasi lokasi kantor
- Dashboard karyawan dengan ringkasan kehadiran bulan berjalan dan sisa cuti tahunan
- Riwayat kehadiran per bulan dalam tampilan tabel atau kalender bulanan berwarna per status
- Pengajuan izin, sakit, dan cuti dengan validasi sisa saldo cuti dan keterangan wajib diisi
- Slip gaji bulanan yang dihitung otomatis dari data kehadiran (potongan keterlambatan dan tanpa keterangan), dapat dicetak

### Admin HR
- Dashboard ringkasan harian, tren kehadiran 14 hari, dan daftar pengajuan yang menunggu persetujuan
- Data kehadiran dengan filter departemen, status, dan tanggal, koreksi absensi manual per karyawan, ekspor CSV, dan cetak
- Approval izin/cuti dengan catatan untuk karyawan, otomatis memotong saldo cuti saat disetujui
- Direktori karyawan dengan shift, status kehadiran hari ini, dan sisa cuti masing-masing
- Analitik kehadiran: distribusi status 30 hari terakhir, kehadiran per departemen, tren kehadiran dan keterlambatan 6 bulan terakhir, dan peringkat ketepatan waktu
- Log aktivitas yang mencatat persetujuan pengajuan, koreksi absensi, pengumuman, dan agenda

### Umum (semua peran)
- Pengumuman internal HR dengan indikator belum dibaca
- Kalender kantor (libur nasional, cuti bersama, agenda kantor)
- Pengaturan akun (warna avatar, simulasi ubah kata sandi)
- Pencarian karyawan global dari topbar, langsung menuju profil ringkas
- Tampilan mobile-friendly dengan navigasi tab yang dapat digulir

## Cara Menjalankan

Buka file `index.html` langsung di browser, tidak perlu server atau proses build tambahan.
