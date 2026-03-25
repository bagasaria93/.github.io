# GambarKu - Image Storage Demo

Demo aplikasi penyimpanan gambar terpusat dengan sistem multi-role, fitur upload, preview, copy URL, dan manajemen pengguna.

## Fitur

- Login/logout dengan 2 role: Master dan Admin
- Upload gambar via klik atau drag & drop (simulasi, hingga 5MB per file)
- Galeri gambar dengan grid responsif
- Preview gambar dalam modal dengan informasi detail
- Salin URL gambar (CDN-ready)
- Hapus gambar dengan konfirmasi
- Filter pencarian dan pengurutan galeri
- Master: manajemen pengguna (tambah dan hapus admin)
- Master: halaman statistik dan ringkasan upload

## Akun Demo

| Role   | Email                     | Password    |
|--------|---------------------------|-------------|
| Master | master@gambarkuapp.id     | password123 |
| Admin  | admin@gambarkuapp.id      | password123 |

## Perbedaan Role

| Fitur              | Master | Admin |
|--------------------|--------|-------|
| Upload gambar      | Ya     | Ya    |
| Hapus gambar       | Ya     | Ya    |
| Salin URL          | Ya     | Ya    |
| Tambah admin       | Ya     | Tidak |
| Hapus admin        | Ya     | Tidak |
| Lihat statistik    | Ya     | Tidak |

## Tech Stack

- HTML5
- Tailwind CSS (CDN)
- JavaScript (Vanilla)
- localStorage (simulasi)
- Plus Jakarta Sans

## Catatan

Ini adalah demo frontend murni. Upload gambar menggunakan Object URL browser sebagai simulasi, data tidak tersimpan permanen setelah halaman di-refresh.