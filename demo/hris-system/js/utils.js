'use strict';

// ============================================================
// DATE & FORMAT HELPERS
// ============================================================

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const BULAN_SHORT = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
const HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

function formatDate(dateStr, format = 'long') {
  if (!dateStr || dateStr === '-') return '-';
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d)) return dateStr;
  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  const dayName = HARI[d.getDay()];
  if (format === 'long') return `${day} ${BULAN[month]} ${year}`;
  if (format === 'full') return `${dayName}, ${day} ${BULAN[month]} ${year}`;
  if (format === 'short') return `${String(day).padStart(2,'0')} ${BULAN_SHORT[month]} ${year}`;
  if (format === 'numeric') return `${String(day).padStart(2,'0')}/${String(month+1).padStart(2,'0')}/${year}`;
  if (format === 'monthYear') return `${BULAN[month]} ${year}`;
  if (format === 'monthShort') return `${BULAN_SHORT[month]} ${year}`;
  return `${day} ${BULAN[month]} ${year}`;
}

function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
  return 'Rp ' + Number(amount).toLocaleString('id-ID');
}

function formatNumber(n) {
  return Number(n).toLocaleString('id-ID');
}

function formatPhone(phone) {
  if (!phone) return '-';
  const p = phone.replace(/\D/g, '');
  if (p.startsWith('62')) return '+62 ' + p.slice(2).replace(/(\d{3})(\d{4})(\d+)/, '$1-$2-$3');
  if (p.startsWith('0')) return p.replace(/^0(\d{3})(\d{4})(\d+)/, '0$1-$2-$3');
  return phone;
}

function formatNIK(nik) {
  if (!nik) return '-';
  return nik.replace(/(\d{6})(\d{6})(\d{4})/, '$1-$2-$3');
}

function getAge(birthDate) {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

function getWorkYears(joinDate) {
  if (!joinDate) return 0;
  const today = new Date();
  const join = new Date(joinDate);
  let years = today.getFullYear() - join.getFullYear();
  const m = today.getMonth() - join.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < join.getDate())) years--;
  return Math.max(0, years);
}

function getWorkDuration(joinDate) {
  if (!joinDate) return '-';
  const today = new Date();
  const join = new Date(joinDate);
  let years = today.getFullYear() - join.getFullYear();
  let months = today.getMonth() - join.getMonth();
  if (months < 0) { years--; months += 12; }
  if (years > 0 && months > 0) return `${years} tahun ${months} bulan`;
  if (years > 0) return `${years} tahun`;
  if (months > 0) return `${months} bulan`;
  return 'Kurang dari 1 bulan';
}

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

function monthName(month) { return BULAN[month - 1] || ''; }
function monthShort(month) { return BULAN_SHORT[month - 1] || ''; }

function getWorkingDays(year, month) {
  const days = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const day = new Date(year, month - 1, d).getDay();
    if (day !== 0 && day !== 6) days.push(d);
  }
  return days;
}

// ============================================================
// ID GENERATOR
// ============================================================

function generateId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ============================================================
// STRING HELPERS
// ============================================================

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

