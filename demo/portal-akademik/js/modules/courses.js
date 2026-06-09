'use strict';

window.CoursesModule = (function () {
  let activeTab = 'courses';

  function render() {
    const courses = DB.courses.getAll();
    const dosen   = DB.users.getByRole('dosen');

    return `
    <div class="page-header">
      <div><div class="page-title">Mata Kuliah & Enrollment</div><div class="page-subtitle">Kelola mata kuliah dan data mahasiswa terdaftar</div></div>
      <div class="page-actions" id="courses-actions">
        <button class="btn btn-primary" id="btn-add-course"><i data-lucide="plus"></i> Tambah Mata Kuliah</button>
      </div>
    </div>

    <div class="tabs">
      <button class="tab-btn ${activeTab==='courses'?'active':''}" data-tab="courses">Mata Kuliah</button>
      <button class="tab-btn ${activeTab==='enrollment'?'active':''}" data-tab="enrollment">Enrollment</button>
    </div>

    <div class="tab-panel ${activeTab==='courses'?'active':''}" id="tab-courses">
      <div class="card">
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Kode</th><th>Nama Mata Kuliah</th><th>Dosen</th><th>SKS</th><th>Semester</th><th>Mahasiswa</th><th>Aksi</th></tr></thead>
            <tbody>
              ${courses.map(c => {
                const d     = DB.users.getById(c.dosenId);
                const count = DB.enrollments.getByCourse(c.id).length;
                return `<tr>
                  <td><span class="badge badge-indigo">${escapeHtml(c.code)}</span></td>
                  <td><strong>${escapeHtml(c.name)}</strong><div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${escapeHtml(c.deskripsi?.substring(0,60))}...</div></td>
                  <td>${d ? escapeHtml(d.name) : '-'}</td>
                  <td>${c.sks} SKS</td>
                  <td>Sem. ${c.semester}</td>
                  <td>${count}</td>
                  <td>
                    <div style="display:flex;gap:6px;">
                      <button class="btn btn-outline btn-sm btn-edit-course" data-id="${c.id}"><i data-lucide="pencil"></i></button>
                      <button class="btn btn-danger btn-sm btn-del-course" data-id="${c.id}"><i data-lucide="trash-2"></i></button>
                    </div>
                  </td>
                </tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="tab-panel ${activeTab==='enrollment'?'active':''}" id="tab-enrollment">
      <div class="filter-bar">
        <select class="filter-select" id="enroll-course-filter" style="min-width:220px;">
          <option value="">Pilih Mata Kuliah...</option>
          ${courses.map(c => `<option value="${c.id}">${escapeHtml(c.code)} - ${escapeHtml(c.name)}</option>`).join('')}
        </select>
        <button class="btn btn-primary" id="btn-add-enroll" style="display:none;"><i data-lucide="user-plus"></i> Tambah Mahasiswa</button>
      </div>
      <div id="enroll-table-wrap">
        <div class="empty-state"><i data-lucide="book-open"></i><h3>Pilih mata kuliah</h3><p>Pilih mata kuliah di atas untuk melihat daftar mahasiswa terdaftar.</p></div>
      </div>
    </div>

    <!-- Modal Tambah/Edit Course -->
    <div class="modal modal-md" id="modal-course">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title" id="modal-course-title">Tambah Mata Kuliah</span>
          <button class="modal-close" onclick="closeModal('modal-course')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="c-id">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label required">Kode MK</label>
              <input type="text" class="form-control" id="c-code" placeholder="TI-101">
            </div>
            <div class="form-group">
              <label class="form-label required">SKS</label>
              <input type="number" class="form-control" id="c-sks" min="1" max="6" value="3">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label required">Nama Mata Kuliah</label>
            <input type="text" class="form-control" id="c-name" placeholder="Nama mata kuliah">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label required">Dosen Pengampu</label>
              <select class="form-control" id="c-dosen">
                <option value="">Pilih Dosen</option>
                ${dosen.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Semester</label>
              <input type="number" class="form-control" id="c-semester" min="1" max="8" value="1">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Deskripsi</label>
            <textarea class="form-control" id="c-deskripsi" rows="3" placeholder="Deskripsi singkat mata kuliah"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-course')">Batal</button>
          <button class="btn btn-primary" id="btn-save-course"><i data-lucide="save"></i> Simpan</button>
        </div>
      </div>
    </div>

    <!-- Modal Tambah Enrollment -->
    <div class="modal modal-sm" id="modal-enroll">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title">Tambah Mahasiswa</span>
          <button class="modal-close" onclick="closeModal('modal-enroll')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Mahasiswa</label>
            <select class="form-control" id="enroll-mhs-select"><option value="">Pilih mahasiswa...</option></select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-enroll')">Batal</button>
          <button class="btn btn-primary" id="btn-save-enroll"><i data-lucide="user-plus"></i> Daftarkan</button>
        </div>
      </div>
    </div>`;
  }

  function renderEnrollTable(courseId) {
    const wrap = document.getElementById('enroll-table-wrap');
    if (!wrap) return;
    const enrollments = DB.enrollments.getByCourse(courseId);
    const course = DB.courses.getById(courseId);
    if (!enrollments.length) {
      wrap.innerHTML = `<div class="empty-state"><i data-lucide="user-x"></i><h3>Belum ada mahasiswa terdaftar</h3><p>Klik "Tambah Mahasiswa" untuk mendaftarkan mahasiswa ke ${escapeHtml(course?.name)}.</p></div>`;
      return;
    }
    const rows = enrollments.map(e => {
      const u = DB.users.getById(e.userId);
      return `<tr>
        <td><div class="table-name-cell">${avatarHtml(u?.name,30)}<div><div class="name">${escapeHtml(u?.name)}</div><div class="sub">${escapeHtml(u?.nim)}</div></div></div></td>
        <td>${escapeHtml(u?.email)}</td>
        <td>${formatDate(e.enrolledAt)}</td>
        <td><button class="btn btn-danger btn-sm btn-remove-enroll" data-uid="${e.userId}" data-cid="${courseId}"><i data-lucide="user-minus"></i> Hapus</button></td>
      </tr>`;
    }).join('');
    wrap.innerHTML = `<div class="card"><div class="table-wrap"><table class="data-table">
      <thead><tr><th>Mahasiswa</th><th>Email</th><th>Tanggal Daftar</th><th>Aksi</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div></div>`;
    if (window.lucide) lucide.createIcons({ nodes: [wrap] });
  }

  function openAddCourse() {
    document.getElementById('modal-course-title').textContent = 'Tambah Mata Kuliah';
    document.getElementById('c-id').value = '';
    ['c-code','c-name','c-deskripsi'].forEach(id => { document.getElementById(id).value = ''; });
    document.getElementById('c-sks').value = 3;
    document.getElementById('c-semester').value = 1;
    document.getElementById('c-dosen').value = '';
    openModal('modal-course');
  }

  function openEditCourse(id) {
    const c = DB.courses.getById(id);
    if (!c) return;
    document.getElementById('modal-course-title').textContent = 'Edit Mata Kuliah';
    document.getElementById('c-id').value       = c.id;
    document.getElementById('c-code').value     = c.code;
    document.getElementById('c-name').value     = c.name;
    document.getElementById('c-sks').value      = c.sks;
    document.getElementById('c-semester').value = c.semester;
    document.getElementById('c-dosen').value    = c.dosenId;
    document.getElementById('c-deskripsi').value = c.deskripsi || '';
    openModal('modal-course');
  }

  function saveCourse() {
    const id       = document.getElementById('c-id').value;
    const code     = document.getElementById('c-code').value.trim();
    const name     = document.getElementById('c-name').value.trim();
    const sks      = parseInt(document.getElementById('c-sks').value);
    const semester = parseInt(document.getElementById('c-semester').value);
    const dosenId  = document.getElementById('c-dosen').value;
    const deskripsi = document.getElementById('c-deskripsi').value.trim();
    if (!code || !name || !dosenId) { showToast('Kode, nama, dan dosen wajib diisi.', 'error'); return; }
    if (id) {
      DB.courses.update(id, { code, name, sks, semester, dosenId, deskripsi });
      showToast('Mata kuliah diperbarui.', 'success');
    } else {
      DB.courses.add({ id: DB.courses.nextId(), code, name, sks, semester, dosenId, deskripsi, status:'aktif' });
      showToast('Mata kuliah ditambahkan.', 'success');
    }
    closeModal('modal-course');
    App.navigate('courses');
  }

  function init() {
    document.getElementById('btn-add-course')?.addEventListener('click', openAddCourse);
    document.getElementById('btn-save-course')?.addEventListener('click', saveCourse);

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeTab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));
        document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === 'tab-' + activeTab));
        document.getElementById('btn-add-course').style.display = activeTab === 'courses' ? '' : 'none';
      });
    });

    document.getElementById('enroll-course-filter')?.addEventListener('change', e => {
      const cid = e.target.value;
      const addBtn = document.getElementById('btn-add-enroll');
      if (addBtn) addBtn.style.display = cid ? '' : 'none';
      if (cid) renderEnrollTable(cid);
      else document.getElementById('enroll-table-wrap').innerHTML = `<div class="empty-state"><i data-lucide="book-open"></i><h3>Pilih mata kuliah</h3></div>`;
    });

    document.getElementById('btn-add-enroll')?.addEventListener('click', () => {
      const cid = document.getElementById('enroll-course-filter').value;
      if (!cid) return;
      const enrolled = DB.enrollments.getByCourse(cid).map(e => e.userId);
      const available = DB.users.getByRole('mahasiswa').filter(u => !enrolled.includes(u.id));
      const sel = document.getElementById('enroll-mhs-select');
      sel.innerHTML = '<option value="">Pilih mahasiswa...</option>' + available.map(u => `<option value="${u.id}">${escapeHtml(u.name)} (${u.nim})</option>`).join('');
      openModal('modal-enroll');
    });

    document.getElementById('btn-save-enroll')?.addEventListener('click', () => {
      const cid = document.getElementById('enroll-course-filter').value;
      const uid = document.getElementById('enroll-mhs-select').value;
      if (!uid) { showToast('Pilih mahasiswa terlebih dahulu.', 'error'); return; }
      DB.enrollments.add({ id: DB.enrollments.nextId(), userId: uid, courseId: cid, enrolledAt: todayStr() });
      showToast('Mahasiswa berhasil didaftarkan.', 'success');
      closeModal('modal-enroll');
      renderEnrollTable(cid);
    });

    document.addEventListener('click', function(e) {
      if (e.target.closest('.btn-edit-course')) openEditCourse(e.target.closest('.btn-edit-course').dataset.id);
      if (e.target.closest('.btn-del-course')) {
        const id = e.target.closest('.btn-del-course').dataset.id;
        const c  = DB.courses.getById(id);
        confirmDialog(`Hapus mata kuliah "${c?.name}"?`, () => {
          DB.courses.delete(id);
          showToast('Mata kuliah dihapus.', 'success');
          App.navigate('courses');
        });
      }
      if (e.target.closest('.btn-remove-enroll')) {
        const btn = e.target.closest('.btn-remove-enroll');
        confirmDialog('Hapus mahasiswa dari mata kuliah ini?', () => {
          DB.enrollments.delete(btn.dataset.uid, btn.dataset.cid);
          showToast('Mahasiswa dihapus dari enrollment.', 'success');
          renderEnrollTable(btn.dataset.cid);
        });
      }
    });
  }

  return { render, init };
})();
