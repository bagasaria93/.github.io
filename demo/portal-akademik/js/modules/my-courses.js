'use strict';

window.MyCoursesModule = (function () {

  function render() {
    const session  = Auth.getSession();
    const isDosen  = session.role === 'dosen';
    const courses  = isDosen ? DB.courses.getByDosen(session.id)
      : DB.enrollments.getByUser(session.id).map(e => DB.courses.getById(e.courseId)).filter(Boolean);
    const mySubs   = isDosen ? [] : DB.submissions.getByUser(session.id);

    if (!courses.length) {
      return `<div class="page-header"><div><div class="page-title">Mata Kuliah Saya</div></div></div>
        <div class="empty-state"><i data-lucide="book-open"></i><h3>Belum ada mata kuliah</h3><p>${isDosen ? 'Belum ada mata kuliah yang diampu.' : 'Anda belum terdaftar di mata kuliah apapun.'}</p></div>`;
    }

    return `
    <div class="page-header">
      <div>
        <div class="page-title">Mata Kuliah ${isDosen ? 'Diampu' : 'Saya'}</div>
        <div class="page-subtitle">${courses.length} mata kuliah${isDosen ? ' yang Anda ampu' : ' yang Anda ikuti'}</div>
      </div>
    </div>

    <div class="course-grid">
      ${courses.map(c => {
        const dosen   = DB.users.getById(c.dosenId);
        const mats    = DB.materials.getByCourse(c.id).length;
        const assigns = DB.assignments.getByCourse(c.id);
        const done    = isDosen ? assigns.flatMap(a => DB.submissions.getByAssignment(a.id)).filter(s => s.nilai == null).length
          : assigns.filter(a => mySubs.some(s => s.assignmentId === a.id)).length;

        return `<div class="course-card">
          <div class="course-card-header"></div>
          <div class="course-card-body">
            <div class="course-code">${escapeHtml(c.code)}</div>
            <div class="course-name">${escapeHtml(c.name)}</div>
            <p style="font-size:12.5px;color:var(--text-muted);margin-top:8px;line-height:1.5;">${escapeHtml(c.deskripsi?.substring(0,100))}...</p>
            <div class="course-meta" style="margin-top:12px;">
              ${!isDosen ? `<div class="course-meta-item"><i data-lucide="user"></i>${escapeHtml(dosen?.name?.split(',')[0] || '-')}</div>` : ''}
              <div class="course-meta-item"><i data-lucide="layers"></i>${c.sks} SKS</div>
              <div class="course-meta-item"><i data-lucide="file-text"></i>${mats} materi</div>
              <div class="course-meta-item"><i data-lucide="${isDosen ? 'clock' : 'check'}"></i>${isDosen ? `${done} belum dinilai` : `${done}/${assigns.length} tugas`}</div>
            </div>
          </div>
          <div class="course-card-footer">
            <span class="badge badge-indigo">Sem. ${c.semester}</span>
            ${isDosen
              ? `<div style="display:flex;gap:6px;">
                  <button class="btn btn-outline btn-sm" onclick="App.navigate('materials')"><i data-lucide="file-text"></i> Materi</button>
                  <button class="btn btn-primary btn-sm" onclick="App.navigate('assignments')"><i data-lucide="clipboard-list"></i> Tugas</button>
                </div>`
              : `<div style="display:flex;gap:6px;">
                  <button class="btn btn-outline btn-sm" onclick="App.navigate('my-materials')"><i data-lucide="file-text"></i> Materi</button>
                  <button class="btn btn-primary btn-sm" onclick="App.navigate('my-assignments')"><i data-lucide="clipboard-check"></i> Tugas</button>
                </div>`
            }
          </div>
        </div>`;
      }).join('')}
    </div>`;
  }

  function init() {}

  return { render, init };
})();
