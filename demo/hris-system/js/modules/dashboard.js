'use strict';

window.DashboardModule = (function () {

  function render() {
    const session = Auth.getSession();
    const isHR = ['superadmin','hrmanager','hrstaff'].includes(session.role);

    if (isHR) return renderHRDashboard(session);
    return renderEmployeeDashboard(session);
  }

  function renderHRDashboard(session) {
    const employees = DB.employees.getActive();
    const pendingLeave = DB.leave.getPending();
    const openJobs = DB.recruitment.getOpen();
    const todayStr2 = todayStr();
    const todayAtt = DB.attendance.getAll().filter(a => a.date === todayStr2);
    const hadirToday = todayAtt.filter(a => ['Hadir','WFH'].includes(a.status)).length;
    const attRate = employees.length > 0 ? Math.round((hadirToday / employees.length) * 100) : 0;

    const recentLeave = DB.leave.getAll()
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

    const announcements = DB.announcements.getPublished()
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)).slice(0, 3);

    return `
    <div class="page-header">
      <div>
        <div class="page-title">Selamat Datang, ${escapeHtml(session.name.split(' ')[0])} 👋</div>
        <div class="page-subtitle">${formatDate(todayStr2, 'full')} &mdash; ${getRoleLabel(session.role)}</div>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon blue"><i data-lucide="users"></i></div>
        <div>
          <div class="stat-value">${employees.length}</div>
          <div class="stat-label">Total Karyawan Aktif</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i data-lucide="user-check"></i></div>
        <div>
          <div class="stat-value">${attRate}%</div>
          <div class="stat-label">Kehadiran Hari Ini</div>
          <div class="stat-trend">${hadirToday} dari ${employees.length} karyawan</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i data-lucide="calendar-clock"></i></div>
        <div>
          <div class="stat-value">${pendingLeave.length}</div>
          <div class="stat-label">Cuti Menunggu Approval</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><i data-lucide="briefcase"></i></div>
        <div>
          <div class="stat-value">${openJobs.length}</div>
          <div class="stat-label">Posisi Terbuka</div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid" style="margin-bottom:24px;">
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Trend Kehadiran — Mei 2026</div>
            <div class="card-subtitle">Rekapitulasi kehadiran harian minggu ini</div>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-container" style="height:220px;">
            <canvas id="chart-attendance"></canvas>
          </div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Distribusi Karyawan</div>
            <div class="card-subtitle">Per departemen</div>
          </div>
        </div>
        <div class="card-body">
          <div class="chart-container" style="height:220px;">
            <canvas id="chart-dept"></canvas>
          </div>
        </div>
      </div>
    </div>

    <div class="charts-grid" style="margin-bottom:24px;">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Pengajuan Cuti Terbaru</div>
          <a href="#/leave" class="btn btn-ghost btn-sm">Lihat Semua</a>
        </div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr>
              <th>Karyawan</th><th>Jenis</th><th>Tanggal</th><th>Status</th><th>Aksi</th>
            </tr></thead>
            <tbody>
              ${recentLeave.length ? recentLeave.map(l => {
                const emp = DB.employees.getById(l.employeeId);
                return `<tr>
                  <td><div class="table-name-cell">${avatarHtml(emp ? emp.name : '?', 30)}
                    <div><div class="name">${escapeHtml(emp ? emp.name : '-')}</div>
                    <div class="sub">${escapeHtml(getDeptName(emp ? emp.department : ''))}</div></div>
                  </div></td>
                  <td>${escapeHtml(l.type)}</td>
                  <td>${formatDate(l.startDate,'short')}</td>
                  <td>${badge(l.status)}</td>
                  <td>${l.status === 'Menunggu' ? `<button class="btn btn-sm btn-primary" onclick="DashboardModule.quickApprove('${l.id}')">Setujui</button>` : '—'}</td>
                </tr>`;
              }).join('') : `<tr><td colspan="5"><div class="empty-state" style="padding:24px;"><p>Tidak ada pengajuan cuti</p></div></td></tr>`}
            </tbody>
          </table>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Pengumuman Terbaru</div>
          <a href="#/announcements" class="btn btn-ghost btn-sm">Lihat Semua</a>
        </div>
        <div class="card-body" style="padding:0;">
          ${announcements.length ? announcements.map(a => `
            <div style="padding:14px 20px;border-bottom:1px solid var(--border);">
              <div style="display:flex;align-items:flex-start;gap:10px;">
                <div style="width:36px;height:36px;border-radius:8px;background:var(--primary-xlight);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
                  <i data-lucide="megaphone" style="width:16px;height:16px;color:var(--primary);"></i>
                </div>
                <div style="flex:1;min-width:0;">
                  <div style="font-weight:600;font-size:13.5px;">${escapeHtml(a.title)}</div>
                  <div style="font-size:12px;color:var(--text-muted);margin-top:2px;">${formatDate(a.publishDate,'short')} &bull; ${badge(a.category)}</div>
                </div>
                ${a.isPinned ? '<span title="Disematkan"><i data-lucide="pin" style="width:14px;height:14px;color:var(--primary);flex-shrink:0;"></i></span>' : ''}
              </div>
            </div>`).join('') : `<div class="empty-state" style="padding:32px;"><p>Tidak ada pengumuman</p></div>`}
        </div>
      </div>
    </div>

    <!-- Quick Stats Row -->
    <div class="card">
      <div class="card-header">
        <div class="card-title">Ringkasan Status Karyawan</div>
      </div>
      <div class="card-body">
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:16px;">
          ${renderStatusSummary()}
        </div>
      </div>
    </div>`;
  }

  function renderStatusSummary() {
    const all = DB.employees.getAll();
    const depts = DB.departments.getAll();
    return depts.map(d => {
      const count = all.filter(e => e.department === d.id && e.status === 'Aktif').length;
      return `<div style="text-align:center;padding:16px;background:var(--body-bg);border-radius:var(--radius-lg);">
        <div style="font-size:22px;font-weight:800;color:var(--primary);">${count}</div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${escapeHtml(d.name)}</div>
      </div>`;
    }).join('');
  }

  function renderEmployeeDashboard(session) {
    const user = DB.employees.getById(session.id);
    const today = todayStr();
    const todayAtt = DB.attendance.getTodayByEmployee(session.id);
    const balance = DB.leave.getBalance(session.id, 2026);
    const myPending = DB.leave.getByEmployee(session.id).filter(l => l.status === 'Menunggu');
    const announcements = DB.announcements.getPublished()
      .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate)).slice(0, 4);
    const myTrainings = DB.training.getAll().filter(t => t.participants.includes(session.id)).slice(0, 3);

    return `
    <div class="page-header">
      <div>
        <div class="page-title">Halo, ${escapeHtml(user ? user.name.split(' ')[0] : session.name)} 👋</div>
        <div class="page-subtitle">${formatDate(today, 'full')}</div>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon ${todayAtt ? (todayAtt.status === 'Hadir' || todayAtt.status === 'WFH' ? 'green' : 'orange') : 'red'}">
          <i data-lucide="clock"></i>
        </div>
        <div>
          <div class="stat-value">${todayAtt ? todayAtt.checkIn : '--:--'}</div>
          <div class="stat-label">Clock In Hari Ini</div>
          <div class="stat-trend">${todayAtt ? badge(todayAtt.status) : badge('Belum Hadir','badge-danger')}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green"><i data-lucide="calendar-check"></i></div>
        <div>
          <div class="stat-value">${balance ? balance.annual.remaining : 12}</div>
          <div class="stat-label">Sisa Cuti Tahunan</div>
          <div class="stat-trend">dari ${balance ? balance.annual.total : 12} hari</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange"><i data-lucide="clock-3"></i></div>
        <div>
          <div class="stat-value">${myPending.length}</div>
          <div class="stat-label">Cuti Menunggu</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon purple"><i data-lucide="graduation-cap"></i></div>
        <div>
          <div class="stat-value">${myTrainings.length}</div>
          <div class="stat-label">Pelatihan Saya</div>
        </div>
      </div>
    </div>

    <div class="charts-grid">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Kehadiran Bulan Ini</div>
          <a href="#/attendance" class="btn btn-ghost btn-sm">Detail</a>
        </div>
        <div class="card-body">
          <canvas id="chart-my-attendance" height="180"></canvas>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <div class="card-title">Pengumuman Terbaru</div>
        </div>
        <div style="padding:0 4px;">
          ${announcements.map(a => `
            <div style="padding:12px 16px;border-bottom:1px solid var(--border);">
              <div style="font-weight:600;font-size:13.5px;margin-bottom:3px;">${escapeHtml(a.title)}</div>
              <div style="font-size:12px;color:var(--text-muted);">${formatDate(a.publishDate,'short')}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>`;
  }

  function init() {
    const session = Auth.getSession();
    const isHR = ['superadmin','hrmanager','hrstaff'].includes(session.role);

    if (isHR) {
      initHRCharts();
    } else {
      initEmployeeCharts(session.id);
    }
  }

  function initHRCharts() {
    // Attendance trend chart (last 7 working days)
    const workingDays = [19, 20, 21, 22, 25, 26].map(d => `2026-05-${String(d).padStart(2,'0')}`);
    const labels = workingDays.map(d => formatDate(d, 'short').split(' ').slice(0,2).join(' '));
    const allAtt = DB.attendance.getAll();
    const employees = DB.employees.getActive();

    const hadirData = workingDays.map(date => {
      const dayAtt = allAtt.filter(a => a.date === date);
      return dayAtt.filter(a => ['Hadir','WFH'].includes(a.status)).length;
    });
    const telatData = workingDays.map(date => {
      return allAtt.filter(a => a.date === date && a.status === 'Telat').length;
    });
    const alphaData = workingDays.map(date => {
      return allAtt.filter(a => a.date === date && a.status === 'Alpha').length;
    });

    const ctx1 = document.getElementById('chart-attendance');
    if (ctx1) {
      ChartRegistry['attendance'] = new Chart(ctx1, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            { label: 'Hadir/WFH', data: hadirData, backgroundColor: '#0D9488', borderRadius: 4 },
            { label: 'Telat', data: telatData, backgroundColor: '#F59E0B', borderRadius: 4 },
            { label: 'Alpha', data: alphaData, backgroundColor: '#EF4444', borderRadius: 4 },
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom', labels: { font: { size: 11 }, padding: 12 } } },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { font: { size: 11 } } },
            y: { stacked: true, ticks: { stepSize: 1, font: { size: 11 } }, grid: { color: '#F1F5F9' } }
          }
        }
      });
    }

    // Department donut chart
    const depts = DB.departments.getAll();
    const activeEmps = DB.employees.getActive();
    const deptLabels = depts.map(d => d.name);
    const deptData = depts.map(d => activeEmps.filter(e => e.department === d.id).length);
    const deptColors = ['#0D9488','#3B82F6','#8B5CF6','#F59E0B','#10B981','#F97316','#EC4899'];

    const ctx2 = document.getElementById('chart-dept');
    if (ctx2) {
      ChartRegistry['dept'] = new Chart(ctx2, {
        type: 'doughnut',
        data: {
          labels: deptLabels,
          datasets: [{ data: deptData, backgroundColor: deptColors, borderWidth: 2, borderColor: '#fff' }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { font: { size: 11 }, padding: 8, boxWidth: 12 } }
          },
          cutout: '65%'
        }
      });
    }

    if (window.lucide) lucide.createIcons();
  }

  function initEmployeeCharts(empId) {
    const myAtt = DB.attendance.getByEmployeeMonth(empId, 5, 2026);
    const statusCounts = {};
    ['Hadir','Telat','Alpha','Sakit','Cuti','WFH'].forEach(s => {
      statusCounts[s] = myAtt.filter(a => a.status === s).length;
    });

    const ctx = document.getElementById('chart-my-attendance');
    if (ctx) {
      ChartRegistry['myAtt'] = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(statusCounts),
          datasets: [{
            data: Object.values(statusCounts),
            backgroundColor: ['#0D9488','#F59E0B','#EF4444','#3B82F6','#94A3B8','#8B5CF6'],
            borderWidth: 2, borderColor: '#fff'
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'right', labels: { font: { size: 11 }, padding: 8, boxWidth: 12 } }
          },
          cutout: '60%'
        }
      });
    }
    if (window.lucide) lucide.createIcons();
  }

  function quickApprove(leaveId) {
    const session = Auth.getSession();
    DB.leave.update(leaveId, { status: 'Disetujui', approvedBy: session.id, approvedDate: todayStr() });
    showToast('Cuti berhasil disetujui', 'success');
    App.navigate('dashboard');
  }

  return { render, init, quickApprove };
})();
