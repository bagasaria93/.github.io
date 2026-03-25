const SEED = {
    customers: [
        { id: 'C001', nama: 'PT Maju Bersama Industri', kota: 'Jakarta', telepon: '021-5551234', pic: 'Budi Santoso' },
        { id: 'C002', nama: 'CV Karya Nusantara', kota: 'Surabaya', telepon: '031-5559876', pic: 'Dewi Rahayu' },
        { id: 'C003', nama: 'PT Sinar Abadi Jaya', kota: 'Bandung', telepon: '022-5554567', pic: 'Hendra Wijaya' },
        { id: 'C004', nama: 'UD Berkah Makmur', kota: 'Semarang', telepon: '024-5558765', pic: 'Siti Aminah' },
        { id: 'C005', nama: 'PT Global Teknik Indonesia', kota: 'Medan', telepon: '061-5552345', pic: 'Rizky Pratama' },
        { id: 'C006', nama: 'CV Mandiri Sejahtera', kota: 'Makassar', telepon: '0411-5553456', pic: 'Andi Firmansyah' },
        { id: 'C007', nama: 'PT Nusa Industri Perkasa', kota: 'Balikpapan', telepon: '0542-5554567', pic: 'Yulia Kartika' },
    ],

    suppliers: [
        { id: 'S001', nama: 'PT Baja Utama Persada', kota: 'Cikarang', telepon: '021-8901234', pic: 'Ahmad Fauzi', kategori: 'Bahan Baku' },
        { id: 'S002', nama: 'CV Kimia Nusantara', kota: 'Tangerang', telepon: '021-5904321', pic: 'Rina Marlina', kategori: 'Bahan Kimia' },
        { id: 'S003', nama: 'PT Plastindo Makmur', kota: 'Bekasi', telepon: '021-8812345', pic: 'Dodi Kurniawan', kategori: 'Kemasan' },
        { id: 'S004', nama: 'UD Logam Jaya', kota: 'Surabaya', telepon: '031-7712345', pic: 'Wahyu Setiawan', kategori: 'Bahan Baku' },
        { id: 'S005', nama: 'PT Elektronik Komponindo', kota: 'Jakarta', telepon: '021-6601234', pic: 'Mega Lestari', kategori: 'Komponen' },
        { id: 'S006', nama: 'CV Teknik Presisi', kota: 'Bandung', telepon: '022-7701234', pic: 'Dani Setiabudi', kategori: 'Komponen' },
    ],

    products: [
        { id: 'P001', kode: 'PRD-STL-001', nama: 'Rangka Baja Siku 40x40', satuan: 'pcs', harga: 185000, kategori: 'Komponen Baja' },
        { id: 'P002', kode: 'PRD-STL-002', nama: 'Plat Baja 3mm 1x2m', satuan: 'lembar', harga: 420000, kategori: 'Komponen Baja' },
        { id: 'P003', kode: 'PRD-MEC-001', nama: 'Mesin Press Hidrolik 10T', satuan: 'unit', harga: 45000000, kategori: 'Mesin' },
        { id: 'P004', kode: 'PRD-MEC-002', nama: 'Konveyor Belt 5 Meter', satuan: 'unit', harga: 12500000, kategori: 'Mesin' },
        { id: 'P005', kode: 'PRD-PKG-001', nama: 'Box Kemasan Industri L', satuan: 'pcs', harga: 35000, kategori: 'Kemasan' },
        { id: 'P006', kode: 'PRD-STL-003', nama: 'Pipa Baja Hollow 50x50', satuan: 'batang', harga: 275000, kategori: 'Komponen Baja' },
        { id: 'P007', kode: 'PRD-MEC-003', nama: 'Meja Kerja Baja Heavy Duty', satuan: 'unit', harga: 3800000, kategori: 'Furnitur Industri' },
    ],

    materials: [
        { id: 'M001', kode: 'MAT-001', nama: 'Besi Beton 10mm', satuan: 'kg', stok: 2500, stokMin: 500, hargaBeli: 12500, supplierId: 'S001', lokasi: 'RAK-A1' },
        { id: 'M002', kode: 'MAT-002', nama: 'Plat Baja Hitam 3mm', satuan: 'kg', stok: 180, stokMin: 200, hargaBeli: 18500, supplierId: 'S001', lokasi: 'RAK-A2' },
        { id: 'M003', kode: 'MAT-003', nama: 'Cat Primer Epoxy 20L', satuan: 'kaleng', stok: 45, stokMin: 20, hargaBeli: 385000, supplierId: 'S002', lokasi: 'RAK-B1' },
        { id: 'M004', kode: 'MAT-004', nama: 'Baut Hex M12 x 50 (box)', satuan: 'box', stok: 12, stokMin: 30, hargaBeli: 145000, supplierId: 'S004', lokasi: 'RAK-C1' },
        { id: 'M005', kode: 'MAT-005', nama: 'Elektroda Las 3.2mm (kg)', satuan: 'kg', stok: 320, stokMin: 100, hargaBeli: 28000, supplierId: 'S004', lokasi: 'RAK-C2' },
        { id: 'M006', kode: 'MAT-006', nama: 'Karet Seal Hidrolik', satuan: 'pcs', stok: 8, stokMin: 50, hargaBeli: 75000, supplierId: 'S005', lokasi: 'RAK-D1' },
        { id: 'M007', kode: 'MAT-007', nama: 'Box Kemasan Kayu 60x40', satuan: 'pcs', stok: 95, stokMin: 80, hargaBeli: 55000, supplierId: 'S003', lokasi: 'RAK-E1' },
        { id: 'M008', kode: 'MAT-008', nama: 'Minyak Pelumas SAE 40 (L)', satuan: 'liter', stok: 210, stokMin: 50, hargaBeli: 22000, supplierId: 'S002', lokasi: 'RAK-B2' },
        { id: 'M009', kode: 'MAT-009', nama: 'Pipa Hollow 50x50x3mm', satuan: 'batang', stok: 480, stokMin: 100, hargaBeli: 185000, supplierId: 'S001', lokasi: 'RAK-A3' },
        { id: 'M010', kode: 'MAT-010', nama: 'Amplas Lembar #120', satuan: 'lembar', stok: 22, stokMin: 50, hargaBeli: 8500, supplierId: 'S006', lokasi: 'RAK-F1' },
    ],

    workCenters: [
        { id: 'WC01', nama: 'Mesin Las', kapasitas: 3 },
        { id: 'WC02', nama: 'Mesin Bubut', kapasitas: 2 },
        { id: 'WC03', nama: 'Mesin Press', kapasitas: 1 },
        { id: 'WC04', nama: 'Finishing & Cat', kapasitas: 4 },
        { id: 'WC05', nama: 'Assembling', kapasitas: 5 },
        { id: 'WC06', nama: 'Quality Check', kapasitas: 2 },
    ],

    qcParams: {
        'P001': [
            { param: 'Dimensi panjang (mm)', standar: '400 +/- 2mm' },
            { param: 'Dimensi lebar (mm)', standar: '400 +/- 2mm' },
            { param: 'Ketebalan material (mm)', standar: '4.0 +/- 0.2mm' },
            { param: 'Kualitas las', standar: 'Tidak ada retak/porosity' },
            { param: 'Lapisan cat primer', standar: 'Merata, tidak ada gelembung' },
        ],
        'P002': [
            { param: 'Dimensi (mm)', standar: '3000 x 1500 +/- 5mm' },
            { param: 'Ketebalan (mm)', standar: '3.0 +/- 0.3mm' },
            { param: 'Flatness', standar: 'Maks. warping 2mm/m' },
            { param: 'Permukaan', standar: 'Bebas karat dan cacat' },
        ],
        'P003': [
            { param: 'Tekanan hidrolik (bar)', standar: '150-160 bar' },
            { param: 'Kebocoran sistem', standar: 'Tidak ada kebocoran' },
            { param: 'Stroke piston (mm)', standar: '200 +/- 3mm' },
            { param: 'Bunyi operasi', standar: 'Normal, tidak ada suara abnormal' },
            { param: 'Finishing body', standar: 'Cat merata, tidak ada cacat' },
        ],
        'default': [
            { param: 'Visual inspection', standar: 'Tidak ada cacat tampak' },
            { param: 'Dimensi utama', standar: 'Sesuai drawing' },
            { param: 'Fungsi mekanis', standar: 'Berfungsi normal' },
            { param: 'Penandaan/labeling', standar: 'Lengkap dan terbaca' },
        ]
    }
};