function avatarBg(name) {
  const colors = ['#0D9488','#7C3AED','#DC2626','#D97706','#2563EB','#059669','#DB2777','#9333EA'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function avatarHtml(name, size = 36, extraClass = '') {
  const bg = avatarBg(name);
  const initials = getInitials(name);
  const fontSize = Math.floor(size * 0.38);
  return `<div class="avatar-circle ${extraClass}" style="width:${size}px;height:${size}px;background:${bg};font-size:${fontSize}px">${initials}</div>`;
}

function truncate(str, max = 60) {
  if (!str) return '';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

function nl2br(str) {
  if (!str) return '';
  return escapeHtml(str).replace(/\n/g, '<br>');
}

// ============================================================
// STATUS BADGES
// ============================================================

const STATUS_BADGES = {
  // Employee status
  'Aktif':    'badge-success',
  'Resign':   'badge-danger',
  'Cuti Panjang': 'badge-warning',
  // Leave status
  'Disetujui': 'badge-success',
  'Menunggu':  'badge-warning',
  'Ditolak':   'badge-danger',
  // Payroll
  'Dibayar': 'badge-success',
  'Proses':  'badge-info',
  // Attendance
  'Hadir':  'badge-success',
  'Telat':  'badge-warning',
  'Alpha':  'badge-danger',
  'Sakit':  'badge-info',
  'WFH':    'badge-purple',
  'Cuti':   'badge-secondary',
  'Libur':  'badge-secondary',
  // Recruitment stage
  'Applied':   'badge-secondary',
  'Screening': 'badge-info',
  'Interview': 'badge-warning',
  'Offer':     'badge-purple',
  'Hired':     'badge-success',
  'Rejected':  'badge-danger',
  // Training
  'Selesai':       'badge-success',
  'Berlangsung':   'badge-warning',
  'Akan Datang':   'badge-info',
  // Performance
  'Final': 'badge-success',
  'Draft': 'badge-secondary',
  // Announcement
  'Publish': 'badge-success',
  // Recruitment job
  'Buka':  'badge-success',
  'Tutup': 'badge-secondary',
  // Employee type
  'Tetap':   'badge-success',
  'Kontrak': 'badge-warning',
  'Magang':  'badge-info',
};

function badge(text, customClass = '') {
  const cls = customClass || STATUS_BADGES[text] || 'badge-secondary';
  return `<span class="badge ${cls}">${escapeHtml(text)}</span>`;
}

function performanceRatingBadge(rating) {
  const map = { 'Istimewa': 'badge-purple', 'Sangat Baik': 'badge-success', 'Baik': 'badge-info', 'Cukup': 'badge-warning', 'Kurang': 'badge-danger', '-': 'badge-secondary' };
  return `<span class="badge ${map[rating] || 'badge-secondary'}">${escapeHtml(rating)}</span>`;
}

// ============================================================
// TOAST NOTIFICATIONS
// ============================================================

function showToast(message, type = 'success', duration = 3500) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: 'check-circle', error: 'x-circle', warning: 'alert-triangle', info: 'info' };
  const id = generateId('toast-');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.id = id;
  toast.innerHTML = `
    <i data-lucide="${icons[type] || 'info'}" class="toast-icon"></i>
    <span class="toast-msg">${escapeHtml(message)}</span>
    <button class="toast-close" onclick="document.getElementById('${id}').remove()">
      <i data-lucide="x"></i>
    </button>`;
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons({ nodes: [toast] });

  requestAnimationFrame(() => toast.classList.add('toast-show'));
  setTimeout(() => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ============================================================
// MODAL SYSTEM
// ============================================================

function openModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.add('modal-open'); document.body.style.overflow = 'hidden'; }
}

function closeModal(id) {
  const m = document.getElementById(id);
  if (m) { m.classList.remove('modal-open'); document.body.style.overflow = ''; }
}

function closeAllModals() {
  document.querySelectorAll('.modal-open').forEach(m => m.classList.remove('modal-open'));
  document.body.style.overflow = '';
}

function confirmDialog(message, onConfirm, onCancel) {
  let overlay = document.getElementById('confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'confirm-overlay';
    overlay.className = 'confirm-overlay';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div class="confirm-box">
      <div class="confirm-icon"><i data-lucide="alert-triangle"></i></div>
      <p class="confirm-msg">${escapeHtml(message)}</p>
      <div class="confirm-actions">
        <button class="btn btn-outline" id="confirm-cancel">Batal</button>
        <button class="btn btn-danger" id="confirm-ok">Ya, Lanjutkan</button>
      </div>
    </div>`;
  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  if (window.lucide) lucide.createIcons({ nodes: [overlay] });

  document.getElementById('confirm-ok').onclick = () => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    if (onConfirm) onConfirm();
  };
  document.getElementById('confirm-cancel').onclick = () => {
    overlay.style.display = 'none';
    document.body.style.overflow = '';
    if (onCancel) onCancel();
  };
}

// ============================================================
// PAGINATION HELPER
// ============================================================

function paginate(items, page, perPage = 10) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * perPage;
  return {
    items: items.slice(start, start + perPage),
    page: safePage, totalPages, total, perPage,
    start: start + 1, end: Math.min(start + perPage, total),
  };
}

function paginationHtml(pag, onPageChange) {
  if (pag.totalPages <= 1) return '';
  const { page, totalPages, total, start, end } = pag;
  let pages = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(totalPages, page + 2); i++) pages.push(i);

  return `
    <div class="pagination-bar">
      <span class="pagination-info">Menampilkan ${start}–${end} dari ${formatNumber(total)} data</span>
      <div class="pagination-controls">
        <button class="page-btn" ${page <= 1 ? 'disabled' : ''} onclick="(${onPageChange})(${page - 1})">
          <i data-lucide="chevron-left"></i>
        </button>
        ${pages.map(p => `<button class="page-btn ${p === page ? 'active' : ''}" onclick="(${onPageChange})(${p})">${p}</button>`).join('')}
        <button class="page-btn" ${page >= totalPages ? 'disabled' : ''} onclick="(${onPageChange})(${page + 1})">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>
    </div>`;
}

// ============================================================
// FORM HELPERS
// ============================================================

function getFormData(formId) {
  const form = document.getElementById(formId);
  if (!form) return {};
  const data = {};
  new FormData(form).forEach((val, key) => { data[key] = val; });
  return data;
}

function setFormData(formId, data) {
  const form = document.getElementById(formId);
  if (!form) return;
  Object.entries(data).forEach(([key, val]) => {
    const el = form.elements[key];
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!val;
    else el.value = val !== null && val !== undefined ? val : '';
  });
}

function validateRequired(formId, fields) {
  let valid = true;
  fields.forEach(f => {
    const fieldName = typeof f === 'string' ? f : f.name;
    const fieldMsg  = typeof f === 'string' ? 'Field ini wajib diisi' : (f.msg || 'Field ini wajib diisi');
    const el = document.querySelector(`#${formId} [name="${fieldName}"]`);
    if (!el) return;
    const val = el.value.trim();
    const errEl = document.getElementById(`err-${fieldName}`);
    if (!val) {
      valid = false;
      if (errEl) { errEl.textContent = fieldMsg; errEl.style.display = 'block'; }
      el.classList.add('input-error');
    } else {
      if (errEl) { errEl.style.display = 'none'; }
      el.classList.remove('input-error');
    }
  });
  return valid;
}

