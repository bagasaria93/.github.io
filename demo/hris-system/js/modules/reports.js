window.ReportsModule = (function () {
  let _activeReport = 'headcount';

  const REPORTS = [
    { id: 'headcount', label: 'Headcount & Komposisi', icon: 'users' },
    { id: 'attendance', label: 'Rekap Kehadiran', icon: 'calendar-check' },
    { id: 'payroll', label: 'Ringkasan Penggajian', icon: 'wallet' },
    { id: 'leave', label: 'Rekap Cuti', icon: 'umbrella' },
    { id: 'turnover', label: 'Turnover & Rekrutmen', icon: 'trending-up' },
  ];

  // ── render ──────────────────────────────────────────────────
  function render() {
    return `
<div class="page-header">
  <div>
    <h1 class="page-title">Laporan & Analitik</h1>
    <p class="page-subtitle">Laporan SDM dan analitik data perusahaan</p>
  </div>
</div>

<div style="display:grid;grid-template-columns:220px 1fr;gap:20px;align-items:start">
  <div class="card" style="padding:8px">
    ${REPORTS.map(r => `
    <button id="report-tab-${r.id}" onclick="ReportsModule.setReport('${r.id}')"
      style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;border:none;cursor:pointer;font-size:13px;text-align:left;transition:all .15s;background:transparent;color:var(--text-secondary)">
      <i data-lucide="${r.icon}" style="width:16px;height:16px;flex-shrink:0"></i>
      ${r.label}
    </button>`).join('')}
  </div>
  <div id="report-content"></div>
</div>`;
  }

  // ── init ─────────────────────────────────────────────────────
  function init() {
    lucide.createIcons();
    setReport(_activeReport);
  }

  function setReport(id) {
    _activeReport = id;
    REPORTS.forEach(r => {
      const btn = document.getElementById(`report-tab-${r.id}`);
      if (btn) {
        btn.style.background = r.id === id ? 'var(--primary)' : 'transparent';
        btn.style.color = r.id === id ? '#fff' : 'var(--text-secondary)';
        btn.style.fontWeight = r.id === id ? '600' : '400';
      }
    });

    const el = document.getElementById('report-content');
    if (!el) return;

    destroyAllCharts();
    const renderers = {
      headcount: _renderHeadcount,
      attendance: _renderAttendance,
      payroll: _renderPayroll,
      leave: _renderLeave,
      turnover: _renderTurnover,
    };
    if (renderers[id]) renderers[id](el);
    lucide.createIcons();
  }

  // ── Headcount ─────────────────────────────────────────────────
  function _renderHeadcount(el) {
    const employees = DB.employees.getAll();
    const active = employees.filter(e => e.status === 'Aktif');
    const departments = DB.departments.getAll();

    const byDept = departments.map(d => ({
      name: d.name, count: active.filter(e => e.department === d.id).length,
    })).filter(x => x.count > 0).sort((a, b) => b.count - a.count);

    const byType = [
      { label: 'Tetap', count: active.filter(e => e.employeeType === 'Tetap').length },
      { label: 'Kontrak', count: active.filter(e => e.employeeType === 'Kontrak').length },
      { label: 'Magang', count: active.filter(e => e.employeeType === 'Magang').length },
    ];

    const byGender = [
      { label: 'Laki-laki', count: active.filter(e => e.gender === 'L').length },
      { label: 'Perempuan', count: active.filter(e => e.gender === 'P').length },
    ];

    const today = new Date();
    const avgAge = active.length ? Math.round(active.reduce((s, e) => s + (today.getFullYear() - new Date(e.birthDate).getFullYear()), 0) / active.length) : 0;
    const avgTenure = active.length ? (active.reduce((s, e) => s + ((today - new Date(e.joinDate)) / (365.25 * 24 * 3600 * 1000)), 0) / active.length).toFixed(1) : 0;

    el.innerHTML = `
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
  ${_kpi('Total Karyawan', employees.length, 'users', 'teal')}
  ${_kpi('Karyawan Aktif', active.length, 'user-check', 'green')}
  ${_kpi('Rata-rata Usia', `${avgAge} thn`, 'calendar', 'blue')}
  ${_kpi('Rata-rata Masa Kerja', `${avgTenure} thn`, 'clock', 'orange')}
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
  <div class="card">
    <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Karyawan per Departemen</h3>
    <canvas id="chart-dept" height="220"></canvas>
  </div>
  <div class="card">
    <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Jenis Kepegawaian & Gender</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <canvas id="chart-type" height="180"></canvas>
      <canvas id="chart-gender" height="180"></canvas>
    </div>
  </div>
</div>
<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <h3 style="font-size:14px;font-weight:600">Detail Per Departemen</h3>
    <button class="btn-outline btn-sm" onclick="ReportsModule.exportHeadcount()"><i data-lucide="download" style="width:14px;height:14px;margin-right:4px"></i>Export CSV</button>
  </div>
  <table class="data-table">
    <thead><tr><th>Departemen</th><th>Aktif</th><th>Tetap</th><th>Kontrak</th><th>Magang</th><th>Lk</th><th>Pr</th></tr></thead>
    <tbody>
    ${departments.map(d => {
      const demps = active.filter(e => e.department === d.id);
      return `<tr>
        <td style="font-weight:500">${escapeHtml(d.name)}</td>
        <td>${demps.length}</td>
        <td>${demps.filter(e => e.employeeType === 'Tetap').length}</td>
        <td>${demps.filter(e => e.employeeType === 'Kontrak').length}</td>
        <td>${demps.filter(e => e.employeeType === 'Magang').length}</td>
        <td>${demps.filter(e => e.gender === 'L').length}</td>
        <td>${demps.filter(e => e.gender === 'P').length}</td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>
</div>`;

    _drawChart('chart-dept', 'bar', byDept.map(x => x.name), byDept.map(x => x.count), { label: 'Karyawan' });
    _drawDoughnut('chart-type', byType.map(x => x.label), byType.map(x => x.count));
    _drawDoughnut('chart-gender', byGender.map(x => x.label), byGender.map(x => x.count), ['#0891B2', '#7C3AED']);
    lucide.createIcons();
  }

  function exportHeadcount() {
    const employees = DB.employees.getAll();
    const rows = [['ID', 'Nama', 'Departemen', 'Jabatan', 'Jenis', 'Gender', 'Status', 'Tanggal Bergabung']];
    employees.forEach(e => rows.push([
      e.id, e.name, getDeptName(e.department), getPosName(e.position),
      e.employeeType, e.gender, e.status, e.joinDate,
    ]));
    _downloadCsv(rows, 'headcount_report.csv');
  }

  // ── Attendance report ─────────────────────────────────────────
  function _renderAttendance(el) {
    const allAtt = DB.attendance.getAll();
    const months = [
      { label: 'April 2026', month: 4, year: 2026 },
      { label: 'Mei 2026', month: 5, year: 2026 },
    ];
    const employees = DB.employees.getActive();

    el.innerHTML = `
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
  ${months.map(m => {
    const recs = allAtt.filter(a => a.month === m.month && a.year === m.year);
    const hadir = recs.filter(a => a.status === 'Hadir' || a.status === 'WFH').length;
    const pct = recs.length ? Math.round((hadir / recs.length) * 100) : 0;
    return _kpi(`Kehadiran ${m.label}`, `${pct}%`, 'calendar-check', 'teal');
  }).join('')}
  ${_kpi('Total Hari Kerja', new Set(allAtt.map(a => a.date)).size, 'calendar', 'blue')}
  ${_kpi('Rata-rata Kehadiran', (() => {
    const recs = allAtt;
    const hadir = recs.filter(a => ['Hadir','WFH','Telat'].includes(a.status)).length;
    return recs.length ? `${Math.round((hadir / recs.length) * 100)}%` : '0%';
  })(), 'trending-up', 'green')}
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
  <div class="card">
    <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Distribusi Status Kehadiran — Mei 2026</h3>
    <canvas id="chart-att-status" height="220"></canvas>
  </div>
  <div class="card">
    <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Kehadiran per Departemen — Mei 2026</h3>
    <canvas id="chart-att-dept" height="220"></canvas>
  </div>
</div>
<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <h3 style="font-size:14px;font-weight:600">Rekap Kehadiran Karyawan — Mei 2026</h3>
    <button class="btn-outline btn-sm" onclick="ReportsModule.exportAttendance()"><i data-lucide="download" style="width:14px;height:14px;margin-right:4px"></i>Export CSV</button>
  </div>
  <table class="data-table">
    <thead><tr><th>Karyawan</th><th>Departemen</th><th>Hadir</th><th>Telat</th><th>WFH</th><th>Cuti</th><th>Sakit</th><th>Alpha</th><th>% Hadir</th></tr></thead>
    <tbody>
    ${employees.map(e => {
      const recs = allAtt.filter(a => a.employeeId === e.id && a.month === 5 && a.year === 2026);
      const counts = { Hadir: 0, Telat: 0, WFH: 0, Cuti: 0, Sakit: 0, Alpha: 0 };
      recs.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
      const presentDays = counts.Hadir + counts.Telat + counts.WFH;
      const pct = recs.length ? Math.round((presentDays / recs.length) * 100) : 0;
      return `<tr>
        <td>${avatarHtml(e.name, 26)} <span style="margin-left:6px">${escapeHtml(e.name)}</span></td>
        <td style="font-size:12px">${getDeptName(e.department)}</td>
        <td>${counts.Hadir}</td><td>${counts.Telat}</td><td>${counts.WFH}</td>
        <td>${counts.Cuti}</td><td>${counts.Sakit}</td><td>${counts.Alpha}</td>
        <td><span style="font-weight:600;color:${pct >= 90 ? 'var(--success)' : pct >= 75 ? 'var(--warning)' : 'var(--danger)'}">${pct}%</span></td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>
</div>`;

    const may = allAtt.filter(a => a.month === 5 && a.year === 2026);
    const statusLabels = ['Hadir', 'Telat', 'WFH', 'Cuti', 'Sakit', 'Alpha'];
    const statusCounts = statusLabels.map(s => may.filter(a => a.status === s).length);
    _drawDoughnut('chart-att-status', statusLabels, statusCounts, ['#10B981','#F59E0B','#3B82F6','#8B5CF6','#EF4444','#6B7280']);

    const departments = DB.departments.getAll();
    const deptAttPct = departments.map(d => {
      const emps = employees.filter(e => e.department === d.id);
      const empRecs = may.filter(a => emps.some(e => e.id === a.employeeId));
      const present = empRecs.filter(a => ['Hadir','Telat','WFH'].includes(a.status)).length;
      return { name: d.name.replace('Departemen ', ''), pct: empRecs.length ? Math.round((present / empRecs.length) * 100) : 0 };
    }).filter(x => x.pct > 0);
    _drawChart('chart-att-dept', 'bar', deptAttPct.map(x => x.name), deptAttPct.map(x => x.pct), { label: 'Kehadiran %', color: '#0891B2' });
    lucide.createIcons();
  }

  function exportAttendance() {
    const allAtt = DB.attendance.getAll();
    const employees = DB.employees.getActive();
    const rows = [['ID Karyawan', 'Nama', 'Tanggal', 'Status', 'Masuk', 'Keluar', 'Keterangan']];
    allAtt.filter(a => a.month === 5 && a.year === 2026).forEach(a => {
      const emp = employees.find(e => e.id === a.employeeId);
      rows.push([a.employeeId, emp ? emp.name : '', a.date, a.status, a.checkIn, a.checkOut, a.note]);
    });
    _downloadCsv(rows, 'rekap_kehadiran_mei2026.csv');
  }

  // ── Payroll report ────────────────────────────────────────────
  function _renderPayroll(el) {
    const payrolls = DB.payroll.getAll();
    const periods = [{ month: 4, year: 2026, label: 'April 2026' }, { month: 5, year: 2026, label: 'Mei 2026' }];

    el.innerHTML = `
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
  ${periods.map(p => {
    const recs = payrolls.filter(x => x.month === p.month && x.year === p.year);
    const total = recs.reduce((s, x) => s + x.netSalary, 0);
    return _kpi(`Total Nett ${p.label}`, formatCurrency(total), 'wallet', 'teal');
  }).join('')}
  ${_kpi('Total Gross Mei 2026', formatCurrency(payrolls.filter(p => p.month === 5 && p.year === 2026).reduce((s, x) => s + x.grossSalary, 0)), 'trending-up', 'blue')}
  ${_kpi('Total Potongan Mei 2026', formatCurrency(payrolls.filter(p => p.month === 5 && p.year === 2026).reduce((s, x) => s + x.totalDeductions, 0)), 'minus-circle', 'orange')}
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
  <div class="card">
    <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Total Penggajian per Bulan</h3>
    <canvas id="chart-pay-trend" height="220"></canvas>
  </div>
  <div class="card">
    <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Komposisi Biaya Penggajian</h3>
    <canvas id="chart-pay-comp" height="220"></canvas>
  </div>
</div>
<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <h3 style="font-size:14px;font-weight:600">Rincian Penggajian per Departemen — Mei 2026</h3>
    <button class="btn-outline btn-sm" onclick="ReportsModule.exportPayroll()"><i data-lucide="download" style="width:14px;height:14px;margin-right:4px"></i>Export CSV</button>
  </div>
  <table class="data-table">
    <thead><tr><th>Departemen</th><th>Jml Karyawan</th><th>Total Gaji Pokok</th><th>Total Tunjangan</th><th>Total Gross</th><th>Total Potongan</th><th>Total Nett</th></tr></thead>
    <tbody>
    ${DB.departments.getAll().map(d => {
      const empIds = DB.employees.getAll().filter(e => e.department === d.id).map(e => e.id);
      const recs = payrolls.filter(p => p.month === 5 && p.year === 2026 && empIds.includes(p.employeeId));
      if (!recs.length) return '';
      return `<tr>
        <td style="font-weight:500">${escapeHtml(d.name)}</td>
        <td>${recs.length}</td>
        <td>${formatCurrency(recs.reduce((s, x) => s + x.basicSalary, 0))}</td>
        <td>${formatCurrency(recs.reduce((s, x) => s + Object.values(x.allowances).reduce((a, b) => a + b, 0), 0))}</td>
        <td>${formatCurrency(recs.reduce((s, x) => s + x.grossSalary, 0))}</td>
        <td>${formatCurrency(recs.reduce((s, x) => s + x.totalDeductions, 0))}</td>
        <td style="font-weight:600">${formatCurrency(recs.reduce((s, x) => s + x.netSalary, 0))}</td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>
</div>`;

    const payLabels = periods.map(p => p.label);
    const grossData = periods.map(p => payrolls.filter(x => x.month === p.month && x.year === p.year).reduce((s, x) => s + x.grossSalary, 0));
    const netData = periods.map(p => payrolls.filter(x => x.month === p.month && x.year === p.year).reduce((s, x) => s + x.netSalary, 0));
    const payCtx = document.getElementById('chart-pay-trend');
    if (payCtx) {
      ChartRegistry['chart-pay-trend'] = new Chart(payCtx, {
        type: 'bar', data: {
          labels: payLabels,
          datasets: [
            { label: 'Gross', data: grossData, backgroundColor: '#0891B2' },
            { label: 'Nett', data: netData, backgroundColor: '#10B981' },
          ],
        },
        options: { plugins: { legend: { position: 'bottom' } }, scales: { y: { ticks: { callback: v => 'Rp ' + (v / 1e6).toFixed(0) + 'jt' } } } },
      });
    }

    const may5 = payrolls.filter(p => p.month === 5 && p.year === 2026);
    const totalGross = may5.reduce((s, x) => s + x.grossSalary, 0);
    const totalBpjsK = may5.reduce((s, x) => s + x.deductions.bpjsKesehatan, 0);
    const totalBpjsJHT = may5.reduce((s, x) => s + x.deductions.bpjsJHT, 0);
    const totalBpjsJP = may5.reduce((s, x) => s + x.deductions.bpjsJP, 0);
    const totalPPh = may5.reduce((s, x) => s + x.deductions.pph21, 0);
    const totalNet = may5.reduce((s, x) => s + x.netSalary, 0);
    _drawDoughnut('chart-pay-comp',
      ['Gaji Bersih', 'BPJS Kes', 'BPJS JHT', 'BPJS JP', 'PPh21'],
      [totalNet, totalBpjsK, totalBpjsJHT, totalBpjsJP, totalPPh],
      ['#10B981', '#0891B2', '#7C3AED', '#F59E0B', '#EF4444'],
    );
    lucide.createIcons();
  }

  function exportPayroll() {
    const payrolls = DB.payroll.getAll().filter(p => p.month === 5 && p.year === 2026);
    const rows = [['ID', 'Karyawan', 'Departemen', 'Gaji Pokok', 'Total Tunjangan', 'Gross', 'BPJS Kes', 'BPJS JHT', 'BPJS JP', 'PPh21', 'Total Potongan', 'Nett']];
    payrolls.forEach(p => {
      const emp = DB.employees.getById(p.employeeId);
      rows.push([p.id, emp ? emp.name : '', emp ? getDeptName(emp.department) : '',
        p.basicSalary, Object.values(p.allowances).reduce((a, b) => a + b, 0),
        p.grossSalary, p.deductions.bpjsKesehatan, p.deductions.bpjsJHT, p.deductions.bpjsJP, p.deductions.pph21, p.totalDeductions, p.netSalary]);
    });
    _downloadCsv(rows, 'payroll_report_mei2026.csv');
  }

  // ── Leave report ──────────────────────────────────────────────
  function _renderLeave(el) {
    const leaves = DB.leave.getAll();
    const approved = leaves.filter(l => l.status === 'Disetujui');
    const pending = leaves.filter(l => l.status === 'Menunggu');
    const rejected = leaves.filter(l => l.status === 'Ditolak');

    el.innerHTML = `
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
  ${_kpi('Total Pengajuan', leaves.length, 'inbox', 'blue')}
  ${_kpi('Disetujui', approved.length, 'check-circle', 'green')}
  ${_kpi('Menunggu', pending.length, 'clock', 'orange')}
  ${_kpi('Ditolak', rejected.length, 'x-circle', 'red')}
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
  <div class="card">
    <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Pengajuan per Jenis Cuti</h3>
    <canvas id="chart-leave-type" height="220"></canvas>
  </div>
  <div class="card">
    <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Status Pengajuan Cuti</h3>
    <canvas id="chart-leave-status" height="220"></canvas>
  </div>
</div>
<div class="card">
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
    <h3 style="font-size:14px;font-weight:600">Sisa Kuota Cuti per Karyawan — 2026</h3>
    <button class="btn-outline btn-sm" onclick="ReportsModule.exportLeave()"><i data-lucide="download" style="width:14px;height:14px;margin-right:4px"></i>Export CSV</button>
  </div>
  <table class="data-table">
    <thead><tr><th>Karyawan</th><th>Departemen</th><th>Kuota Tahunan</th><th>Terpakai</th><th>Sisa</th><th>Kuota Sakit</th><th>Sakit Terpakai</th></tr></thead>
    <tbody>
    ${DB.employees.getActive().map(e => {
      const bal = DB.leave.getBalance(e.id, 2026) || {};
      return `<tr>
        <td>${avatarHtml(e.name, 26)} <span style="margin-left:6px">${escapeHtml(e.name)}</span></td>
        <td style="font-size:12px">${getDeptName(e.department)}</td>
        <td>${bal.annual?.total || 0}</td>
        <td>${bal.annual?.used || 0}</td>
        <td style="font-weight:600;color:${((bal.annual?.total || 0) - (bal.annual?.used || 0)) > 5 ? 'var(--success)' : 'var(--warning)'}">
          ${(bal.annual?.total || 0) - (bal.annual?.used || 0)}
        </td>
        <td>${bal.sick?.total || 0}</td>
        <td>${bal.sick?.used || 0}</td>
      </tr>`;
    }).join('')}
    </tbody>
  </table>
</div>`;

    const typeCount = {};
    approved.forEach(l => { typeCount[l.type] = (typeCount[l.type] || 0) + l.days; });
    _drawDoughnut('chart-leave-type', Object.keys(typeCount), Object.values(typeCount));
    _drawDoughnut('chart-leave-status',
      ['Disetujui', 'Menunggu', 'Ditolak'],
      [approved.length, pending.length, rejected.length],
      ['#10B981', '#F59E0B', '#EF4444']);
    lucide.createIcons();
  }

  function exportLeave() {
    const leaves = DB.leave.getAll();
    const rows = [['ID', 'Karyawan', 'Jenis Cuti', 'Dari', 'Sampai', 'Hari', 'Status', 'Alasan']];
    leaves.forEach(l => {
      const emp = DB.employees.getById(l.employeeId);
      rows.push([l.id, emp ? emp.name : '', l.type, l.startDate, l.endDate, l.days, l.status, l.reason]);
    });
    _downloadCsv(rows, 'rekap_cuti_2026.csv');
  }

  // ── Turnover ──────────────────────────────────────────────────
  function _renderTurnover(el) {
    const employees = DB.employees.getAll();
    const active = employees.filter(e => e.status === 'Aktif').length;
    const resigned = employees.filter(e => e.status === 'Nonaktif').length;
    const recruitments = DB.recruitment.getAll();
    const open = recruitments.filter(r => r.status === 'Buka').length;
    const allCandidates = recruitments.flatMap(r => r.candidates || []);
    const hired = allCandidates.filter(c => c.stage === 'Hired').length;

    el.innerHTML = `
<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px">
  ${_kpi('Karyawan Aktif', active, 'users', 'green')}
  ${_kpi('Karyawan Nonaktif', resigned, 'user-x', 'red')}
  ${_kpi('Lowongan Aktif', open, 'briefcase', 'blue')}
  ${_kpi('Kandidat Diterima', hired, 'user-check', 'teal')}
</div>
<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
  <div class="card">
    <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Status Rekrutmen Aktif</h3>
    ${recruitments.filter(r => r.status === 'Buka').length ? recruitments.filter(r => r.status === 'Buka').map(r => {
      const stages = ['Applied','Screening','Interview','Offer','Hired','Rejected'];
      const stageCount = {};
      stages.forEach(s => { stageCount[s] = (r.candidates || []).filter(c => c.stage === s).length; });
      return `<div style="margin-bottom:16px">
        <p style="font-weight:600;font-size:13px;margin-bottom:6px">${escapeHtml(r.position)}</p>
        ${stages.map(s => stageCount[s] ? `<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px"><span>${s}</span><span class="badge badge-secondary">${stageCount[s]}</span></div>` : '').join('')}
      </div>`;
    }).join('') : '<p style="color:var(--text-muted);font-size:13px">Tidak ada lowongan aktif.</p>'}
  </div>
  <div class="card">
    <h3 style="font-size:14px;font-weight:600;margin-bottom:16px">Pipeline Kandidat (Total)</h3>
    <canvas id="chart-pipeline" height="220"></canvas>
  </div>
</div>`;

    const stages = ['Applied','Screening','Interview','Offer','Hired','Rejected'];
    const stageCounts = stages.map(s => allCandidates.filter(c => c.stage === s).length);
    _drawChart('chart-pipeline', 'bar', stages, stageCounts, { label: 'Kandidat' });
    lucide.createIcons();
  }

  // ── Chart helpers ─────────────────────────────────────────────
  function _drawChart(id, type, labels, data, opts = {}) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    destroyChart(id);
    ChartRegistry[id] = new Chart(ctx, {
      type, data: {
        labels,
        datasets: [{ label: opts.label || '', data, backgroundColor: opts.color || '#0D9488', borderColor: opts.color || '#0D9488', borderWidth: type === 'line' ? 2 : 0, fill: false, tension: 0.4 }],
      },
      options: { plugins: { legend: { display: !!opts.legend } }, scales: { y: { beginAtZero: true } } },
    });
  }

  function _drawDoughnut(id, labels, data, colors) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    destroyChart(id);
    const defaultColors = ['#0D9488','#0891B2','#7C3AED','#D97706','#DC2626','#059669','#6366F1','#F59E0B'];
    ChartRegistry[id] = new Chart(ctx, {
      type: 'doughnut', data: {
        labels, datasets: [{ data, backgroundColor: colors || defaultColors.slice(0, data.length), borderWidth: 2, borderColor: '#fff' }],
      },
      options: { plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, boxWidth: 12 } } }, cutout: '60%' },
    });
  }

  function _kpi(label, value, icon, color) {
    const colorMap = { teal: '#0D9488', blue: '#0891B2', green: '#10B981', orange: '#F59E0B', red: '#EF4444', purple: '#7C3AED' };
    const c = colorMap[color] || colorMap.teal;
    return `
<div class="card" style="text-align:center">
  <div style="width:40px;height:40px;border-radius:10px;background:${c}20;display:flex;align-items:center;justify-content:center;margin:0 auto 10px">
    <i data-lucide="${icon}" style="width:20px;height:20px;color:${c}"></i>
  </div>
  <p style="font-size:20px;font-weight:700;color:var(--text-primary);margin-bottom:2px">${value}</p>
  <p style="font-size:12px;color:var(--text-muted)">${label}</p>
</div>`;
  }

  function _downloadCsv(rows, filename) {
    const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  }

  return { render, init, setReport, exportHeadcount, exportAttendance, exportPayroll, exportLeave };
})();
