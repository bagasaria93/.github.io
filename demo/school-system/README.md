# SekolahKu - SMA Bhakti Nusantara

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo

---

## Deskripsi

SekolahKu adalah sistem informasi sekolah untuk SMA Bhakti Nusantara, mencakup data induk siswa dan guru, absensi harian, jadwal pelajaran, input nilai dan rapor, penggajian guru berbasis jam mengajar, perpustakaan dan inventaris, kenaikan kelas, pengumuman dan kalender akademik, pesan antar peran, log aktivitas, hingga dashboard kinerja untuk Kepala Sekolah. Dibangun dengan sistem desain custom bernuansa akademik, Chart.js untuk analitik, dan data tersimpan di localStorage.

## Konsep Desain

Desain mengangkat identitas institusi pendidikan yang hangat dan tepercaya: latar berwarna kertas hangat, topbar hijau hutan solid dengan tab aktif bergaris bawah emas, tipografi Fraunces (serif) untuk judul dan Figtree untuk isi, kartu bertepi tegas, aksen warna di sisi kiri stat tile, serta motif dekoratif dot-grid dan garis diagonal. Sistem komponen (tombol, kartu, badge, chip) konsisten di seluruh halaman dan sengaja dibedakan dari demo AbsenKu agar terasa sebagai produk yang berbeda.

## Tech Stack

- HTML5, CSS3 (custom design system)
- Chart.js
- JavaScript (Vanilla)
- localStorage

## Fitur

### Guru
- Login demo dengan 9 akun guru lintas mata pelajaran, masing-masing dengan jadwal mengajar sendiri
- Beranda guru dengan ringkasan jam mengajar mingguan, kelas diampu, kehadiran mengajar, pengumuman terbaru, dan agenda mendatang
- Jadwal mengajar mingguan dalam tampilan grid hari dan jam
- Input dan tandai absensi siswa per kelas dan tanggal, dengan opsi tandai semua hadir
- Input nilai siswa (Tugas, UTS, UAS) dengan nilai akhir dan status Tuntas/Belum Tuntas terhitung otomatis sesuai KKM
- Rapor kelas untuk wali kelas dengan rekap nilai seluruh mata pelajaran, dapat dicetak, serta profil siswa dapat dibuka langsung dari tabel
- Slip gaji pribadi dengan rincian gaji pokok, tunjangan, potongan, dan rincian jam mengajar

### Admin TU
- Dashboard ringkasan data siswa, guru, dan kelas, dengan pengumuman terbaru dan agenda mendatang
- Data induk siswa dengan filter kelas, pencarian nama, profil detail per siswa, dan sub-menu Kenaikan Kelas
- Kenaikan kelas dan tahun ajaran: memproses kenaikan seluruh siswa (X ke XI, XI ke XII, XII lulus) dengan opsi reset kapan saja
- Data induk guru lengkap dengan jadwal mengajar dan status wali kelas
- Data kelas dengan wali kelas, daftar mata pelajaran, dan sub-menu Jadwal Pelajaran per kelas dalam tampilan grid
- Rekap absensi guru harian
- Penggajian guru bulanan dengan slip gaji dan penandaan status pembayaran
- Perpustakaan dan inventaris sekolah (data buku dan barang inventaris)
- Log aktivitas yang mencatat perubahan data penting di sistem

### Kepala Sekolah
- Ringkasan sekolah: total siswa, total guru, rata-rata kehadiran, rata-rata nilai, pengumuman terbaru, dan agenda mendatang
- Tren kehadiran siswa 14 hari terakhir dan kehadiran siswa per kelas
- Kinerja akademik: rata-rata nilai dan persentase tuntas KKM per kelas, serta tren prestasi akademik antar tahun ajaran
- Kepegawaian: peringkat ketepatan waktu mengajar guru
- Keuangan: ringkasan anggaran gaji guru bulanan dan grafik anggaran per guru

### Umum (semua peran)
- Pengumuman sekolah dengan indikator belum dibaca
- Kalender akademik (ujian, libur, rapat, agenda lain)
- Pesan dan catatan singkat antar peran
- Pengaturan akun (warna avatar, simulasi ubah kata sandi)
- Pencarian global siswa dan guru dari topbar
- Tampilan mobile-friendly dengan navigasi tab yang dapat digulir

## Cara Menjalankan

Buka file `index.html` langsung di browser, tidak perlu server atau proses build tambahan.
