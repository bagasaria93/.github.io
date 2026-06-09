'use strict';

window.MaterialsModule = (function () {
  let activeCourseId = null;

  function render() {
    const session = Auth.getSession();
    const courses = DB.courses.getByDosen(session.id);
    if (!activeCourseId && courses.length) activeCourseId = courses[0].id;

    return `
    <div class="page-header">
      <div><div class="page-title">Kelola Materi</div><div class="page-subtitle">Tambah dan atur materi untuk mata kuliah Anda</div></div>
      <div class="page-actions">
        <select class="filter-select" id="mat-course-sel" style="min-width:200px;">
          ${courses.map(c => `<option value="${c.id}" ${c.id===activeCourseId?'selected':''}>${escapeHtml(c.code)} - ${escapeHtml(c.name)}</option>`).join('')}
        </select>
        <button class="btn btn-primary" id="btn-add-mat"><i data-lucide="plus"></i> Tambah Materi</button>
      </div>
    </div>
    <div class="card" id="mat-card">
      <div id="mat-list"></div>
    </div>

    <!-- Modal -->
    <div class="modal modal-md" id="modal-mat">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title" id="modal-mat-title">Tambah Materi</span>
          <button class="modal-close" onclick="closeModal('modal-mat')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="m-id">
          <div class="form-group">
            <label class="form-label required">Judul Materi</label>
            <input type="text" class="form-control" id="m-judul" placeholder="Judul materi">
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Tipe</label>
              <select class="form-control" id="m-tipe">
                <option value="pdf">PDF / Dokumen</option>
                <option value="video">Video</option>
                <option value="link">Link</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Urutan</label>
              <input type="number" class="form-control" id="m-urutan" min="1" value="1">
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">Deskripsi</label>
            <textarea class="form-control" id="m-deskripsi" rows="3" placeholder="Deskripsi isi materi..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-mat')">Batal</button>
          <button class="btn btn-primary" id="btn-save-mat"><i data-lucide="save"></i> Simpan</button>
        </div>
      </div>
    </div>`;
  }

  function renderList() {
    const list = document.getElementById('mat-list');
    if (!list || !activeCourseId) return;
    const mats = DB.materials.getByCourse(activeCourseId);
    if (!mats.length) {
      list.innerHTML = `<div class="empty-state"><i data-lucide="file-text"></i><h3>Belum ada materi</h3><p>Klik "Tambah Materi" untuk mulai menambahkan materi.</p></div>`;
      return;
    }
    const icons = { pdf: 'file-text', video: 'video', link: 'link' };
    list.innerHTML = `<div style="padding:16px;">${mats.map(m => `
      <div class="material-item">
        <div class="material-icon"><i data-lucide="${icons[m.tipe]||'file'}"></i></div>
        <div class="material-info">
          <div class="material-title">${escapeHtml(m.judul)}</div>
          <div class="material-sub">${escapeHtml(m.deskripsi?.substring(0,80))}... &mdash; <span class="badge badge-secondary" style="font-size:10px;">${m.tipe.toUpperCase()}</span></div>
        </div>
        <div class="material-actions">
          <button class="btn btn-outline btn-sm btn-edit-mat" data-id="${m.id}"><i data-lucide="pencil"></i></button>
          <button class="btn btn-danger btn-sm btn-del-mat" data-id="${m.id}"><i data-lucide="trash-2"></i></button>
        </div>
      </div>`).join('')}</div>`;
    if (window.lucide) lucide.createIcons({ nodes: [list] });
  }

  function openAdd() {
    document.getElementById('modal-mat-title').textContent = 'Tambah Materi';
    document.getElementById('m-id').value = '';
    document.getElementById('m-judul').value = '';
    document.getElementById('m-tipe').value = 'pdf';
    document.getElementById('m-deskripsi').value = '';
    const mats = DB.materials.getByCourse(activeCourseId);
    document.getElementById('m-urutan').value = mats.length + 1;
    openModal('modal-mat');
  }

  function openEdit(id) {
    const m = DB.materials.getById(id);
    if (!m) return;
    document.getElementById('modal-mat-title').textContent = 'Edit Materi';
    document.getElementById('m-id').value = m.id;
    document.getElementById('m-judul').value = m.judul;
    document.getElementById('m-tipe').value = m.tipe;
    document.getElementById('m-urutan').value = m.urutan;
    document.getElementById('m-deskripsi').value = m.deskripsi || '';
    openModal('modal-mat');
  }

  function save() {
    const id       = document.getElementById('m-id').value;
    const judul    = document.getElementById('m-judul').value.trim();
    const tipe     = document.getElementById('m-tipe').value;
    const urutan   = parseInt(document.getElementById('m-urutan').value);
    const deskripsi = document.getElementById('m-deskripsi').value.trim();
    if (!judul) { showToast('Judul wajib diisi.', 'error'); return; }
    if (id) {
      DB.materials.update(id, { judul, tipe, urutan, deskripsi });
      showToast('Materi diperbarui.', 'success');
    } else {
      DB.materials.add({ id: DB.materials.nextId(), courseId: activeCourseId, judul, tipe, urutan, deskripsi, createdAt: todayStr() });
      showToast('Materi ditambahkan.', 'success');
    }
    closeModal('modal-mat');
    renderList();
  }

  function init() {
    renderList();
    document.getElementById('btn-add-mat')?.addEventListener('click', openAdd);
    document.getElementById('btn-save-mat')?.addEventListener('click', save);
    document.getElementById('mat-course-sel')?.addEventListener('change', e => {
      activeCourseId = e.target.value;
      renderList();
    });
    document.addEventListener('click', function(e) {
      if (e.target.closest('.btn-edit-mat')) openEdit(e.target.closest('.btn-edit-mat').dataset.id);
      if (e.target.closest('.btn-del-mat')) {
        const id = e.target.closest('.btn-del-mat').dataset.id;
        const m  = DB.materials.getById(id);
        confirmDialog(`Hapus materi "${m?.judul}"?`, () => {
          DB.materials.delete(id);
          showToast('Materi dihapus.', 'success');
          renderList();
        });
      }
    });
  }

  return { render, init };
})();
