'use strict';

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

const BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const HARI  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

function escapeHtml(str) {
  if (str == null) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatDate(dateStr, mode = 'short') {
  if (!dateStr) return '-';
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d)) return dateStr;
  if (mode === 'full') return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

function todayStr() {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`;
}

function isOverdue(deadlineStr) {
  return new Date(deadlineStr + 'T23:59:59') < new Date();
}

function avatarHtml(name, size = 32, extraClass = '') {
  const colors = ['#4F46E5','#7C3AED','#2563EB','#0891B2','#059669','#D97706','#DC2626','#9333EA'];
  const idx = (name || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colors.length;
  const initials = (name || '?').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
  return `<div class="avatar-circle ${extraClass}" style="width:${size}px;height:${size}px;background:${colors[idx]};font-size:${Math.round(size*0.38)}px;">${initials}</div>`;
}

function nilaiToGrade(nilai) {
  if (nilai == null) return '-';
  if (nilai >= 80) return 'A';
  if (nilai >= 70) return 'B';
  if (nilai >= 60) return 'C';
  if (nilai >= 50) return 'D';
  return 'E';
}

function gradeBadge(nilai) {
  if (nilai == null) return `<span class="badge badge-secondary">Belum dinilai</span>`;
  const g = nilaiToGrade(nilai);
  const cls = { A:'grade-A', B:'grade-B', C:'grade-C', D:'grade-D', E:'grade-E' }[g];
  return `<span class="grade-pill ${cls}">${g}</span>`;
}

function nilaiColor(nilai) {
  if (nilai >= 80) return 'success';
  if (nilai >= 70) return 'info';
  if (nilai >= 60) return 'warning';
  return 'danger';
}

function generateId(prefix, existing) {
  const nums = existing.map(id => parseInt(id.replace(prefix,''))).filter(n => !isNaN(n));
  return prefix + String(Math.max(0, ...nums) + 1).padStart(3, '0');
}

// ============================================================
// TOAST
// ============================================================
function showToast(msg, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success:'check-circle', error:'x-circle', warning:'alert-triangle', info:'info' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon"><i data-lucide="${icons[type] || 'info'}"></i></span>
    <span class="toast-msg">${escapeHtml(msg)}</span>
    <button class="toast-close"><i data-lucide="x"></i></button>`;
  container.appendChild(toast);
  if (window.lucide) lucide.createIcons({ nodes: [toast] });
  requestAnimationFrame(() => toast.classList.add('toast-show'));
  const remove = () => {
    toast.classList.remove('toast-show');
    setTimeout(() => toast.remove(), 400);
  };
  toast.querySelector('.toast-close').addEventListener('click', remove);
  setTimeout(remove, 3500);
}

// ============================================================
// CONFIRM DIALOG
// ============================================================
function confirmDialog(msg, onConfirm, confirmLabel = 'Ya, Lanjutkan', danger = true) {
  let overlay = document.getElementById('confirm-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.id = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-box">
        <div class="confirm-icon"><i data-lucide="alert-triangle"></i></div>
        <div class="confirm-msg" id="confirm-msg"></div>
        <div class="confirm-actions">
          <button class="btn btn-secondary btn-cancel">Batal</button>
          <button class="btn btn-confirm">Konfirmasi</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    if (window.lucide) lucide.createIcons({ nodes: [overlay] });
    overlay.querySelector('.btn-cancel').addEventListener('click', () => { overlay.style.display = 'none'; });
  }
  overlay.querySelector('#confirm-msg').textContent = msg;
  const confirmBtn = overlay.querySelector('.btn-confirm');
  confirmBtn.textContent = confirmLabel;
  confirmBtn.className = `btn ${danger ? 'btn-danger' : 'btn-primary'}`;
  const newBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
  newBtn.addEventListener('click', () => { overlay.style.display = 'none'; onConfirm(); });
  overlay.style.display = 'flex';
}

// ============================================================
// MODALS
// ============================================================
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('modal-open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('modal-open');
}
function closeAllModals() {
  document.querySelectorAll('.modal.modal-open').forEach(m => m.classList.remove('modal-open'));
}

// ============================================================
// PAGINATION HELPER
// ============================================================
function renderPagination(containerId, total, page, perPage, onPage) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const totalPages = Math.ceil(total / perPage);
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to   = Math.min(page * perPage, total);

  let pages = '';
  for (let i = 1; i <= totalPages; i++) {
    if (totalPages > 7 && i > 2 && i < totalPages - 1 && Math.abs(i - page) > 1) {
      if (i === 3 || i === totalPages - 2) pages += `<span style="padding:0 4px;color:var(--text-muted);">...</span>`;
      continue;
    }
    pages += `<button class="page-btn ${i === page ? 'active' : ''}" data-p="${i}">${i}</button>`;
  }

  container.innerHTML = `
    <div class="pagination-bar">
      <span class="pagination-info">Menampilkan ${from}–${to} dari ${total} data</span>
      <div class="pagination-controls">
        <button class="page-btn" data-p="${page-1}" ${page<=1?'disabled':''}><i data-lucide="chevron-left"></i></button>
        ${pages}
        <button class="page-btn" data-p="${page+1}" ${page>=totalPages?'disabled':''}><i data-lucide="chevron-right"></i></button>
      </div>
    </div>`;
  if (window.lucide) lucide.createIcons({ nodes: [container] });
  container.querySelectorAll('.page-btn[data-p]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.p);
      if (!isNaN(p) && p >= 1 && p <= totalPages) onPage(p);
    });
  });
}

// ============================================================
// CHART REGISTRY (for cleanup)
// ============================================================
const _charts = {};
function registerChart(id, instance) { _charts[id] = instance; }
function destroyAllCharts() { Object.values(_charts).forEach(c => { try { c.destroy(); } catch {} }); Object.keys(_charts).forEach(k => delete _charts[k]); }
function makeChart(id, config) {
  if (_charts[id]) { try { _charts[id].destroy(); } catch {} }
  const ctx = document.getElementById(id);
  if (!ctx) return null;
  const instance = new Chart(ctx, config);
  registerChart(id, instance);
  return instance;
}
