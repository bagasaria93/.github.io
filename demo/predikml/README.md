# PredikML: Prediksi Penjualan dengan Python

Demo prediksi penjualan menggunakan regresi linear yang berjalan sepenuhnya di browser lewat Pyodide (WebAssembly), tanpa server dan tanpa backend.

---

## Tech Stack

- HTML5
- Tailwind CSS (via CDN)
- Chart.js (via CDN)
- Pyodide / Python (via CDN)
- Vanilla JavaScript

## Fitur

- Python asli (NumPy) berjalan langsung di browser lewat Pyodide WebAssembly
- 3 dataset contoh: Toko Retail, Platform SaaS, Manufaktur
- Model regresi linear OLS dihitung manual dengan NumPy
- Metrik akurasi model: R² Score, MAE, arah tren, slope
- Grafik interaktif data historis, garis regresi, dan prediksi (Chart.js)
- Prediksi 3 bulan ke depan dengan persentase perubahan
- Kode Python yang dijalankan ditampilkan langsung di halaman (accordion)

## Cara Menjalankan

Buka file `index.html` langsung di browser. Tidak memerlukan server atau dependensi tambahan.

---

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo
