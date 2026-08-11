# ErpCore - Manufacturing ERP System

Sistem ERP manufaktur multi-modul untuk PT Sentosa Manufaktur dengan inter-module automation workflow.

## Tech Stack

- HTML5, CSS3
- Tailwind CSS (dikompilasi via CLI, bukan CDN runtime)
- jQuery 3.7.1 - DOM manipulation
- Chart.js - visualisasi dashboard
- Plus Jakarta Sans - Google Fonts

## Modul

1. Dashboard - KPI, chart produksi, revenue trend, aktivitas, low stock alert
2. Sales Order - CRUD SO, konfirmasi, pengiriman, print
3. Production - Work Order management, update progress, selesaikan produksi
4. Warehouse - Stock list, stock in, stock out, stock history
5. Quality Control - Inspeksi checklist, approve/reject/rework
6. Purchase - Purchase Request dan Purchase Order workflow
7. Invoice - Penagihan, catat pembayaran, print invoice

## Inter-Module Automation

- SO Confirmed -> Work Order dibuat otomatis
- Stock di bawah minimum -> Purchase Request dibuat otomatis
- WO Completed -> QC Inspection dibuat otomatis
- QC Approved -> SO Delivered + Invoice dibuat otomatis
- Invoice Paid -> SO status Invoiced

## Konteks Data

Semua data fiktif Indonesia:
- Perusahaan: PT Sentosa Manufaktur
- Customer: 5 perusahaan Indonesia
- Supplier: 5 supplier Indonesia
- Material: 8 material produksi dengan harga Rupiah

## Cara Menjalankan

Buka file `index.html` langsung di browser. CSS Tailwind sudah dikompilasi ke `tailwind.min.css` di folder yang sama, tidak memerlukan server atau proses build tambahan untuk menjalankannya.

---

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo