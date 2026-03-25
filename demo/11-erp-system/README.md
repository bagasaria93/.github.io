# ErpCore - Manufacturing ERP System

Sistem ERP manufaktur multi-modul untuk PT Sentosa Manufaktur dengan inter-module automation workflow.

## URL Demo

[https://bagasaria93.github.io/demo/10-erp-system/](https://bagasaria93.github.io/demo/10-erp-system/)

## Tech Stack

- HTML5, Tailwind CSS, Vanilla JavaScript
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

---

Demo project by [Bagas Aria Sativa](https://bagasaria93.github.io) - Portfolio Demo
```

---

Struktur folder final Phase 10:
```
demo/10-erp-system/
├── index.html
├── assets/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── data.js
│       ├── state.js
│       ├── modules/
│       │   ├── dashboard.js
│       │   ├── sales.js
│       │   ├── production.js
│       │   ├── warehouse.js
│       │   ├── qc.js
│       │   ├── purchase.js
│       │   └── invoice.js
│       └── main.js
└── README.md