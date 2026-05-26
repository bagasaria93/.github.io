'use strict';

const STORAGE_PREFIX = 'hris_cg_';

// ============================================================
// STATIC MOCK DATA
// ============================================================

const INITIAL_DEPARTMENTS = [
  { id: 'DEP001', code: 'DIR', name: 'Direksi', headId: 'EMP001', description: 'Manajemen puncak perusahaan' },
  { id: 'DEP002', code: 'SDM', name: 'Sumber Daya Manusia', headId: 'EMP002', description: 'Pengelolaan sumber daya manusia perusahaan' },
  { id: 'DEP003', code: 'TI', name: 'Teknologi Informasi', headId: 'EMP005', description: 'Pengembangan dan pengelolaan sistem teknologi' },
  { id: 'DEP004', code: 'KEU', name: 'Keuangan & Akuntansi', headId: 'EMP003', description: 'Pengelolaan keuangan dan pelaporan akuntansi' },
  { id: 'DEP005', code: 'PMK', name: 'Pemasaran & Komunikasi', headId: 'EMP008', description: 'Strategi pemasaran dan komunikasi perusahaan' },
  { id: 'DEP006', code: 'OPS', name: 'Operasional', headId: 'EMP014', description: 'Operasional dan administrasi umum' },
  { id: 'DEP007', code: 'PJL', name: 'Penjualan', headId: 'EMP011', description: 'Tim penjualan dan pengembangan bisnis' },
];

const INITIAL_POSITIONS = [
  { id: 'POS001', name: 'Direktur Utama', departmentId: 'DEP001', level: 1, grade: 'A' },
  { id: 'POS002', name: 'HR Manager', departmentId: 'DEP002', level: 2, grade: 'B' },
  { id: 'POS003', name: 'Finance Manager', departmentId: 'DEP004', level: 2, grade: 'B' },
  { id: 'POS004', name: 'HR Generalist', departmentId: 'DEP002', level: 4, grade: 'D' },
  { id: 'POS005', name: 'Senior Software Engineer', departmentId: 'DEP003', level: 3, grade: 'C' },
  { id: 'POS006', name: 'UI/UX Designer', departmentId: 'DEP003', level: 4, grade: 'D' },
  { id: 'POS007', name: 'Backend Developer', departmentId: 'DEP003', level: 4, grade: 'D' },
  { id: 'POS008', name: 'Marketing Manager', departmentId: 'DEP005', level: 2, grade: 'B' },
  { id: 'POS009', name: 'System Analyst', departmentId: 'DEP003', level: 3, grade: 'C' },
  { id: 'POS010', name: 'Staff Akuntansi', departmentId: 'DEP004', level: 5, grade: 'E' },
  { id: 'POS011', name: 'Sales Executive', departmentId: 'DEP007', level: 4, grade: 'D' },
  { id: 'POS012', name: 'Content Strategist', departmentId: 'DEP005', level: 4, grade: 'D' },
  { id: 'POS013', name: 'IT Support', departmentId: 'DEP003', level: 5, grade: 'E' },
  { id: 'POS014', name: 'Staff Operasional', departmentId: 'DEP006', level: 5, grade: 'E' },
  { id: 'POS015', name: 'Junior Developer', departmentId: 'DEP003', level: 5, grade: 'E' },
];

