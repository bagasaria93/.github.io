# SDM Pro - Sistem Manajemen SDM

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo

---

## Deskripsi

SDM Pro adalah sistem manajemen sumber daya manusia untuk perusahaan fiktif PT Maju Bersama Indonesia. Dibangun menggunakan Bootstrap 5 dan Chart.js dengan fitur multi-role login dan pengelolaan data karyawan lengkap.

## Tech Stack

- Bootstrap 5
- Chart.js
- JavaScript (Vanilla)
- localStorage

## Role Login

Tiga role tersedia di halaman login (gunakan email dan password apapun):

- **Admin** - Akses penuh ke semua modul termasuk data gaji
- **HR Staff** - Akses HR tanpa modul slip gaji karyawan lain
- **Karyawan** - Self-service: absensi sendiri, ajukan cuti, pelatihan, slip gaji sendiri, profil

## Fitur

- Multi-role login simulation via localStorage
- Dashboard dengan KPI cards dan chart kehadiran mingguan
- Direktori karyawan dengan search, filter departemen dan status
- Rekap absensi 7 hari terakhir dengan filter status
- Pengajuan cuti dengan workflow approve/reject (Admin dan HR)
- Karyawan dapat submit pengajuan cuti baru
- Jadwal pelatihan dengan progress bar penyelesaian
- Analitik: komposisi departemen, distribusi jenis cuti, tren kehadiran via Chart.js
- Slip gaji dengan simulasi print via window.print()
- Export CSV untuk data karyawan dan absensi
- Notifikasi panel di topbar
- Responsive layout dengan mobile sidebar overlay
- Session persistence via localStorage