# Company Profile 15 - Kilau Laundry: Layanan Cuci Kiloan, Cuci Setrika, dan Dry Clean

Landing page company profile untuk usaha laundry fiktif yang melayani cuci kiloan, cuci dan setrika, setrika saja, dry clean, cuci sepatu, hingga cuci karpet dan boneka dengan layanan antar jemput gratis.

**Tagline:** Cucian Bersih dan Wangi, Selesai Tepat Waktu.

---

## Tech Stack

- HTML5, CSS3 (hand written, self contained, tanpa dependency framework CSS eksternal)
- Vanilla JavaScript
- Google Fonts (Fredoka, Mulish, JetBrains Mono)

## Konsep Desain

Desain mengangkat identitas visual laundry yang ceria dan bersih, dibedakan secara struktural dari seluruh demo company profile lain lewat motif dan interaksi yang belum pernah dipakai sebelumnya:

- Palet warna teal dan coral di atas latar mint lembut, memberi kesan bersih, segar, dan hangat
- Tipografi bulat Fredoka untuk judul yang ramah, dipadu Mulish untuk isi dan JetBrains Mono untuk detail harga
- Header berbentuk pil melayang (floating pill) yang terpisah dari tepi layar, bukan header penuh lebar seperti demo lain
- Menu mobile terbuka dengan animasi circle reveal dari tombol burger menggunakan CSS clip-path, berbeda dari overlay penuh layar, dropdown, panel geser, maupun bottom sheet pada demo lain
- Foto hero dibingkai dalam porthole (jendela kapal bundar) dengan cincin gradien berputar sebagai aksen dekoratif
- Pembatas antar bagian memakai garis gelombang (wave divider) SVG, bukan garis lurus atau zigzag
- Alur cara kerja disajikan sebagai kartu tiket sobekan (ticket stub) dengan lubang notch di tepinya, tersusun berjejer horizontal
- Harga layanan ditampilkan sebagai gantungan label harga (price tag) dengan lubang gantungan, bukan tabel maupun kartu polos
- Perbandingan kecepatan proses (Reguler, Express, Kilat) memakai mini progress bar di setiap kartu
- Testimoni digantung pada jemuran (clothesline) dengan ilustrasi jepitan baju di setiap kartu, sesuai identitas bisnis laundry

## Fitur

- Fully responsive (mobile, tablet, desktop)
- Header pil melayang dengan navigasi sticky
- Menu mobile circle reveal dengan animasi clip-path dari tombol burger
- Hero dengan foto porthole berbingkai cincin berputar, badge higienis, dan pill statistik (waktu mulai, harga per kilogram, antar jemput gratis)
- Enam layanan (cuci kiloan, cuci dan setrika, setrika saja) dengan foto asli, ditambah chip layanan tambahan (dry clean, cuci sepatu, cuci karpet dan boneka, antar jemput gratis)
- Alur Cara Kerja sebagai lima kartu tiket sobekan berurutan
- Galeri Fasilitas dalam tata letak mosaic menampilkan outlet, mesin cuci, stasiun setrika, staf, dan hasil cucian siap diambil
- Bagian Kenapa Kami dengan foto asli dan daftar keunggulan bercentang (deterjen pilihan, timbangan digital, notifikasi WhatsApp, garansi cuci ulang)
- Daftar harga sebagai enam label harga gantung, dilengkapi tiga kartu perbandingan kecepatan proses dengan progress bar
- Testimoni pelanggan bergaya jemuran dengan ilustrasi jepitan baju
- FAQ accordion dengan ikon plus yang berubah menjadi minus saat aktif
- Form Pemesanan dengan validasi inline per field tanpa alert browser, mencakup nama, WhatsApp, alamat penjemputan, jenis layanan, kecepatan proses, dan catatan
- Info kontak alamat, telepon, email, dan jam operasional
- WhatsApp floating button
- Scroll triggered reveal animation via IntersectionObserver
- Smooth scroll navigation

## Cara Menjalankan

Buka file `index.html` langsung di browser, tidak perlu server atau proses build tambahan.

---

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo
