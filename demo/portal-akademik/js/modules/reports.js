'use strict';

window.ReportsModule = (function () {

  function render() {
    const courses = DB.courses.getAll();
    const subs    = DB.submissions.getAll().filter(s => s.nilai != null);
    const users   = DB.users.getAll();
    const mhs     = users.filter(u => u.role === 'mahasiswa');
    const enroll  = DB.enrollments.getAll();
    const avgAll  = subs.length ? Math.round(subs.reduce((a,s) => a+s.nilai, 0)/subs.length) : 0;

    const gradeDistrib = { A:0, B:0, C:0, D:0, E:0 };
    subs.forEach(s => { const g = nilaiToGrade(s.nilai); gradeDistrib[g]++; });

    return `
    <div class="page-header">
      <div><h1 class="page-title">Laporan Akademik</h1><div class="page-subtitle">Rekap data akademik seluruh sistem</div></div>
      <div class="page-actions">
        <button class="btn btn-success" id="btn-export-csv"><i data-lucide="download"></i> Export CSV</button>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon indigo"><i data-lucide="users"></i></div>
        <div><div class="stat-value">${mhs.length}</div><div class="stat-label">Total Mahasiswa</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon blue"><i data-lucide="book-open"></i></div>
        <div><div class="stat-value">${courses.length}</div><div class="stat-label">Mata Kuliah</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i data-lucide="check-circle"></i></div>
        <div><div class="stat-value">${subs.length}</div><div class="stat-label">Nilai Tercatat</div></div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i data-lucide="star"></i></div>
        <div><div class="stat-value">${avgAll}</div><div class="stat-label">Rata-rata Nilai</div></div>
      </div>
    </div>

    <div class="charts-grid" style="margin-bottom:24px;">
      <div class="card">
        <div class="card-header"><div><div class="card-title">Distribusi Grade</div></div></div>
        <div class="card-body"><div class="chart-container" style="height:220px;"><canvas id="chart-grades"></canvas></div></div>
      </div>
      <div class="card">
        <div class="card-header"><div><div class="card-title">Rata-rata Nilai per Mata Kuliah</div></div></div>
        <div class="card-body"><div class="chart-container" style="height:220px;"><canvas id="chart-avg-course"></canvas></div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div><div class="card-title">Rekap Nilai per Mahasiswa</div><div class="card-subtitle">Semua submission yang sudah dinilai</div></div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Mahasiswa</th><th>NIM</th><th>Mata Kuliah</th><th>Tugas</th><th>Nilai</th><th>Grade</th></tr></thead>
          <tbody>
            ${subs.map(s => {
              const u = DB.users.getById(s.userId);
              const a = DB.assignments.getById(s.assignmentId);
              const c = a ? DB.courses.getById(a.courseId) : null;
              return `<tr>
                <td><div class="table-name-cell">${avatarHtml(u?.name,28)}<span class="name">${escapeHtml(u?.name)}</span></div></td>
                <td>${escapeHtml(u?.nim || '-')}</td>
                <td><span class="badge badge-indigo">${escapeHtml(c?.code)}</span></td>
                <td>${escapeHtml(a?.judul)}</td>
                <td><strong style="color:var(--${nilaiColor(s.nilai)})">${s.nilai}</strong></td>
                <td>${gradeBadge(s.nilai)}</td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>`;
  }

  function init() {
    const subs = DB.submissions.getAll().filter(s => s.nilai != null);
    const courses = DB.courses.getAll();

    const gradeDistrib = { A:0, B:0, C:0, D:0, E:0 };
    subs.forEach(s => { const g = nilaiToGrade(s.nilai); gradeDistrib[g]++; });

    makeChart('chart-grades', {
      type: 'doughnut',
      data: {
        labels: ['A (>=80)', 'B (70-79)', 'C (60-69)', 'D (50-59)', 'E (<50)'],
        datasets: [{ data: Object.values(gradeDistrib), backgroundColor: ['#10B981','#3B82F6','#F59E0B','#EF4444','#94A3B8'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } } }
    });

    const avgPerCourse = courses.map(c => {
      const assigns = DB.assignments.getByCourse(c.id);
      const csubs   = assigns.flatMap(a => DB.submissions.getByAssignment(a.id)).filter(s => s.nilai != null);
      const avg     = csubs.length ? Math.round(csubs.reduce((a,s) => a+s.nilai,0)/csubs.length) : 0;
      return { code: c.code, avg };
    });
    makeChart('chart-avg-course', {
      type: 'bar',
      data: {
        labels: avgPerCourse.map(x => x.code),
        datasets: [{ label: 'Rata-rata', data: avgPerCourse.map(x => x.avg), backgroundColor: '#818CF8', borderRadius: 6 }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    document.getElementById('btn-export-csv')?.addEventListener('click', exportCsv);
  }

  function exportCsv() {
    const subs = DB.submissions.getAll().filter(s => s.nilai != null);
    const rows = [['Mahasiswa','NIM','Mata Kuliah','Kode MK','Tugas','Nilai','Grade','Feedback']];
    subs.forEach(s => {
      const u = DB.users.getById(s.userId);
      const a = DB.assignments.getById(s.assignmentId);
      const c = a ? DB.courses.getById(a.courseId) : null;
      rows.push([
        u?.name || '', u?.nim || '', c?.name || '', c?.code || '',
        a?.judul || '', s.nilai, nilaiToGrade(s.nilai), s.feedback || ''
      ]);
    });
    const csv = rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'laporan_nilai_portal_akademik.csv';
    a.click(); URL.revokeObjectURL(url);
    showToast('CSV berhasil diunduh.', 'success');
  }

  return { render, init };
})();
