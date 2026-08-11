'use strict';

window.LeaveModule = (function () {
  let currentPage = 1;
  let filterStatus = '';
  let filterType = '';
  let editingId = null;

  const LEAVE_TYPES = ['Cuti Tahunan','Cuti Sakit','Cuti Penting','Cuti Melahirkan','Cuti Ayah'];

  function render() {
    const session = Auth.getSession();
    const isHR = ['superadmin','hrmanager','hrstaff'].includes(session.role);
    return isHR ? renderHRView() : renderEmployeeView(session);
  }

  function renderHRView() {
    const pendingCount = DB.leave.getPending().length;
    return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Manajemen Cuti</h1>
        <p class="page-subtitle">${pendingCount > 0 ? `<span style="color:var(--warning);">${pendingCount} pengajuan menunggu approval</span>` : 'Semua pengajuan sudah diproses'}</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="padding-bottom:0;">
        <div class="filter-bar">
          <select class="filter-select" id="leave-status">
            <option value="">Semua Status</option>
            ${['Menunggu','Disetujui','Ditolak'].map(s=>`<option value="${s}" ${filterStatus===s?'selected':''}>${s}</option>`).join('')}
          </select>
          <select class="filter-select" id="leave-type">
            <option value="">Semua Jenis</option>
            ${LEAVE_TYPES.map(t=>`<option value="${t}" ${filterType===t?'selected':''}>${t}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="table-wrap" id="leave-table-wrap">${renderHRTable()}</div>
    </div>

    ${renderApprovalModal()}`;
  }

  function renderHRTable() {
    let data = DB.leave.getAll();
    if (filterStatus) data = data.filter(l => l.status === filterStatus);
    if (filterType) data = data.filter(l => l.type === filterType);
    data.sort((a, b) => {
      const order = { Menunggu: 0, Disetujui: 1, Ditolak: 2 };
      return (order[a.status] - order[b.status]) || new Date(b.createdAt) - new Date(a.createdAt);
    });

    const pag = paginate(data, currentPage, 10);
    return `
    <table class="data-table">
      <thead><tr>
        <th>Karyawan</th><th>Jenis Cuti</th><th>Mulai</th><th>Selesai</th><th>Hari</th><th>Alasan</th><th>Status</th><th>Aksi</th>
      </tr></thead>
      <tbody>
        ${pag.items.length ? pag.items.map(l => {
          const emp = DB.employees.getById(l.employeeId);
          return `<tr>
            <td><div class="table-name-cell">${avatarHtml(emp?emp.name:'?',28)}
              <div><div class="name">${escapeHtml(emp?emp.name:'?')}</div>
              <div class="sub">${escapeHtml(getDeptName(emp?emp.department:''))}</div></div>
            </div></td>
            <td><span style="font-size:12.5px;">${escapeHtml(l.type)}</span></td>
            <td>${formatDate(l.startDate,'short')}</td>
            <td>${formatDate(l.endDate,'short')}</td>
            <td style="text-align:center;font-weight:600;">${l.days}</td>
            <td style="max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;" title="${escapeHtml(l.reason)}">${escapeHtml(truncate(l.reason,50))}</td>
            <td>${badge(l.status)}</td>
            <td>
              <div style="display:flex;gap:4px;">
                <button class="btn btn-ghost btn-sm btn-icon" onclick="LeaveModule.viewDetail('${l.id}')" title="Detail">
                  <i data-lucide="eye"></i>
                </button>
                ${l.status === 'Menunggu' ? `
                <button class="btn btn-sm btn-success" onclick="LeaveModule.approve('${l.id}')">
                  <i data-lucide="check"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="LeaveModule.openReject('${l.id}')">
                  <i data-lucide="x"></i>
                </button>` : ''}
              </div>
            </td>
          </tr>`;
        }).join('') : `<tr><td colspan="8"><div class="empty-state" style="padding:32px;"><i data-lucide="calendar-off"></i><h3>Tidak ada data cuti</h3></div></td></tr>`}
      </tbody>
    </table>
    ${paginationHtml(pag, (p) => `LeaveModule.goPage(${p})`)}`;
  }

  function renderEmployeeView(session) {
    const myLeave = DB.leave.getByEmployee(session.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const balance = DB.leave.getBalance(session.id, 2026);

    return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Cuti Saya</h1>
        <p class="page-subtitle">Riwayat dan saldo cuti Anda</p>
      </div>
      <button class="btn btn-primary" onclick="LeaveModule.openApply()">
        <i data-lucide="plus"></i> Ajukan Cuti
      </button>
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:20px;">
      <div class="card" style="padding:20px;">
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">Cuti Tahunan</div>
        <div style="display:flex;align-items:baseline;gap:8px;">
          <span style="font-size:28px;font-weight:800;color:var(--primary);">${balance?balance.annual.remaining:12}</span>
          <span style="color:var(--text-muted);font-size:13px;">/ ${balance?balance.annual.total:12} hari tersisa</span>
        </div>
        <div style="margin-top:8px;height:6px;background:var(--body-bg);border-radius:3px;overflow:hidden;">
          <div style="height:100%;background:var(--primary);border-radius:3px;width:${balance?Math.round((balance.annual.remaining/balance.annual.total)*100):100}%;"></div>
        </div>
      </div>
      <div class="card" style="padding:20px;">
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">Cuti Sakit</div>
        <div style="display:flex;align-items:baseline;gap:8px;">
          <span style="font-size:28px;font-weight:800;color:var(--info);">${balance?balance.sick.remaining:14}</span>
          <span style="color:var(--text-muted);font-size:13px;">/ ${balance?balance.sick.total:14} hari tersisa</span>
        </div>
        <div style="margin-top:8px;height:6px;background:var(--body-bg);border-radius:3px;overflow:hidden;">
          <div style="height:100%;background:var(--info);border-radius:3px;width:${balance?Math.round((balance.sick.remaining/balance.sick.total)*100):100}%;"></div>
        </div>
      </div>
      <div class="card" style="padding:20px;">
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">Cuti Penting</div>
        <div style="display:flex;align-items:baseline;gap:8px;">
          <span style="font-size:28px;font-weight:800;color:var(--purple);">${balance?balance.important.remaining:3}</span>
          <span style="color:var(--text-muted);font-size:13px;">/ ${balance?balance.important.total:3} hari tersisa</span>
        </div>
        <div style="margin-top:8px;height:6px;background:var(--body-bg);border-radius:3px;overflow:hidden;">
          <div style="height:100%;background:var(--purple);border-radius:3px;width:${balance?Math.round((balance.important.remaining/balance.important.total)*100):100}%;"></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><div class="card-title">Riwayat Pengajuan Cuti</div></div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Jenis</th><th>Mulai</th><th>Selesai</th><th>Hari</th><th>Alasan</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            ${myLeave.length ? myLeave.map(l => `<tr>
              <td>${escapeHtml(l.type)}</td>
              <td>${formatDate(l.startDate,'short')}</td>
              <td>${formatDate(l.endDate,'short')}</td>
              <td style="text-align:center;font-weight:600;">${l.days}</td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12.5px;" title="${escapeHtml(l.reason)}">${escapeHtml(truncate(l.reason,50))}</td>
              <td>${badge(l.status)}</td>
              <td>
                <button class="btn btn-ghost btn-sm btn-icon" onclick="LeaveModule.viewDetail('${l.id}')" title="Detail">
                  <i data-lucide="eye"></i>
                </button>
                ${l.status === 'Menunggu' ? `<button class="btn btn-ghost btn-sm btn-icon" onclick="LeaveModule.cancelLeave('${l.id}')" title="Batalkan" style="color:var(--danger);">
                  <i data-lucide="trash-2"></i>
                </button>` : ''}
              </td>
            </tr>`).join('') : `<tr><td colspan="7"><div class="empty-state" style="padding:32px;"><i data-lucide="calendar-off"></i><h3>Belum ada pengajuan cuti</h3></div></td></tr>`}
          </tbody>
        </table>
      </div>
    </div>

    ${renderApplyModal()}
    ${renderDetailModal()}`;
  }

  function renderApplyModal() {
    return `
    <div class="modal" id="modal-leave-apply">
      <div class="modal-box modal-md">
        <div class="modal-header">
          <div class="modal-title">Ajukan Cuti</div>
          <button class="modal-close" onclick="closeModal('modal-leave-apply')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <form id="form-leave" novalidate>
            <div class="form-group">
              <label class="form-label required">Jenis Cuti</label>
              <select name="type" class="form-control" onchange="LeaveModule.checkBalance()">
                ${LEAVE_TYPES.map(t=>`<option>${t}</option>`).join('')}
              </select>
            </div>
            <div id="leave-balance-info" style="background:var(--primary-xlight);border-radius:var(--radius);padding:10px 14px;font-size:13px;margin-bottom:16px;"></div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Tanggal Mulai</label>
                <input type="date" name="startDate" class="form-control" onchange="LeaveModule.calcDays()">
                <div class="field-error" id="err-startDate"></div>
              </div>
              <div class="form-group">
                <label class="form-label required">Tanggal Selesai</label>
                <input type="date" name="endDate" class="form-control" onchange="LeaveModule.calcDays()">
                <div class="field-error" id="err-endDate"></div>
              </div>
            </div>
            <div style="background:var(--body-bg);border-radius:var(--radius);padding:10px 14px;font-size:13px;margin-bottom:16px;" id="leave-days-info">
              Pilih tanggal untuk menghitung jumlah hari
            </div>
            <div class="form-group">
              <label class="form-label required">Alasan Pengajuan</label>
              <textarea name="reason" class="form-control" rows="3" placeholder="Jelaskan keperluan cuti Anda..."></textarea>
              <div class="field-error" id="err-reason"></div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-leave-apply')">Batal</button>
          <button class="btn btn-primary" onclick="LeaveModule.submitLeave()">
            <i data-lucide="send"></i> Kirim Pengajuan
          </button>
        </div>
      </div>
    </div>`;
  }

  function renderApprovalModal() {
    return `
    <div class="modal" id="modal-leave-reject">
      <div class="modal-box modal-sm">
        <div class="modal-header">
          <div class="modal-title">Tolak Pengajuan Cuti</div>
          <button class="modal-close" onclick="closeModal('modal-leave-reject')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <p style="margin-bottom:16px;font-size:13.5px;color:var(--text-secondary);">Berikan alasan penolakan agar karyawan dapat memahami keputusan ini.</p>
          <div class="form-group">
            <label class="form-label required">Alasan Penolakan</label>
            <textarea id="reject-note" class="form-control" rows="3" placeholder="Tulis alasan penolakan..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-leave-reject')">Batal</button>
          <button class="btn btn-danger" onclick="LeaveModule.confirmReject()">
            <i data-lucide="x-circle"></i> Tolak Pengajuan
          </button>
        </div>
      </div>
    </div>
    ${renderDetailModal()}`;
  }

  function renderDetailModal() {
    return `
    <div class="modal" id="modal-leave-detail">
      <div class="modal-box modal-md">
        <div class="modal-header">
          <div class="modal-title">Detail Pengajuan Cuti</div>
          <button class="modal-close" onclick="closeModal('modal-leave-detail')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body" id="leave-detail-body"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-leave-detail')">Tutup</button>
        </div>
      </div>
    </div>`;
  }

  function init() {
    const session = Auth.getSession();
    const isHR = ['superadmin','hrmanager','hrstaff'].includes(session.role);
    if (isHR) {
      const statusEl = document.getElementById('leave-status');
      const typeEl   = document.getElementById('leave-type');
      if (statusEl) statusEl.addEventListener('change', function() { filterStatus = this.value; currentPage = 1; refreshTable(); });
      if (typeEl)   typeEl.addEventListener('change',   function() { filterType = this.value; currentPage = 1; refreshTable(); });
    }
    if (window.lucide) lucide.createIcons();
  }

  function refreshTable() {
    const wrap = document.getElementById('leave-table-wrap');
    if (wrap) { wrap.innerHTML = renderHRTable(); if (window.lucide) lucide.createIcons({ nodes: [wrap] }); }
  }

  function goPage(p) { currentPage = p; refreshTable(); }

  function openApply() {
    document.getElementById('form-leave').reset();
    checkBalance();
    openModal('modal-leave-apply');
    if (window.lucide) lucide.createIcons();
  }

  function checkBalance() {
    const session = Auth.getSession();
    const type = document.querySelector('[name="type"]')?.value;
    const balance = DB.leave.getBalance(session.id, 2026);
    const infoEl = document.getElementById('leave-balance-info');
    if (!infoEl || !balance) return;

    let remaining = null;
    if (type === 'Cuti Tahunan') remaining = balance.annual.remaining;
    else if (type === 'Cuti Sakit') remaining = balance.sick.remaining;
    else if (type === 'Cuti Penting') remaining = balance.important.remaining;

    if (remaining !== null) {
      infoEl.innerHTML = `<span style="color:var(--primary);font-weight:600;">Saldo tersedia: ${remaining} hari</span>`;
      infoEl.style.display = 'block';
    } else {
      infoEl.style.display = 'none';
    }
  }

  function calcDays() {
    const start = document.querySelector('[name="startDate"]')?.value;
    const end   = document.querySelector('[name="endDate"]')?.value;
    const infoEl = document.getElementById('leave-days-info');
    if (!infoEl) return;
    if (!start || !end) { infoEl.textContent = 'Pilih tanggal untuk menghitung jumlah hari'; return; }
    const days = countWorkingDaysBetween(start, end);
    if (days <= 0) { infoEl.innerHTML = `<span style="color:var(--danger);">Tanggal tidak valid atau bukan hari kerja</span>`; return; }
    infoEl.innerHTML = `<span style="font-weight:600;">Durasi: <span style="color:var(--primary);">${days} hari kerja</span></span>`;
  }

  function countWorkingDaysBetween(start, end) {
    const s = new Date(start + 'T00:00:00');
    const e = new Date(end + 'T00:00:00');
    if (e < s) return 0;
    let count = 0;
    const cur = new Date(s);
    while (cur <= e) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return count;
  }

  function submitLeave() {
    if (!validateRequired('form-leave', [
      { name: 'startDate', msg: 'Tanggal mulai wajib diisi' },
      { name: 'endDate', msg: 'Tanggal selesai wajib diisi' },
      { name: 'reason', msg: 'Alasan wajib diisi' },
    ])) return;

    const data = getFormData('form-leave');
    const session = Auth.getSession();
    const days = countWorkingDaysBetween(data.startDate, data.endDate);

    if (days <= 0) { showToast('Tanggal tidak valid atau bukan hari kerja', 'error'); return; }

    const leave = {
      id: DB.leave.nextId(),
      employeeId: session.id,
      type: data.type, startDate: data.startDate, endDate: data.endDate,
      days, reason: data.reason, status: 'Menunggu',
      approvedBy: null, approvedDate: null, rejectNote: '',
      createdAt: todayStr(),
    };
    DB.leave.create(leave);
    showToast('Pengajuan cuti berhasil dikirim', 'success');
    closeModal('modal-leave-apply');
    App.navigate('leave');
  }

  function approve(id) {
    const session = Auth.getSession();
    const leave = DB.leave.getById(id);
    DB.leave.update(id, { status: 'Disetujui', approvedBy: session.id, approvedDate: todayStr() });
    if (leave) {
      const year = parseInt(leave.startDate.slice(0, 4));
      DB.leave.deductBalance(leave.employeeId, year, leave.type, leave.days);
    }
    showToast('Cuti disetujui', 'success');
    refreshTable();
    const notifBadge = document.querySelector('.notif-badge');
    if (notifBadge) {
      const count = DB.leave.getPending().length;
      notifBadge.textContent = count;
      if (count === 0) notifBadge.style.display = 'none';
    }
  }

  let rejectingId = null;
  function openReject(id) {
    rejectingId = id;
    document.getElementById('reject-note').value = '';
    openModal('modal-leave-reject');
  }

  function confirmReject() {
    const note = document.getElementById('reject-note').value.trim();
    if (!note) { showToast('Alasan penolakan wajib diisi', 'error'); return; }
    const session = Auth.getSession();
    DB.leave.update(rejectingId, { status: 'Ditolak', approvedBy: session.id, approvedDate: todayStr(), rejectNote: note });
    showToast('Pengajuan cuti ditolak', 'warning');
    closeModal('modal-leave-reject');
    rejectingId = null;
    refreshTable();
  }

  function cancelLeave(id) {
    confirmDialog('Batalkan pengajuan cuti ini?', () => {
      DB.leave.delete(id);
      showToast('Pengajuan cuti dibatalkan', 'info');
      App.navigate('leave');
    });
  }

  function viewDetail(id) {
    const l = DB.leave.getById(id);
    if (!l) return;
    const emp = DB.employees.getById(l.employeeId);
    const approver = l.approvedBy ? DB.employees.getById(l.approvedBy) : null;
    const body = document.getElementById('leave-detail-body');
    if (!body) return;

    body.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">
        ${avatarHtml(emp?emp.name:'?',48)}
        <div>
          <div style="font-size:17px;font-weight:700;">${escapeHtml(emp?emp.name:'-')}</div>
          <div style="font-size:12.5px;color:var(--text-muted);">${escapeHtml(getDeptName(emp?emp.department:''))}</div>
          <div style="margin-top:4px;">${badge(l.status)}</div>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">Jenis Cuti</div><div class="detail-value">${escapeHtml(l.type)}</div></div>
        <div class="detail-item"><div class="detail-label">Durasi</div><div class="detail-value">${l.days} hari kerja</div></div>
        <div class="detail-item"><div class="detail-label">Tanggal Mulai</div><div class="detail-value">${formatDate(l.startDate)}</div></div>
        <div class="detail-item"><div class="detail-label">Tanggal Selesai</div><div class="detail-value">${formatDate(l.endDate)}</div></div>
        <div class="detail-item"><div class="detail-label">Tanggal Pengajuan</div><div class="detail-value">${formatDate(l.createdAt)}</div></div>
        <div class="detail-item"><div class="detail-label">Diproses oleh</div><div class="detail-value">${approver?escapeHtml(approver.name):'-'}</div></div>
      </div>
      <div style="margin-top:16px;">
        <div class="detail-label" style="margin-bottom:6px;">Alasan</div>
        <div style="background:var(--body-bg);border-radius:var(--radius);padding:12px;font-size:13.5px;line-height:1.6;">${escapeHtml(l.reason)}</div>
      </div>
      ${l.rejectNote ? `<div style="margin-top:12px;">
        <div class="detail-label" style="margin-bottom:6px;color:var(--danger);">Alasan Penolakan</div>
        <div style="background:#FEF2F2;border-radius:var(--radius);padding:12px;font-size:13.5px;line-height:1.6;color:var(--danger);">${escapeHtml(l.rejectNote)}</div>
      </div>` : ''}`;

    openModal('modal-leave-detail');
    if (window.lucide) lucide.createIcons({ nodes: [body.parentElement] });
  }

  return { render, init, goPage, openApply, checkBalance, calcDays, submitLeave, approve, openReject, confirmReject, cancelLeave, viewDetail };
})();
