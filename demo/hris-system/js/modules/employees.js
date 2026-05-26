'use strict';

window.EmployeesModule = (function () {
  let currentPage = 1;
  let searchQuery = '';
  let filterDept = '';
  let filterStatus = '';
  let filterType = '';

  function render() {
    const canCreate = Auth.can('create_employee');
    return `
    <div class="page-header">
      <div>
        <div class="page-title">Manajemen Karyawan</div>
        <div class="page-subtitle">Kelola data seluruh karyawan perusahaan</div>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" onclick="EmployeesModule.exportCSV()">
          <i data-lucide="download"></i> Ekspor CSV
        </button>
        ${canCreate ? `<button class="btn btn-primary" onclick="EmployeesModule.openAdd()">
          <i data-lucide="user-plus"></i> Tambah Karyawan
        </button>` : ''}
      </div>
    </div>

    <div class="card">
      <div class="card-body" style="padding-bottom:0;">
        <div class="filter-bar">
          <div class="search-wrap">
            <i data-lucide="search"></i>
            <input type="text" class="search-input" id="emp-search" placeholder="Cari nama, NIK, email..." value="${escapeHtml(searchQuery)}">
          </div>
          <select class="filter-select" id="emp-dept">
            <option value="">Semua Departemen</option>
            ${DB.departments.getAll().map(d => `<option value="${d.id}" ${filterDept===d.id?'selected':''}>${escapeHtml(d.name)}</option>`).join('')}
          </select>
          <select class="filter-select" id="emp-status">
            <option value="">Semua Status</option>
            <option value="Aktif" ${filterStatus==='Aktif'?'selected':''}>Aktif</option>
            <option value="Resign" ${filterStatus==='Resign'?'selected':''}>Resign</option>
            <option value="Cuti Panjang" ${filterStatus==='Cuti Panjang'?'selected':''}>Cuti Panjang</option>
          </select>
          <select class="filter-select" id="emp-type">
            <option value="">Semua Tipe</option>
            <option value="Tetap" ${filterType==='Tetap'?'selected':''}>Tetap</option>
            <option value="Kontrak" ${filterType==='Kontrak'?'selected':''}>Kontrak</option>
            <option value="Magang" ${filterType==='Magang'?'selected':''}>Magang</option>
          </select>
        </div>
      </div>
      <div class="table-wrap" id="emp-table-wrap">
        ${renderTable()}
      </div>
    </div>

    ${renderAddEditModal()}
    ${renderDetailModal()}`;
  }

  function renderTable() {
    let data = DB.employees.getAll();

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(e => e.name.toLowerCase().includes(q) || e.nik.includes(q) || e.email.toLowerCase().includes(q) || e.loginEmail.toLowerCase().includes(q));
    }
    if (filterDept) data = data.filter(e => e.department === filterDept);
    if (filterStatus) data = data.filter(e => e.status === filterStatus);
    if (filterType) data = data.filter(e => e.employeeType === filterType);

    const pag = paginate(data, currentPage, 10);
    const canEdit = Auth.can('edit_employee');
    const canDel = Auth.can('delete_employee');

    return `
    <table class="data-table">
      <thead><tr>
        <th>#</th><th>Karyawan</th><th>Departemen</th><th>Jabatan</th><th>Tipe</th><th>Masa Kerja</th><th>Status</th><th>Aksi</th>
      </tr></thead>
      <tbody>
        ${pag.items.length ? pag.items.map((emp, i) => `
          <tr>
            <td style="color:var(--text-muted);font-size:12px;">${pag.start + i}</td>
            <td>
              <div class="table-name-cell">
                ${avatarHtml(emp.name, 34)}
                <div>
                  <div class="name">${escapeHtml(emp.name)}</div>
                  <div class="sub">${escapeHtml(emp.nik)}</div>
                </div>
              </div>
            </td>
            <td>${escapeHtml(getDeptName(emp.department))}</td>
            <td>${escapeHtml(getPosName(emp.position))}</td>
            <td>${badge(emp.employeeType)}</td>
            <td style="white-space:nowrap;">${getWorkDuration(emp.joinDate)}</td>
            <td>${badge(emp.status)}</td>
            <td>
              <div style="display:flex;gap:4px;">
                <button class="btn btn-ghost btn-sm btn-icon" onclick="EmployeesModule.openDetail('${emp.id}')" title="Detail">
                  <i data-lucide="eye"></i>
                </button>
                ${canEdit ? `<button class="btn btn-ghost btn-sm btn-icon" onclick="EmployeesModule.openEdit('${emp.id}')" title="Edit">
                  <i data-lucide="pencil"></i>
                </button>` : ''}
                ${canDel ? `<button class="btn btn-ghost btn-sm btn-icon" onclick="EmployeesModule.deleteEmp('${emp.id}')" title="Hapus" style="color:var(--danger);">
                  <i data-lucide="trash-2"></i>
                </button>` : ''}
              </div>
            </td>
          </tr>`).join('') : `<tr><td colspan="8"><div class="empty-state"><i data-lucide="users"></i><h3>Tidak ada karyawan ditemukan</h3></div></td></tr>`}
      </tbody>
    </table>
    ${paginationHtml(pag, (p) => `EmployeesModule.goPage(${p})`)}`;
  }

  function renderAddEditModal() {
    const depts = DB.departments.getAll();
    return `
    <div class="modal" id="modal-emp">
      <div class="modal-box modal-lg">
        <div class="modal-header">
          <div class="modal-title" id="modal-emp-title">Tambah Karyawan</div>
          <button class="modal-close" onclick="closeModal('modal-emp')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <form id="form-emp" novalidate>
            <input type="hidden" name="id" id="emp-id">

            <div class="form-section-title">Informasi Pribadi</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Nama Lengkap</label>
                <input type="text" name="name" class="form-control" placeholder="Nama sesuai KTP">
                <div class="field-error" id="err-name"></div>
              </div>
              <div class="form-group">
                <label class="form-label required">NIK (KTP)</label>
                <input type="text" name="nik" class="form-control" maxlength="16" placeholder="16 digit NIK">
                <div class="field-error" id="err-nik"></div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Tanggal Lahir</label>
                <input type="date" name="birthDate" class="form-control">
                <div class="field-error" id="err-birthDate"></div>
              </div>
              <div class="form-group">
                <label class="form-label">Tempat Lahir</label>
                <input type="text" name="birthPlace" class="form-control" placeholder="Kota kelahiran">
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Jenis Kelamin</label>
                <select name="gender" class="form-control">
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Agama</label>
                <select name="religion" class="form-control">
                  <option>Islam</option><option>Kristen</option><option>Katolik</option>
                  <option>Hindu</option><option>Buddha</option><option>Konghucu</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Status Pernikahan (PTKP)</label>
                <select name="maritalStatus" class="form-control">
                  <option value="TK/0">TK/0 - Tidak Kawin, 0 Tanggungan</option>
                  <option value="TK/1">TK/1 - Tidak Kawin, 1 Tanggungan</option>
                  <option value="K/0">K/0 - Kawin, 0 Tanggungan</option>
                  <option value="K/1">K/1 - Kawin, 1 Tanggungan</option>
                  <option value="K/2">K/2 - Kawin, 2 Tanggungan</option>
                  <option value="K/3">K/3 - Kawin, 3 Tanggungan</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Golongan Darah</label>
                <select name="bloodType" class="form-control">
                  <option>A</option><option>B</option><option>AB</option><option>O</option>
                </select>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Alamat</label>
              <textarea name="address" class="form-control" rows="2" placeholder="Alamat lengkap sesuai KTP"></textarea>
            </div>

            <div class="form-section-title">Informasi Pekerjaan</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Departemen</label>
                <select name="department" class="form-control" id="emp-dept-select" onchange="EmployeesModule.onDeptChange()">
                  <option value="">— Pilih Departemen —</option>
                  ${depts.map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')}
                </select>
                <div class="field-error" id="err-department"></div>
              </div>
              <div class="form-group">
                <label class="form-label required">Jabatan</label>
                <select name="position" class="form-control" id="emp-pos-select">
                  <option value="">— Pilih Jabatan —</option>
                </select>
                <div class="field-error" id="err-position"></div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Tipe Karyawan</label>
                <select name="employeeType" class="form-control">
                  <option>Tetap</option><option>Kontrak</option><option>Magang</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label required">Tanggal Bergabung</label>
                <input type="date" name="joinDate" class="form-control">
                <div class="field-error" id="err-joinDate"></div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Status</label>
                <select name="status" class="form-control">
                  <option>Aktif</option><option>Resign</option><option>Cuti Panjang</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Role Sistem</label>
                <select name="role" class="form-control">
                  <option value="employee">Karyawan</option>
                  <option value="hrstaff">HR Staff</option>
                  <option value="hrmanager">HR Manager</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>

            <div class="form-section-title">Informasi Kontak</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label required">Email Perusahaan</label>
                <input type="email" name="email" class="form-control" placeholder="nama@cakrawalagemilang.co.id">
                <div class="field-error" id="err-email"></div>
              </div>
              <div class="form-group">
                <label class="form-label required">Email Login</label>
                <input type="email" name="loginEmail" class="form-control" placeholder="Email untuk login sistem">
                <div class="field-error" id="err-loginEmail"></div>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">No. Telepon</label>
                <input type="text" name="phone" class="form-control" placeholder="081xxxxxxxxx">
              </div>
              <div class="form-group">
                <label class="form-label" id="pw-label">Password Login</label>
                <input type="password" name="password" class="form-control" placeholder="Minimal 8 karakter">
                <div class="form-hint" id="pw-hint"></div>
              </div>
            </div>

            <div class="form-section-title">Informasi Gaji & Bank</div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Gaji Pokok (Rp)</label>
                <input type="number" name="salary" class="form-control" placeholder="0" min="0">
              </div>
              <div class="form-group">
                <label class="form-label">Nama Bank</label>
                <select name="bankName" class="form-control">
                  <option>BCA</option><option>Mandiri</option><option>BNI</option>
                  <option>BRI</option><option>CIMB Niaga</option><option>BTN</option>
                  <option>Permata</option><option>Danamon</option>
                </select>
              </div>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">No. Rekening</label>
                <input type="text" name="bankAccount" class="form-control" placeholder="Nomor rekening">
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-emp')">Batal</button>
          <button class="btn btn-primary" onclick="EmployeesModule.saveEmp()">
            <i data-lucide="save"></i> Simpan
          </button>
        </div>
      </div>
    </div>`;
  }

  function renderDetailModal() {
    return `
    <div class="modal" id="modal-emp-detail">
      <div class="modal-box modal-lg">
        <div class="modal-header">
          <div class="modal-title">Detail Karyawan</div>
          <button class="modal-close" onclick="closeModal('modal-emp-detail')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body" id="modal-emp-detail-body"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-emp-detail')">Tutup</button>
          ${Auth.can('edit_employee') ? `<button class="btn btn-primary" id="detail-edit-btn">
            <i data-lucide="pencil"></i> Edit
          </button>` : ''}
        </div>
      </div>
    </div>`;
  }

  function init() {
    const search = document.getElementById('emp-search');
    if (search) {
      search.addEventListener('input', debounce(function() {
        searchQuery = this.value;
        currentPage = 1;
        refreshTable();
      }, 300));
    }

    const deptSel = document.getElementById('emp-dept');
    if (deptSel) deptSel.addEventListener('change', function() { filterDept = this.value; currentPage = 1; refreshTable(); });

    const statusSel = document.getElementById('emp-status');
    if (statusSel) statusSel.addEventListener('change', function() { filterStatus = this.value; currentPage = 1; refreshTable(); });

    const typeSel = document.getElementById('emp-type');
    if (typeSel) typeSel.addEventListener('change', function() { filterType = this.value; currentPage = 1; refreshTable(); });

    if (window.lucide) lucide.createIcons();
  }

  function refreshTable() {
    const wrap = document.getElementById('emp-table-wrap');
    if (wrap) { wrap.innerHTML = renderTable(); if (window.lucide) lucide.createIcons({ nodes: [wrap] }); }
  }

  function goPage(p) { currentPage = p; refreshTable(); }

  function onDeptChange() {
    const deptId = document.querySelector('[name="department"]')?.value;
    const posSel = document.getElementById('emp-pos-select');
    if (!posSel) return;
    const positions = deptId ? DB.positions.getByDept(deptId) : DB.positions.getAll();
    posSel.innerHTML = `<option value="">— Pilih Jabatan —</option>` +
      positions.map(p => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('');
  }

  function openAdd() {
    document.getElementById('modal-emp-title').textContent = 'Tambah Karyawan Baru';
    document.getElementById('form-emp').reset();
    document.getElementById('emp-id').value = '';
    document.getElementById('pw-label').textContent = 'Password Login';
    document.getElementById('pw-hint').textContent = 'Minimal 8 karakter';
    document.getElementById('emp-pos-select').innerHTML = '<option value="">— Pilih Jabatan —</option>';
    clearFormErrors('form-emp');
    openModal('modal-emp');
    if (window.lucide) lucide.createIcons();
  }

  function openEdit(id) {
    const emp = DB.employees.getById(id);
    if (!emp) return;
    document.getElementById('modal-emp-title').textContent = 'Edit Data Karyawan';
    document.getElementById('pw-label').textContent = 'Password Baru (kosongkan jika tidak diubah)';
    document.getElementById('pw-hint').textContent = 'Biarkan kosong jika tidak ingin mengubah password';
    clearFormErrors('form-emp');

    // Populate position options first
    const posSel = document.getElementById('emp-pos-select');
    const allPos = DB.positions.getAll();
    const deptPositions = emp.department ? DB.positions.getByDept(emp.department) : allPos;
    posSel.innerHTML = `<option value="">— Pilih Jabatan —</option>` +
      deptPositions.map(p => `<option value="${p.id}" ${p.id === emp.position ? 'selected' : ''}>${escapeHtml(p.name)}</option>`).join('');

    setFormData('form-emp', { ...emp, password: '' });
    openModal('modal-emp');
    if (window.lucide) lucide.createIcons();
  }

  function openDetail(id) {
    const emp = DB.employees.getById(id);
    if (!emp) return;
    const balance = DB.leave.getBalance(id, 2026);
    const payroll = DB.payroll.getByEmployeeMonth(id, 5, 2026);
    const body = document.getElementById('modal-emp-detail-body');

    body.innerHTML = `
      <div style="display:flex;align-items:center;gap:20px;padding-bottom:20px;border-bottom:1px solid var(--border);margin-bottom:20px;">
        ${avatarHtml(emp.name, 64)}
        <div>
          <div style="font-size:20px;font-weight:800;">${escapeHtml(emp.name)}</div>
          <div style="font-size:13px;color:var(--text-muted);margin-top:2px;">${escapeHtml(getPosName(emp.position))} &bull; ${escapeHtml(getDeptName(emp.department))}</div>
          <div style="margin-top:6px;display:flex;gap:6px;">${badge(emp.status)} ${badge(emp.employeeType)} ${badge(getRoleLabel(emp.role),'badge-info')}</div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:20px;">
        <div style="background:var(--primary-xlight);border-radius:var(--radius);padding:14px;text-align:center;">
          <div style="font-size:18px;font-weight:800;color:var(--primary);">${balance ? balance.annual.remaining : 12}</div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">Sisa Cuti Tahunan</div>
        </div>
        <div style="background:#EFF6FF;border-radius:var(--radius);padding:14px;text-align:center;">
          <div style="font-size:18px;font-weight:800;color:var(--info);">${getWorkYears(emp.joinDate)}</div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">Tahun Bekerja</div>
        </div>
        <div style="background:#F0FDF4;border-radius:var(--radius);padding:14px;text-align:center;">
          <div style="font-size:18px;font-weight:800;color:var(--success);">${formatCurrency(emp.salary)}</div>
          <div style="font-size:11.5px;color:var(--text-muted);margin-top:2px;">Gaji Pokok</div>
        </div>
      </div>

      <div class="detail-grid">
        <div class="detail-item"><div class="detail-label">NIK</div><div class="detail-value">${formatNIK(emp.nik)}</div></div>
        <div class="detail-item"><div class="detail-label">Email Perusahaan</div><div class="detail-value">${escapeHtml(emp.email)}</div></div>
        <div class="detail-item"><div class="detail-label">Tempat, Tgl Lahir</div><div class="detail-value">${escapeHtml(emp.birthPlace)}, ${formatDate(emp.birthDate)}</div></div>
        <div class="detail-item"><div class="detail-label">Usia</div><div class="detail-value">${getAge(emp.birthDate)} tahun</div></div>
        <div class="detail-item"><div class="detail-label">Jenis Kelamin</div><div class="detail-value">${emp.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</div></div>
        <div class="detail-item"><div class="detail-label">Agama</div><div class="detail-value">${escapeHtml(emp.religion)}</div></div>
        <div class="detail-item"><div class="detail-label">Status Pernikahan</div><div class="detail-value">${escapeHtml(emp.maritalStatus)}</div></div>
        <div class="detail-item"><div class="detail-label">Golongan Darah</div><div class="detail-value">${escapeHtml(emp.bloodType)}</div></div>
        <div class="detail-item"><div class="detail-label">No. Telepon</div><div class="detail-value">${formatPhone(emp.phone)}</div></div>
        <div class="detail-item"><div class="detail-label">Tanggal Bergabung</div><div class="detail-value">${formatDate(emp.joinDate)}</div></div>
        <div class="detail-item"><div class="detail-label">Masa Kerja</div><div class="detail-value">${getWorkDuration(emp.joinDate)}</div></div>
        <div class="detail-item"><div class="detail-label">Bank & Rekening</div><div class="detail-value">${escapeHtml(emp.bankName)} — ${escapeHtml(emp.bankAccount)}</div></div>
      </div>
      <div class="detail-item" style="padding:12px 0;border-top:1px solid var(--border);">
        <div class="detail-label">Alamat</div>
        <div class="detail-value">${escapeHtml(emp.address)}</div>
      </div>`;

    const editBtn = document.getElementById('detail-edit-btn');
    if (editBtn) editBtn.onclick = () => { closeModal('modal-emp-detail'); openEdit(id); };

    openModal('modal-emp-detail');
    if (window.lucide) lucide.createIcons({ nodes: [body.parentElement] });
  }

  function saveEmp() {
    const requiredFields = [
      { name: 'name', msg: 'Nama wajib diisi' },
      { name: 'nik', msg: 'NIK wajib diisi' },
      { name: 'birthDate', msg: 'Tanggal lahir wajib diisi' },
      { name: 'department', msg: 'Departemen wajib dipilih' },
      { name: 'position', msg: 'Jabatan wajib dipilih' },
      { name: 'joinDate', msg: 'Tanggal bergabung wajib diisi' },
      { name: 'email', msg: 'Email wajib diisi' },
      { name: 'loginEmail', msg: 'Email login wajib diisi' },
    ];
    if (!validateRequired('form-emp', requiredFields)) return;

    const data = getFormData('form-emp');
    const id = data.id;
    delete data.id;

    if (id) {
      // Edit: only update password if provided
      if (!data.password) delete data.password;
      DB.employees.update(id, data);
      showToast('Data karyawan berhasil diperbarui', 'success');
    } else {
      if (!data.password) { showToast('Password wajib diisi untuk karyawan baru', 'error'); return; }
      data.id = DB.employees.nextId();
      data.photo = null;
      data.salary = parseFloat(data.salary) || 0;
      data.allowances = { transport: 500000, meal: 600000, housing: 0, position: 0 };
      DB.employees.create(data);
      showToast('Karyawan baru berhasil ditambahkan', 'success');
    }

    closeModal('modal-emp');
    refreshTable();
  }

  function deleteEmp(id) {
    const emp = DB.employees.getById(id);
    if (!emp) return;
    const session = Auth.getSession();
    if (id === session.id) { showToast('Tidak dapat menghapus akun Anda sendiri', 'error'); return; }
    confirmDialog(`Hapus karyawan "${emp.name}"? Tindakan ini tidak dapat dibatalkan.`, () => {
      DB.employees.delete(id);
      showToast('Karyawan berhasil dihapus', 'success');
      refreshTable();
    });
  }

  function exportCSV() {
    const data = DB.employees.getAll();
    const headers = ['ID','NIK','Nama','Email','Departemen','Jabatan','Tipe','Tanggal Bergabung','Gaji Pokok','Status'];
    const rows = data.map(e => [
      e.id, e.nik, e.name, e.email,
      getDeptName(e.department), getPosName(e.position),
      e.employeeType, e.joinDate, e.salary, e.status
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'data-karyawan.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Data berhasil diekspor', 'success');
  }

  return { render, init, goPage, openAdd, openEdit, openDetail, saveEmp, deleteEmp, exportCSV, onDeptChange };
})();