const INITIAL_DATA = {
    salesOrders: [
        {
            id: 'SO-2024-001', customerId: 'C001', tanggal: '2024-10-05', targetKirim: '2024-11-20',
            status: 'Invoiced', items: [
                { productId: 'P001', qty: 50, harga: 185000 },
                { productId: 'P005', qty: 100, harga: 35000 }
            ], catatan: 'Pengiriman ke gudang Jakarta Utara'
        },
        {
            id: 'SO-2024-002', customerId: 'C002', tanggal: '2024-10-12', targetKirim: '2024-11-25',
            status: 'Invoiced', items: [
                { productId: 'P002', qty: 20, harga: 420000 }
            ], catatan: ''
        },
        {
            id: 'SO-2024-003', customerId: 'C006', tanggal: '2024-10-20', targetKirim: '2024-12-01',
            status: 'Invoiced', items: [
                { productId: 'P006', qty: 80, harga: 275000 },
                { productId: 'P007', qty: 5, harga: 3800000 }
            ], catatan: 'Proyek renovasi pabrik Makassar'
        },
        {
            id: 'SO-2024-004', customerId: 'C003', tanggal: '2024-11-01', targetKirim: '2024-12-15',
            status: 'Delivered', items: [
                { productId: 'P001', qty: 120, harga: 185000 },
                { productId: 'P002', qty: 30, harga: 420000 }
            ], catatan: ''
        },
        {
            id: 'SO-2024-005', customerId: 'C007', tanggal: '2024-11-08', targetKirim: '2024-12-20',
            status: 'Delivered', items: [
                { productId: 'P004', qty: 2, harga: 12500000 }
            ], catatan: 'Ekspedisi via Pelni'
        },
        {
            id: 'SO-2024-006', customerId: 'C004', tanggal: '2024-11-20', targetKirim: '2025-01-10',
            status: 'In Production', items: [
                { productId: 'P003', qty: 2, harga: 45000000 },
                { productId: 'P004', qty: 1, harga: 12500000 }
            ], catatan: 'Prioritas tinggi'
        },
        {
            id: 'SO-2024-007', customerId: 'C001', tanggal: '2024-12-01', targetKirim: '2025-01-20',
            status: 'Confirmed', items: [
                { productId: 'P001', qty: 100, harga: 185000 }
            ], catatan: ''
        },
        {
            id: 'SO-2024-008', customerId: 'C005', tanggal: '2024-12-05', targetKirim: '2025-02-01',
            status: 'Draft', items: [
                { productId: 'P004', qty: 3, harga: 12500000 }
            ], catatan: 'Menunggu konfirmasi customer'
        },
        {
            id: 'SO-2024-009', customerId: 'C002', tanggal: '2024-12-10', targetKirim: '2025-02-15',
            status: 'Draft', items: [
                { productId: 'P007', qty: 10, harga: 3800000 }
            ], catatan: 'Permintaan tambahan Q1 2025'
        },
    ],

    workOrders: [
        {
            id: 'WO-2024-001', soId: 'SO-2024-001', productId: 'P001', qty: 50,
            workCenterId: 'WC05', status: 'Completed', progress: 100,
            targetDate: '2024-11-15', startDate: '2024-10-08', completedDate: '2024-11-12'
        },
        {
            id: 'WO-2024-002', soId: 'SO-2024-002', productId: 'P002', qty: 20,
            workCenterId: 'WC01', status: 'Completed', progress: 100,
            targetDate: '2024-11-20', startDate: '2024-10-15', completedDate: '2024-11-18'
        },
        {
            id: 'WO-2024-003', soId: 'SO-2024-003', productId: 'P006', qty: 80,
            workCenterId: 'WC01', status: 'Completed', progress: 100,
            targetDate: '2024-11-25', startDate: '2024-10-22', completedDate: '2024-11-22'
        },
        {
            id: 'WO-2024-004', soId: 'SO-2024-004', productId: 'P001', qty: 120,
            workCenterId: 'WC05', status: 'Completed', progress: 100,
            targetDate: '2024-12-10', startDate: '2024-11-05', completedDate: '2024-12-08'
        },
        {
            id: 'WO-2024-005', soId: 'SO-2024-005', productId: 'P004', qty: 2,
            workCenterId: 'WC03', status: 'Completed', progress: 100,
            targetDate: '2024-12-15', startDate: '2024-11-10', completedDate: '2024-12-12'
        },
        {
            id: 'WO-2024-006', soId: 'SO-2024-006', productId: 'P003', qty: 2,
            workCenterId: 'WC03', status: 'In Progress', progress: 65,
            targetDate: '2025-01-05', startDate: '2024-11-25', completedDate: null
        },
        {
            id: 'WO-2024-007', soId: 'SO-2024-006', productId: 'P004', qty: 1,
            workCenterId: 'WC05', status: 'In Progress', progress: 40,
            targetDate: '2025-01-08', startDate: '2024-11-28', completedDate: null
        },
        {
            id: 'WO-2024-008', soId: 'SO-2024-007', productId: 'P001', qty: 100,
            workCenterId: 'WC05', status: 'Not Started', progress: 0,
            targetDate: '2025-01-15', startDate: null, completedDate: null
        },
    ],

    stockHistory: [
        { id: 'SH-001', materialId: 'M001', tipe: 'masuk', qty: 3000, stokSebelum: 0, stokSesudah: 3000, ref: 'PO-2024-001', tanggal: '2024-09-01', keterangan: 'Pembelian awal' },
        { id: 'SH-002', materialId: 'M001', tipe: 'keluar', qty: 500, stokSebelum: 3000, stokSesudah: 2500, ref: 'WO-2024-001', tanggal: '2024-10-09', keterangan: 'Produksi WO-2024-001' },
        { id: 'SH-003', materialId: 'M002', tipe: 'masuk', qty: 500, stokSebelum: 0, stokSesudah: 500, ref: 'PO-2024-002', tanggal: '2024-09-05', keterangan: 'Pembelian awal' },
        { id: 'SH-004', materialId: 'M002', tipe: 'keluar', qty: 320, stokSebelum: 500, stokSesudah: 180, ref: 'WO-2024-002', tanggal: '2024-10-16', keterangan: 'Produksi WO-2024-002' },
        { id: 'SH-005', materialId: 'M009', tipe: 'masuk', qty: 600, stokSebelum: 0, stokSesudah: 600, ref: 'PO-2024-003', tanggal: '2024-09-10', keterangan: 'Pembelian awal' },
        { id: 'SH-006', materialId: 'M009', tipe: 'keluar', qty: 120, stokSebelum: 600, stokSesudah: 480, ref: 'WO-2024-003', tanggal: '2024-10-23', keterangan: 'Produksi WO-2024-003' },
        { id: 'SH-007', materialId: 'M005', tipe: 'masuk', qty: 400, stokSebelum: 0, stokSesudah: 400, ref: 'PO-2024-004', tanggal: '2024-09-15', keterangan: 'Pembelian awal' },
        { id: 'SH-008', materialId: 'M005', tipe: 'keluar', qty: 80, stokSebelum: 400, stokSesudah: 320, ref: 'WO-2024-001', tanggal: '2024-10-10', keterangan: 'Pemakaian produksi' },
    ],

    qcInspections: [
        {
            id: 'QC-2024-001', woId: 'WO-2024-001', productId: 'P001', qty: 50,
            status: 'Approved', hasil: 'Approved', inspector: 'Teguh Santoso',
            tanggal: '2024-11-13', checklist: [], catatan: 'Semua parameter OK'
        },
        {
            id: 'QC-2024-002', woId: 'WO-2024-002', productId: 'P002', qty: 20,
            status: 'Approved', hasil: 'Approved', inspector: 'Teguh Santoso',
            tanggal: '2024-11-19', checklist: [], catatan: 'Lulus inspeksi'
        },
        {
            id: 'QC-2024-003', woId: 'WO-2024-003', productId: 'P006', qty: 80,
            status: 'Approved', hasil: 'Approved', inspector: 'Dewi Kusuma',
            tanggal: '2024-11-23', checklist: [], catatan: 'Dimensi sesuai, finishing baik'
        },
        {
            id: 'QC-2024-004', woId: 'WO-2024-004', productId: 'P001', qty: 120,
            status: 'Approved', hasil: 'Approved', inspector: 'Teguh Santoso',
            tanggal: '2024-12-09', checklist: [], catatan: 'Lulus semua parameter'
        },
        {
            id: 'QC-2024-005', woId: 'WO-2024-005', productId: 'P004', qty: 2,
            status: 'Rework', hasil: 'Rework', inspector: 'Dewi Kusuma',
            tanggal: '2024-12-13', checklist: [], catatan: 'Perlu perbaikan alignment belt'
        },
    ],

    purchaseRequests: [
        {
            id: 'PR-2024-001', materialId: 'M004', qty: 100, status: 'Approved',
            alasan: 'Stok di bawah minimum (auto-generated)', tanggal: '2024-11-01', approvedBy: 'Manajer Produksi'
        },
        {
            id: 'PR-2024-002', materialId: 'M006', qty: 150, status: 'Approved',
            alasan: 'Stok di bawah minimum (auto-generated)', tanggal: '2024-11-15', approvedBy: 'Manajer Produksi'
        },
        {
            id: 'PR-2024-003', materialId: 'M002', qty: 500, status: 'Pending',
            alasan: 'Stok di bawah minimum (auto-generated)', tanggal: '2024-12-01', approvedBy: null
        },
        {
            id: 'PR-2024-004', materialId: 'M010', qty: 200, status: 'Pending',
            alasan: 'Stok di bawah minimum (auto-generated)', tanggal: '2024-12-05', approvedBy: null
        },
    ],

    purchaseOrders: [
        {
            id: 'PO-2024-001', prId: 'PR-2024-001', supplierId: 'S004', materialId: 'M004',
            qty: 100, harga: 145000, status: 'Completed',
            tanggal: '2024-11-02', tanggalTerima: '2024-11-08'
        },
        {
            id: 'PO-2024-002', prId: null, supplierId: 'S001', materialId: 'M002',
            qty: 500, harga: 18500, status: 'Sent',
            tanggal: '2024-12-03', tanggalTerima: null
        },
    ],

    invoices: [
        {
            id: 'INV-2024-001', soId: 'SO-2024-001', customerId: 'C001',
            tanggal: '2024-11-22', jatuhTempo: '2024-12-22',
            status: 'Paid', totalTagihan: 12750000, totalBayar: 12750000,
            payments: [{ tanggal: '2024-12-18', jumlah: 12750000, metode: 'Transfer Bank' }]
        },
        {
            id: 'INV-2024-002', soId: 'SO-2024-002', customerId: 'C002',
            tanggal: '2024-11-27', jatuhTempo: '2024-12-27',
            status: 'Paid', totalTagihan: 8400000, totalBayar: 8400000,
            payments: [{ tanggal: '2024-12-20', jumlah: 8400000, metode: 'Giro' }]
        },
        {
            id: 'INV-2024-003', soId: 'SO-2024-003', customerId: 'C006',
            tanggal: '2024-12-03', jatuhTempo: '2025-01-03',
            status: 'Partial', totalTagihan: 41000000, totalBayar: 20000000,
            payments: [{ tanggal: '2024-12-15', jumlah: 20000000, metode: 'Transfer Bank' }]
        },
        {
            id: 'INV-2024-004', soId: 'SO-2024-004', customerId: 'C003',
            tanggal: '2024-12-17', jatuhTempo: '2025-01-17',
            status: 'Sent', totalTagihan: 34800000, totalBayar: 0,
            payments: []
        },
        {
            id: 'INV-2024-005', soId: 'SO-2024-005', customerId: 'C007',
            tanggal: '2024-12-22', jatuhTempo: '2025-01-22',
            status: 'Sent', totalTagihan: 25000000, totalBayar: 0,
            payments: []
        },
    ],

    activities: [
        { id: 1, tipe: 'so', pesan: 'SO-2024-009 dibuat untuk CV Karya Nusantara', waktu: '2024-12-10 10:30', warna: 'bg-blue-400' },
        { id: 2, tipe: 'so', pesan: 'SO-2024-008 dibuat untuk PT Global Teknik Indonesia', waktu: '2024-12-05 09:15', warna: 'bg-blue-400' },
        { id: 3, tipe: 'wo', pesan: 'WO-2024-006 progress diupdate ke 65%', waktu: '2024-12-04 14:30', warna: 'bg-orange-400' },
        { id: 4, tipe: 'inv', pesan: 'INV-2024-004 dikirim ke PT Sinar Abadi Jaya', waktu: '2024-12-17 09:00', warna: 'bg-blue-400' },
        { id: 5, tipe: 'inv', pesan: 'INV-2024-005 dikirim ke PT Nusa Industri Perkasa', waktu: '2024-12-22 11:00', warna: 'bg-blue-400' },
        { id: 6, tipe: 'qc', pesan: 'QC-2024-004 disetujui - Rangka Baja Siku lulus inspeksi', waktu: '2024-12-09 11:00', warna: 'bg-green-400' },
        { id: 7, tipe: 'qc', pesan: 'QC-2024-005 hasil Rework - Konveyor Belt perlu perbaikan', waktu: '2024-12-13 15:00', warna: 'bg-yellow-400' },
        { id: 8, tipe: 'inv', pesan: 'INV-2024-002 lunas - CV Karya Nusantara', waktu: '2024-12-20 10:00', warna: 'bg-green-400' },
        { id: 9, tipe: 'pr', pesan: 'PR-2024-003 auto-generated: Plat Baja stok kritis', waktu: '2024-12-01 08:00', warna: 'bg-yellow-400' },
        { id: 10, tipe: 'pr', pesan: 'PR-2024-004 auto-generated: Amplas stok kritis', waktu: '2024-12-05 08:00', warna: 'bg-yellow-400' },
    ],

    notifications: []
};