const INITIAL_EMPLOYEES = [
  {
    id: 'EMP001', nik: '3175011503850001', name: 'Rendra Kusuma',
    email: 'rendra.kusuma@cakrawalagemilang.co.id', loginEmail: 'admin@cakrawalagemilang.co.id', password: 'Admin@123',
    phone: '081210001001', birthPlace: 'Jakarta', birthDate: '1985-03-15',
    gender: 'L', religion: 'Islam', maritalStatus: 'K/2',
    bloodType: 'B', address: 'Jl. Kemang Raya No. 12, Kemang, Jakarta Selatan',
    department: 'DEP001', position: 'POS001', employeeType: 'Tetap',
    joinDate: '2012-01-15', salary: 30000000,
    allowances: { transport: 1500000, meal: 800000, housing: 5000000, position: 10000000 },
    bankName: 'BCA', bankAccount: '1234567890', status: 'Aktif', role: 'superadmin', photo: null,
  },
  {
    id: 'EMP002', nik: '3175025501900002', name: 'Larasati Pramudita',
    email: 'larasati.pramudita@cakrawalagemilang.co.id', loginEmail: 'hrmanager@cakrawalagemilang.co.id', password: 'Hrmgr@123',
    phone: '081210001002', birthPlace: 'Yogyakarta', birthDate: '1990-01-15',
    gender: 'P', religion: 'Islam', maritalStatus: 'K/1',
    bloodType: 'A', address: 'Jl. Tebet Barat Dalam V No. 7, Tebet, Jakarta Selatan',
    department: 'DEP002', position: 'POS002', employeeType: 'Tetap',
    joinDate: '2014-03-01', salary: 18000000,
    allowances: { transport: 1000000, meal: 700000, housing: 3000000, position: 4000000 },
    bankName: 'Mandiri', bankAccount: '1234567891', status: 'Aktif', role: 'hrmanager', photo: null,
  },
  {
    id: 'EMP003', nik: '3175031201880003', name: 'Satria Wibowo',
    email: 'satria.wibowo@cakrawalagemilang.co.id', loginEmail: 'satria@cakrawalagemilang.co.id', password: 'Satria@123',
    phone: '081210001003', birthPlace: 'Surabaya', birthDate: '1988-01-12',
    gender: 'L', religion: 'Islam', maritalStatus: 'K/1',
    bloodType: 'O', address: 'Jl. Pejaten Barat No. 23, Pasar Minggu, Jakarta Selatan',
    department: 'DEP004', position: 'POS003', employeeType: 'Tetap',
    joinDate: '2015-06-01', salary: 18500000,
    allowances: { transport: 1000000, meal: 700000, housing: 3000000, position: 4000000 },
    bankName: 'BNI', bankAccount: '1234567892', status: 'Aktif', role: 'employee', photo: null,
  },
  {
    id: 'EMP004', nik: '3175042205950004', name: 'Annisa Rahmawati',
    email: 'annisa.rahmawati@cakrawalagemilang.co.id', loginEmail: 'hrstaff@cakrawalagemilang.co.id', password: 'Hrstaff@123',
    phone: '081210001004', birthPlace: 'Bandung', birthDate: '1995-05-22',
    gender: 'P', religion: 'Islam', maritalStatus: 'TK/0',
    bloodType: 'AB', address: 'Jl. Kalibata Utara II No. 5, Kalibata, Jakarta Selatan',
    department: 'DEP002', position: 'POS004', employeeType: 'Tetap',
    joinDate: '2019-08-01', salary: 8500000,
    allowances: { transport: 500000, meal: 600000, housing: 0, position: 1000000 },
    bankName: 'BRI', bankAccount: '1234567893', status: 'Aktif', role: 'hrstaff', photo: null,
  },
  {
    id: 'EMP005', nik: '3175051407930005', name: 'Gilang Ramadhan',
    email: 'gilang.ramadhan@cakrawalagemilang.co.id', loginEmail: 'karyawan@cakrawalagemilang.co.id', password: 'Kary@123',
    phone: '081210001005', birthPlace: 'Bandung', birthDate: '1993-07-14',
    gender: 'L', religion: 'Islam', maritalStatus: 'K/0',
    bloodType: 'B', address: 'Jl. Cipete Raya No. 45, Cipete, Jakarta Selatan',
    department: 'DEP003', position: 'POS005', employeeType: 'Tetap',
    joinDate: '2017-04-01', salary: 15000000,
    allowances: { transport: 800000, meal: 700000, housing: 2000000, position: 2000000 },
    bankName: 'BCA', bankAccount: '1234567894', status: 'Aktif', role: 'employee', photo: null,
  },
  {
    id: 'EMP006', nik: '3175062903920006', name: 'Kartika Sari Dewi',
    email: 'kartika.sari@cakrawalagemilang.co.id', loginEmail: 'kartika@cakrawalagemilang.co.id', password: 'Kartika@123',
    phone: '081210001006', birthPlace: 'Solo', birthDate: '1992-03-29',
    gender: 'P', religion: 'Kristen', maritalStatus: 'K/1',
    bloodType: 'A', address: 'Jl. Panglima Polim IX No. 11, Kebayoran Baru, Jakarta Selatan',
    department: 'DEP003', position: 'POS006', employeeType: 'Tetap',
    joinDate: '2018-02-01', salary: 12000000,
    allowances: { transport: 700000, meal: 600000, housing: 1500000, position: 1500000 },
    bankName: 'Mandiri', bankAccount: '1234567895', status: 'Aktif', role: 'employee', photo: null,
  },
  {
    id: 'EMP007', nik: '3175070809940007', name: 'Bagas Nugraha',
    email: 'bagas.nugraha@cakrawalagemilang.co.id', loginEmail: 'bagas@cakrawalagemilang.co.id', password: 'Bagas@123',
    phone: '081210001007', birthPlace: 'Jakarta', birthDate: '1994-09-08',
    gender: 'L', religion: 'Islam', maritalStatus: 'TK/0',
    bloodType: 'O', address: 'Jl. Mampang Prapatan IV No. 22, Mampang, Jakarta Selatan',
    department: 'DEP003', position: 'POS007', employeeType: 'Tetap',
    joinDate: '2019-01-07', salary: 13000000,
    allowances: { transport: 700000, meal: 600000, housing: 1500000, position: 1500000 },
    bankName: 'BNI', bankAccount: '1234567896', status: 'Aktif', role: 'employee', photo: null,
  },
  {
    id: 'EMP008', nik: '3175081612910008', name: 'Nisrina Aulia',
    email: 'nisrina.aulia@cakrawalagemilang.co.id', loginEmail: 'nisrina@cakrawalagemilang.co.id', password: 'Nisrina@123',
    phone: '081210001008', birthPlace: 'Medan', birthDate: '1991-12-16',
    gender: 'P', religion: 'Islam', maritalStatus: 'K/0',
    bloodType: 'B', address: 'Jl. Fatmawati Raya No. 78, Cilandak, Jakarta Selatan',
    department: 'DEP005', position: 'POS008', employeeType: 'Tetap',
    joinDate: '2016-07-01', salary: 14000000,
    allowances: { transport: 800000, meal: 700000, housing: 2000000, position: 2500000 },
    bankName: 'BCA', bankAccount: '1234567897', status: 'Aktif', role: 'employee', photo: null,
  },
  {
    id: 'EMP009', nik: '3175092511890009', name: 'Fauzan Aditya',
    email: 'fauzan.aditya@cakrawalagemilang.co.id', loginEmail: 'fauzan@cakrawalagemilang.co.id', password: 'Fauzan@123',
    phone: '081210001009', birthPlace: 'Semarang', birthDate: '1989-11-25',
    gender: 'L', religion: 'Islam', maritalStatus: 'K/2',
    bloodType: 'A', address: 'Jl. Kebagusan Raya No. 5, Pasar Minggu, Jakarta Selatan',
    department: 'DEP003', position: 'POS009', employeeType: 'Tetap',
    joinDate: '2016-01-04', salary: 12500000,
    allowances: { transport: 700000, meal: 600000, housing: 1500000, position: 2000000 },
    bankName: 'BRI', bankAccount: '1234567898', status: 'Aktif', role: 'employee', photo: null,
  },
  {
    id: 'EMP010', nik: '3175100703960010', name: 'Cantika Maharani',
    email: 'cantika.maharani@cakrawalagemilang.co.id', loginEmail: 'cantika@cakrawalagemilang.co.id', password: 'Cantika@123',
    phone: '081210001010', birthPlace: 'Jakarta', birthDate: '1996-03-07',
    gender: 'P', religion: 'Islam', maritalStatus: 'TK/0',
    bloodType: 'B', address: 'Jl. Condet Raya No. 33, Kramat Jati, Jakarta Timur',
    department: 'DEP004', position: 'POS010', employeeType: 'Tetap',
    joinDate: '2020-03-02', salary: 7500000,
    allowances: { transport: 500000, meal: 600000, housing: 0, position: 500000 },
    bankName: 'BCA', bankAccount: '1234567899', status: 'Aktif', role: 'employee', photo: null,
  },
  {
    id: 'EMP011', nik: '3175111901930011', name: 'Iqbal Hamdani',
    email: 'iqbal.hamdani@cakrawalagemilang.co.id', loginEmail: 'iqbal@cakrawalagemilang.co.id', password: 'Iqbal@123',
    phone: '081210001011', birthPlace: 'Makassar', birthDate: '1993-01-19',
    gender: 'L', religion: 'Islam', maritalStatus: 'K/1',
    bloodType: 'O', address: 'Jl. Cijantung III No. 17, Kramat Jati, Jakarta Timur',
    department: 'DEP007', position: 'POS011', employeeType: 'Tetap',
    joinDate: '2018-09-03', salary: 7000000,
    allowances: { transport: 500000, meal: 600000, housing: 0, position: 500000 },
    bankName: 'Mandiri', bankAccount: '1234567900', status: 'Aktif', role: 'employee', photo: null,
  },
  {
    id: 'EMP012', nik: '3175122708970012', name: 'Resita Anggraini',
    email: 'resita.anggraini@cakrawalagemilang.co.id', loginEmail: 'resita@cakrawalagemilang.co.id', password: 'Resita@123',
    phone: '081210001012', birthPlace: 'Surabaya', birthDate: '1997-08-27',
    gender: 'P', religion: 'Kristen', maritalStatus: 'TK/0',
    bloodType: 'A', address: 'Jl. Ragunan Raya No. 8, Pasar Minggu, Jakarta Selatan',
    department: 'DEP005', position: 'POS012', employeeType: 'Kontrak',
    joinDate: '2021-06-01', salary: 8000000,
    allowances: { transport: 500000, meal: 600000, housing: 0, position: 500000 },
    bankName: 'BNI', bankAccount: '1234567901', status: 'Aktif', role: 'employee', photo: null,
  },
  {
    id: 'EMP013', nik: '3175130511980013', name: 'Daffa Ardiansyah',
    email: 'daffa.ardiansyah@cakrawalagemilang.co.id', loginEmail: 'daffa@cakrawalagemilang.co.id', password: 'Daffa@123',
    phone: '081210001013', birthPlace: 'Bogor', birthDate: '1998-11-05',
    gender: 'L', religion: 'Islam', maritalStatus: 'TK/0',
    bloodType: 'B', address: 'Jl. Warung Buncit Raya No. 55, Mampang, Jakarta Selatan',
    department: 'DEP003', position: 'POS013', employeeType: 'Tetap',
    joinDate: '2021-03-15', salary: 6500000,
    allowances: { transport: 500000, meal: 600000, housing: 0, position: 500000 },
    bankName: 'BRI', bankAccount: '1234567902', status: 'Aktif', role: 'employee', photo: null,
  },
  {
    id: 'EMP014', nik: '3175141503940014', name: 'Wulandari Setyowati',
    email: 'wulandari.setyowati@cakrawalagemilang.co.id', loginEmail: 'wulandari@cakrawalagemilang.co.id', password: 'Wulan@123',
    phone: '081210001014', birthPlace: 'Malang', birthDate: '1994-03-15',
    gender: 'P', religion: 'Islam', maritalStatus: 'K/1',
    bloodType: 'O', address: 'Jl. Pondok Labu Raya No. 14, Cilandak, Jakarta Selatan',
    department: 'DEP006', position: 'POS014', employeeType: 'Tetap',
    joinDate: '2019-11-01', salary: 6000000,
    allowances: { transport: 500000, meal: 600000, housing: 0, position: 500000 },
    bankName: 'BCA', bankAccount: '1234567903', status: 'Aktif', role: 'employee', photo: null,
  },
  {
    id: 'EMP015', nik: '3175151209010015', name: 'Hanif Maulana',
    email: 'hanif.maulana@cakrawalagemilang.co.id', loginEmail: 'hanif@cakrawalagemilang.co.id', password: 'Hanif@123',
    phone: '081210001015', birthPlace: 'Depok', birthDate: '2001-09-12',
    gender: 'L', religion: 'Islam', maritalStatus: 'TK/0',
    bloodType: 'A', address: 'Jl. TB Simatupang No. 20, Cilandak, Jakarta Selatan',
    department: 'DEP003', position: 'POS015', employeeType: 'Magang',
    joinDate: '2024-01-08', salary: 7000000,
    allowances: { transport: 500000, meal: 600000, housing: 0, position: 0 },
    bankName: 'Mandiri', bankAccount: '1234567904', status: 'Aktif', role: 'employee', photo: null,
  },
];

