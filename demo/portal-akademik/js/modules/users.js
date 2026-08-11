'use strict';

window.UsersModule = (function () {
  let page = 1, search = '', filterRole = '';
  const PER = 8;

  function render() {
    return `
    <div class="page-header">
      <div><h1 class="page-title">Manajemen Pengguna</h1><div class="page-subtitle">Kelola semua akun pengguna sistem</div></div>
      <div class="page-actions">
        <button class="btn btn-primary" id="btn-add-user"><i data-lucide="user-plus"></i> Tambah Pengguna</button>
      </div>
    </div>
    <div class="card">
      <div class="card-body" style="padding-bottom:0;">
        <div class="filter-bar">
          <div class="search-wrap"><i data-lucide="search"></i><input type="text" class="search-input" id="search-user" placeholder="Cari nama atau email..." value="${escapeHtml(search)}"></div>
          <select class="filter-select" id="filter-role">
            <option value="">Semua Role</option>
            <option value="admin" ${filterRole==='admin'?'selected':''}>Admin</option>
            <option value="dosen" ${filterRole==='dosen'?'selected':''}>Dosen</option>
            <option value="mahasiswa" ${filterRole==='mahasiswa'?'selected':''}>Mahasiswa</option>
          </select>
        </div>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Pengguna</th><th>Role</th><th>NIP / NIM</th><th>Status</th><th>Aksi</th></tr></thead>
          <tbody id="users-tbody"></tbody>
        </table>
      </div>
      <div id="users-pagination"></div>
    </div>

    <!-- Modal Tambah/Edit -->
    <div class="modal modal-md" id="modal-user">
      <div class="modal-box">
        <div class="modal-header">
          <span class="modal-title" id="modal-user-title">Tambah Pengguna</span>
          <button class="modal-close" aria-label="Tutup" onclick="closeModal('modal-user')"><i data-lucide="x"></i></button>
        </div>
        <div class="modal-body">
          <input type="hidden" id="u-id">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label required">Nama Lengkap</label>
              <input type="text" class="form-control" id="u-name" placeholder="Nama lengkap">
            </div>
            <div class="form-group">
              <label class="form-label required">Role</label>
              <select class="form-control" id="u-role">
                <option value="mahasiswa">Mahasiswa</option>
                <option value="dosen">Dosen</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label required">Email</label>
            <input type="email" class="form-control" id="u-email" placeholder="email@portal.ac.id">
          </div>
          <div class="form-row">
            <div class="form-group" id="u-nim-group">
              <label class="form-label">NIM</label>
              <input type="text" class="form-control" id="u-nim" placeholder="Nomor Induk Mahasiswa">
            </div>
            <div class="form-group" id="u-nip-group" style="display:none;">
              <label class="form-label">NIP</label>
              <input type="text" class="form-control" id="u-nip" placeholder="Nomor Induk Pegawai">
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Password <span style="font-weight:400;color:var(--text-muted);">(kosongkan jika tidak diubah)</span></label>
              <input type="password" class="form-control" id="u-pw" placeholder="Password baru">
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select class="form-control" id="u-status">
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeModal('modal-user')">Batal</button>
          <button class="btn btn-primary" id="btn-save-user"><i data-lucide="save"></i> Simpan</button>
        </div>
      </div>
    </div>`;
  }

  function getData() {
    let data = DB.users.getAll();
    if (search) data = data.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    if (filterRole) data = data.filter(u => u.role === filterRole);
    return data;
  }

  function renderTable() {
    const data   = getData();
    const sliced = data.slice((page-1)*PER, page*PER);
    const tbody  = document.getElementById('users-tbody');
    if (!tbody) return;
    if (!sliced.length) {
      tbody.innerHTML = `<tr><td colspan="5"><div class="empty-state" style="padding:30px;"><i data-lucide="users"></i><h3>Tidak ada pengguna</h3></div></td></tr>`;
    } else {
      tbody.innerHTML = sliced.map(u => `
        <tr>
          <td><div class="table-name-cell">${avatarHtml(u.name, 32)}<div><div class="name">${escapeHtml(u.name)}</div><div class="sub">${escapeHtml(u.email)}</div></div></div></td>
          <td>${getRoleBadge(u.role)}</td>
          <td>${escapeHtml(u.nim || u.nip || '-')}</td>
          <td><span class="badge ${u.status==='aktif'?'badge-success':'badge-secondary'}">${u.status}</span></td>
          <td>
            <div style="display:flex;gap:6px;">
              <button class="btn btn-outline btn-sm btn-edit-user" aria-label="Edit pengguna ${escapeHtml(u.name)}" data-id="${u.id}"><i data-lucide="pencil"></i></button>
              ${u.id !== Auth.getSession().id ? `<button class="btn btn-danger btn-sm btn-del-user" aria-label="Hapus pengguna ${escapeHtml(u.name)}" data-id="${u.id}"><i data-lucide="trash-2"></i></button>` : ''}
            </div>
          </td>
        </tr>`).join('');
    }
    if (window.lucide) lucide.createIcons({ nodes: [tbody] });
    renderPagination('users-pagination', data.length, page, PER, p => { page = p; renderTable(); });
  }

  function openAdd() {
    document.getElementById('modal-user-title').textContent = 'Tambah Pengguna';
    document.getElementById('u-id').value    = '';
    document.getElementById('u-name').value  = '';
    document.getElementById('u-email').value = '';
    document.getElementById('u-role').value  = 'mahasiswa';
    document.getElementById('u-nim').value   = '';
    document.getElementById('u-nip').value   = '';
    document.getElementById('u-pw').value    = '';
    document.getElementById('u-status').value = 'aktif';
    toggleNipNim('mahasiswa');
    openModal('modal-user');
  }

  function openEdit(id) {
    const u = DB.users.getById(id);
    if (!u) return;
    document.getElementById('modal-user-title').textContent = 'Edit Pengguna';
    document.getElementById('u-id').value     = u.id;
    document.getElementById('u-name').value   = u.name;
    document.getElementById('u-email').value  = u.email;
    document.getElementById('u-role').value   = u.role;
    document.getElementById('u-nim').value    = u.nim || '';
    document.getElementById('u-nip').value    = u.nip || '';
    document.getElementById('u-pw').value     = '';
    document.getElementById('u-status').value = u.status;
    toggleNipNim(u.role);
    openModal('modal-user');
  }

  function toggleNipNim(role) {
    const nimG = document.getElementById('u-nim-group');
    const nipG = document.getElementById('u-nip-group');
    if (!nimG || !nipG) return;
    nimG.style.display = role === 'mahasiswa' ? '' : 'none';
    nipG.style.display = (role === 'dosen' || role === 'admin') ? '' : 'none';
  }

  function saveUser() {
    const id     = document.getElementById('u-id').value;
    const name   = document.getElementById('u-name').value.trim();
    const email  = document.getElementById('u-email').value.trim();
    const role   = document.getElementById('u-role').value;
    const nim    = document.getElementById('u-nim').value.trim();
    const nip    = document.getElementById('u-nip').value.trim();
    const pw     = document.getElementById('u-pw').value;
    const status = document.getElementById('u-status').value;

    if (!name || !email) { showToast('Nama dan email wajib diisi.', 'error'); return; }

    if (id) {
      const patch = { name, email, role, nim, nip, status };
      if (pw) patch.password = pw;
      DB.users.update(id, patch);
      showToast('Pengguna berhasil diperbarui.', 'success');
    } else {
      if (!pw) { showToast('Password wajib diisi untuk pengguna baru.', 'error'); return; }
      const newUser = { id: DB.users.nextId(), name, email, role, nim, nip, password: pw, status, phone: '', gender: 'L', createdAt: todayStr() };
      DB.users.add(newUser);
      showToast('Pengguna berhasil ditambahkan.', 'success');
    }
    closeModal('modal-user');
    renderTable();
  }

  let _clickHandler = null;

  function init() {
    renderTable();
    document.getElementById('btn-add-user')?.addEventListener('click', openAdd);
    document.getElementById('btn-save-user')?.addEventListener('click', saveUser);
    document.getElementById('u-role')?.addEventListener('change', e => toggleNipNim(e.target.value));
    document.getElementById('search-user')?.addEventListener('input', e => { search = e.target.value; page = 1; renderTable(); });
    document.getElementById('filter-role')?.addEventListener('change', e => { filterRole = e.target.value; page = 1; renderTable(); });

    _clickHandler = function (e) {
      if (e.target.closest('.btn-edit-user')) openEdit(e.target.closest('.btn-edit-user').dataset.id);
      if (e.target.closest('.btn-del-user')) {
        const id = e.target.closest('.btn-del-user').dataset.id;
        const u  = DB.users.getById(id);
        confirmDialog(`Hapus pengguna "${u?.name}"? Tindakan ini tidak dapat dibatalkan.`, () => {
          DB.users.delete(id);
          showToast('Pengguna dihapus.', 'success');
          renderTable();
        });
      }
    };
    document.addEventListener('click', _clickHandler);
  }

  function destroy() {
    if (_clickHandler) { document.removeEventListener('click', _clickHandler); _clickHandler = null; }
  }

  return { render, init, destroy };
})();
