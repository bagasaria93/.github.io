window.SettingsModule = (function () {
  let _activeTab = 'company';

  const TABS = [
    { id: 'company', label: 'Profil Perusahaan', icon: 'building-2' },
    { id: 'workpolicy', label: 'Kebijakan Kerja', icon: 'clock' },
    { id: 'bpjs', label: 'Iuran BPJS', icon: 'shield' },
    { id: 'account', label: 'Akun Saya', icon: 'user-cog' },
    { id: 'system', label: 'Sistem', icon: 'settings' },
  ];

  // ── render ──────────────────────────────────────────────────
  function render() {
    const isAdmin = Auth.can('edit_settings');
    const tabs = isAdmin ? TABS : TABS.filter(t => t.id === 'account');
    const defaultTab = isAdmin ? 'company' : 'account';
    _activeTab = defaultTab;

    return `
<div class="page-header">
  <div>
    <h1 class="page-title">Pengaturan</h1>
    <p class="page-subtitle">Konfigurasi sistem dan preferensi pengguna</p>
  </div>
</div>

<div style="display:grid;grid-template-columns:220px 1fr;gap:20px;align-items:start">
  <div class="card" style="padding:8px">
    ${tabs.map(t => `
    <button id="settings-tab-${t.id}" onclick="SettingsModule.setTab('${t.id}')"
      style="width:100%;display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:8px;border:none;cursor:pointer;font-size:13px;text-align:left;transition:all .15s;background:transparent;color:var(--text-secondary)">
      <i data-lucide="${t.icon}" style="width:16px;height:16px;flex-shrink:0"></i>
      ${t.label}
    </button>`).join('')}
  </div>
  <div id="settings-content"></div>
</div>`;
  }

  // ── init ─────────────────────────────────────────────────────
  function init() {
    lucide.createIcons();
    const isAdmin = Auth.can('edit_settings');
    setTab(isAdmin ? 'company' : 'account');
  }

  function setTab(id) {
    _activeTab = id;
    TABS.forEach(t => {
      const btn = document.getElementById(`settings-tab-${t.id}`);
      if (btn) {
        btn.style.background = t.id === id ? 'var(--primary)' : 'transparent';
        btn.style.color = t.id === id ? '#fff' : 'var(--text-secondary)';
        btn.style.fontWeight = t.id === id ? '600' : '400';
      }
    });
    const el = document.getElementById('settings-content');
    if (!el) return;

    const renderers = {
      company: _renderCompany, workpolicy: _renderWorkPolicy,
      bpjs: _renderBpjs, account: _renderAccount, system: _renderSystem,
    };
    if (renderers[id]) renderers[id](el);
    lucide.createIcons();
  }

  // ── Company ───────────────────────────────────────────────────
  function _renderCompany(el) {
    const s = DB.settings.get();
    el.innerHTML = `
<div class="card" style="padding:20px">
  <h3 style="font-size:15px;font-weight:600;margin-bottom:20px">Profil Perusahaan</h3>
  <form id="form-company">
    <div class="form-row">
      <div class="form-group required">
        <label class="form-label">Nama Perusahaan</label>
        <input type="text" name="name" class="form-control" value="${escapeHtml(s.name)}">
      </div>
      <div class="form-group">
        <label class="form-label">Nama Singkat</label>
        <input type="text" name="shortName" class="form-control" value="${escapeHtml(s.shortName || '')}">
      </div>
    </div>
    <div class="form-group">
      <label class="form-label">Alamat</label>
      <textarea name="address" class="form-control" rows="2">${escapeHtml(s.address || '')}</textarea>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Nomor Telepon</label>
        <input type="text" name="phone" class="form-control" value="${escapeHtml(s.phone || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Fax</label>
        <input type="text" name="fax" class="form-control" value="${escapeHtml(s.fax || '')}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">Email Perusahaan</label>
        <input type="email" name="email" class="form-control" value="${escapeHtml(s.email || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Website</label>
        <input type="text" name="website" class="form-control" value="${escapeHtml(s.website || '')}">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label class="form-label">NPWP</label>
        <input type="text" name="npwp" class="form-control" value="${escapeHtml(s.npwp || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Industri</label>
        <input type="text" name="industry" class="form-control" value="${escapeHtml(s.industry || '')}">
      </div>
      <div class="form-group">
        <label class="form-label">Tahun Berdiri</label>
        <input type="number" name="foundedYear" class="form-control" value="${s.foundedYear || ''}">
      </div>
    </div>
  </form>
  <div style="display:flex;justify-content:flex-end;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
    <button class="btn btn-primary" onclick="SettingsModule.saveCompany()">Simpan Perubahan</button>
  </div>
</div>`;
  }

  function saveCompany() {
    if (!validateRequired('form-company', ['name'])) return;
    const data = getFormData('form-company');
    DB.settings.update({ name: data.name, shortName: data.shortName, address: data.address, phone: data.phone, fax: data.fax, email: data.email, website: data.website, npwp: data.npwp, industry: data.industry, foundedYear: parseInt(data.foundedYear) || 0 });
    showToast('Profil perusahaan berhasil disimpan', 'success');
  }

  // ── Work Policy ───────────────────────────────────────────────
  function _renderWorkPolicy(el) {
    const s = DB.settings.get();
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    el.innerHTML = `
<div class="card" style="padding:20px">
  <h3 style="font-size:15px;font-weight:600;margin-bottom:20px">Kebijakan Jam & Hari Kerja</h3>
  <div class="form-group">
    <label class="form-label">Hari Kerja</label>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      ${days.map(d => `
      <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:13px">
        <input type="checkbox" id="wd-${d}" ${(s.workDays || []).includes(d) ? 'checked' : ''} style="width:15px;height:15px">
        ${d}
      </label>`).join('')}
    </div>
  </div>
  <div class="form-row" style="margin-top:16px">
    <div class="form-group">
      <label class="form-label">Jam Masuk</label>
      <input type="time" id="wp-start" class="form-control" value="${s.workHourStart || '08:00'}">
    </div>
    <div class="form-group">
      <label class="form-label">Jam Pulang</label>
      <input type="time" id="wp-end" class="form-control" value="${s.workHourEnd || '17:00'}">
    </div>
    <div class="form-group">
      <label class="form-label">Toleransi Keterlambatan (menit)</label>
      <input type="number" id="wp-late" class="form-control" value="${s.lateToleranceMinutes || 15}" min="0" max="60">
    </div>
  </div>
  <div style="display:flex;justify-content:flex-end;margin-top:20px;padding-top:16px;border-top:1px solid var(--border)">
    <button class="btn btn-primary" onclick="SettingsModule.saveWorkPolicy()">Simpan</button>
  </div>
</div>`;
  }

  function saveWorkPolicy() {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
    const workDays = days.filter(d => document.getElementById(`wd-${d}`)?.checked);
    const workHourStart = document.getElementById('wp-start')?.value;
    const workHourEnd = document.getElementById('wp-end')?.value;
    const lateToleranceMinutes = parseInt(document.getElementById('wp-late')?.value) || 15;
    if (!workDays.length) { showToast('Pilih minimal 1 hari kerja', 'error'); return; }
    DB.settings.update({ workDays, workHourStart, workHourEnd, lateToleranceMinutes });
    showToast('Kebijakan kerja berhasil disimpan', 'success');
  }

  // ── BPJS ─────────────────────────────────────────────────────
  function _renderBpjs(el) {
    const s = DB.settings.get();
    const bk = s.bpjsKesehatan || { employee: 0.01, employer: 0.04 };
    const jht = s.bpjsJHT || { employee: 0.02, employer: 0.037 };
    const jp = s.bpjsJP || { employee: 0.01, employer: 0.02 };
    const jkk = s.bpjsJKK || { employer: 0.0024 };
    const jkm = s.bpjsJKM || { employer: 0.003 };

    el.innerHTML = `
<div class="card" style="padding:20px">
  <h3 style="font-size:15px;font-weight:600;margin-bottom:4px">Konfigurasi Iuran BPJS</h3>
  <p style="font-size:12px;color:var(--text-muted);margin-bottom:20px">Isi dalam persentase desimal (contoh: 1% = 0.01)</p>
  <table class="data-table" style="margin-bottom:24px">
    <thead><tr><th>Jenis BPJS</th><th>Karyawan (%)</th><th>Perusahaan (%)</th></tr></thead>
    <tbody>
      <tr>
        <td style="font-weight:500">BPJS Kesehatan</td>
        <td><input type="number" id="bk-emp" class="form-control" value="${(bk.employee * 100).toFixed(2)}" min="0" max="100" step="0.01" style="width:100px"></td>
        <td><input type="number" id="bk-er" class="form-control" value="${(bk.employer * 100).toFixed(2)}" min="0" max="100" step="0.01" style="width:100px"></td>
      </tr>
      <tr>
        <td style="font-weight:500">BPJS JHT</td>
        <td><input type="number" id="jht-emp" class="form-control" value="${(jht.employee * 100).toFixed(2)}" min="0" max="100" step="0.01" style="width:100px"></td>
        <td><input type="number" id="jht-er" class="form-control" value="${(jht.employer * 100).toFixed(2)}" min="0" max="100" step="0.01" style="width:100px"></td>
      </tr>
      <tr>
        <td style="font-weight:500">BPJS JP (Pensiun)</td>
        <td><input type="number" id="jp-emp" class="form-control" value="${(jp.employee * 100).toFixed(2)}" min="0" max="100" step="0.01" style="width:100px"></td>
        <td><input type="number" id="jp-er" class="form-control" value="${(jp.employer * 100).toFixed(2)}" min="0" max="100" step="0.01" style="width:100px"></td>
      </tr>
      <tr>
        <td style="font-weight:500">BPJS JKK</td>
        <td><span style="color:var(--text-muted);font-size:12px">Tidak ada</span></td>
        <td><input type="number" id="jkk-er" class="form-control" value="${(jkk.employer * 100).toFixed(3)}" min="0" max="100" step="0.001" style="width:100px"></td>
      </tr>
      <tr>
        <td style="font-weight:500">BPJS JKM</td>
        <td><span style="color:var(--text-muted);font-size:12px">Tidak ada</span></td>
        <td><input type="number" id="jkm-er" class="form-control" value="${(jkm.employer * 100).toFixed(3)}" min="0" max="100" step="0.001" style="width:100px"></td>
      </tr>
    </tbody>
  </table>
  <div style="background:#F1F5F9;border-radius:8px;padding:12px 16px;font-size:12px;color:var(--text-muted);margin-bottom:20px">
    <strong style="color:var(--text-secondary)">Info:</strong> Perubahan tarif iuran tidak akan mempengaruhi data payroll yang sudah ada. Hanya berlaku untuk kalkulasi baru.
  </div>
  <div style="display:flex;justify-content:flex-end">
    <button class="btn btn-primary" onclick="SettingsModule.saveBpjs()">Simpan Tarif BPJS</button>
  </div>
</div>`;
  }

  function saveBpjs() {
    const g = id => parseFloat(document.getElementById(id)?.value || 0) / 100;
    DB.settings.update({
      bpjsKesehatan: { employee: g('bk-emp'), employer: g('bk-er') },
      bpjsJHT: { employee: g('jht-emp'), employer: g('jht-er') },
      bpjsJP: { employee: g('jp-emp'), employer: g('jp-er') },
      bpjsJKK: { employer: g('jkk-er') },
      bpjsJKM: { employer: g('jkm-er') },
    });
    showToast('Tarif BPJS berhasil disimpan', 'success');
  }

  // ── Account ───────────────────────────────────────────────────
  function _renderAccount(el) {
    const user = Auth.getUser();
    if (!user) { el.innerHTML = '<div class="empty-state"><p>Sesi tidak ditemukan. Silakan login ulang.</p></div>'; return; }
    const emp = DB.employees.getById(user.id);
    if (!emp) { el.innerHTML = '<div class="empty-state"><p>Data akun tidak ditemukan.</p></div>'; return; }

    el.innerHTML = `
<div style="display:flex;flex-direction:column;gap:16px">
  <div class="card" style="padding:20px">
    <h3 style="font-size:15px;font-weight:600;margin-bottom:20px">Informasi Akun</h3>
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--border)">
      ${avatarHtml(emp.name, 64, 'style="font-size:24px"')}
      <div>
        <h2 style="font-size:18px;font-weight:700;margin-bottom:2px">${escapeHtml(emp.name)}</h2>
        <p style="font-size:13px;color:var(--text-muted)">${getPosName(emp.position)} · ${getDeptName(emp.department)}</p>
        <p style="font-size:12px;color:var(--text-muted);margin-top:2px">${escapeHtml(emp.email)}</p>
        <span class="badge badge-info" style="margin-top:6px;font-size:11px">${getRoleLabel(user.role)}</span>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
      ${_infoRow('ID Karyawan', emp.id)}
      ${_infoRow('No. HP', emp.phone)}
      ${_infoRow('Status', emp.status)}
      ${_infoRow('Jenis Kepegawaian', emp.employeeType)}
      ${_infoRow('Tanggal Bergabung', formatDate(emp.joinDate, 'long'))}
      ${_infoRow('NIK', emp.nik || '-')}
    </div>
  </div>

  <div class="card" style="padding:20px">
    <h3 style="font-size:15px;font-weight:600;margin-bottom:20px">Ganti Password</h3>
    <div style="max-width:400px">
      <div class="form-group">
        <label class="form-label">Password Saat Ini</label>
        <input type="password" id="acc-old-pw" class="form-control" placeholder="••••••••">
      </div>
      <div class="form-group">
        <label class="form-label">Password Baru</label>
        <input type="password" id="acc-new-pw" class="form-control" placeholder="Minimal 8 karakter">
      </div>
      <div class="form-group">
        <label class="form-label">Konfirmasi Password Baru</label>
        <input type="password" id="acc-confirm-pw" class="form-control" placeholder="Ulangi password baru">
      </div>
      <button class="btn btn-primary" onclick="SettingsModule.changePassword()">Ganti Password</button>
    </div>
  </div>
</div>`;
  }

  function changePassword() {
    const oldPw = document.getElementById('acc-old-pw')?.value || '';
    const newPw = document.getElementById('acc-new-pw')?.value || '';
    const confirmPw = document.getElementById('acc-confirm-pw')?.value || '';
    const user = Auth.getUser();
    const emp = DB.employees.getById(user.id);

    if (!emp) return;
    if (emp.password !== oldPw) { showToast('Password saat ini tidak benar', 'error'); return; }
    if (newPw.length < 8) { showToast('Password baru minimal 8 karakter', 'error'); return; }
    if (newPw !== confirmPw) { showToast('Konfirmasi password tidak cocok', 'error'); return; }

    DB.employees.update(user.id, { password: newPw });
    document.getElementById('acc-old-pw').value = '';
    document.getElementById('acc-new-pw').value = '';
    document.getElementById('acc-confirm-pw').value = '';
    showToast('Password berhasil diganti', 'success');
  }

  function _infoRow(label, value) {
    return `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
      <p style="font-size:11px;color:var(--text-muted);margin-bottom:2px">${label}</p>
      <p style="font-weight:500">${value}</p>
    </div>`;
  }

  // ── System ────────────────────────────────────────────────────
  function _renderSystem(el) {
    const employees = DB.employees.getAll();
    const storageKeys = Object.keys(localStorage).filter(k => k.startsWith('hris_cg_'));
    const storageBytes = storageKeys.reduce((s, k) => s + (localStorage.getItem(k) || '').length * 2, 0);
    const storageMb = (storageBytes / 1024 / 1024).toFixed(2);

    el.innerHTML = `
<div style="display:flex;flex-direction:column;gap:16px">
  <div class="card" style="padding:20px">
    <h3 style="font-size:15px;font-weight:600;margin-bottom:16px">Informasi Sistem</h3>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px">
      ${_infoRow('Versi Aplikasi', 'HRIS v1.0.0')}
      ${_infoRow('Total Karyawan', employees.length + ' records')}
      ${_infoRow('Data Tersimpan', `${storageMb} MB (${storageKeys.length} keys)`)}
      ${_infoRow('Browser Storage', 'localStorage (quota: ~5 MB)')}
      ${_infoRow('Sesi Login', Auth.getUser()?.email || '-')}
      ${_infoRow('Hak Akses', getRoleLabel(Auth.getUser()?.role || ''))}
    </div>
  </div>

  <div class="card" style="border:1px solid #FEE2E2;padding:20px">
    <h3 style="font-size:15px;font-weight:600;margin-bottom:8px;color:var(--danger)">Zona Berbahaya</h3>
    <p style="font-size:13px;color:var(--text-muted);margin-bottom:16px">
      Tindakan berikut bersifat permanen dan tidak dapat dibatalkan. Gunakan dengan hati-hati.
    </p>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;border:1px solid var(--border);border-radius:8px">
        <div>
          <p style="font-weight:600;font-size:13px">Reset Data Demo</p>
          <p style="font-size:12px;color:var(--text-muted)">Hapus semua data dan kembalikan ke data awal (seed). Sesi login akan tetap aktif.</p>
        </div>
        <button class="btn btn-outline btn-sm" style="border-color:var(--warning);color:var(--warning)" onclick="SettingsModule.resetData()">Reset Data</button>
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:14px;border:1px solid var(--border);border-radius:8px">
        <div>
          <p style="font-weight:600;font-size:13px">Logout & Hapus Sesi</p>
          <p style="font-size:12px;color:var(--text-muted)">Keluar dari sistem dan hapus data sesi yang tersimpan.</p>
        </div>
        <button class="btn btn-danger btn-sm" onclick="Auth.logout()">Logout</button>
      </div>
    </div>
  </div>

  <div class="card" style="padding:20px">
    <h3 style="font-size:15px;font-weight:600;margin-bottom:12px">Demo Accounts</h3>
    <table class="data-table" style="font-size:12px">
      <thead><tr><th>Email</th><th>Password</th><th>Role</th></tr></thead>
      <tbody>
        <tr><td>admin@cakrawalagemilang.co.id</td><td>Admin@123</td><td><span class="badge badge-danger">Super Admin</span></td></tr>
        <tr><td>hrmanager@cakrawalagemilang.co.id</td><td>Hrmgr@123</td><td><span class="badge badge-warning">HR Manager</span></td></tr>
        <tr><td>hrstaff@cakrawalagemilang.co.id</td><td>Hrstaff@123</td><td><span class="badge badge-info">HR Staff</span></td></tr>
        <tr><td>karyawan@cakrawalagemilang.co.id</td><td>Kary@123</td><td><span class="badge badge-secondary">Karyawan</span></td></tr>
      </tbody>
    </table>
  </div>
</div>`;
  }

  function resetData() {
    confirmDialog(
      'Reset semua data ke kondisi awal demo? Seluruh perubahan yang Anda buat akan hilang.',
      () => {
        DB.reset();
        showToast('Data berhasil direset ke kondisi awal', 'success');
        setTimeout(() => window.location.reload(), 1200);
      }
    );
  }

  return {
    render, init, setTab,
    saveCompany, saveWorkPolicy, saveBpjs, changePassword, resetData,
  };
})();