const INITIAL_LEAVE_BALANCES = [
  { employeeId: 'EMP001', year: 2026, annual: { total: 12, used: 0, remaining: 12 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP002', year: 2026, annual: { total: 12, used: 2, remaining: 10 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP003', year: 2026, annual: { total: 12, used: 1, remaining: 11 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP004', year: 2026, annual: { total: 12, used: 0, remaining: 12 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP005', year: 2026, annual: { total: 12, used: 2, remaining: 10 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP006', year: 2026, annual: { total: 12, used: 0, remaining: 12 }, sick: { total: 14, used: 1, remaining: 13 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP007', year: 2026, annual: { total: 12, used: 0, remaining: 12 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP008', year: 2026, annual: { total: 12, used: 3, remaining: 9 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP009', year: 2026, annual: { total: 12, used: 1, remaining: 11 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP010', year: 2026, annual: { total: 12, used: 0, remaining: 12 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 2, remaining: 1 } },
  { employeeId: 'EMP011', year: 2026, annual: { total: 12, used: 4, remaining: 8 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP012', year: 2026, annual: { total: 12, used: 0, remaining: 12 }, sick: { total: 14, used: 2, remaining: 12 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP013', year: 2026, annual: { total: 12, used: 0, remaining: 12 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP014', year: 2026, annual: { total: 12, used: 2, remaining: 10 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 0, remaining: 3 } },
  { employeeId: 'EMP015', year: 2026, annual: { total: 12, used: 0, remaining: 12 }, sick: { total: 14, used: 0, remaining: 14 }, important: { total: 3, used: 0, remaining: 3 } },
];

const INITIAL_LEAVE_REQUESTS = [
  { id: 'LVR001', employeeId: 'EMP005', type: 'Cuti Tahunan', startDate: '2026-05-01', endDate: '2026-05-02', days: 2, reason: 'Keperluan keluarga di kampung halaman Bandung', status: 'Disetujui', approvedBy: 'EMP002', approvedDate: '2026-04-28', rejectNote: '', createdAt: '2026-04-25' },
  { id: 'LVR002', employeeId: 'EMP006', type: 'Cuti Sakit', startDate: '2026-05-06', endDate: '2026-05-06', days: 1, reason: 'Demam tinggi disertai batuk, sudah ke dokter', status: 'Disetujui', approvedBy: 'EMP002', approvedDate: '2026-05-06', rejectNote: '', createdAt: '2026-05-06' },
  { id: 'LVR003', employeeId: 'EMP010', type: 'Cuti Penting', startDate: '2026-05-12', endDate: '2026-05-13', days: 2, reason: 'Pernikahan saudara kandung di Yogyakarta', status: 'Disetujui', approvedBy: 'EMP002', approvedDate: '2026-05-10', rejectNote: '', createdAt: '2026-05-08' },
  { id: 'LVR004', employeeId: 'EMP013', type: 'Cuti Tahunan', startDate: '2026-05-28', endDate: '2026-05-29', days: 2, reason: 'Liburan bersama keluarga', status: 'Menunggu', approvedBy: null, approvedDate: null, rejectNote: '', createdAt: '2026-05-21' },
  { id: 'LVR005', employeeId: 'EMP007', type: 'Cuti Tahunan', startDate: '2026-05-29', endDate: '2026-05-29', days: 1, reason: 'Pengurusan dokumen administrasi kependudukan', status: 'Menunggu', approvedBy: null, approvedDate: null, rejectNote: '', createdAt: '2026-05-22' },
  { id: 'LVR006', employeeId: 'EMP012', type: 'Cuti Sakit', startDate: '2026-05-08', endDate: '2026-05-09', days: 2, reason: 'Infeksi saluran pernapasan atas', status: 'Ditolak', approvedBy: 'EMP002', approvedDate: '2026-05-09', rejectNote: 'Perlu melampirkan surat keterangan dokter yang valid. Silakan ajukan ulang dengan dokumen lengkap.', createdAt: '2026-05-08' },
  { id: 'LVR007', employeeId: 'EMP009', type: 'Cuti Tahunan', startDate: '2026-06-02', endDate: '2026-06-05', days: 4, reason: 'Liburan akhir tahun ajaran anak, sudah ada tiket', status: 'Menunggu', approvedBy: null, approvedDate: null, rejectNote: '', createdAt: '2026-05-25' },
  { id: 'LVR008', employeeId: 'EMP011', type: 'Cuti Tahunan', startDate: '2026-04-14', endDate: '2026-04-17', days: 4, reason: 'Mudik Lebaran', status: 'Disetujui', approvedBy: 'EMP002', approvedDate: '2026-04-10', rejectNote: '', createdAt: '2026-04-08' },
  { id: 'LVR009', employeeId: 'EMP008', type: 'Cuti Tahunan', startDate: '2026-04-14', endDate: '2026-04-17', days: 4, reason: 'Mudik Lebaran ke Medan', status: 'Disetujui', approvedBy: 'EMP002', approvedDate: '2026-04-09', rejectNote: '', createdAt: '2026-04-07' },
  { id: 'LVR010', employeeId: 'EMP003', type: 'Cuti Tahunan', startDate: '2026-04-14', endDate: '2026-04-15', days: 2, reason: 'Cuti Lebaran', status: 'Disetujui', approvedBy: 'EMP001', approvedDate: '2026-04-09', rejectNote: '', createdAt: '2026-04-07' },
];

const INITIAL_RECRUITMENTS = [
  {
    id: 'REC001', position: 'Full Stack Developer', department: 'DEP003', type: 'Tetap', quota: 2,
    description: 'Kami mencari Full Stack Developer berpengalaman untuk bergabung dengan tim TI. Kandidat akan bertanggung jawab dalam pengembangan dan pemeliharaan aplikasi web perusahaan.',
    requirements: ['Minimal S1 Teknik Informatika atau bidang terkait', 'Pengalaman minimal 3 tahun sebagai Full Stack Developer', 'Menguasai React.js/Vue.js dan Node.js/Laravel', 'Familiar dengan database SQL dan NoSQL', 'Kemampuan problem solving yang baik dan kerja tim'],
    status: 'Buka', postedDate: '2026-05-01', deadline: '2026-06-15',
    candidates: [
      { id: 'CND001', name: 'Aryo Prasetyo Nugroho', email: 'aryo.prasetyo@email.com', phone: '081299881001', stage: 'Interview', appliedDate: '2026-05-05', notes: 'Background kuat di React dan Node.js, pengalaman 4 tahun di startup. Komunikatif dan antusias.', rating: 4 },
      { id: 'CND002', name: 'Sefira Maulida Rahman', email: 'sefira.maulida@email.com', phone: '081299881002', stage: 'Screening', appliedDate: '2026-05-08', notes: 'Portfolio menarik dengan beberapa proyek open source, perlu verifikasi pengalaman kerja.', rating: 3 },
      { id: 'CND003', name: 'Brilian Dwi Cahyanto', email: 'brilian.dwi@email.com', phone: '081299881003', stage: 'Applied', appliedDate: '2026-05-14', notes: '', rating: 0 },
      { id: 'CND004', name: 'Tiara Rachmawati Putri', email: 'tiara.rachma@email.com', phone: '081299881004', stage: 'Rejected', appliedDate: '2026-05-03', notes: 'Pengalaman belum memenuhi kualifikasi minimum 3 tahun, baru 1 tahun pengalaman.', rating: 2 },
    ]
  },
  {
    id: 'REC002', position: 'Digital Marketing Specialist', department: 'DEP005', type: 'Tetap', quota: 1,
    description: 'Bergabunglah dengan tim pemasaran kami. Kandidat akan mengelola kampanye digital, SEO/SEM, dan analitik pemasaran untuk meningkatkan brand awareness perusahaan.',
    requirements: ['Minimal S1 Pemasaran, Komunikasi, atau bidang terkait', 'Pengalaman 2 tahun di digital marketing', 'Menguasai Google Ads, Meta Ads, dan tools analitik', 'Kemampuan copywriting dalam bahasa Indonesia dan Inggris', 'Berorientasi pada data, target, dan ROI'],
    status: 'Buka', postedDate: '2026-05-10', deadline: '2026-06-10',
    candidates: [
      { id: 'CND005', name: 'Indira Wulandari Putri', email: 'indira.wulan@email.com', phone: '081299881005', stage: 'Offer', appliedDate: '2026-05-12', notes: 'Sangat qualified, pengalaman 3 tahun di agency digital terkemuka. Negosiasi gaji sedang berlangsung.', rating: 5 },
      { id: 'CND006', name: 'Rizky Fadhillah Akbar', email: 'rizky.fadhil@email.com', phone: '081299881006', stage: 'Interview', appliedDate: '2026-05-15', notes: 'Kandidat potensial, perlu evaluasi lebih lanjut terkait kemampuan analitik data.', rating: 3 },
      { id: 'CND007', name: 'Dewita Kusumawati', email: 'dewita.kusu@email.com', phone: '081299881007', stage: 'Screening', appliedDate: '2026-05-18', notes: '', rating: 0 },
    ]
  },
  {
    id: 'REC003', position: 'Akuntan Senior', department: 'DEP004', type: 'Tetap', quota: 1,
    description: 'Kami membutuhkan Akuntan Senior untuk memperkuat tim keuangan. Bertanggung jawab atas pelaporan keuangan, analisis, dan kepatuhan perpajakan perusahaan.',
    requirements: ['S1/S2 Akuntansi', 'Pengalaman minimal 5 tahun di posisi serupa', 'Sertifikasi CPA atau CA lebih diutamakan', 'Menguasai PSAK dan peraturan perpajakan Indonesia', 'Pengalaman dengan software ERP (SAP/Oracle/Odoo)'],
    status: 'Tutup', postedDate: '2026-03-15', deadline: '2026-04-30',
    candidates: [
      { id: 'CND008', name: 'Anggita Permana Kusuma', email: 'anggita.perm@email.com', phone: '081299881008', stage: 'Hired', appliedDate: '2026-03-20', notes: 'Ditawari posisi dan menerima. Join date dijadwalkan 1 Juli 2026. Background sangat kuat dari KAP Big4.', rating: 5 },
      { id: 'CND009', name: 'Wahyu Triyanto', email: 'wahyu.tri@email.com', phone: '081299881009', stage: 'Rejected', appliedDate: '2026-03-22', notes: 'Tidak lolos final interview, kurang dalam aspek leadership dan komunikasi.', rating: 3 },
    ]
  },
];

const INITIAL_PERFORMANCES = [
  {
    id: 'PRF001', employeeId: 'EMP005', period: 'Q1-2026',
    kpis: [
      { name: 'Penyelesaian Sprint Tepat Waktu', target: 90, actual: 92, unit: '%', weight: 30 },
      { name: 'Tingkat Kehadiran', target: 95, actual: 98, unit: '%', weight: 20 },
      { name: 'Code Review Score', target: 80, actual: 85, unit: 'poin', weight: 25 },
      { name: 'Resolusi Bug dalam SLA', target: 85, actual: 88, unit: '%', weight: 25 },
    ],
    overallScore: 91, rating: 'Sangat Baik', reviewedBy: 'EMP001', reviewDate: '2026-04-10',
    notes: 'Gilang menunjukkan peningkatan signifikan dalam kualitas kode dan kolaborasi tim. Sangat direkomendasikan untuk program pengembangan leadership tahun ini.', status: 'Final',
  },
  {
    id: 'PRF002', employeeId: 'EMP006', period: 'Q1-2026',
    kpis: [
      { name: 'Penyelesaian Desain Tepat Waktu', target: 90, actual: 88, unit: '%', weight: 35 },
      { name: 'Tingkat Kehadiran', target: 95, actual: 94, unit: '%', weight: 20 },
      { name: 'Skor Kepuasan Stakeholder', target: 80, actual: 85, unit: 'poin', weight: 30 },
      { name: 'Rata-rata Jumlah Iterasi Revisi', target: 3, actual: 2, unit: 'kali', weight: 15 },
    ],
    overallScore: 87, rating: 'Baik', reviewedBy: 'EMP002', reviewDate: '2026-04-12',
    notes: 'Kartika konsisten menghasilkan desain berkualitas tinggi dan disukai stakeholder. Perlu meningkatkan kecepatan penyelesaian pada proyek dengan deadline ketat.', status: 'Final',
  },
  {
    id: 'PRF003', employeeId: 'EMP008', period: 'Q1-2026',
    kpis: [
      { name: 'Pencapaian Target Campaign', target: 100, actual: 115, unit: '%', weight: 40 },
      { name: 'Pertumbuhan Followers', target: 10, actual: 18, unit: '%', weight: 25 },
      { name: 'Tingkat Kehadiran', target: 95, actual: 97, unit: '%', weight: 15 },
      { name: 'Engagement Rate Media Sosial', target: 3, actual: 4.2, unit: '%', weight: 20 },
    ],
    overallScore: 96, rating: 'Istimewa', reviewedBy: 'EMP001', reviewDate: '2026-04-08',
    notes: 'Nisrina berhasil melampaui semua target marketing Q1 secara signifikan. Strategi kampanye digital yang inovatif terbukti sangat efektif. Pertahankan dan kembangkan pendekatan ini.', status: 'Final',
  },
  {
    id: 'PRF004', employeeId: 'EMP007', period: 'Q1-2026',
    kpis: [
      { name: 'API Delivery Tepat Waktu', target: 85, actual: 80, unit: '%', weight: 35 },
      { name: 'Uptime Sistem', target: 99.5, actual: 99.2, unit: '%', weight: 30 },
      { name: 'Tingkat Kehadiran', target: 95, actual: 92, unit: '%', weight: 15 },
      { name: 'Code Quality Score', target: 80, actual: 75, unit: 'poin', weight: 20 },
    ],
    overallScore: 82, rating: 'Baik', reviewedBy: 'EMP005', reviewDate: '2026-04-15',
    notes: 'Bagas menunjukkan kemampuan teknis yang solid. Perlu meningkatkan konsistensi kehadiran dan kualitas dokumentasi kode agar lebih mudah di-maintain tim lain.', status: 'Final',
  },
  {
    id: 'PRF005', employeeId: 'EMP009', period: 'Q1-2026',
    kpis: [
      { name: 'Penyelesaian Analisis Sistem', target: 90, actual: 93, unit: '%', weight: 40 },
      { name: 'Tingkat Kehadiran', target: 95, actual: 96, unit: '%', weight: 20 },
      { name: 'Akurasi Dokumentasi', target: 85, actual: 88, unit: '%', weight: 25 },
      { name: 'Kepuasan Tim Pengembang', target: 80, actual: 82, unit: 'poin', weight: 15 },
    ],
    overallScore: 90, rating: 'Sangat Baik', reviewedBy: 'EMP001', reviewDate: '2026-04-14',
    notes: 'Fauzan menunjukkan kemampuan analisis yang sangat baik. Dokumentasi teknis yang dihasilkan sangat membantu tim pengembang. Kandidat kuat untuk naik jabatan.', status: 'Final',
  },
  {
    id: 'PRF006', employeeId: 'EMP005', period: 'Q2-2026',
    kpis: [
      { name: 'Penyelesaian Sprint Tepat Waktu', target: 90, actual: 0, unit: '%', weight: 30 },
      { name: 'Tingkat Kehadiran', target: 95, actual: 0, unit: '%', weight: 20 },
      { name: 'Code Review Score', target: 80, actual: 0, unit: 'poin', weight: 25 },
      { name: 'Resolusi Bug dalam SLA', target: 85, actual: 0, unit: '%', weight: 25 },
    ],
    overallScore: 0, rating: '-', reviewedBy: null, reviewDate: null,
    notes: '', status: 'Draft',
  },
];

const INITIAL_TRAININGS = [
  {
    id: 'TRN001', title: 'Leadership & Team Management',
    category: 'Soft Skill', trainer: 'Dr. Hendriawan Prasetyo', organization: 'Prasetyo Leadership Institute',
    method: 'Offline', startDate: '2026-04-14', endDate: '2026-04-15',
    location: 'Ruang Rapat Utama Lt. 10, Gedung CG', quota: 15, cost: 5000000,
    description: 'Program pengembangan kepemimpinan untuk para manajer dan supervisor. Mencakup teknik motivasi tim, delegasi tugas, manajemen konflik, dan pengambilan keputusan strategis.',
    participants: ['EMP001', 'EMP002', 'EMP003', 'EMP008', 'EMP009'],
    completions: ['EMP001', 'EMP002', 'EMP003', 'EMP008', 'EMP009'], status: 'Selesai',
  },
  {
    id: 'TRN002', title: 'React.js Advanced Development',
    category: 'Hard Skill', trainer: 'Ryzal Firmansyah, S.Kom', organization: 'TechSkill Academy Indonesia',
    method: 'Online', startDate: '2026-05-05', endDate: '2026-05-16',
    location: 'Zoom Meeting (Link dikirim via email)', quota: 10, cost: 3500000,
    description: 'Pelatihan intensif React.js tingkat lanjut: React Hooks, Context API, Redux Toolkit, Performance Optimization dengan memoization, serta Testing dengan Jest dan React Testing Library.',
    participants: ['EMP005', 'EMP007', 'EMP009', 'EMP013', 'EMP015'],
    completions: ['EMP005', 'EMP007', 'EMP009', 'EMP013'], status: 'Selesai',
  },
  {
    id: 'TRN003', title: 'K3 & Keselamatan Kerja 2026',
    category: 'Compliance', trainer: 'Ir. Sugianto Prawirodihardjo, MM', organization: 'Lembaga K3 Nasional',
    method: 'Offline', startDate: '2026-05-26', endDate: '2026-05-27',
    location: 'Aula Gedung Utama Lt. 2', quota: 30, cost: 2000000,
    description: 'Pelatihan K3 (Kesehatan dan Keselamatan Kerja) wajib sesuai regulasi Kemnaker RI. Mencakup identifikasi & pengendalian risiko kerja, prosedur keadaan darurat, P3K, dan penggunaan APAR.',
    participants: ['EMP001','EMP002','EMP003','EMP004','EMP005','EMP006','EMP007','EMP008','EMP009','EMP010','EMP011','EMP012','EMP013','EMP014','EMP015'],
    completions: [], status: 'Berlangsung',
  },
  {
    id: 'TRN004', title: 'Digital Marketing Mastery 2026',
    category: 'Hard Skill', trainer: 'Gracia Natalie Tanuwijaya, MBA', organization: 'Digital Growth Academy',
    method: 'Hybrid', startDate: '2026-06-09', endDate: '2026-06-11',
    location: 'Ruang Training Lt. 5 & Zoom Meeting', quota: 12, cost: 4500000,
    description: 'Pelatihan strategi digital marketing terkini: Google Ads, Meta Ads, SEO/SEM, email marketing, marketing automation, dan analisis data untuk optimasi ROI kampanye.',
    participants: ['EMP008', 'EMP011', 'EMP012'], completions: [], status: 'Akan Datang',
  },
  {
    id: 'TRN005', title: 'PSAK Update & Financial Reporting 2026',
    category: 'Hard Skill', trainer: 'Prof. Bambang Hermansyah, Ph.D., CPA', organization: 'IAI (Ikatan Akuntan Indonesia)',
    method: 'Offline', startDate: '2026-06-23', endDate: '2026-06-24',
    location: 'Hotel Grand Sahid Jaya, Jakarta', quota: 5, cost: 7500000,
    description: 'Pembaruan PSAK terbaru dan implikasinya terhadap pelaporan keuangan. Mencakup PSAK 72 (Revenue), PSAK 73 (Leases), dan regulasi perpajakan terkini yang mempengaruhi pelaporan.',
    participants: ['EMP003', 'EMP010'], completions: [], status: 'Akan Datang',
  },
];

const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ANN001', title: 'Kebijakan Hybrid Working Terbaru Mulai Juni 2026',
    content: 'Yth. Seluruh Karyawan PT Cakrawala Gemilang,\n\nDengan hormat, kami sampaikan bahwa mulai tanggal 1 Juni 2026, perusahaan akan memberlakukan kebijakan hybrid working yang diperbarui sebagai berikut:\n\n1. Karyawan dapat bekerja dari rumah (WFH) maksimal 2 hari per minggu\n2. WFH harus dikomunikasikan kepada atasan langsung minimal 1 hari sebelumnya melalui sistem HRIS\n3. Kehadiran di kantor wajib pada hari Selasa dan Rabu\n4. Meeting dengan klien dan rapat strategis wajib dilakukan secara tatap muka\n5. Karyawan WFH wajib dapat dihubungi dan responsif selama jam kerja\n\nKebijakan ini berlaku untuk semua karyawan tetap yang telah melewati masa percobaan. Karyawan magang dan kontrak mengikuti ketentuan tersendiri yang akan diinformasikan oleh atasan langsung.\n\nInformasi lebih lanjut dapat menghubungi departemen SDM di ext. 101.\n\nHormat kami,\nManajemen PT Cakrawala Gemilang',
    category: 'SDM', audience: 'Semua', postedBy: 'EMP002',
    publishDate: '2026-05-20', status: 'Publish', isPinned: true, views: 142,
  },
  {
    id: 'ANN002', title: 'Jadwal dan Informasi Pembayaran THR Idul Adha 1447H',
    content: 'Kepada Yth. Seluruh Karyawan PT Cakrawala Gemilang,\n\nKami dengan bangga mengumumkan bahwa pembayaran Tunjangan Hari Raya (THR) Idul Adha 1447H akan dilaksanakan pada:\n\n📅 Tanggal Pembayaran: 3 Juni 2026\n💳 Metode: Transfer langsung ke rekening masing-masing karyawan\n\nBesaran THR:\n• Karyawan dengan masa kerja ≥ 12 bulan: 1 bulan gaji pokok\n• Karyawan dengan masa kerja < 12 bulan: proporsional sesuai masa kerja\n• Karyawan magang: sesuai perjanjian kerja\n\nSlip THR dapat diakses melalui menu Penggajian pada sistem HRIS mulai tanggal 4 Juni 2026.\n\nSalam,\nDepartemen Keuangan & Akuntansi',
    category: 'Keuangan', audience: 'Semua', postedBy: 'EMP003',
    publishDate: '2026-05-18', status: 'Publish', isPinned: true, views: 189,
  },
  {
    id: 'ANN003', title: 'Employee of The Month — April 2026: Nisrina Aulia',
    content: 'Dengan bangga dan penuh kebahagiaan, kami mengumumkan Employee of the Month untuk bulan April 2026:\n\n🏆 Nisrina Aulia — Marketing Manager\n\nNisrina berhasil melampaui seluruh target marketing Q1 2026 secara gemilang:\n• Pencapaian target campaign: 115% (target 100%)\n• Pertumbuhan followers: +18% (target 10%)\n• Engagement rate: 4.2% (target 3%)\n• Kehadiran: 97%\n\nBerkat kepemimpinan dan kreativitas Nisrina, brand awareness PT Cakrawala Gemilang meningkat signifikan di semua platform digital. Strategi konten yang inovatif dan eksekusi kampanye yang terukur menjadi kunci keberhasilan ini.\n\nSelamat kepada Nisrina! Penghargaan berupa sertifikat, voucher, dan feature di newsletter perusahaan akan diserahkan pada acara Town Hall tanggal 28 Mei 2026.\n\nManajemen PT Cakrawala Gemilang',
    category: 'Informasi', audience: 'Semua', postedBy: 'EMP001',
    publishDate: '2026-05-15', status: 'Publish', isPinned: false, views: 214,
  },
  {
    id: 'ANN004', title: 'Pelatihan K3 Wajib — 26-27 Mei 2026',
    content: 'Kepada Yth. Seluruh Karyawan,\n\nDalam rangka memenuhi kewajiban regulasi dan meningkatkan budaya keselamatan kerja, perusahaan menyelenggarakan:\n\n📌 PELATIHAN K3 (Kesehatan & Keselamatan Kerja)\nKehadiran bersifat WAJIB untuk seluruh karyawan.\n\n📅 Tanggal: 26-27 Mei 2026\n⏰ Waktu: 08.00 – 17.00 WIB\n📍 Tempat: Aula Gedung Utama Lt. 2\n👨‍🏫 Fasilitator: Ir. Sugianto Prawirodihardjo, MM (Lembaga K3 Nasional)\n\nMateri yang akan dibahas:\n• Identifikasi dan pengendalian risiko kerja\n• Prosedur keadaan darurat dan evakuasi\n• Pertolongan Pertama pada Kecelakaan (P3K)\n• Penggunaan Alat Pelindung Diri (APD) dan APAR\n\nKaryawan yang berhalangan hadir WAJIB melapor ke departemen SDM paling lambat H-2.\n\nDepartemen SDM',
    category: 'SDM', audience: 'Semua', postedBy: 'EMP002',
    publishDate: '2026-05-12', status: 'Publish', isPinned: false, views: 156,
  },
  {
    id: 'ANN005', title: 'Peluncuran Sistem HRIS Baru — Fitur & Panduan',
    content: 'Kepada Seluruh Karyawan,\n\nKami dengan bangga mengumumkan peluncuran Sistem HRIS PT Cakrawala Gemilang versi terbaru dengan berbagai peningkatan fitur:\n\n✅ Modul Rekrutmen terintegrasi dengan pipeline kandidat\n✅ Dashboard analitik SDM yang lebih komprehensif\n✅ Modul Manajemen Kinerja dengan penilaian KPI\n✅ Slip gaji digital dengan tampilan yang lebih informatif\n✅ Sistem pengumuman dan notifikasi real-time\n✅ Tampilan yang lebih modern dan responsif\n\nCara Mengakses:\nSistem dapat diakses di portal HRIS yang sama. Login menggunakan email dan password yang sudah ada.\n\nPanduan penggunaan fitur baru tersedia di folder IT Department pada drive perusahaan.\n\nUntuk bantuan teknis, hubungi Daffa Ardiansyah (IT Support) di ext. 105 atau daffa.ardiansyah@cakrawalagemilang.co.id\n\nDepartemen Teknologi Informasi',
    category: 'Informasi', audience: 'Semua', postedBy: 'EMP001',
    publishDate: '2026-05-05', status: 'Publish', isPinned: false, views: 97,
  },
  {
    id: 'ANN006', title: 'Rencana Renovasi Area Kerja Lantai 8 (DRAFT)',
    content: 'Pengumuman ini masih dalam tahap penyusunan dan belum siap dipublikasikan.',
    category: 'Informasi', audience: 'Semua', postedBy: 'EMP002',
    publishDate: '2026-06-01', status: 'Draft', isPinned: false, views: 0,
  },
];

const INITIAL_SETTINGS = {
  name: 'PT Cakrawala Gemilang', shortName: 'CG',
  address: 'Jl. H.R. Rasuna Said Kav. 10, Kuningan, Jakarta Selatan 12950',
  phone: '(021) 5550-1234', fax: '(021) 5550-1235',
  email: 'hrd@cakrawalagemilang.co.id', website: 'www.cakrawalagemilang.co.id',
  npwp: '01.234.567.8-012.000', industry: 'Jasa Teknologi Informasi',
  foundedYear: 2012,
  workDays: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'],
  workHourStart: '08:00', workHourEnd: '17:00', lateToleranceMinutes: 15,
  bpjsKesehatan: { employee: 0.01, employer: 0.04 },
  bpjsJHT: { employee: 0.02, employer: 0.037 },
  bpjsJP: { employee: 0.01, employer: 0.02 },
  bpjsJKK: { employer: 0.0024 }, bpjsJKM: { employer: 0.003 },
};

// ============================================================
// GENERATORS
// ============================================================

function pseudoRand(seed) {
  let s = (seed * 1664525 + 1013904223) & 0x7fffffff;
  return s / 0x7fffffff;
}

function generateAttendance() {
  const records = [];
  const months = [
    { year: 2026, month: 4, days: [1,2,3,6,7,8,9,10,13,22,23,24,27,28,29,30] },
    { year: 2026, month: 5, days: [4,5,6,7,8,11,12,13,14,15,18,19,20,21,22,25,26] },
  ];

  INITIAL_EMPLOYEES.forEach((emp, empIdx) => {
    months.forEach(({ year, month, days }) => {
      days.forEach((day, dayIdx) => {
        const seed = empIdx * 10000 + month * 100 + day;
        const r = pseudoRand(seed);

        let status, checkIn, checkOut, note = '';
        const hIn = pseudoRand(seed + 1);
        const mIn = Math.floor(pseudoRand(seed + 2) * 59);
        const mOut = Math.floor(pseudoRand(seed + 3) * 59);
        const hOut = 17 + Math.floor(pseudoRand(seed + 4) * 2);

        if (r < 0.62) {
          status = 'Hadir';
          const h = 7 + Math.floor(hIn * 1);
          checkIn = `${String(h).padStart(2,'0')}:${String(mIn).padStart(2,'0')}`;
          checkOut = `${String(hOut).padStart(2,'0')}:${String(mOut).padStart(2,'0')}`;
        } else if (r < 0.78) {
          status = 'Telat';
          const h = 8 + Math.floor(hIn * 2);
          const m = 5 + Math.floor(pseudoRand(seed + 5) * 54);
          checkIn = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
          checkOut = `${String(hOut).padStart(2,'0')}:${String(mOut).padStart(2,'0')}`;
          note = 'Terlambat masuk';
        } else if (r < 0.84) {
          status = 'Cuti'; checkIn = '-'; checkOut = '-'; note = 'Cuti';
        } else if (r < 0.90) {
          status = 'Sakit'; checkIn = '-'; checkOut = '-'; note = 'Izin sakit';
        } else if (r < 0.96) {
          status = 'WFH';
          const h = 8; const m = Math.floor(pseudoRand(seed + 6) * 20);
          checkIn = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
          checkOut = `${String(hOut).padStart(2,'0')}:${String(mOut).padStart(2,'0')}`;
          note = 'Work From Home';
        } else {
          status = 'Alpha'; checkIn = '-'; checkOut = '-'; note = 'Tanpa keterangan';
        }

        records.push({
          id: `ATT_${emp.id}_${year}${String(month).padStart(2,'0')}${String(day).padStart(2,'0')}`,
          employeeId: emp.id, date: `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`,
          checkIn, checkOut, status, note, month, year,
        });
      });
    });
  });
  return records;
}

function calcPPh21(grossMonthly, maritalStatus) {
  const gross12 = grossMonthly * 12;
  const ptkpMap = {
    'TK/0': 54000000, 'TK/1': 58500000, 'TK/2': 63000000, 'TK/3': 67500000,
    'K/0': 58500000, 'K/1': 63000000, 'K/2': 67500000, 'K/3': 72000000,
  };
  const ptkp = ptkpMap[maritalStatus] || 54000000;
  const pkp = Math.max(0, gross12 - ptkp);
  let tax = 0;
  if (pkp <= 60000000) { tax = pkp * 0.05; }
  else if (pkp <= 250000000) { tax = 3000000 + (pkp - 60000000) * 0.15; }
  else if (pkp <= 500000000) { tax = 3000000 + 28500000 + (pkp - 250000000) * 0.25; }
  else { tax = 3000000 + 28500000 + 62500000 + (pkp - 500000000) * 0.30; }
  return Math.round(tax / 12);
}

function generatePayrolls() {
  const payrolls = [];
  [{ month: 4, year: 2026, status: 'Dibayar', paidDate: '2026-04-25' },
   { month: 5, year: 2026, status: 'Proses', paidDate: null }].forEach(period => {
    INITIAL_EMPLOYEES.forEach(emp => {
      const gross = emp.salary + Object.values(emp.allowances).reduce((a, b) => a + b, 0);
      const bpjsKes = Math.round(emp.salary * 0.01);
      const bpjsJHT = Math.round(emp.salary * 0.02);
      const bpjsJP = Math.round(emp.salary * 0.01);
      const pph21 = calcPPh21(gross, emp.maritalStatus);
      const totalDed = bpjsKes + bpjsJHT + bpjsJP + pph21;
      payrolls.push({
        id: `PAY_${emp.id}_${period.year}${String(period.month).padStart(2,'0')}`,
        employeeId: emp.id, month: period.month, year: period.year,
        basicSalary: emp.salary, allowances: { ...emp.allowances },
        grossSalary: gross,
        deductions: { bpjsKesehatan: bpjsKes, bpjsJHT, bpjsJP, pph21, lainnya: 0 },
        totalDeductions: totalDed, netSalary: gross - totalDed,
        overtimeHours: 0, overtimePay: 0,
        status: period.status, paidDate: period.paidDate,
      });
    });
  });
  return payrolls;
}

// ============================================================
// DATABASE API
// ============================================================

const DB = {
  get(key) {
    try { return JSON.parse(localStorage.getItem(STORAGE_PREFIX + key)); } catch { return null; }
  },
  set(key, data) {
    try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data)); } catch(e) { console.error('Storage error', e); }
  },
  init() {
    if (this.get('seeded')) return;
    this.set('departments', INITIAL_DEPARTMENTS);
    this.set('positions', INITIAL_POSITIONS);
    this.set('employees', INITIAL_EMPLOYEES);
    this.set('leaveBalances', INITIAL_LEAVE_BALANCES);
    this.set('leaveRequests', INITIAL_LEAVE_REQUESTS);
    this.set('attendance', generateAttendance());
    this.set('payrolls', generatePayrolls());
    this.set('recruitments', INITIAL_RECRUITMENTS);
    this.set('performances', INITIAL_PERFORMANCES);
    this.set('trainings', INITIAL_TRAININGS);
    this.set('announcements', INITIAL_ANNOUNCEMENTS);
    this.set('settings', INITIAL_SETTINGS);
    this.set('seeded', true);
  },
  reset() {
    Object.keys(localStorage).filter(k => k.startsWith(STORAGE_PREFIX)).forEach(k => localStorage.removeItem(k));
    this.init();
  },

  // ---- Employees ----
  employees: {
    getAll() { return DB.get('employees') || []; },
    getActive() { return (DB.get('employees') || []).filter(e => e.status === 'Aktif'); },
    getById(id) { return (DB.get('employees') || []).find(e => e.id === id); },
    getByDept(deptId) { return (DB.get('employees') || []).filter(e => e.department === deptId); },
    create(data) { const list = DB.get('employees') || []; list.push(data); DB.set('employees', list); return data; },
    update(id, data) {
      const list = DB.get('employees') || [];
      const idx = list.findIndex(e => e.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('employees', list); return list[idx]; }
      return null;
    },
    delete(id) { DB.set('employees', (DB.get('employees') || []).filter(e => e.id !== id)); },
    nextId() {
      const list = DB.get('employees') || [];
      const nums = list.map(e => parseInt(e.id.replace('EMP',''))).filter(n => !isNaN(n));
      return 'EMP' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
    },
  },

  // ---- Departments ----
  departments: {
    getAll() { return DB.get('departments') || []; },
    getById(id) { return (DB.get('departments') || []).find(d => d.id === id); },
    create(data) { const list = DB.get('departments') || []; list.push(data); DB.set('departments', list); return data; },
    update(id, data) {
      const list = DB.get('departments') || [];
      const idx = list.findIndex(d => d.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('departments', list); return list[idx]; }
    },
    delete(id) { DB.set('departments', (DB.get('departments') || []).filter(d => d.id !== id)); },
    nextId() {
      const list = DB.get('departments') || [];
      const nums = list.map(d => parseInt(d.id.replace('DEP',''))).filter(n => !isNaN(n));
      return 'DEP' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
    },
  },

  // ---- Positions ----
  positions: {
    getAll() { return DB.get('positions') || []; },
    getById(id) { return (DB.get('positions') || []).find(p => p.id === id); },
    getByDept(deptId) { return (DB.get('positions') || []).filter(p => p.departmentId === deptId); },
    create(data) { const list = DB.get('positions') || []; list.push(data); DB.set('positions', list); return data; },
    update(id, data) {
      const list = DB.get('positions') || [];
      const idx = list.findIndex(p => p.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('positions', list); return list[idx]; }
    },
    delete(id) { DB.set('positions', (DB.get('positions') || []).filter(p => p.id !== id)); },
    nextId() {
      const list = DB.get('positions') || [];
      const nums = list.map(p => parseInt(p.id.replace('POS',''))).filter(n => !isNaN(n));
      return 'POS' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
    },
  },

  // ---- Attendance ----
  attendance: {
    getAll() { return DB.get('attendance') || []; },
    getByEmployee(empId) { return (DB.get('attendance') || []).filter(a => a.employeeId === empId); },
    getByMonth(month, year) { return (DB.get('attendance') || []).filter(a => a.month === month && a.year === year); },
    getByEmployeeMonth(empId, month, year) { return (DB.get('attendance') || []).filter(a => a.employeeId === empId && a.month === month && a.year === year); },
    getTodayByEmployee(empId) {
      const today = new Date(); const d = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      return (DB.get('attendance') || []).find(a => a.employeeId === empId && a.date === d);
    },
    upsert(record) {
      const list = DB.get('attendance') || [];
      const idx = list.findIndex(a => a.id === record.id);
      if (idx > -1) list[idx] = record; else list.push(record);
      DB.set('attendance', list);
    },
    delete(id) { DB.set('attendance', (DB.get('attendance') || []).filter(a => a.id !== id)); },
  },

  // ---- Leave ----
  leave: {
    getAll() { return DB.get('leaveRequests') || []; },
    getById(id) { return (DB.get('leaveRequests') || []).find(l => l.id === id); },
    getByEmployee(empId) { return (DB.get('leaveRequests') || []).filter(l => l.employeeId === empId); },
    getPending() { return (DB.get('leaveRequests') || []).filter(l => l.status === 'Menunggu'); },
    create(data) { const list = DB.get('leaveRequests') || []; list.push(data); DB.set('leaveRequests', list); return data; },
    update(id, data) {
      const list = DB.get('leaveRequests') || [];
      const idx = list.findIndex(l => l.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('leaveRequests', list); return list[idx]; }
    },
    delete(id) { DB.set('leaveRequests', (DB.get('leaveRequests') || []).filter(l => l.id !== id)); },
    nextId() {
      const list = DB.get('leaveRequests') || [];
      const nums = list.map(l => parseInt(l.id.replace('LVR',''))).filter(n => !isNaN(n));
      return 'LVR' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
    },
    // Leave balances
    getBalance(empId, year) { return (DB.get('leaveBalances') || []).find(b => b.employeeId === empId && b.year === year); },
    updateBalance(empId, year, data) {
      const list = DB.get('leaveBalances') || [];
      const idx = list.findIndex(b => b.employeeId === empId && b.year === year);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('leaveBalances', list); }
    },
  },

  // ---- Payroll ----
  payroll: {
    getAll() { return DB.get('payrolls') || []; },
    getByMonth(month, year) { return (DB.get('payrolls') || []).filter(p => p.month === month && p.year === year); },
    getByEmployee(empId) { return (DB.get('payrolls') || []).filter(p => p.employeeId === empId); },
    getByEmployeeMonth(empId, month, year) { return (DB.get('payrolls') || []).find(p => p.employeeId === empId && p.month === month && p.year === year); },
    update(id, data) {
      const list = DB.get('payrolls') || [];
      const idx = list.findIndex(p => p.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('payrolls', list); return list[idx]; }
    },
    markPaid(month, year, paidDate) {
      const list = DB.get('payrolls') || [];
      list.forEach(p => { if (p.month === month && p.year === year) { p.status = 'Dibayar'; p.paidDate = paidDate; } });
      DB.set('payrolls', list);
    },
  },

  // ---- Recruitment ----
  recruitment: {
    getAll() { return DB.get('recruitments') || []; },
    getById(id) { return (DB.get('recruitments') || []).find(r => r.id === id); },
    getOpen() { return (DB.get('recruitments') || []).filter(r => r.status === 'Buka'); },
    create(data) { const list = DB.get('recruitments') || []; list.push(data); DB.set('recruitments', list); return data; },
    update(id, data) {
      const list = DB.get('recruitments') || [];
      const idx = list.findIndex(r => r.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('recruitments', list); return list[idx]; }
    },
    delete(id) { DB.set('recruitments', (DB.get('recruitments') || []).filter(r => r.id !== id)); },
    nextId() {
      const list = DB.get('recruitments') || [];
      const nums = list.map(r => parseInt(r.id.replace('REC',''))).filter(n => !isNaN(n));
      return 'REC' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
    },
  },

  // ---- Performance ----
  performance: {
    getAll() { return DB.get('performances') || []; },
    getById(id) { return (DB.get('performances') || []).find(p => p.id === id); },
    getByEmployee(empId) { return (DB.get('performances') || []).filter(p => p.employeeId === empId); },
    create(data) { const list = DB.get('performances') || []; list.push(data); DB.set('performances', list); return data; },
    update(id, data) {
      const list = DB.get('performances') || [];
      const idx = list.findIndex(p => p.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('performances', list); return list[idx]; }
    },
    delete(id) { DB.set('performances', (DB.get('performances') || []).filter(p => p.id !== id)); },
    nextId() {
      const list = DB.get('performances') || [];
      const nums = list.map(p => parseInt(p.id.replace('PRF',''))).filter(n => !isNaN(n));
      return 'PRF' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
    },
  },

  // ---- Training ----
  training: {
    getAll() { return DB.get('trainings') || []; },
    getById(id) { return (DB.get('trainings') || []).find(t => t.id === id); },
    create(data) { const list = DB.get('trainings') || []; list.push(data); DB.set('trainings', list); return data; },
    update(id, data) {
      const list = DB.get('trainings') || [];
      const idx = list.findIndex(t => t.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('trainings', list); return list[idx]; }
    },
    delete(id) { DB.set('trainings', (DB.get('trainings') || []).filter(t => t.id !== id)); },
    nextId() {
      const list = DB.get('trainings') || [];
      const nums = list.map(t => parseInt(t.id.replace('TRN',''))).filter(n => !isNaN(n));
      return 'TRN' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
    },
  },

  // ---- Announcements ----
  announcements: {
    getAll() { return DB.get('announcements') || []; },
    getPublished() { return (DB.get('announcements') || []).filter(a => a.status === 'Publish'); },
    getById(id) { return (DB.get('announcements') || []).find(a => a.id === id); },
    create(data) { const list = DB.get('announcements') || []; list.push(data); DB.set('announcements', list); return data; },
    update(id, data) {
      const list = DB.get('announcements') || [];
      const idx = list.findIndex(a => a.id === id);
      if (idx > -1) { list[idx] = { ...list[idx], ...data }; DB.set('announcements', list); return list[idx]; }
    },
    delete(id) { DB.set('announcements', (DB.get('announcements') || []).filter(a => a.id !== id)); },
    nextId() {
      const list = DB.get('announcements') || [];
      const nums = list.map(a => parseInt(a.id.replace('ANN',''))).filter(n => !isNaN(n));
      return 'ANN' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(3, '0');
    },
  },

  // ---- Settings ----
  settings: {
    get() { return DB.get('settings') || INITIAL_SETTINGS; },
    update(data) { DB.set('settings', { ...(DB.get('settings') || INITIAL_SETTINGS), ...data }); },
  },
};
