'use strict';

window.PayrollModule = (function () {
  let filterMonth = 5;
  let filterYear = 2026;
  let currentPage = 1;

  function render() {
    const session = Auth.getSession();
    const isHR = ['superadmin','hrmanager'].includes(session.role);
    return isHR ? renderHRView() : renderEmployeeView(session);
  }

  function renderHRView() {
    const payrolls = DB.payroll.getByMonth(filterMonth, filterYear);
    const totalNet = payrolls.reduce((s, p) => s + p.netSalary, 0);
    const totalGross = payrolls.reduce((s, p) => s + p.grossSalary, 0);
    const totalDed = payrolls.reduce((s, p) => s + p.totalDeductions, 0);
    const paidCount = payrolls.filter(p => p.status === 'Dibayar').length;

    return `
    <div class="page-header">
      <div>
        <div class="page-title">Penggajian</div>
        <div class="page-subtitle">${monthName(filterMonth)} ${filterYear}</div>
      </div>
      <div class="page-actions">
        <select class="filter-select" id="pay-month">
          ${[4,5].map(m=>`<option value="${m}" ${m===filterMonth?'selected':''}>${monthName(m)} ${filterYear}</option>`).join('')}
        </select>
        ${Auth.can('mark_paid_payroll') && payrolls.some(p=>p.status==='Proses') ? `
        <button class="btn btn-success" onclick="PayrollModule.markAllPaid()">
          <i data-lucide="check-circle"></i> Tandai Semua Dibayar
        </button>` : ''}
        <button class="btn btn-secondary btn-sm" onclick="PayrollModule.exportCSV()">
          <i data-lucide="download"></i> Ekspor
        </button>
      </div>
    </div>

    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:24px;">
      <div class="stat-card"><div class="stat-icon blue"><i data-lucide="users"></i></div>
        <div><div class="stat-value">${payrolls.length}</div><div class="stat-label">Total Karyawan</div></div></div>
      <div class="stat-card"><div class="stat-icon green"><i data-lucide="wallet"></i></div>
        <div><div class="stat-value" style="font-size:17px;">${formatCurrency(totalGross)}</div><div class="stat-label">Total Gaji Bruto</div></div></div>
      <div class="stat-card"><div class="stat-icon red"><i data-lucide="minus-circle"></i></div>
        <div><div class="stat-value" style="font-size:17px;">${formatCurrency(totalDed)}</div><div class="stat-label">Total Potongan</div></div></div>
      <div class="stat-card"><div class="stat-icon teal"><i data-lucide="banknote"></i></div>
        <div><div class="stat-value" style="font-size:17px;">${formatCurrency(totalNet)}</div><div class="stat-label">Total Gaji Bersih</div>
        <div class="stat-trend">${paidCount}/${payrolls.length} sudah dibayar</div></div></div>
    </div>

    <div class="card">
      <div class="table-wrap" id="pay-table-wrap">${renderHRTable()}</div>
    </div>
    ${renderSlipModal()}`;
  }

  function renderHRTable() {
    const payrolls = DB.payroll.getByMonth(filterMonth, filterYear);
    const pag = paginate(payrolls, currentPage, 15);
    return `
    <table class="data-table">
      <thead><tr>
        <th>Karyawan</th><th>Departemen</th><th>Gaji Pokok</th><th>Tunjangan</th><th>Bruto</th><th>Potongan</th><th>Netto</th><th>Status</th><th>Aksi</th>
      </tr></thead>
      <tbody>
        ${pag.items.length ? pag.items.map(p => {
          const emp = DB.employees.getById(p.employeeId);
          const totalAllow = Object.values(p.allowances).reduce((a,b)=>a+b,0);
          return `<tr>
            <td><div class="table-name-cell">${avatarHtml(emp?emp.name:'?',28)}
              <div class="name">${escapeHtml(emp?emp.name:'-')}</div>
            </div></td>
            <td style="font-size:12px;color:var(--text-muted);">${escapeHtml(getDeptName(emp?emp.department:''))}</td>
            <td>${formatCurrency(p.basicSalary)}</td>
            <td>${formatCurrency(totalAllow)}</td>
            <td style="font-weight:600;">${formatCurrency(p.grossSalary)}</td>
            <td style="color:var(--danger);">${formatCurrency(p.totalDeductions)}</td>
            <td style="font-weight:700;color:var(--primary);">${formatCurrency(p.netSalary)}</td>
            <td>${badge(p.status)}</td>
            <td>
              <button class="btn btn-ghost btn-sm btn-icon" onclick="PayrollModule.viewSlip('${p.id}')" title="Lihat Slip">
                <i data-lucide="file-text"></i>
              </button>
            </td>
          </tr>`;
        }).join('') : `<tr><td colspan="9"><div class="empty-state" style="padding:32px;"><p>Tidak ada data penggajian</p></div></td></tr>`}
      </tbody>
    </table>
    ${paginationHtml(pag, (p) => `PayrollModule.goPage(${p})`)}`;
  }

  function renderEmployeeView(session) {
    const myPayrolls = DB.payroll.getByEmployee(session.id)
      .sort((a,b) => b.year !== a.year ? b.year - a.year : b.month - a.month);

    return `
    <div class="page-header">
      <div>
        <div class="page-title">Slip Gaji</div>
        <div class="page-subtitle">Riwayat penggajian Anda</div>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Periode</th><th>Gaji Pokok</th><th>Total Tunjangan</th><th>Total Potongan</th><th>Gaji Bersih</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody>
            ${myPayrolls.length ? myPayrolls.map(p => {
              const totalAllow = Object.values(p.allowances).reduce((a,b)=>a+b,0);
              return `<tr>
                <td style="font-weight:600;">${monthName(p.month)} ${p.year}</td>
                <td>${formatCurrency(p.basicSalary)}</td>
                <td>${formatCurrency(totalAllow)}</td>
                <td style="color:var(--danger);">${formatCurrency(p.totalDeductions)}</td>
                <td style="font-weight:700;color:var(--primary);">${formatCurrency(p.netSalary)}</td>
                <td>${badge(p.status)}</td>
                <td><button class="btn btn-outline btn-sm" onclick="PayrollModule.viewSlip('${p.id}')">
                  <i data-lucide="file-text"></i> Lihat Slip
                </button></td>
              </tr>`;
            }).join('') : `<tr><td colspan="7"><div class="empty-state" style="padding:32px;"><p>Belum ada data penggajian</p></div></td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
    ${renderSlipModal()}`;
  }

  function renderSlipModal() {
    return `
    <div class="modal" id="modal-slip">
      <div class="modal-box modal-md">
        <div class="modal-header">
          <div class="modal-title">Slip Gaji</div>
          <button class="modal-close" onclick="closeModal('modal-slip')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body" id="slip-content"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-slip')">Tutup</button>
          <button class="btn btn-primary" onclick="PayrollModule.printSlip()">
            <i data-lucide="printer"></i> Cetak
          </button>
        </div>
      </div>
    </div>`;
  }

  function init() {
    const el = document.getElementById('pay-month');
    if (el) el.addEventListener('change', function() {
      filterMonth = parseInt(this.value);
      currentPage = 1;
      refreshTable();
    });
    if (window.lucide) lucide.createIcons();
  }

  function refreshTable() {
    const wrap = document.getElementById('pay-table-wrap');
    if (wrap) { wrap.innerHTML = renderHRTable(); if (window.lucide) lucide.createIcons({ nodes: [wrap] }); }
  }

  function goPage(p) { currentPage = p; refreshTable(); }

  let currentPayrollId = null;

  function viewSlip(payId) {
    const p = DB.payroll.getAll().find(x => x.id === payId);
    if (!p) return;
    currentPayrollId = payId;
    const emp = DB.employees.getById(p.employeeId);
    const settings = DB.settings.get();

    const slipHtml = buildSlipHtml(p, emp, settings);
    document.getElementById('slip-content').innerHTML = slipHtml;
    openModal('modal-slip');
    if (window.lucide) lucide.createIcons();
  }

  function buildSlipHtml(p, emp, settings) {
    const totalAllow = Object.values(p.allowances).reduce((a,b)=>a+b,0);
    return `
    <div id="printable-slip">
      <div class="slip-header">
        <div class="slip-company">${escapeHtml(settings.name)}</div>
        <div style="font-size:11px;color:var(--text-muted);">${escapeHtml(settings.address)}</div>
        <div class="slip-title">SLIP GAJI KARYAWAN</div>
        <div class="slip-period">${monthName(p.month)} ${p.year} ${badge(p.status)}</div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px;padding:12px;background:var(--body-bg);border-radius:var(--radius);">
        <div>
          <div style="font-size:11.5px;color:var(--text-muted);">Nama Karyawan</div>
          <div style="font-weight:600;">${escapeHtml(emp?emp.name:'-')}</div>
        </div>
        <div>
          <div style="font-size:11.5px;color:var(--text-muted);">NIK</div>
          <div style="font-weight:600;">${escapeHtml(emp?emp.nik:'-')}</div>
        </div>
        <div>
          <div style="font-size:11.5px;color:var(--text-muted);">Departemen</div>
          <div style="font-weight:600;">${escapeHtml(getDeptName(emp?emp.department:''))}</div>
        </div>
        <div>
          <div style="font-size:11.5px;color:var(--text-muted);">Jabatan</div>
          <div style="font-weight:600;">${escapeHtml(getPosName(emp?emp.position:''))}</div>
        </div>
        <div>
          <div style="font-size:11.5px;color:var(--text-muted);">Bank / No. Rekening</div>
          <div style="font-weight:600;">${escapeHtml(emp?emp.bankName:'-')} / ${escapeHtml(emp?emp.bankAccount:'-')}</div>
        </div>
        <div>
          <div style="font-size:11.5px;color:var(--text-muted);">Tanggal Dibayar</div>
          <div style="font-weight:600;">${p.paidDate ? formatDate(p.paidDate) : '—'}</div>
        </div>
      </div>

      <table class="slip-table">
        <tr class="slip-section-head"><td colspan="2">PENGHASILAN</td></tr>
        <tr><td>Gaji Pokok</td><td>${formatCurrency(p.basicSalary)}</td></tr>
        <tr><td>Tunjangan Transport</td><td>${formatCurrency(p.allowances.transport||0)}</td></tr>
        <tr><td>Tunjangan Makan</td><td>${formatCurrency(p.allowances.meal||0)}</td></tr>
        ${p.allowances.housing ? `<tr><td>Tunjangan Perumahan</td><td>${formatCurrency(p.allowances.housing)}</td></tr>` : ''}
        ${p.allowances.position ? `<tr><td>Tunjangan Jabatan</td><td>${formatCurrency(p.allowances.position)}</td></tr>` : ''}
        ${p.overtimePay ? `<tr><td>Uang Lembur (${p.overtimeHours} jam)</td><td>${formatCurrency(p.overtimePay)}</td></tr>` : ''}
        <tr style="font-weight:700;"><td>Sub Total Penghasilan</td><td>${formatCurrency(p.grossSalary)}</td></tr>

        <tr class="slip-section-head"><td colspan="2">POTONGAN</td></tr>
        <tr><td>BPJS Kesehatan (1%)</td><td style="color:var(--danger);">- ${formatCurrency(p.deductions.bpjsKesehatan||0)}</td></tr>
        <tr><td>BPJS JHT (2%)</td><td style="color:var(--danger);">- ${formatCurrency(p.deductions.bpjsJHT||0)}</td></tr>
        <tr><td>BPJS JP (1%)</td><td style="color:var(--danger);">- ${formatCurrency(p.deductions.bpjsJP||0)}</td></tr>
        <tr><td>PPh 21 (Estimasi)</td><td style="color:var(--danger);">- ${formatCurrency(p.deductions.pph21||0)}</td></tr>
        ${p.deductions.lainnya ? `<tr><td>Potongan Lainnya</td><td style="color:var(--danger);">- ${formatCurrency(p.deductions.lainnya)}</td></tr>` : ''}
        <tr style="font-weight:700;"><td>Sub Total Potongan</td><td style="color:var(--danger);">- ${formatCurrency(p.totalDeductions)}</td></tr>

        <tr class="slip-total"><td>GAJI BERSIH</td><td>${formatCurrency(p.netSalary)}</td></tr>
      </table>

      <div style="margin-top:20px;font-size:11.5px;color:var(--text-muted);text-align:center;border-top:1px dashed var(--border);padding-top:12px;">
        Slip gaji ini diterbitkan secara elektronik oleh Sistem HRIS ${escapeHtml(settings.name)}.<br>
        Dokumen ini sah tanpa tanda tangan basah.
      </div>
    </div>`;
  }

  function printSlip() {
    const content = document.getElementById('printable-slip');
    if (!content) return;
    const session = Auth.getSession();
    const emp = DB.employees.getById(session.id);
    const p = DB.payroll.getAll().find(x => x.id === currentPayrollId);
    printSection(content.innerHTML, `Slip Gaji - ${emp?emp.name:''} - ${p?monthName(p.month)+' '+p.year:''}`);
  }

  function markAllPaid() {
    confirmDialog(`Tandai semua gaji ${monthName(filterMonth)} ${filterYear} sebagai sudah dibayar?`, () => {
      DB.payroll.markPaid(filterMonth, filterYear, todayStr());
      showToast('Semua gaji berhasil ditandai dibayar', 'success');
      App.navigate('payroll');
    });
  }

  function exportCSV() {
    const payrolls = DB.payroll.getByMonth(filterMonth, filterYear);
    const headers = ['Nama','NIK','Departemen','Gaji Pokok','Tunjangan','Bruto','BPJS Kes','BPJS JHT','BPJS JP','PPh21','Netto','Status'];
    const rows = payrolls.map(p => {
      const emp = DB.employees.getById(p.employeeId);
      const totalAllow = Object.values(p.allowances).reduce((a,b)=>a+b,0);
      return [emp?emp.name:'', emp?emp.nik:'', getDeptName(emp?emp.department:''),
        p.basicSalary, totalAllow, p.grossSalary,
        p.deductions.bpjsKesehatan||0, p.deductions.bpjsJHT||0, p.deductions.bpjsJP||0, p.deductions.pph21||0,
        p.netSalary, p.status];
    });
    const csv = [headers,...rows].map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿'+csv],{type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `penggajian-${monthName(filterMonth)}-${filterYear}.csv`; a.click();
    URL.revokeObjectURL(url);
    showToast('Data berhasil diekspor','success');
  }

  return { render, init, goPage, viewSlip, printSlip, markAllPaid, exportCSV };
})();
