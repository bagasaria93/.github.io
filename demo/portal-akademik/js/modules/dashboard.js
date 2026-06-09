'use strict';

window.DashboardModule = (function () {

  function render() {
    const session = Auth.getSession();
    if (session.role === 'admin')     return renderAdmin(session);
    if (session.role === 'dosen')     return renderDosen(session);
    return renderMahasiswa(session);
  }

  function renderAdmin(session) {
    const users    = DB.users.getAll();
    const courses  = DB.courses.getAll();
    const mhs      = users.filter(u => u.role === 'mahasiswa');
    const dosen    = users.filter(u => u.role === 'dosen');
    const enroll   = DB.enrollments.getAll();
    const subs     = DB.submissions.getAll();
    const graded   = subs.filter(s => s.nilai != null);
    const avgNilai = graded.length ? Math.round(graded.reduce((a,s) => a + s.nilai, 0) / graded.length) : 0;

    return `
    <div class="page-header">
      <div>
        <div class="page-title">Selamat Datang, ${escapeHtml(session.name.split(' ')[0])} 👋</div>
        <div class="page-subtitle">${formatDate(todayStr(), 'full')} &mdash; Administrator</div>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon indigo"><i data-lucide="users"></i></div>
        <div><div class="stat-value">${users.length}</div><div class="stat-label">Total Pengguna</div><div class="stat-trend">${mhs.length} mahasiswa, ${dosen.length} dosen</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i data-lucide="book-open"></i></div>
        <div><div class="stat-value">${courses.length}</div><div class="stat-label">Mata Kuliah Aktif</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i data-lucide="user-check"></i></div>
        <div><div class="stat-value">${enroll.length}</div><div class="stat-label">Total Enrollment</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i data-lucide="star"></i></div>
        <div><div class="stat-value">${avgNilai}</div><div class="stat-label">Rata-rata Nilai</div><div class="stat-trend">dari ${graded.length} submission dinilai</div></div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="card">
        <div class="card-header"><div><div class="card-title">Distribusi Pengguna per Role</div></div></div>
        <div class="card-body"><div class="chart-container" style="height:220px;"><canvas id="chart-roles"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-header"><div><div class="card-title">Enrollment per Mata Kuliah</div></div></div>
        <div class="card-body"><div class="chart-container" style="height:220px;"><canvas id="chart-enroll"></canvas></div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Daftar Mata Kuliah</div><div class="card-subtitle">Overview semua mata kuliah aktif</div></div>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('courses')"><i data-lucide="settings"></i> Kelola</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Kode</th><th>Nama Mata Kuliah</th><th>Dosen</th><th>SKS</th><th>Mahasiswa</th></tr></thead>
          <tbody>
            ${courses.map(c => {
              const d = DB.users.getById(c.dosenId);
              const count = DB.enrollments.getByCourse(c.id).length;
              return `<tr>
                <td><span class="badge badge-indigo">${escapeHtml(c.code)}</span></td>
                <td><strong>${escapeHtml(c.name)}</strong></td>
                <td>${d ? escapeHtml(d.name) : '-'}</td>
                <td>${c.sks} SKS</td>
                <td>${count} mahasiswa</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  function renderDosen(session) {
    const courses    = DB.courses.getByDosen(session.id);
    const allAssign  = courses.flatMap(c => DB.assignments.getByCourse(c.id));
    const allSubs    = allAssign.flatMap(a => DB.submissions.getByAssignment(a.id));
    const ungraded   = allSubs.filter(s => s.nilai == null);
    const materials  = courses.flatMap(c => DB.materials.getByCourse(c.id));

    return `
    <div class="page-header">
      <div>
        <div class="page-title">Selamat Datang, ${escapeHtml(session.name.split(' ')[0])} 👋</div>
        <div class="page-subtitle">${formatDate(todayStr(), 'full')} &mdash; Dosen</div>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon indigo"><i data-lucide="book-open"></i></div>
        <div><div class="stat-value">${courses.length}</div><div class="stat-label">Mata Kuliah Diampu</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i data-lucide="file-text"></i></div>
        <div><div class="stat-value">${materials.length}</div><div class="stat-label">Total Materi</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i data-lucide="clipboard-list"></i></div>
        <div><div class="stat-value">${allAssign.length}</div><div class="stat-label">Total Tugas</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i data-lucide="clock"></i></div>
        <div><div class="stat-value">${ungraded.length}</div><div class="stat-label">Belum Dinilai</div></div>
      </div>
    </div>

    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <div><div class="card-title">Mata Kuliah Saya</div></div>
        <button class="btn btn-outline btn-sm" onclick="App.navigate('my-courses')">Lihat Semua</button>
      </div>
      <div class="course-grid" style="padding:16px;">
        ${courses.map(c => {
          const count = DB.enrollments.getByCourse(c.id).length;
          const mats  = DB.materials.getByCourse(c.id).length;
          const assig = DB.assignments.getByCourse(c.id).length;
          return `<div class="course-card" onclick="App.navigate('materials')">
            <div class="course-card-header"></div>
            <div class="course-card-body">
              <div class="course-code">${escapeHtml(c.code)}</div>
              <div class="course-name">${escapeHtml(c.name)}</div>
              <div class="course-meta">
                <div class="course-meta-item"><i data-lucide="users"></i>${count} mhs</div>
                <div class="course-meta-item"><i data-lucide="file-text"></i>${mats} materi</div>
                <div class="course-meta-item"><i data-lucide="clipboard-list"></i>${assig} tugas</div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    ${ungraded.length > 0 ? `
    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Tugas Menunggu Penilaian</div><div class="card-subtitle">${ungraded.length} submission belum dinilai</div></div>
        <button class="btn btn-primary btn-sm" onclick="App.navigate('assignments')">Nilai Sekarang</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Mahasiswa</th><th>Tugas</th><th>Mata Kuliah</th><th>Dikumpulkan</th><th>Aksi</th></tr></thead>
          <tbody>
            ${ungraded.slice(0,5).map(s => {
              const u = DB.users.getById(s.userId);
              const a = DB.assignments.getById(s.assignmentId);
              const c = a ? DB.courses.getById(a.courseId) : null;
              return `<tr>
                <td><div class="table-name-cell">${avatarHtml(u?.name,28)}<div><div class="name">${escapeHtml(u?.name)}</div><div class="sub">${escapeHtml(u?.nim)}</div></div></div></td>
                <td>${escapeHtml(a?.judul)}</td>
                <td><span class="badge badge-indigo">${escapeHtml(c?.code)}</span></td>
                <td>${formatDate(s.submittedAt)}</td>
                <td><button class="btn btn-primary btn-sm" onclick="App.navigate('assignments')">Nilai</button></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>` : ''}`;
  }

  function renderMahasiswa(session) {
    const enrollments = DB.enrollments.getByUser(session.id);
    const courses     = enrollments.map(e => DB.courses.getById(e.courseId)).filter(Boolean);
    const allAssign   = courses.flatMap(c => DB.assignments.getByCourse(c.id));
    const mySubs      = DB.submissions.getByUser(session.id);
    const submitted   = allAssign.filter(a => mySubs.some(s => s.assignmentId === a.id));
    const graded      = mySubs.filter(s => s.nilai != null);
    const avgNilai    = graded.length ? Math.round(graded.reduce((a,s) => a + s.nilai, 0) / graded.length) : null;
    const overdue     = allAssign.filter(a => isOverdue(a.deadline) && !mySubs.some(s => s.assignmentId === a.id));

    return `
    <div class="page-header">
      <div>
        <div class="page-title">Selamat Datang, ${escapeHtml(session.name.split(' ')[0])} 👋</div>
        <div class="page-subtitle">${formatDate(todayStr(), 'full')} &mdash; Mahasiswa</div>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon indigo"><i data-lucide="book-open"></i></div>
        <div><div class="stat-value">${courses.length}</div><div class="stat-label">Mata Kuliah Diambil</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i data-lucide="check-circle"></i></div>
        <div><div class="stat-value">${submitted.length}</div><div class="stat-label">Tugas Dikumpulkan</div><div class="stat-trend">dari ${allAssign.length} total tugas</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon ${avgNilai ? (avgNilai >= 70 ? 'green' : 'orange') : 'blue'}"><i data-lucide="star"></i></div>
        <div><div class="stat-value">${avgNilai ?? '-'}</div><div class="stat-label">Rata-rata Nilai</div></div>
      </div>
      ${overdue.length > 0 ? `
      <div class="stat-card">
        <div class="stat-icon red"><i data-lucide="alert-circle"></i></div>
        <div><div class="stat-value">${overdue.length}</div><div class="stat-label">Tugas Terlewat</div></div>
      </div>` : `
      <div class="stat-card">
        <div class="stat-icon purple"><i data-lucide="award"></i></div>
        <div><div class="stat-value">${graded.length}</div><div class="stat-label">Nilai Diterima</div></div>
      </div>`}
    </div>

    <div class="card" style="margin-bottom:24px;">
      <div class="card-header">
        <div><div class="card-title">Mata Kuliah Saya</div></div>
        <button class="btn btn-outline btn-sm" onclick="App.navigate('my-courses')">Lihat Semua</button>
      </div>
      <div class="course-grid" style="padding:16px;">
        ${courses.map(c => {
          const dosen = DB.users.getById(c.dosenId);
          const mats  = DB.materials.getByCourse(c.id).length;
          const assig = DB.assignments.getByCourse(c.id);
          const done  = assig.filter(a => mySubs.some(s => s.assignmentId === a.id)).length;
          return `<div class="course-card" onclick="App.navigate('my-materials')">
            <div class="course-card-header"></div>
            <div class="course-card-body">
              <div class="course-code">${escapeHtml(c.code)}</div>
              <div class="course-name">${escapeHtml(c.name)}</div>
              <div class="course-meta">
                <div class="course-meta-item"><i data-lucide="user"></i>${escapeHtml(dosen?.name?.split(',')[0] || '-')}</div>
                <div class="course-meta-item"><i data-lucide="file-text"></i>${mats} materi</div>
                <div class="course-meta-item"><i data-lucide="check"></i>${done}/${assig.length} tugas</div>
              </div>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Tugas Mendatang</div><div class="card-subtitle">Deadline terdekat</div></div>
        <button class="btn btn-outline btn-sm" onclick="App.navigate('my-assignments')">Lihat Semua</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Tugas</th><th>Mata Kuliah</th><th>Deadline</th><th>Status</th></tr></thead>
          <tbody>
            ${allAssign.sort((a,b) => new Date(a.deadline)-new Date(b.deadline)).slice(0,5).map(a => {
              const c    = DB.courses.getById(a.courseId);
              const sub  = mySubs.find(s => s.assignmentId === a.id);
              const over = isOverdue(a.deadline);
              const status = sub
                ? (sub.nilai != null ? `<span class="badge badge-success">Dinilai: ${sub.nilai}</span>` : `<span class="badge badge-info">Dikumpulkan</span>`)
                : (over ? `<span class="badge badge-danger">Terlewat</span>` : `<span class="badge badge-warning">Belum dikumpulkan</span>`);
              return `<tr>
                <td><strong>${escapeHtml(a.judul)}</strong></td>
                <td><span class="badge badge-indigo">${escapeHtml(c?.code)}</span></td>
                <td style="color:${over && !sub ? 'var(--danger)' : 'inherit'}">${formatDate(a.deadline)}</td>
                <td>${status}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  function init() {
    const session = Auth.getSession();
    if (session.role === 'admin') {
      const courses = DB.courses.getAll();
      const roleCounts = ['admin','dosen','mahasiswa'].map(r => DB.users.getByRole(r).length);
      makeChart('chart-roles', {
        type: 'doughnut',
        data: { labels: ['Admin','Dosen','Mahasiswa'], datasets: [{ data: roleCounts, backgroundColor: ['#EF4444','#4F46E5','#10B981'], borderWidth: 0 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
      });
      makeChart('chart-enroll', {
        type: 'bar',
        data: {
          labels: courses.map(c => c.code),
          datasets: [{ label: 'Mahasiswa', data: courses.map(c => DB.enrollments.getByCourse(c.id).length), backgroundColor: '#818CF8', borderRadius: 6 }]
        },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
      });
    }
  }

  return { render, init };
})();
