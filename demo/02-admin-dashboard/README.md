# Demo 02 - Dasbor: Admin Dashboard

Admin dashboard analytics untuk toko online Indonesia "Toko Nusantara Digital".

---

## Tech Stack

- HTML5, CSS3
- Bootstrap 5 (via CDN)
- Chart.js (via CDN)
- Vanilla JavaScript

## Fitur

- Sidebar collapsible dengan smooth transition
- Tooltip pada nav item saat sidebar collapsed
- Badge notifikasi pada menu Pesanan
- Overlay backdrop mobile saat sidebar terbuka
- Multi-tab: Overview, Pesanan, Produk, Pelanggan, Analitik, Laporan, Pengaturan
- Page subtitle dinamis per tab
- Realtime clock di topbar
- Search global di topbar dengan dropdown hasil
- Stats cards dengan sparkline mini chart
- Line chart tren pendapatan via Chart.js
- Doughnut chart sumber traffic via Chart.js
- Bar chart penjualan produk via Chart.js
- Line chart pengguna aktif dengan toggle Mingguan / Bulanan / Tahunan
- Bar chart horizontal konversi per kategori
- Bar chart ringkasan laporan (dual axis: pendapatan + terjual)
- Tabel pesanan: search, filter status, paginasi, klik baris buka modal detail
- Tabel produk: search filter
- Tabel pelanggan: search filter
- Modal detail pesanan lengkap
- Empty state saat pencarian tidak menemukan hasil
- CSV export semua tab termasuk laporan
- Tombol print di tab Laporan
- Dark mode toggle
- Toast notification system
- Lazy render per tab (hanya render saat tab pertama dibuka)
- Tidak ada animasi chart untuk mencegah layout shift

## Cara Menjalankan

Buka file `index.html` langsung di browser. Tidak memerlukan server atau dependensi tambahan.

---

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo