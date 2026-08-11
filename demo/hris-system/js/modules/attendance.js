'use strict';

window.AttendanceModule = (function () {
  let currentPage = 1;
  let filterMonth = 5;
  let filterYear = 2026;
  let filterEmp = '';
  let filterStatus = '';

  function render() {
    const session = Auth.getSession();
    const isHR = ['superadmin','hrmanager','hrstaff'].includes(session.role);
    return isHR ? renderHRView() : renderEmployeeView(session);
  }

  function getAvailableMonths() {
    const months = [...new Set(DB.attendance.getAll().map(a => a.month))];
    return months.sort((a, b) => a - b);
  }

  function renderHRView() {
    const summary = getSummary(filterMonth, filterYear);
    const canCreate = Auth.can('create_attendance');
    return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Rekap Kehadiran</h1>
        <p class="page-subtitle">Data kehadiran seluruh karyawan</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="AttendanceModule.exportCSV()">
          <i data-lucide="download"></i> Ekspor CSV
        </button>
        ${canCreate ? `<button class="btn btn-primary" onclick="AttendanceModule.openAdd()">
          <i data-lucide="plus"></i> Tambah Manual
        </button>` : ''}
      </div>
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(5,1fr);">
      <div class="stat-card"><div class="stat-icon green"><i data-lucide="check-circle"></i></div>
        <div><div class="stat-value">${summary.hadir}</div><div class="stat-label">Hadir</div></div></div>
      <div class="stat-card"><div class="stat-icon purple"><i data-lucide="monitor"></i></div>
        <div><div class="stat-value">${summary.wfh}</div><div class="stat-label">WFH</div></div></div>
      <div class="stat-card"><div class="stat-icon yellow"><i data-lucide="clock-alert"></i></div>
        <div><div class="stat-value">${summary.telat}</div><div class="stat-label">Terlambat</div></div></div>
      <div class="stat-card"><div class="stat-icon blue"><i data-lucide="thermometer"></i></div>
        <div><div class="stat-value">${summary.sakit}</div><div class="stat-label">Sakit</div></div></div>
      <div class="stat-card"><div class="stat-icon red"><i data-lucide="x-circle"></i></div>
        <div><div class="stat-value">${summary.alpha}</div><div class="stat-label">Alpha</div></div></div>
    </div>

    <div class="card">
      <div class="card-body" style="padding-bottom:0;">
        <div class="filter-bar">
          <select class="filter-select" id="att-month">
            ${getAvailableMonths().map(m => `<option value="${m}" ${m===filterMonth?'selected':''}>${monthName(m)}</option>`).join('')}
          </select>
          <select class="filter-select" id="att-year">
            <option value="2026" ${filterYear===2026?'selected':''}>2026</option>
          </select>
          <select class="filter-select" id="att-emp" style="max-width:220px;">
            <option value="">Semua Karyawan</option>
            ${DB.employees.getAll().map(e => `<option value="${e.id}" ${filterEmp===e.id?'selected':''}>${escapeHtml(e.name)}</option>`).join('')}
          </select>
          <select class="filter-select" id="att-status">
            <option value="">Semua Status</option>
            ${['Hadir','WFH','Telat','Alpha','Cuti','Sakit'].map(s => `<option value="${s}" ${filterStatus===s?'selected':''}>${s}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="table-wrap" id="att-table-wrap">${renderTable()}</div>
    </div>
    ${renderAddModal()}`;
  }

  function renderEmployeeView(session) {
    const myAtt = DB.attendance.getByEmployeeMonth(session.id, filterMonth, filterYear);
    const todayAtt = DB.attendance.getTodayByEmployee(session.id);
    const canClockIn = !todayAtt || todayAtt.checkIn === '-';
    const canClockOut = todayAtt && todayAtt.checkIn !== '-' && (todayAtt.checkOut === '-' || !todayAtt.checkOut);

    const countStatus = (s) => myAtt.filter(a => a.status === s).length;

    return `
    <div class="page-header">
      <div>
        <h1 class="page-title">Kehadiran Saya</h1>
        <p class="page-subtitle">${monthName(filterMonth)} ${filterYear}</p>
      </div>
    </div>

    <div class="card" style="margin-bottom:20px;padding:20px;">
      <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;">
        <div>
          <div style="font-size:13px;color:var(--text-muted);">Status Hari Ini - ${formatDate(todayStr(),'full')}</div>
          <div style="font-size:20px;font-weight:800;margin-top:4px;">
            ${todayAtt ? `${badge(todayAtt.status)} &nbsp; Clock In: <span style="color:var(--primary)">${todayAtt.checkIn}</span>${todayAtt.checkOut && todayAtt.checkOut!=='-' ? ` &nbsp; Clock Out: <span style="color:var(--text-secondary)">${todayAtt.checkOut}</span>` : ''}` : `${badge('Belum Hadir','badge-danger')}`}
          </div>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="btn btn-primary" onclick="AttendanceModule.clockIn()" ${!canClockIn ? 'disabled' : ''}>
            <i data-lucide="log-in"></i> Clock In
          </button>
          <button class="btn btn-secondary" onclick="AttendanceModule.clockOut()" ${!canClockOut ? 'disabled' : ''}>
            <i data-lucide="log-out"></i> Clock Out
          </button>
        </div>
      </div>
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:20px;">
      ${[['Hadir','green'],['WFH','purple'],['Telat','yellow'],['Sakit','blue'],['Alpha','red']].map(([s,c]) =>
        `<div class="stat-card"><div class="stat-icon ${c}"><i data-lucide="circle"></i></div>
        <div><div class="stat-value">${countStatus(s)}</div><div class="stat-label">${s}</div></div></div>`
      ).join('')}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Riwayat Kehadiran</div>
        <div style="display:flex;gap:8px;">
          <select class="filter-select" id="att-month-emp">
            ${getAvailableMonths().map(m => `<option value="${m}" ${m===filterMonth?'selected':''}>${monthName(m)} 2026</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Tanggal</th><th>Hari</th><th>Clock In</th><th>Clock Out</th><th>Status</th><th>Keterangan</th></tr></thead>
          <tbody>
            ${myAtt.length ? myAtt.sort((a,b)=>b.date.localeCompare(a.date)).map(a => `<tr>
              <td>${formatDate(a.date,'short')}</td>
              <td>${HARI[new Date(a.date+'T00:00:00').getDay()]}</td>
              <td style="font-weight:600;color:${a.checkIn!=='-'?'var(--primary)':'var(--text-muted)'};">${a.checkIn}</td>
              <td style="color:var(--text-secondary);">${a.checkOut || '-'}</td>
              <td>${badge(a.status)}</td>
              <td style="font-size:12px;color:var(--text-muted);">${escapeHtml(a.note)}</td>
            </tr>`).join('') : `<tr><td colspan="6"><div class="empty-state" style="padding:32px;"><p>Belum ada data kehadiran</p></div></td></tr>`}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  function renderTable() {
    let data = DB.attendance.getByMonth(filterMonth, filterYear);
    if (filterEmp) data = data.filter(a => a.employeeId === filterEmp);
    if (filterStatus) data = data.filter(a => a.status === filterStatus);
    data.sort((a, b) => b.date.localeCompare(a.date) || a.employeeId.localeCompare(b.employeeId));

    const pag = paginate(data, currentPage, 15);
    return `
    <table class="data-table">
      <thead><tr>
        <th>Tanggal</th><th>Karyawan</th><th>Departemen</th><th>Clock In</th><th>Clock Out</th><th>Status</th><th>Keterangan</th>
        ${Auth.can('edit_attendance') ? '<th>Aksi</th>' : ''}
      </tr></thead>
      <tbody>
        ${pag.items.length ? pag.items.map(a => {
          const emp = DB.employees.getById(a.employeeId);
          return `<tr>
            <td style="white-space:nowrap;">${formatDate(a.date,'short')}</td>
            <td><div class="table-name-cell">${avatarHtml(emp?emp.name:'?',28)}<div class="name">${escapeHtml(emp?emp.name:a.employeeId)}</div></div></td>
            <td style="font-size:12px;color:var(--text-muted);">${escapeHtml(getDeptName(emp?emp.department:''))}</td>
            <td style="font-weight:600;color:${a.checkIn!=='-'?'var(--primary)':'var(--text-muted)'};">${a.checkIn}</td>
            <td style="color:var(--text-secondary);">${a.checkOut||'-'}</td>
            <td>${badge(a.status)}</td>
            <td style="font-size:12px;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${escapeHtml(a.note)}">${escapeHtml(a.note)||'-'}</td>
            ${Auth.can('edit_attendance') ? `<td><button class="btn btn-ghost btn-sm btn-icon" onclick="AttendanceModule.editRecord('${a.id}')" title="Edit"><i data-lucide="pencil"></i></button></td>` : ''}
          </tr>`;
        }).join('') : `<tr><td colspan="${Auth.can('edit_attendance')?8:7}"><div class="empty-state" style="padding:32px;"><i data-lucide="clock"></i><h3>Tidak ada data kehadiran</h3></div></td></tr>`}
      </tbody>
    </table>
    ${paginationHtml(pag, (p) => `AttendanceModule.goPage(${p})`)}`;
  }

  function renderAddModal() {
    return `
    <div class="modal" id="modal-att">
      <div class="modal-box modal-md">
        <div class="modal-header">
          <div class="modal-title" id="modal-att-title">Tambah Data Kehadiran</div>
          <button class="modal-close" onclick="closeModal('modal-att')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <form id="form-att">
            <input type="hidden" name="id" id="att-record-id">
            <div class="form-group">
              <label class="form-label required">Karyawan</label>
              <select name="employeeId" class="form-control">
                <option value="">Pilih Karyawan</option>
                ${DB.employees.getAll().map(e => `<option value="${e.id}">${escapeHtml(e.name)}</option>`).join('')}
              </select>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Tanggal</label>
                <input type="date" name="date" class="form-control" value="${todayStr()}">
              </div>
              <div class="form-group">
                <label class="form-label">Status</label>
                <select name="status" class="form-control">
                  ${['Hadir','WFH','Telat','Sakit','Cuti','Alpha'].map(s=>`<option>${s}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Clock In</label>
                <input type="time" name="checkIn" class="form-control" value="08:00">
              </div>
              <div class="form-group">
                <label class="form-label">Clock Out</label>
                <input type="time" name="checkOut" class="form-control" value="17:00">
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Keterangan</label>
              <input type="text" name="note" class="form-control" placeholder="Keterangan tambahan">
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-att')">Batal</button>
          <button class="btn btn-primary" onclick="AttendanceModule.saveRecord()">
            <i data-lucide="save"></i> Simpan
          </button>
        </div>
      </div>
    </div>`;
  }

  function getSummary(month, year) {
    const data = DB.attendance.getByMonth(month, year);
    return {
      hadir: data.filter(a => a.status === 'Hadir').length,
      wfh:   data.filter(a => a.status === 'WFH').length,
      telat: data.filter(a => a.status === 'Telat').length,
      sakit: data.filter(a => a.status === 'Sakit').length,
      alpha: data.filter(a => a.status === 'Alpha').length,
      cuti:  data.filter(a => a.status === 'Cuti').length,
    };
  }

  function init() {
    const session = Auth.getSession();
    const isHR = ['superadmin','hrmanager','hrstaff'].includes(session.role);

    if (isHR) {
      ['att-month','att-year','att-emp','att-status'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', function() {
          if (id === 'att-month') filterMonth = parseInt(this.value);
          if (id === 'att-year') filterYear = parseInt(this.value);
          if (id === 'att-emp') filterEmp = this.value;
          if (id === 'att-status') filterStatus = this.value;
          currentPage = 1; refreshTable();
        });
      });
    } else {
      const el = document.getElementById('att-month-emp');
      if (el) el.addEventListener('change', function() {
        filterMonth = parseInt(this.value);
        App.navigate('attendance');
      });
    }
    if (window.lucide) lucide.createIcons();
  }

  function refreshTable() {
    const wrap = document.getElementById('att-table-wrap');
    if (wrap) { wrap.innerHTML = renderTable(); if (window.lucide) lucide.createIcons({ nodes: [wrap] }); }
  }

  function goPage(p) { currentPage = p; refreshTable(); }

  function clockIn() {
    const session = Auth.getSession();
    const today = todayStr();
    const existing = DB.attendance.getTodayByEmployee(session.id);
    if (existing && existing.checkIn !== '-') { showToast('Anda sudah melakukan clock in hari ini', 'warning'); return; }
    const time = nowTime();
    const late = time > '08:15';
    const record = {
      id: `ATT_${session.id}_${today.replace(/-/g,'')}`,
      employeeId: session.id,
      date: today, checkIn: time, checkOut: '-',
      status: late ? 'Telat' : 'Hadir',
      note: late ? 'Terlambat masuk' : '',
      month: new Date().getMonth() + 1, year: new Date().getFullYear(),
    };
    DB.attendance.upsert(record);
    showToast(`Clock in berhasil pukul ${time}${late ? ' (Terlambat)' : ''}`, late ? 'warning' : 'success');
    App.navigate('attendance');
  }

  function clockOut() {
    const session = Auth.getSession();
    const today = todayStr();
    const existing = DB.attendance.getTodayByEmployee(session.id);
    if (!existing || existing.checkIn === '-') { showToast('Anda belum melakukan clock in', 'error'); return; }
    if (existing.checkOut && existing.checkOut !== '-') { showToast('Anda sudah melakukan clock out hari ini', 'warning'); return; }
    const time = nowTime();
    DB.attendance.upsert({ ...existing, checkOut: time });
    showToast(`Clock out berhasil pukul ${time}`, 'success');
    App.navigate('attendance');
  }

  function openAdd() {
    document.getElementById('modal-att-title').textContent = 'Tambah Data Kehadiran';
    document.getElementById('form-att').reset();
    document.getElementById('att-record-id').value = '';
    openModal('modal-att');
    if (window.lucide) lucide.createIcons();
  }

  function editRecord(id) {
    const allAtt = DB.attendance.getAll();
    const rec = allAtt.find(a => a.id === id);
    if (!rec) return;
    document.getElementById('modal-att-title').textContent = 'Edit Data Kehadiran';
    document.getElementById('att-record-id').value = rec.id;
    setFormData('form-att', { ...rec });
    openModal('modal-att');
    if (window.lucide) lucide.createIcons();
  }

  function saveRecord() {
    const data = getFormData('form-att');
    if (!data.employeeId || !data.date) { showToast('Karyawan dan tanggal wajib diisi', 'error'); return; }
    const d = new Date(data.date + 'T00:00:00');
    const record = {
      id: `ATT_${data.employeeId}_${data.date.replace(/-/g,'')}`,
      employeeId: data.employeeId, date: data.date,
      checkIn: data.checkIn || '-', checkOut: data.checkOut || '-',
      status: data.status, note: data.note || '',
      month: d.getMonth() + 1, year: d.getFullYear(),
    };
    DB.attendance.upsert(record);
    showToast('Data kehadiran berhasil disimpan', 'success');
    closeModal('modal-att');
    refreshTable();
  }

  function exportCSV() {
    const data = DB.attendance.getByMonth(filterMonth, filterYear);
    const headers = ['Tanggal','Nama Karyawan','Departemen','Clock In','Clock Out','Status','Keterangan'];
    const rows = data.map(a => {
      const emp = DB.employees.getById(a.employeeId);
      return [a.date, emp?emp.name:'', getDeptName(emp?emp.department:''), a.checkIn, a.checkOut||'-', a.status, a.note||''];
    });
    const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `kehadiran-${monthName(filterMonth)}-${filterYear}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('Data berhasil diekspor','success');
  }

  return { render, init, goPage, clockIn, clockOut, openAdd, editRecord, saveRecord, exportCSV };
})();
