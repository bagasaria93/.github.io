'use strict';

window.GradesModule = (function () {

  function render() {
    const session = Auth.getSession();
    const courses = DB.courses.getByDosen(session.id);

    return `
    <div class="page-header">
      <div><div class="page-title">Rekap Nilai</div><div class="page-subtitle">Rekap nilai mahasiswa per mata kuliah</div></div>
    </div>

    ${courses.map(c => {
      const enrollments = DB.enrollments.getByCourse(c.id);
      const assigns     = DB.assignments.getByCourse(c.id);
      const rows = enrollments.map(e => {
        const u      = DB.users.getById(e.userId);
        const subs   = assigns.map(a => {
          const s = DB.submissions.getByUserAssignment(e.userId, a.id);
          return s;
        });
        const graded = subs.filter(s => s && s.nilai != null);
        const avg    = graded.length ? Math.round(graded.reduce((acc,s) => acc+s.nilai, 0)/graded.length) : null;
        return { u, subs, graded, avg };
      });

      const gradeDistrib = { A:0, B:0, C:0, D:0, E:0 };
      rows.forEach(r => { if (r.avg != null) { const g = nilaiToGrade(r.avg); gradeDistrib[g]++; } });
      const courseAvg = rows.filter(r => r.avg != null).length
        ? Math.round(rows.filter(r => r.avg != null).reduce((a,r) => a+r.avg, 0) / rows.filter(r => r.avg != null).length)
        : null;

      return `
      <div class="card" style="margin-bottom:24px;">
        <div class="card-header">
          <div>
            <div class="card-title">${escapeHtml(c.code)} &mdash; ${escapeHtml(c.name)}</div>
            <div class="card-subtitle">${enrollments.length} mahasiswa &mdash; ${assigns.length} tugas &mdash; Rata-rata: ${courseAvg ?? '-'}</div>
          </div>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Mahasiswa</th>
                ${assigns.map(a => `<th style="min-width:120px;">${escapeHtml(a.judul.substring(0,20))}...</th>`).join('')}
                <th>Rata-rata</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
              ${rows.map(r => `
              <tr>
                <td><div class="table-name-cell">${avatarHtml(r.u?.name,28)}<div><div class="name">${escapeHtml(r.u?.name)}</div><div class="sub">${escapeHtml(r.u?.nim)}</div></div></div></td>
                ${assigns.map(a => {
                  const s = r.subs[assigns.indexOf(a)];
                  if (!s) return `<td><span class="badge badge-secondary">-</span></td>`;
                  if (s.nilai == null) return `<td><span class="badge badge-warning">Belum dinilai</span></td>`;
                  return `<td><strong style="color:var(--${nilaiColor(s.nilai)})">${s.nilai}</strong></td>`;
                }).join('')}
                <td><strong style="color:var(--${r.avg != null ? nilaiColor(r.avg) : 'text-muted'})">${r.avg ?? '-'}</strong></td>
                <td>${gradeBadge(r.avg)}</td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div class="card-footer" style="display:flex;gap:12px;flex-wrap:wrap;">
          ${Object.entries(gradeDistrib).map(([g,n]) => n > 0
            ? `<span class="badge grade-${g}" style="font-size:12px;">Grade ${g}: ${n} mhs</span>`
            : '').join('')}
        </div>
      </div>`;
    }).join('')}`;
  }

  function init() {}

  return { render, init };
})();
