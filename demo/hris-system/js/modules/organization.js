'use strict';

window.OrganizationModule = (function () {
  let _view = 'chart'; // 'chart' | 'departments' | 'positions'
  let _selectedDept = '';

  // ── render ──────────────────────────────────────────────────
  function render() {
    return `
<div class="page-header">
  <div>
    <h1 class="page-title">Struktur Organisasi</h1>
    <p class="page-subtitle">Hierarki dan struktur departemen PT Cakrawala Gemilang</p>
  </div>
</div>

<div style="display:flex;gap:8px;margin-bottom:20px">
  <button class="btn btn-outline btn-sm" id="tab-chart" onclick="OrganizationModule.setView('chart')">Bagan Org</button>
  <button class="btn btn-outline btn-sm" id="tab-departments" onclick="OrganizationModule.setView('departments')">Departemen</button>
  <button class="btn btn-outline btn-sm" id="tab-positions" onclick="OrganizationModule.setView('positions')">Jabatan</button>
</div>

<div id="org-content"></div>

<!-- Dept Modal -->
<div class="modal" id="modal-dept-form">
  <div class="modal-box modal-md">
    <div class="modal-header">
      <h2 class="modal-title" id="dept-form-title">Tambah Departemen</h2>
      <button class="btn btn-ghost btn-icon" onclick="closeModal('modal-dept-form')"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="dept-form-id">
      <form id="dept-form">
        <div class="form-row">
          <div class="form-group required">
            <label class="form-label">Nama Departemen</label>
            <input type="text" name="name" class="form-control" placeholder="Nama departemen">
          </div>
          <div class="form-group">
            <label class="form-label">Kode</label>
            <input type="text" name="code" class="form-control" placeholder="Kode singkat (maks 5 huruf)" maxlength="5" style="text-transform:uppercase">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Deskripsi</label>
          <textarea name="description" class="form-control" rows="3" placeholder="Fungsi dan tanggung jawab departemen"></textarea>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modal-dept-form')">Batal</button>
      <button class="btn btn-primary" onclick="OrganizationModule.saveDept()">Simpan</button>
    </div>
  </div>
</div>

<!-- Position Modal -->
<div class="modal" id="modal-pos-form">
  <div class="modal-box modal-md">
    <div class="modal-header">
      <h2 class="modal-title" id="pos-form-title">Tambah Jabatan</h2>
      <button class="btn btn-ghost btn-icon" onclick="closeModal('modal-pos-form')"><i data-lucide="x"></i></button>
    </div>
    <div class="modal-body">
      <input type="hidden" id="pos-form-id">
      <form id="pos-form">
        <div class="form-group required">
          <label class="form-label">Nama Jabatan</label>
          <input type="text" name="name" class="form-control" placeholder="Nama jabatan / posisi">
        </div>
        <div class="form-row">
          <div class="form-group required">
            <label class="form-label">Departemen</label>
            <select name="departmentId" class="form-control" id="pos-dept-select">
              <option value="">Pilih departemen</option>
              ${DB.departments.getAll().map(d => `<option value="${d.id}">${escapeHtml(d.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Level</label>
            <select name="level" class="form-control">
              <option value="Staff">Staff</option>
              <option value="Senior">Senior</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Manager">Manager</option>
              <option value="Director">Director</option>
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Gaji Min (Rp)</label>
            <input type="number" name="salaryMin" class="form-control" min="0" placeholder="0">
          </div>
          <div class="form-group">
            <label class="form-label">Gaji Maks (Rp)</label>
            <input type="number" name="salaryMax" class="form-control" min="0" placeholder="0">
          </div>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal('modal-pos-form')">Batal</button>
      <button class="btn btn-primary" onclick="OrganizationModule.savePos()">Simpan</button>
    </div>
  </div>
</div>`;
  }

  // ── init ─────────────────────────────────────────────────────
  function init() {
    lucide.createIcons();
    setView(_view);
  }

  function setView(v) {
    _view = v;
    ['chart', 'departments', 'positions'].forEach(tab => {
      const btn = document.getElementById(`tab-${tab}`);
      if (btn) btn.className = v === tab ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm';
    });
    if (v === 'chart') _renderChart();
    else if (v === 'departments') _renderDepartments();
    else _renderPositions();
  }

  // ── Org chart ─────────────────────────────────────────────────
  function _renderChart() {
    const employees = DB.employees.getActive();
    const departments = DB.departments.getAll();

    // Find top-level: level 1 position (Direktur Utama)
    const topEmp = employees.find(e => {
      const pos = DB.positions.getById(e.position);
      return pos && pos.level === 1;
    }) || employees[0];

    // Build managerId-like structure from dept headId
    const headIds = new Set(departments.map(d => d.headId).filter(Boolean));
    // Dept heads report to the top (CEO); staff reports to their dept head
    const getReports = (empId) => {
      if (empId === topEmp.id) {
        // CEO's reports = all dept heads (excl CEO's own dept head if CEO = head)
        return employees.filter(e => headIds.has(e.id) && e.id !== empId);
      }
      // Dept head's reports = all active employees in same dept, excluding the head
      const headEmp = employees.find(e => e.id === empId);
      if (!headEmp || !headIds.has(empId)) return [];
      return employees.filter(e => e.department === headEmp.department && e.id !== empId && !headIds.has(e.id));
    };

    const el = document.getElementById('org-content');
    if (!el) return;

    el.innerHTML = `
<div class="card" style="overflow:auto">
  <div style="min-width:900px;padding:20px;text-align:center">
    <div class="org-chart" style="display:inline-block">
      ${_buildNode(topEmp, getReports, 0)}
    </div>
  </div>
</div>`;
    lucide.createIcons();
  }

  function _buildNode(emp, getReports, depth) {
    if (!emp) return '';
    const pos = DB.positions.getById(emp.position);
    const dept = DB.departments.getById(emp.department);
    const reports = getReports(emp.id);
    const depthColors = ['#0D9488', '#0891B2', '#7C3AED', '#D97706', '#DC2626'];
    const color = depthColors[depth % depthColors.length];
    const initials = emp.name.split(' ').map(n => n[0]).slice(0, 2).join('');

    return `
<div class="org-node-wrap" style="display:inline-flex;flex-direction:column;align-items:center">
  <div class="org-node" style="background:#fff;border:2px solid ${color};border-radius:12px;padding:12px 16px;text-align:center;min-width:150px;max-width:175px;box-shadow:0 2px 8px rgba(0,0,0,.08)">
    <div style="margin:0 auto 8px;width:42px;height:42px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:15px">${initials}</div>
    <p style="font-weight:600;font-size:11.5px;color:#1e293b;margin-bottom:2px;line-height:1.3">${escapeHtml(emp.name)}</p>
    <p style="font-size:10px;color:${color};font-weight:500;margin-bottom:2px">${pos ? escapeHtml(pos.name) : ''}</p>
    <p style="font-size:10px;color:#64748b">${dept ? escapeHtml(dept.name) : ''}</p>
  </div>
  ${reports.length ? `
  <div style="width:2px;height:20px;background:#e2e8f0"></div>
  <div style="display:flex;align-items:flex-start;gap:0;position:relative">
    <div style="position:absolute;top:0;left:0;right:0;height:2px;background:#e2e8f0"></div>
    ${reports.map(sub => `
    <div style="display:flex;flex-direction:column;align-items:center;padding:0 6px">
      <div style="width:2px;height:20px;background:#e2e8f0"></div>
      ${_buildNode(sub, getReports, depth + 1)}
    </div>`).join('')}
  </div>` : ''}
</div>`;
  }

  // ── Departments view ──────────────────────────────────────────
  function _renderDepartments() {
    const departments = DB.departments.getAll();
    const employees = DB.employees.getAll();
    const isHR = Auth.can('edit_organization');
    const el = document.getElementById('org-content');
    if (!el) return;

    const deptIcons = {
      DEP001: 'building-2', DEP002: 'code-2', DEP003: 'users', DEP004: 'calculator',
      DEP005: 'megaphone', DEP006: 'package', DEP007: 'shield-check',
    };
    const deptColors = ['#0D9488', '#0891B2', '#7C3AED', '#D97706', '#DC2626', '#059669', '#6366F1'];

    el.innerHTML = `
${isHR ? `<div style="display:flex;justify-content:flex-end;margin-bottom:16px"><button class="btn btn-primary" onclick="OrganizationModule.openAddDept()"><i data-lucide="plus" style="width:16px;height:16px"></i> Tambah Departemen</button></div>` : ''}
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px">
${departments.map((d, i) => {
  const deptEmps = employees.filter(e => e.department === d.id && e.status === 'Aktif');
  const manager = deptEmps.find(e => {
    const pos = DB.positions.getById(e.position);
    const lbl = pos ? _levelLabel(pos.level) : '';
    return lbl === 'Manager' || lbl === 'Director';
  });
  const color = deptColors[i % deptColors.length];
  return `
<div class="card" style="border-top:3px solid ${color};padding:20px">
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
    <div style="width:40px;height:40px;border-radius:10px;background:${color}20;display:flex;align-items:center;justify-content:center">
      <i data-lucide="${deptIcons[d.id] || 'layout-grid'}" style="width:20px;height:20px;color:${color}"></i>
    </div>
    ${isHR ? `<div style="display:flex;gap:6px">
      <button class="btn btn-ghost btn-icon" onclick="OrganizationModule.openEditDept('${d.id}')"><i data-lucide="pencil" style="width:14px;height:14px"></i></button>
      <button class="btn btn-ghost btn-icon" onclick="OrganizationModule.deleteDept('${d.id}')"><i data-lucide="trash-2" style="width:14px;height:14px;color:var(--danger)"></i></button>
    </div>` : ''}
  </div>
  <h3 style="font-size:15px;font-weight:600;color:var(--text-primary);margin-bottom:4px">${escapeHtml(d.name)}</h3>
  ${d.code ? `<span class="badge badge-secondary" style="font-size:10px;margin-bottom:8px">${d.code}</span>` : ''}
  ${d.description ? `<p style="font-size:12px;color:var(--text-muted);margin-bottom:12px">${escapeHtml(d.description)}</p>` : ''}
  <div style="display:flex;justify-content:space-between;align-items:center;padding-top:12px;border-top:1px solid var(--border)">
    <div style="display:flex;align-items:center;gap:6px">
      <i data-lucide="users" style="width:14px;height:14px;color:var(--text-muted)"></i>
      <span style="font-size:13px;font-weight:600">${deptEmps.length}</span>
      <span style="font-size:12px;color:var(--text-muted)">karyawan aktif</span>
    </div>
    ${manager ? `<div style="display:flex;align-items:center;gap:6px">${avatarHtml(manager.name, 24)}<span style="font-size:11px;color:var(--text-secondary)">${escapeHtml(manager.name.split(' ')[0])}</span></div>` : ''}
  </div>
</div>`;
}).join('')}
</div>`;
    lucide.createIcons();
  }

  // ── Positions view ────────────────────────────────────────────
  function _levelLabel(level) {
    if (typeof level === 'string') return level;
    const numMap = { 1: 'Director', 2: 'Manager', 3: 'Senior', 4: 'Supervisor', 5: 'Staff' };
    return numMap[level] || 'Staff';
  }

  function _renderPositions() {
    const positions = DB.positions.getAll();
    const departments = DB.departments.getAll();
    const employees = DB.employees.getAll();
    const isHR = Auth.can('edit_organization');
    const el = document.getElementById('org-content');
    if (!el) return;

    const levelOrder = { Director: 0, Manager: 1, Senior: 2, Supervisor: 3, Staff: 4 };
    const levelCls = {
      Director: 'badge-danger', Manager: 'badge-warning', Supervisor: 'badge-purple',
      Senior: 'badge-info', Staff: 'badge-secondary',
    };

    const byDept = {};
    departments.forEach(d => { byDept[d.id] = { dept: d, positions: [] }; });
    positions.sort((a, b) => (levelOrder[_levelLabel(a.level)] ?? 99) - (levelOrder[_levelLabel(b.level)] ?? 99))
      .forEach(p => { if (byDept[p.departmentId]) byDept[p.departmentId].positions.push(p); });

    el.innerHTML = `
${isHR ? `<div style="display:flex;justify-content:flex-end;margin-bottom:16px"><button class="btn btn-primary" onclick="OrganizationModule.openAddPos()"><i data-lucide="plus" style="width:16px;height:16px"></i> Tambah Jabatan</button></div>` : ''}
<div style="display:flex;flex-direction:column;gap:16px">
${Object.values(byDept).filter(g => g.positions.length).map(g => `
<div class="card">
  <h3 style="font-size:14px;font-weight:600;padding:16px 20px 14px;border-bottom:1px solid var(--border)">${escapeHtml(g.dept.name)}</h3>
  <table class="data-table">
    <thead><tr><th>Nama Jabatan</th><th>Level</th><th>Rentang Gaji</th><th>Jumlah</th>${isHR ? '<th>Aksi</th>' : ''}</tr></thead>
    <tbody>
    ${g.positions.map(p => {
  const count = employees.filter(e => e.position === p.id && e.status === 'Aktif').length;
  return `<tr>
        <td style="font-weight:500">${escapeHtml(p.name)}</td>
        <td><span class="badge ${levelCls[_levelLabel(p.level)] || 'badge-secondary'}">${_levelLabel(p.level)}</span></td>
        <td style="font-size:12px;color:var(--text-secondary)">${p.salaryMin && p.salaryMax ? `${formatCurrency(p.salaryMin)} - ${formatCurrency(p.salaryMax)}` : '-'}</td>
        <td>${count} orang</td>
        ${isHR ? `<td>
          <div style="display:flex;gap:6px">
            <button class="btn btn-outline btn-sm" onclick="OrganizationModule.openEditPos('${p.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="OrganizationModule.deletePos('${p.id}')">Hapus</button>
          </div>
        </td>` : ''}
      </tr>`;
}).join('')}
    </tbody>
  </table>
</div>`).join('')}
</div>`;
    lucide.createIcons();
  }

  // ── Dept CRUD ─────────────────────────────────────────────────
  function openAddDept() {
    document.getElementById('dept-form-title').textContent = 'Tambah Departemen';
    document.getElementById('dept-form-id').value = '';
    document.getElementById('dept-form').reset();
    openModal('modal-dept-form');
  }

  function openEditDept(id) {
    const d = DB.departments.getById(id);
    if (!d) return;
    document.getElementById('dept-form-title').textContent = 'Edit Departemen';
    document.getElementById('dept-form-id').value = id;
    setFormData('dept-form', { name: d.name, code: d.code || '', description: d.description || '' });
    openModal('modal-dept-form');
  }

  function saveDept() {
    if (!validateRequired('dept-form', ['name'])) return;
    const data = getFormData('dept-form');
    const id = document.getElementById('dept-form-id').value;
    const payload = { name: data.name, code: (data.code || '').toUpperCase(), description: data.description || '' };
    if (id) {
      DB.departments.update(id, payload);
      showToast('Departemen diperbarui', 'success');
    } else {
      DB.departments.create({ id: DB.departments.nextId(), ...payload });
      showToast('Departemen ditambahkan', 'success');
    }
    closeModal('modal-dept-form');
    _renderDepartments();
  }

  function deleteDept(id) {
    const emps = DB.employees.getAll().filter(e => e.department === id);
    if (emps.length) { showToast(`Tidak dapat menghapus, ada ${emps.length} karyawan di departemen ini`, 'error'); return; }
    confirmDialog('Hapus departemen ini?', () => {
      DB.departments.delete(id);
      showToast('Departemen dihapus', 'success');
      _renderDepartments();
    });
  }

  // ── Position CRUD ─────────────────────────────────────────────
  function openAddPos() {
    document.getElementById('pos-form-title').textContent = 'Tambah Jabatan';
    document.getElementById('pos-form-id').value = '';
    document.getElementById('pos-form').reset();
    openModal('modal-pos-form');
  }

  function openEditPos(id) {
    const p = DB.positions.getById(id);
    if (!p) return;
    document.getElementById('pos-form-title').textContent = 'Edit Jabatan';
    document.getElementById('pos-form-id').value = id;
    setFormData('pos-form', { name: p.name, departmentId: p.departmentId, level: _levelLabel(p.level), salaryMin: p.salaryMin || '', salaryMax: p.salaryMax || '' });
    openModal('modal-pos-form');
  }

  function savePos() {
    if (!validateRequired('pos-form', ['name', 'departmentId'])) return;
    const data = getFormData('pos-form');
    const id = document.getElementById('pos-form-id').value;
    const payload = {
      name: data.name, departmentId: data.departmentId, level: data.level || 'Staff',
      salaryMin: parseInt(data.salaryMin) || 0, salaryMax: parseInt(data.salaryMax) || 0,
    };
    if (id) {
      DB.positions.update(id, payload);
      showToast('Jabatan diperbarui', 'success');
    } else {
      DB.positions.create({ id: DB.positions.nextId(), ...payload });
      showToast('Jabatan ditambahkan', 'success');
    }
    closeModal('modal-pos-form');
    _renderPositions();
  }

  function deletePos(id) {
    const emps = DB.employees.getAll().filter(e => e.position === id);
    if (emps.length) { showToast(`Tidak dapat menghapus, ada ${emps.length} karyawan dengan jabatan ini`, 'error'); return; }
    confirmDialog('Hapus jabatan ini?', () => {
      DB.positions.delete(id);
      showToast('Jabatan dihapus', 'success');
      _renderPositions();
    });
  }

  return {
    render, init, setView,
    openAddDept, openEditDept, saveDept, deleteDept,
    openAddPos, openEditPos, savePos, deletePos,
  };
})();
