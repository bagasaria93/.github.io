'use strict';

window.MyAssignmentsModule = (function () {
  let activeTab = 'pending';

  function render() {
    const session  = Auth.getSession();
    const enrolled = DB.enrollments.getByUser(session.id).map(e => DB.courses.getById(e.courseId)).filter(Boolean);
    const allAssign = enrolled.flatMap(c => DB.assignments.getByCourse(c.id));
    const mySubs   = DB.submissions.getByUser(session.id);

    const pending  = allAssign.filter(a => !mySubs.some(s => s.assignmentId === a.id));
    const submitted = allAssign.filter(a =>  mySubs.some(s => s.assignmentId === a.id));

    return `
    <div class="page-header">
      <div><div class="page-title">Tugas & Nilai</div><div class="page-subtitle">Kumpulkan tugas dan lihat penilaian</div></div>
    </div>

    <div class="stat-grid" style="margin-bottom:20px;">
      <div class="stat-card">
        <div class="stat-icon warning"><i data-lucide="clock"></i></div>
        <div><div class="stat-value">${pending.length}</div><div class="stat-label">Belum Dikumpulkan</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i data-lucide="check-circle"></i></div>
        <div><div class="stat-value">${submitted.length}</div><div class="stat-label">Sudah Dikumpulkan</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon indigo"><i data-lucide="star"></i></div>
        <div>
          <div class="stat-value">${mySubs.filter(s=>s.nilai!=null).length > 0
            ? Math.round(mySubs.filter(s=>s.nilai!=null).reduce((a,s)=>a+s.nilai,0)/mySubs.filter(s=>s.nilai!=null).length)
            : '-'}</div>
          <div class="stat-label">Rata-rata Nilai</div>
        </div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn ${activeTab==='pending'?'active':''}" data-tab="pending">Belum Dikumpulkan <span class="badge badge-warning" style="margin-left:6px;">${pending.length}</span></button>
      <button class="tab-btn ${activeTab==='submitted'?'active':''}" data-tab="submitted">Sudah Dikumpulkan <span class="badge badge-success" style="margin-left:6px;">${submitted.length}</span></button>
    </div>

    <div class="tab-panel ${activeTab==='pending'?'active':''}" id="tab-pending">
      ${renderPendingList(pending, mySubs, enrolled)}
    </div>
    <div class="tab-panel ${activeTab==='submitted'?'active':''}" id="tab-submitted">
      ${renderSubmittedList(submitted, mySubs, enrolled)}
    </div>

    <!-- Modal Submit -->
    <div class="modal modal-md" id="modal-submit">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title" id="modal-submit-title">Kumpulkan Tugas</span>
          <button class="modal-close" onclick="closeModal('modal-submit')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <div id="submit-assign-info" style="background:var(--primary-xlight);border-radius:var(--radius);padding:14px;margin-bottom:16px;"></div>
          <div class="form-group">
            <label class="form-label required">Jawaban / Deskripsi Pengerjaan</label>
            <textarea class="form-control" id="submit-konten" rows="5" placeholder="Jelaskan hasil pengerjaan tugas Anda, link repository, atau deskripsi solusi..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-submit')">Batal</button>
          <button class="btn btn-primary" id="btn-do-submit"><i data-lucide="send"></i> Kumpulkan</button>
        </div>
      </div>
    </div>

    <!-- Modal Lihat Nilai -->
    <div class="modal modal-md" id="modal-grade-view">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">Detail Nilai</span>
          <button class="modal-close" onclick="closeModal('modal-grade-view')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body" id="grade-view-body"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-grade-view')">Tutup</button>
        </div>
      </div>
    </div>`;
  }

  function renderPendingList(pending, mySubs, enrolled) {
    if (!pending.length) return `<div class="empty-state"><i data-lucide="check-circle"></i><h3>Semua tugas sudah dikumpulkan!</h3><p>Tidak ada tugas yang belum dikumpulkan.</p></div>`;
    return pending.map(a => {
      const c    = DB.courses.getById(a.courseId);
      const over = isOverdue(a.deadline);
      return `
      <div class="card" style="margin-bottom:12px;">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
            <div style="flex:1;">
              <div style="font-weight:700;font-size:15px;margin-bottom:4px;">${escapeHtml(a.judul)}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
                <span class="badge badge-indigo">${escapeHtml(c?.code)}</span>
                ${over ? '<span class="badge badge-danger">Deadline Terlewat</span>' : '<span class="badge badge-warning">Belum Dikumpulkan</span>'}
              </div>
              <div style="font-size:13px;color:var(--text-muted);">Deadline: <strong style="color:${over?'var(--danger)':'inherit'}">${formatDate(a.deadline)}</strong> &mdash; Bobot: ${a.bobot}%</div>
              <p style="font-size:13px;color:var(--text-secondary);margin-top:8px;line-height:1.6;">${escapeHtml(a.deskripsi?.substring(0,150))}...</p>
            </div>
            ${!over ? `<button class="btn btn-primary" onclick="MyAssignmentsModule._openSubmit('${a.id}')"><i data-lucide="send"></i> Kumpulkan</button>` : '<span class="badge badge-danger" style="padding:8px 14px;">Terlambat</span>'}
          </div>
        </div>
      </div>`;
    }).join('');
  }

  function renderSubmittedList(submitted, mySubs, enrolled) {
    if (!submitted.length) return `<div class="empty-state"><i data-lucide="clipboard-list"></i><h3>Belum ada tugas dikumpulkan</h3></div>`;
    return submitted.map(a => {
      const c   = DB.courses.getById(a.courseId);
      const sub = mySubs.find(s => s.assignmentId === a.id);
      return `
      <div class="card" style="margin-bottom:12px;">
        <div class="card-body">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap;">
            <div style="flex:1;">
              <div style="font-weight:700;font-size:15px;margin-bottom:4px;">${escapeHtml(a.judul)}</div>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">
                <span class="badge badge-indigo">${escapeHtml(c?.code)}</span>
                ${sub?.nilai != null
                  ? `<span class="badge badge-success">Dinilai: ${sub.nilai} (${nilaiToGrade(sub.nilai)})</span>`
                  : '<span class="badge badge-info">Menunggu penilaian</span>'}
              </div>
              <div style="font-size:13px;color:var(--text-muted);">Dikumpulkan: ${formatDate(sub?.submittedAt)}</div>
            </div>
            <button class="btn btn-outline" onclick="MyAssignmentsModule._viewGrade('${a.id}')"><i data-lucide="eye"></i> Detail</button>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  let _pendingAssignId = null;

  function _openSubmit(assignmentId) {
    _pendingAssignId = assignmentId;
    const a = DB.assignments.getById(assignmentId);
    const c = a ? DB.courses.getById(a.courseId) : null;
    document.getElementById('modal-submit-title').textContent = 'Kumpulkan: ' + (a?.judul || '');
    document.getElementById('submit-assign-info').innerHTML = `
      <div style="font-weight:600;margin-bottom:4px;">${escapeHtml(a?.judul)}</div>
      <div style="font-size:12.5px;color:var(--text-secondary);">${escapeHtml(c?.name)} &mdash; Deadline: ${formatDate(a?.deadline)} &mdash; Bobot: ${a?.bobot}%</div>`;
    document.getElementById('submit-konten').value = '';
    openModal('modal-submit');
  }

  function _viewGrade(assignmentId) {
    const session = Auth.getSession();
    const sub  = DB.submissions.getByUserAssignment(session.id, assignmentId);
    const a    = DB.assignments.getById(assignmentId);
    const c    = a ? DB.courses.getById(a.courseId) : null;
    const body = document.getElementById('grade-view-body');
    body.innerHTML = `
      <div style="margin-bottom:16px;">
        <div style="font-weight:700;font-size:16px;">${escapeHtml(a?.judul)}</div>
        <div style="font-size:13px;color:var(--text-muted);">${escapeHtml(c?.name)} &mdash; Bobot: ${a?.bobot}%</div>
      </div>
      <div style="display:flex;gap:16px;margin-bottom:16px;align-items:center;">
        ${sub?.nilai != null
          ? `<div class="grade-pill grade-${nilaiToGrade(sub.nilai)}" style="width:56px;height:56px;font-size:20px;">${nilaiToGrade(sub.nilai)}</div>
             <div>
               <div style="font-size:28px;font-weight:900;line-height:1;">${sub.nilai}</div>
               <div style="font-size:13px;color:var(--text-muted);">dari 100</div>
             </div>`
          : `<div style="font-size:14px;color:var(--text-muted);"><span class="badge badge-info" style="padding:10px 16px;">Menunggu penilaian dari dosen</span></div>`}
      </div>
      <div style="background:var(--body-bg);border-radius:var(--radius);padding:14px;margin-bottom:12px;">
        <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Jawaban Saya</div>
        <div style="font-size:13.5px;line-height:1.6;">${escapeHtml(sub?.konten || '-')}</div>
      </div>
      ${sub?.feedback ? `
      <div style="background:#F0FDF4;border-radius:var(--radius);padding:14px;border-left:3px solid var(--success);">
        <div style="font-size:11px;font-weight:700;color:var(--success);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Feedback Dosen</div>
        <div style="font-size:13.5px;line-height:1.6;">${escapeHtml(sub.feedback)}</div>
      </div>` : ''}`;
    openModal('modal-grade-view');
  }

  function init() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + activeTab));
      });
    });

    document.getElementById('btn-do-submit')?.addEventListener('click', () => {
      const konten = document.getElementById('submit-konten').value.trim();
      if (!konten) { showToast('Isi jawaban terlebih dahulu.', 'error'); return; }
      const session = Auth.getSession();
      DB.submissions.add({
        id: DB.submissions.nextId(),
        assignmentId: _pendingAssignId,
        userId: session.id,
        konten,
        submittedAt: todayStr(),
        nilai: null,
        feedback: null,
      });
      showToast('Tugas berhasil dikumpulkan!', 'success');
      closeModal('modal-submit');
      App.navigate('my-assignments');
    });
  }

  return { render, init, _openSubmit, _viewGrade };
})();
