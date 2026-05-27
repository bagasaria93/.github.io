'use strict';

window.PerformanceModule = (function () {
  let filterPeriod = '';
  let editingId = null;

  const PERIODS = ['Q1-2026','Q2-2026','Q3-2026','Q4-2026','Tahunan-2025'];
  const RATINGS = ['Istimewa','Sangat Baik','Baik','Cukup','Kurang'];

  function render() {
    const session = Auth.getSession();
    const isHR = ['superadmin','hrmanager'].includes(session.role);
    return isHR ? renderHRView() : renderEmployeeView(session);
  }

  function renderHRView() {
    let data = DB.performance.getAll();
    if (filterPeriod) data = data.filter(p => p.period === filterPeriod);
    data.sort((a,b) => new Date(b.reviewDate||'2000-01-01') - new Date(a.reviewDate||'2000-01-01'));

    const canCreate = Auth.can('create_performance');
    const ratingCount = (r) => data.filter(p => p.rating === r).length;

    return `
    <div class="page-header">
      <div>
        <div class="page-title">Manajemen Kinerja</div>
        <div class="page-subtitle">Penilaian KPI dan evaluasi performa karyawan</div>
      </div>
      ${canCreate ? `<button class="btn btn-primary" onclick="PerformanceModule.openAdd()">
        <i data-lucide="plus"></i> Tambah Review
      </button>` : ''}
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(5,1fr);margin-bottom:24px;">
      ${[['Istimewa','purple'],['Sangat Baik','green'],['Baik','blue'],['Cukup','yellow'],['Kurang','red']].map(([r,c])=>
        `<div class="stat-card"><div class="stat-icon ${c}"><i data-lucide="star"></i></div>
        <div><div class="stat-value">${ratingCount(r)}</div><div class="stat-label">${r}</div></div></div>`
      ).join('')}
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Daftar Penilaian Kinerja</div>
        <select class="filter-select" id="perf-period">
          <option value="">Semua Periode</option>
          ${PERIODS.map(p=>`<option value="${p}" ${filterPeriod===p?'selected':''}>${p}</option>`).join('')}
        </select>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr>
            <th>Karyawan</th><th>Periode</th><th>Skor</th><th>Rating</th><th>Penilai</th><th>Tgl Review</th><th>Status</th><th>Aksi</th>
          </tr></thead>
          <tbody>
            ${data.length ? data.map(p => {
              const emp = DB.employees.getById(p.employeeId);
              const reviewer = p.reviewedBy ? DB.employees.getById(p.reviewedBy) : null;
              return `<tr>
                <td><div class="table-name-cell">${avatarHtml(emp?emp.name:'?',28)}
                  <div><div class="name">${escapeHtml(emp?emp.name:'-')}</div>
                  <div class="sub">${escapeHtml(getPosName(emp?emp.position:''))}</div></div>
                </div></td>
                <td style="font-weight:600;">${escapeHtml(p.period)}</td>
                <td><span style="font-size:16px;font-weight:800;color:var(--primary);">${p.overallScore>0?p.overallScore.toFixed(1):'-'}</span></td>
                <td>${p.rating!=='-'?performanceRatingBadge(p.rating):badge('-','badge-secondary')}</td>
                <td style="font-size:12.5px;">${escapeHtml(reviewer?reviewer.name:'-')}</td>
                <td>${p.reviewDate?formatDate(p.reviewDate,'short'):'-'}</td>
                <td>${badge(p.status)}</td>
                <td>
                  <div style="display:flex;gap:4px;">
                    <button class="btn btn-ghost btn-sm btn-icon" onclick="PerformanceModule.viewDetail('${p.id}')" title="Detail">
                      <i data-lucide="eye"></i>
                    </button>
                    ${Auth.can('edit_performance') ? `<button class="btn btn-ghost btn-sm btn-icon" onclick="PerformanceModule.openEdit('${p.id}')" title="Edit">
                      <i data-lucide="pencil"></i>
                    </button>` : ''}
                    ${Auth.can('delete_performance') ? `<button class="btn btn-ghost btn-sm btn-icon" onclick="PerformanceModule.deleteReview('${p.id}')" title="Hapus" style="color:var(--danger);">
                      <i data-lucide="trash-2"></i>
                    </button>` : ''}
                  </div>
                </td>
              </tr>`;
            }).join('') : `<tr><td colspan="8"><div class="empty-state" style="padding:32px;"><i data-lucide="bar-chart-2"></i><h3>Tidak ada data penilaian</h3></div></td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
    ${renderFormModal()}
    ${renderDetailModal()}`;
  }

  function renderEmployeeView(session) {
    const myPerfs = DB.performance.getByEmployee(session.id)
      .sort((a,b) => b.period.localeCompare(a.period));

    return `
    <div class="page-header">
      <div><div class="page-title">Kinerja Saya</div><div class="page-subtitle">Hasil evaluasi performa Anda</div></div>
    </div>

    ${myPerfs.length === 0 ? `<div class="card"><div class="empty-state" style="padding:60px;"><i data-lucide="bar-chart-2"></i><h3>Belum ada penilaian kinerja</h3><p>Hubungi HR Manager untuk informasi lebih lanjut</p></div></div>` : ''}

    ${myPerfs.map(p => {
      const reviewer = p.reviewedBy ? DB.employees.getById(p.reviewedBy) : null;
      return `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <div>
            <div style="font-size:15px;font-weight:700;">${p.period}</div>
            <div style="font-size:12.5px;color:var(--text-muted);">Penilai: ${reviewer?escapeHtml(reviewer.name):'-'} &bull; ${p.reviewDate?formatDate(p.reviewDate,'short'):'-'}</div>
          </div>
          <div style="display:flex;align-items:center;gap:12px;">
            <div style="text-align:right;">
              <div style="font-size:28px;font-weight:900;color:var(--primary);">${p.overallScore>0?p.overallScore.toFixed(1):'-'}</div>
              <div style="font-size:11.5px;color:var(--text-muted);">Skor Akhir</div>
            </div>
            ${performanceRatingBadge(p.rating)}
          </div>
        </div>
        <div class="card-body">
          ${p.kpis.map(k => {
            const pct = k.actual > 0 ? Math.min(100, Math.round((k.actual / k.target) * 100)) : 0;
            const cls = pct >= 100 ? 'good' : pct >= 80 ? 'warn' : 'bad';
            return `<div class="kpi-bar">
              <div class="kpi-bar-header">
                <span class="kpi-bar-name">${escapeHtml(k.name)}</span>
                <span class="kpi-bar-vals">${k.actual>0?k.actual:'-'} / ${k.target} ${escapeHtml(k.unit)} (Bobot ${k.weight}%)</span>
              </div>
              <div class="kpi-bar-track"><div class="kpi-bar-fill ${cls}" style="width:${pct}%;"></div></div>
            </div>`;
          }).join('')}
          ${p.notes ? `<div style="margin-top:16px;padding:12px;background:var(--body-bg);border-radius:var(--radius);font-size:13.5px;line-height:1.6;"><strong>Catatan Penilai:</strong><br>${escapeHtml(p.notes)}</div>` : ''}
        </div>
      </div>`;
    }).join('')}
    ${renderDetailModal()}`;
  }

  function renderFormModal() {
    return `
    <div class="modal" id="modal-perf">
      <div class="modal-box modal-lg">
        <div class="modal-header">
          <div class="modal-title" id="perf-modal-title">Tambah Penilaian Kinerja</div>
          <button class="modal-close" onclick="closeModal('modal-perf')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <form id="form-perf" novalidate>
            <input type="hidden" name="id" id="perf-id">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Karyawan</label>
                <select name="employeeId" class="form-control">
                  <option value="">Pilih Karyawan</option>
                  ${DB.employees.getActive().map(e=>`<option value="${e.id}">${escapeHtml(e.name)} - ${escapeHtml(getDeptName(e.department))}</option>`).join('')}
                </select>
              </div>
              <div class="form-group">
                <label class="form-label required">Periode</label>
                <select name="period" class="form-control">
                  ${PERIODS.map(p=>`<option value="${p}">${p}</option>`).join('')}
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Status</label>
                <select name="status" class="form-control">
                  <option>Draft</option><option>Final</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Tanggal Review</label>
                <input type="date" name="reviewDate" class="form-control" value="${todayStr()}">
              </div>
            </div>

            <div class="form-section-title">KPI & Target</div>
            <div id="kpi-list"></div>
            <button type="button" class="btn btn-secondary btn-sm" onclick="PerformanceModule.addKpiRow()" style="margin-bottom:16px;">
              <i data-lucide="plus"></i> Tambah KPI
            </button>

            <div class="form-group">
              <label class="form-label">Catatan Penilai</label>
              <textarea name="notes" class="form-control" rows="3" placeholder="Catatan evaluasi..."></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-perf')">Batal</button>
          <button class="btn btn-primary" onclick="PerformanceModule.saveReview()">
            <i data-lucide="save"></i> Simpan
          </button>
        </div>
      </div>
    </div>`;
  }

  function renderDetailModal() {
    return `
    <div class="modal" id="modal-perf-detail">
      <div class="modal-box modal-md">
        <div class="modal-header">
          <div class="modal-title">Detail Penilaian Kinerja</div>
          <button class="modal-close" onclick="closeModal('modal-perf-detail')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body" id="perf-detail-body"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-perf-detail')">Tutup</button>
        </div>
      </div>
    </div>`;
  }

  function addKpiRow(name='', target='', actual='', unit='%', weight=20) {
    const list = document.getElementById('kpi-list');
    if (!list) return;
    const idx = list.children.length;
    const row = document.createElement('div');
    row.className = 'kpi-input-row';
    row.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr auto;gap:8px;align-items:center;margin-bottom:8px;';
    row.innerHTML = `
      <input type="text" class="form-control" placeholder="Nama KPI" name="kpi_name_${idx}" value="${escapeHtml(name)}">
      <input type="number" class="form-control" placeholder="Target" name="kpi_target_${idx}" value="${target}">
      <input type="number" class="form-control" placeholder="Realisasi" name="kpi_actual_${idx}" value="${actual}">
      <input type="text" class="form-control" placeholder="Satuan" name="kpi_unit_${idx}" value="${escapeHtml(unit)}">
      <input type="number" class="form-control" placeholder="Bobot%" name="kpi_weight_${idx}" value="${weight}" min="0" max="100">
      <button type="button" class="btn btn-ghost btn-sm btn-icon" onclick="this.parentElement.remove()" style="color:var(--danger);">
        <i data-lucide="trash-2"></i>
      </button>`;
    list.appendChild(row);
    if (window.lucide) lucide.createIcons({ nodes: [row] });
  }

  function getKpisFromForm() {
    const rows = document.querySelectorAll('#kpi-list .kpi-input-row');
    return Array.from(rows).map((row, i) => ({
      name: row.querySelector(`[name="kpi_name_${i}"]`)?.value || '',
      target: parseFloat(row.querySelector(`[name="kpi_target_${i}"]`)?.value) || 0,
      actual: parseFloat(row.querySelector(`[name="kpi_actual_${i}"]`)?.value) || 0,
      unit: row.querySelector(`[name="kpi_unit_${i}"]`)?.value || '%',
      weight: parseFloat(row.querySelector(`[name="kpi_weight_${i}"]`)?.value) || 0,
    })).filter(k => k.name);
  }

  function calcOverallScore(kpis) {
    const totalWeight = kpis.reduce((s,k)=>s+k.weight,0);
    if (totalWeight === 0) return 0;
    const weighted = kpis.reduce((s,k) => {
      if (k.target === 0) return s;
      return s + (Math.min(k.actual/k.target,1.2) * 100) * (k.weight/totalWeight);
    }, 0);
    return Math.round(weighted * 10) / 10;
  }

  function scoreToRating(score) {
    if (score >= 95) return 'Istimewa';
    if (score >= 85) return 'Sangat Baik';
    if (score >= 75) return 'Baik';
    if (score >= 60) return 'Cukup';
    return 'Kurang';
  }

  function openAdd() {
    editingId = null;
    document.getElementById('perf-modal-title').textContent = 'Tambah Penilaian Kinerja';
    document.getElementById('form-perf').reset();
    document.getElementById('perf-id').value = '';
    document.getElementById('kpi-list').innerHTML = '';
    // Add default KPIs
    const session = Auth.getSession();
    addKpiRow('Penyelesaian Tugas Tepat Waktu','90','','%',30);
    addKpiRow('Tingkat Kehadiran','95','','%',20);
    addKpiRow('Kualitas Pekerjaan','80','','poin',30);
    addKpiRow('Kolaborasi Tim','80','','poin',20);
    openModal('modal-perf');
    if (window.lucide) lucide.createIcons();
  }

  function openEdit(id) {
    editingId = id;
    const p = DB.performance.getById(id);
    if (!p) return;
    document.getElementById('perf-modal-title').textContent = 'Edit Penilaian Kinerja';
    document.getElementById('kpi-list').innerHTML = '';
    setFormData('form-perf', { employeeId: p.employeeId, period: p.period, status: p.status, reviewDate: p.reviewDate||'', notes: p.notes });
    p.kpis.forEach(k => addKpiRow(k.name, k.target, k.actual, k.unit, k.weight));
    openModal('modal-perf');
    if (window.lucide) lucide.createIcons();
  }

  function saveReview() {
    const data = getFormData('form-perf');
    if (!data.employeeId) { showToast('Karyawan wajib dipilih', 'error'); return; }
    const kpis = getKpisFromForm();
    if (kpis.length === 0) { showToast('Minimal satu KPI wajib diisi', 'error'); return; }

    const session = Auth.getSession();
    const overallScore = data.status === 'Final' ? calcOverallScore(kpis) : 0;
    const rating = data.status === 'Final' ? scoreToRating(overallScore) : '-';

    const review = {
      employeeId: data.employeeId, period: data.period,
      kpis, overallScore, rating,
      reviewedBy: session.id, reviewDate: data.reviewDate || todayStr(),
      notes: data.notes || '', status: data.status,
    };

    if (editingId) {
      DB.performance.update(editingId, review);
      showToast('Penilaian berhasil diperbarui', 'success');
    } else {
      DB.performance.create({ ...review, id: DB.performance.nextId() });
      showToast('Penilaian berhasil ditambahkan', 'success');
    }
    closeModal('modal-perf');
    App.navigate('performance');
  }

  function viewDetail(id) {
    const p = DB.performance.getById(id);
    if (!p) return;
    const emp = DB.employees.getById(p.employeeId);
    const reviewer = p.reviewedBy ? DB.employees.getById(p.reviewedBy) : null;
    const body = document.getElementById('perf-detail-body');

    body.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;padding-bottom:16px;border-bottom:1px solid var(--border);">
        ${avatarHtml(emp?emp.name:'?',48)}
        <div style="flex:1;">
          <div style="font-size:17px;font-weight:700;">${escapeHtml(emp?emp.name:'-')}</div>
          <div style="font-size:12.5px;color:var(--text-muted);">${p.period} &bull; Penilai: ${reviewer?escapeHtml(reviewer.name):'-'}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:32px;font-weight:900;color:var(--primary);">${p.overallScore>0?p.overallScore.toFixed(1):'-'}</div>
          ${performanceRatingBadge(p.rating)}
        </div>
      </div>
      ${p.kpis.map(k => {
        const pct = k.actual > 0 && k.target > 0 ? Math.min(100, Math.round((k.actual/k.target)*100)) : 0;
        const cls = pct >= 100 ? 'good' : pct >= 80 ? 'warn' : 'bad';
        return `<div class="kpi-bar">
          <div class="kpi-bar-header">
            <span class="kpi-bar-name">${escapeHtml(k.name)} <span style="font-size:11px;color:var(--text-muted);">(Bobot ${k.weight}%)</span></span>
            <span class="kpi-bar-vals">${k.actual>0?k.actual:'-'} / ${k.target} ${escapeHtml(k.unit)}</span>
          </div>
          <div class="kpi-bar-track"><div class="kpi-bar-fill ${cls}" style="width:${pct}%;"></div></div>
        </div>`;
      }).join('')}
      ${p.notes ? `<div style="margin-top:16px;padding:12px;background:var(--body-bg);border-radius:var(--radius);font-size:13.5px;line-height:1.6;"><strong>Catatan:</strong><br>${escapeHtml(p.notes)}</div>` : ''}`;

    openModal('modal-perf-detail');
    if (window.lucide) lucide.createIcons({ nodes: [body.parentElement] });
  }

  function deleteReview(id) {
    confirmDialog('Hapus penilaian kinerja ini?', () => {
      DB.performance.delete(id);
      showToast('Penilaian berhasil dihapus', 'success');
      App.navigate('performance');
    });
  }

  function init() {
    const el = document.getElementById('perf-period');
    if (el) el.addEventListener('change', function() { filterPeriod = this.value; App.navigate('performance'); });
    if (window.lucide) lucide.createIcons();
  }

  return { render, init, openAdd, openEdit, saveReview, addKpiRow, viewDetail, deleteReview };
})();
