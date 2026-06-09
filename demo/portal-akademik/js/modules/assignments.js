'use strict';

window.AssignmentsModule = (function () {
  let activeCourseId = null;
  let gradeAssignId  = null;
  let gradeUserId    = null;

  function render() {
    const session = Auth.getSession();
    const courses = DB.courses.getByDosen(session.id);
    if (!activeCourseId && courses.length) activeCourseId = courses[0].id;

    return `
    <div class="page-header">
      <div><div class="page-title">Kelola Tugas & Penilaian</div><div class="page-subtitle">Buat tugas dan nilai submission mahasiswa</div></div>
      <div class="page-actions">
        <select class="filter-select" id="assign-course-sel" style="min-width:200px;">
          ${courses.map(c => `<option value="${c.id}" ${c.id===activeCourseId?'selected':''}>${escapeHtml(c.code)} - ${escapeHtml(c.name)}</option>`).join('')}
        </select>
        <button class="btn btn-primary" id="btn-add-assign"><i data-lucide="plus"></i> Buat Tugas</button>
      </div>
    </div>
    <div id="assign-content"></div>

    <!-- Modal Tugas -->
    <div class="modal modal-md" id="modal-assign">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title" id="modal-assign-title">Buat Tugas</span>
          <button class="modal-close" onclick="closeModal('modal-assign')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="a-id">
          <div class="form-group">
            <label class="form-label required">Judul Tugas</label>
            <input type="text" class="form-control" id="a-judul" placeholder="Judul tugas">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label required">Deadline</label>
              <input type="date" class="form-control" id="a-deadline">
            </div>
            <div class="form-group">
              <label class="form-label">Bobot (%)</label>
              <input type="number" class="form-control" id="a-bobot" min="1" max="100" value="30">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Deskripsi Tugas</label>
            <textarea class="form-control" id="a-deskripsi" rows="4" placeholder="Deskripsi lengkap tugas..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-assign')">Batal</button>
          <button class="btn btn-primary" id="btn-save-assign"><i data-lucide="save"></i> Simpan</button>
        </div>
      </div>
    </div>

    <!-- Modal Nilai -->
    <div class="modal modal-md" id="modal-grade">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">Beri Nilai</span>
          <button class="modal-close" onclick="closeModal('modal-grade')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <div id="grade-submission-detail"></div>
          <div class="form-group" style="margin-top:16px;">
            <label class="form-label required">Nilai (0-100)</label>
            <input type="number" class="form-control" id="grade-nilai" min="0" max="100" placeholder="Masukkan nilai...">
          </div>
          <div class="form-group">
            <label class="form-label">Feedback</label>
            <textarea class="form-control" id="grade-feedback" rows="3" placeholder="Feedback untuk mahasiswa..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-grade')">Batal</button>
          <button class="btn btn-primary" id="btn-save-grade"><i data-lucide="check-circle"></i> Simpan Nilai</button>
        </div>
      </div>
    </div>`;
  }

  function renderContent() {
    const content = document.getElementById('assign-content');
    if (!content || !activeCourseId) return;
    const assigns = DB.assignments.getByCourse(activeCourseId);
    if (!assigns.length) {
      content.innerHTML = `<div class="empty-state"><i data-lucide="clipboard-list"></i><h3>Belum ada tugas</h3><p>Klik "Buat Tugas" untuk membuat tugas baru.</p></div>`;
      return;
    }
    content.innerHTML = assigns.map(a => {
      const subs    = DB.submissions.getByAssignment(a.id);
      const graded  = subs.filter(s => s.nilai != null);
      const ungrade = subs.filter(s => s.nilai == null);
      const enroll  = DB.enrollments.getByCourse(a.courseId).length;
      const over    = isOverdue(a.deadline);
      return `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-header">
          <div>
            <div class="card-title" style="display:flex;align-items:center;gap:8px;">
              ${escapeHtml(a.judul)}
              ${over ? '<span class="badge badge-secondary" style="font-size:10px;">Berakhir</span>' : '<span class="badge badge-success" style="font-size:10px;">Aktif</span>'}
            </div>
            <div class="card-subtitle">Deadline: ${formatDate(a.deadline)} &mdash; Bobot: ${a.bobot}%</div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn btn-outline btn-sm btn-edit-assign" data-id="${a.id}"><i data-lucide="pencil"></i> Edit</button>
            <button class="btn btn-danger btn-sm btn-del-assign" data-id="${a.id}"><i data-lucide="trash-2"></i></button>
          </div>
        </div>
        <div class="card-body">
          <p style="font-size:13.5px;color:var(--text-secondary);margin-bottom:16px;line-height:1.6;">${escapeHtml(a.deskripsi)}</p>
          <div style="display:flex;gap:16px;margin-bottom:16px;">
            <div style="text-align:center;"><div style="font-size:20px;font-weight:800;color:var(--primary);">${subs.length}</div><div style="font-size:12px;color:var(--text-muted);">Dikumpulkan</div></div>
            <div style="text-align:center;"><div style="font-size:20px;font-weight:800;color:var(--success);">${graded.length}</div><div style="font-size:12px;color:var(--text-muted);">Sudah dinilai</div></div>
            <div style="text-align:center;"><div style="font-size:20px;font-weight:800;color:var(--warning);">${ungrade.length}</div><div style="font-size:12px;color:var(--text-muted);">Belum dinilai</div></div>
            <div style="text-align:center;"><div style="font-size:20px;font-weight:800;color:var(--text-muted);">${enroll - subs.length}</div><div style="font-size:12px;color:var(--text-muted);">Belum kumpul</div></div>
          </div>
          ${subs.length > 0 ? `
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Mahasiswa</th><th>Dikumpulkan</th><th>Nilai</th><th>Aksi</th></tr></thead>
              <tbody>
                ${subs.map(s => {
                  const u = DB.users.getById(s.userId);
                  return `<tr>
                    <td><div class="table-name-cell">${avatarHtml(u?.name,28)}<div><div class="name">${escapeHtml(u?.name)}</div><div class="sub">${escapeHtml(u?.nim)}</div></div></div></td>
                    <td>${formatDate(s.submittedAt)}</td>
                    <td>${s.nilai != null ? `<strong style="color:var(--${nilaiColor(s.nilai)})">${s.nilai}</strong> ${gradeBadge(s.nilai)}` : '<span class="badge badge-warning">Belum dinilai</span>'}</td>
                    <td><button class="btn btn-primary btn-sm btn-grade" data-aid="${a.id}" data-uid="${s.userId}"><i data-lucide="${s.nilai != null ? 'pencil' : 'check-circle'}"></i> ${s.nilai != null ? 'Edit' : 'Nilai'}</button></td>
                  </tr>`;
                }).join('')}
              </tbody>
            </table>
          </div>` : '<div style="color:var(--text-muted);font-size:13px;">Belum ada submission masuk.</div>'}
        </div>
      </div>`;
    }).join('');
    if (window.lucide) lucide.createIcons({ nodes: [content] });
  }

  function openAdd() {
    document.getElementById('modal-assign-title').textContent = 'Buat Tugas';
    document.getElementById('a-id').value = '';
    document.getElementById('a-judul').value = '';
    document.getElementById('a-deadline').value = '';
    document.getElementById('a-bobot').value = 30;
    document.getElementById('a-deskripsi').value = '';
    openModal('modal-assign');
  }

  function openEdit(id) {
    const a = DB.assignments.getById(id);
    if (!a) return;
    document.getElementById('modal-assign-title').textContent = 'Edit Tugas';
    document.getElementById('a-id').value = a.id;
    document.getElementById('a-judul').value = a.judul;
    document.getElementById('a-deadline').value = a.deadline;
    document.getElementById('a-bobot').value = a.bobot;
    document.getElementById('a-deskripsi').value = a.deskripsi || '';
    openModal('modal-assign');
  }

  function saveAssign() {
    const id       = document.getElementById('a-id').value;
    const judul    = document.getElementById('a-judul').value.trim();
    const deadline = document.getElementById('a-deadline').value;
    const bobot    = parseInt(document.getElementById('a-bobot').value);
    const deskripsi = document.getElementById('a-deskripsi').value.trim();
    if (!judul || !deadline) { showToast('Judul dan deadline wajib diisi.', 'error'); return; }
    if (id) {
      DB.assignments.update(id, { judul, deadline, bobot, deskripsi });
      showToast('Tugas diperbarui.', 'success');
    } else {
      DB.assignments.add({ id: DB.assignments.nextId(), courseId: activeCourseId, judul, deadline, bobot, deskripsi, createdAt: todayStr() });
      showToast('Tugas dibuat.', 'success');
    }
    closeModal('modal-assign');
    renderContent();
  }

  function openGrade(assignmentId, userId) {
    gradeAssignId = assignmentId;
    gradeUserId   = userId;
    const s = DB.submissions.getByUserAssignment(userId, assignmentId);
    const u = DB.users.getById(userId);
    document.getElementById('grade-submission-detail').innerHTML = `
      <div style="background:var(--body-bg);border-radius:var(--radius);padding:14px;margin-bottom:4px;">
        <div style="font-weight:700;margin-bottom:6px;">${escapeHtml(u?.name)} &mdash; ${escapeHtml(u?.nim)}</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.6;">${escapeHtml(s?.konten || '-')}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:6px;">Dikumpulkan: ${formatDate(s?.submittedAt)}</div>
      </div>`;
    document.getElementById('grade-nilai').value = s?.nilai ?? '';
    document.getElementById('grade-feedback').value = s?.feedback || '';
    openModal('modal-grade');
  }

  function saveGrade() {
    const nilai    = parseInt(document.getElementById('grade-nilai').value);
    const feedback = document.getElementById('grade-feedback').value.trim();
    if (isNaN(nilai) || nilai < 0 || nilai > 100) { showToast('Nilai harus antara 0-100.', 'error'); return; }
    const existing = DB.submissions.getByUserAssignment(gradeUserId, gradeAssignId);
    if (existing) {
      DB.submissions.update(existing.id, { nilai, feedback });
    } else {
      DB.submissions.add({ id: DB.submissions.nextId(), assignmentId: gradeAssignId, userId: gradeUserId, nilai, feedback, submittedAt: todayStr(), konten: '' });
    }
    showToast('Nilai disimpan.', 'success');
    closeModal('modal-grade');
    renderContent();
  }

  function init() {
    renderContent();
    document.getElementById('btn-add-assign')?.addEventListener('click', openAdd);
    document.getElementById('btn-save-assign')?.addEventListener('click', saveAssign);
    document.getElementById('btn-save-grade')?.addEventListener('click', saveGrade);
    document.getElementById('assign-course-sel')?.addEventListener('change', e => { activeCourseId = e.target.value; renderContent(); });
    document.addEventListener('click', function(e) {
      if (e.target.closest('.btn-edit-assign')) openEdit(e.target.closest('.btn-edit-assign').dataset.id);
      if (e.target.closest('.btn-grade')) {
        const btn = e.target.closest('.btn-grade');
        openGrade(btn.dataset.aid, btn.dataset.uid);
      }
      if (e.target.closest('.btn-del-assign')) {
        const id = e.target.closest('.btn-del-assign').dataset.id;
        const a  = DB.assignments.getById(id);
        confirmDialog(`Hapus tugas "${a?.judul}"?`, () => {
          DB.assignments.delete(id);
          showToast('Tugas dihapus.', 'success');
          renderContent();
        });
      }
    });
  }

  return { render, init };
})();
