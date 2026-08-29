# Company Profile 11 - Kriyatama: Atelier Konveksi Seragam dan Custom Apparel

Landing page company profile untuk konveksi fiktif yang melayani produksi seragam kantor, seragam sekolah, jersey olahraga, kaos custom, jaket, dan label fashion.

**Tagline:** Jahit Cerita Anda.

---

## Tech Stack

- HTML5, CSS3 (hand written, self contained, tanpa dependency framework CSS eksternal)
- Vanilla JavaScript
- Google Fonts (Anton, Space Mono, Inter)

## Konsep Desain

Desain mengangkat identitas visual dokumen kerja produksi konveksi (spec sheet, kartu order/SPK, stempel kontrol kualitas), dibedakan dari demo company profile lain lewat pendekatan tata letak dan tipografi yang berbeda, bukan sekadar ganti warna:

- Navigasi tanpa navbar horizontal, hanya wordmark di kiri dan tombol menu bulat di kanan yang membuka panel menu penuh layar bernomor
- Pembatas antar section berbentuk zigzag menyerupai gunting kain (pinking shears)
- Kartu layanan bergaya kartu spesifikasi produksi (kode SPK) dengan sudut terlipat, disusun dalam scroll horizontal
- Alur produksi dan simulasi paket disajikan sebagai tabel bergaris (ruled table) alih-alih grid kartu bernomor
- Elemen jahitan berupa garis putus-putus (stitch line) sebagai pemisah visual
- Foto hero dimiringkan (rotate) dengan bingkai putih tebal menyerupai polaroid, dilengkapi kartu kontrol kualitas bergaya stempel pabrik
- Galeri menampilkan lantai produksi dan mesin jahit industrial, bukan hanya barang jadi, agar calon klien bisa melihat fasilitas kerjanya
- Testimoni ditautkan ke kode job SPK sebagai referensi pekerjaan klien

## Fitur

- Fully responsive (mobile, tablet, desktop)
- Palet warna charcoal gelap dan rust oranye di atas latar krem kanvas
- Tipografi display Anton untuk judul besar, Space Mono untuk label dan angka, Inter untuk isi
- Menu penuh layar (fullscreen overlay) dengan daftar navigasi bernomor dan CTA
- Hero dengan foto miring bingkai tebal, kartu kontrol kualitas "100% Sample Dulu", dan baris spesifikasi bergaya spec sheet
- Marquee strip berjalan menampilkan jenis produk bergaya measuring tape
- Kartu layanan bergaya kartu spesifikasi produksi (SPK) dalam scroll horizontal dengan snap
- Alur Proses Produksi lima langkah sebagai tabel bergaris di atas latar gelap
- Bagian Keunggulan dengan foto lini mesin jahit industrial dan daftar poin bergaris putus-putus
- Galeri Fasilitas & Portofolio dalam collage asimetris berlabel (lantai produksi, mesin jahit, kontrol kualitas, workshop, hasil jadi)
- Simulasi paket produksi tiga tingkat sebagai tabel spesifikasi, satu baris ditonjolkan sebagai paling diminati
- Testimoni klien dalam kartu rata dengan referensi kode job SPK
- FAQ accordion bergaya list bergaris dengan ikon plus yang berubah saat item aktif
- Form Pengajuan Pesanan dengan validasi inline per field tanpa alert browser, mencakup nama, instansi, no WhatsApp, jenis produk, estimasi jumlah, target selesai, dan catatan
- Info kontak alamat workshop, telepon, email, dan jam operasional bergaya spec list
- WhatsApp floating button
- Scroll triggered reveal animation via IntersectionObserver
- Smooth scroll navigation

## Cara Menjalankan

Buka file `index.html` langsung di browser, tidak perlu server atau proses build tambahan.

---

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo
