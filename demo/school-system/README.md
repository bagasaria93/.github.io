# SekolahKu - SMA Bhakti Nusantara

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo

---

## Deskripsi

SekolahKu adalah sistem informasi sekolah untuk SMA Bhakti Nusantara, mencakup data induk siswa dan guru, absensi harian, input nilai dan rapor, penggajian guru berbasis jam mengajar, hingga dashboard kinerja untuk Kepala Sekolah. Dibangun dengan sistem desain custom bernuansa akademik, Chart.js untuk analitik, dan data tersimpan di localStorage.

## Konsep Desain

Desain mengangkat identitas institusi pendidikan yang hangat dan tepercaya, dengan palet hijau hutan dipadu aksen emas dan teal, tipografi Sora untuk judul dan Plus Jakarta Sans untuk isi, serta sistem komponen (tombol, kartu, badge, chip) yang konsisten di seluruh halaman.

## Tech Stack

- HTML5, CSS3 (custom design system)
- Chart.js
- JavaScript (Vanilla)
- localStorage

## Fitur

### Guru
- Login demo dengan 9 akun guru lintas mata pelajaran, masing-masing dengan jadwal mengajar sendiri
- Beranda guru dengan ringkasan jam mengajar mingguan, kelas diampu, dan kehadiran mengajar bulan berjalan
- Input dan tandai absensi siswa per kelas dan tanggal, dengan opsi tandai semua hadir
- Input nilai siswa (Tugas, UTS, UAS) dengan nilai akhir dan status Tuntas/Belum Tuntas terhitung otomatis sesuai KKM
- Rapor kelas untuk wali kelas dengan rekap nilai seluruh mata pelajaran
- Slip gaji pribadi dengan rincian gaji pokok, tunjangan, dan potongan

### Admin TU
- Dashboard ringkasan data siswa, guru, dan kelas
- Data induk siswa dengan filter kelas dan pencarian nama
- Data induk guru lengkap dengan jadwal mengajar dan status wali kelas
- Data kelas dengan wali kelas dan daftar mata pelajaran per kelas
- Rekap absensi guru harian
- Penggajian guru bulanan dengan slip gaji dan penandaan status pembayaran

### Kepala Sekolah
- Ringkasan sekolah: total siswa, total guru, rata-rata kehadiran, dan rata-rata nilai
- Tren kehadiran siswa 14 hari terakhir
- Kinerja akademik: rata-rata nilai dan persentase tuntas KKM per kelas
- Kepegawaian: peringkat ketepatan waktu mengajar guru
- Keuangan: ringkasan anggaran gaji guru bulanan dan grafik anggaran per guru

### Umum
- Tampilan mobile-friendly dengan navigasi tab yang dapat digulir

## Cara Menjalankan

Buka file `index.html` langsung di browser, tidak perlu server atau proses build tambahan.