function clearFormErrors(formId) {
  document.querySelectorAll(`#${formId} .field-error`).forEach(el => { el.textContent = ''; el.style.display = 'none'; });
  document.querySelectorAll(`#${formId} .input-error`).forEach(el => el.classList.remove('input-error'));
}

// ============================================================
// CHART MANAGEMENT
// ============================================================

const ChartRegistry = {};

function destroyChart(key) {
  if (ChartRegistry[key]) {
    ChartRegistry[key].destroy();
    delete ChartRegistry[key];
  }
}

function destroyAllCharts() {
  Object.keys(ChartRegistry).forEach(destroyChart);
}

// ============================================================
// MISC
// ============================================================

function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}

function calcPPh21Public(grossMonthly, maritalStatus) {
  const gross12 = grossMonthly * 12;
  const ptkpMap = {
    'TK/0': 54000000, 'TK/1': 58500000, 'TK/2': 63000000, 'TK/3': 67500000,
    'K/0': 58500000, 'K/1': 63000000, 'K/2': 67500000, 'K/3': 72000000,
  };
  const ptkp = ptkpMap[maritalStatus] || 54000000;
  const pkp = Math.max(0, gross12 - ptkp);
  let tax = 0;
  if (pkp <= 60000000) tax = pkp * 0.05;
  else if (pkp <= 250000000) tax = 3000000 + (pkp - 60000000) * 0.15;
  else if (pkp <= 500000000) tax = 3000000 + 28500000 + (pkp - 250000000) * 0.25;
  else tax = 3000000 + 28500000 + 62500000 + (pkp - 500000000) * 0.30;
  return Math.round(tax / 12);
}

function getDeptName(deptId) {
  const dept = DB.departments.getById(deptId);
  return dept ? dept.name : '-';
}

function getPosName(posId) {
  const pos = DB.positions.getById(posId);
  return pos ? pos.name : '-';
}

function getEmpName(empId) {
  const emp = DB.employees.getById(empId);
  return emp ? emp.name : '-';
}

function deptOptions(selectedId = '') {
  return DB.departments.getAll().map(d =>
    `<option value="${d.id}" ${d.id === selectedId ? 'selected' : ''}>${escapeHtml(d.name)}</option>`
  ).join('');
}

function posOptions(deptId = '', selectedId = '') {
  const positions = deptId ? DB.positions.getByDept(deptId) : DB.positions.getAll();
  return positions.map(p =>
    `<option value="${p.id}" ${p.id === selectedId ? 'selected' : ''}>${escapeHtml(p.name)}</option>`
  ).join('');
}

function empOptions(selectedId = '') {
  return DB.employees.getAll().map(e =>
    `<option value="${e.id}" ${e.id === selectedId ? 'selected' : ''}>${escapeHtml(e.name)}</option>`
  ).join('');
}

function printSection(html, title = '') {
  const w = window.open('', '_blank');
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12px; color: #333; }
      table { width: 100%; border-collapse: collapse; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
      th { background: #f5f5f5; font-weight: 600; }
      h1 { font-size: 16px; margin-bottom: 4px; }
      h2 { font-size: 14px; margin-bottom: 4px; }
      @media print { body { margin: 0; } }
    </style></head><body>${html}</body></html>`);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 500);
}
