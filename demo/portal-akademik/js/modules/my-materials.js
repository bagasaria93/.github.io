'use strict';

window.MyMaterialsModule = (function () {
  let activeCourseId = null;

  function render() {
    const session  = Auth.getSession();
    const enrolled = DB.enrollments.getByUser(session.id).map(e => DB.courses.getById(e.courseId)).filter(Boolean);
    if (!activeCourseId && enrolled.length) activeCourseId = enrolled[0].id;

    return `
    <div class="page-header">
      <div><div class="page-title">Materi Perkuliahan</div><div class="page-subtitle">Akses materi dari mata kuliah yang Anda ikuti</div></div>
      <div class="page-actions">
        <select class="filter-select" id="mymat-course-sel" style="min-width:220px;">
          ${enrolled.map(c => `<option value="${c.id}" ${c.id===activeCourseId?'selected':''}>${escapeHtml(c.code)} - ${escapeHtml(c.name)}</option>`).join('')}
        </select>
      </div>
    </div>
    <div id="mymat-content"></div>

    <!-- Modal Lihat Materi -->
    <div class="modal modal-md" id="modal-view-mat">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title" id="modal-mat-view-title">Detail Materi</span>
          <button class="modal-close" onclick="closeModal('modal-view-mat')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body" id="modal-mat-view-body"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-view-mat')">Tutup</button>
        </div>
      </div>
    </div>`;
  }

  function renderContent() {
    const content = document.getElementById('mymat-content');
    if (!content || !activeCourseId) return;
    const course = DB.courses.getById(activeCourseId);
    const mats   = DB.materials.getByCourse(activeCourseId);
    const dosen  = course ? DB.users.getById(course.dosenId) : null;

    if (!mats.length) {
      content.innerHTML = `<div class="empty-state"><i data-lucide="file-text"></i><h3>Belum ada materi</h3><p>Dosen belum menambahkan materi untuk mata kuliah ini.</p></div>`;
      return;
    }

    const icons = { pdf: 'file-text', video: 'video', link: 'link' };
    content.innerHTML = `
      <div class="card" style="margin-bottom:16px;">
        <div class="card-body" style="display:flex;align-items:center;gap:16px;">
          <div style="width:52px;height:52px;background:var(--primary-xlight);border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0;"><i data-lucide="book-open" style="width:24px;height:24px;color:var(--primary);"></i></div>
          <div>
            <div style="font-weight:700;font-size:16px;">${escapeHtml(course?.name)}</div>
            <div style="font-size:12.5px;color:var(--text-muted);">Dosen: ${escapeHtml(dosen?.name)} &mdash; ${mats.length} materi tersedia</div>
          </div>
        </div>
      </div>
      <div class="card">
        <div style="padding:16px;">
          ${mats.map((m, i) => `
          <div class="material-item">
            <div class="material-icon"><i data-lucide="${icons[m.tipe]||'file'}"></i></div>
            <div class="material-info">
              <div class="material-title">${i+1}. ${escapeHtml(m.judul)}</div>
              <div class="material-sub">${escapeHtml(m.deskripsi?.substring(0,90))}... &mdash; <span class="badge badge-secondary" style="font-size:10px;">${m.tipe.toUpperCase()}</span></div>
            </div>
            <div class="material-actions">
              <button class="btn btn-primary btn-sm btn-view-mat" data-id="${m.id}"><i data-lucide="eye"></i> Buka</button>
            </div>
          </div>`).join('')}
        </div>
      </div>`;
    if (window.lucide) lucide.createIcons({ nodes: [content] });
  }

  function viewMaterial(id) {
    const m = DB.materials.getById(id);
    if (!m) return;
    const icons = { pdf: 'file-text', video: 'video', link: 'link' };
    document.getElementById('modal-mat-view-title').textContent = m.judul;
    document.getElementById('modal-mat-view-body').innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;">
        <div class="material-icon"><i data-lucide="${icons[m.tipe]||'file'}"></i></div>
        <div>
          <span class="badge badge-indigo">${m.tipe.toUpperCase()}</span>
          <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">Ditambahkan: ${formatDate(m.createdAt)}</div>
        </div>
      </div>
      <div style="background:var(--body-bg);border-radius:var(--radius);padding:16px;line-height:1.7;font-size:14px;color:var(--text-secondary);">
        ${escapeHtml(m.deskripsi)}
      </div>
      <div style="margin-top:16px;padding:14px;border:2px dashed var(--border);border-radius:var(--radius);text-align:center;color:var(--text-muted);font-size:13px;">
        <i data-lucide="${icons[m.tipe]||'file'}" style="width:32px;height:32px;margin-bottom:8px;display:block;margin-left:auto;margin-right:auto;"></i>
        [Demo] File ${m.tipe.toUpperCase()} tersedia di sistem asli
      </div>`;
    if (window.lucide) lucide.createIcons({ nodes: [document.getElementById('modal-mat-view-body')] });
    openModal('modal-view-mat');
  }

  function init() {
    renderContent();
    document.getElementById('mymat-course-sel')?.addEventListener('change', e => {
      activeCourseId = e.target.value;
      renderContent();
    });
    document.addEventListener('click', function(e) {
      if (e.target.closest('.btn-view-mat')) viewMaterial(e.target.closest('.btn-view-mat').dataset.id);
    });
  }

  return { render, init };
})();
