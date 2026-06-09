'use strict';

window.ProfileModule = (function () {

  function render() {
    const session = Auth.getSession();
    const user    = DB.users.getById(session.id);
    if (!user) return '<div class="empty-state"><h3>User tidak ditemukan</h3></div>';

    const idLabel = user.role === 'mahasiswa' ? 'NIM' : user.role === 'dosen' ? 'NIP' : 'ID';
    const idValue = user.role === 'mahasiswa' ? user.nim : user.role === 'dosen' ? user.nip : user.id;

    return `
    <div class="page-header">
      <div><div class="page-title">Profil Saya</div><div class="page-subtitle">Kelola informasi akun Anda</div></div>
    </div>

    <div class="profile-header">
      <div class="profile-avatar-big">${(user.name||'?').split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase()}</div>
      <div>
        <div class="profile-name">${escapeHtml(user.name)}</div>
        <div class="profile-role">${getRoleLabel(user.role)}</div>
        <div class="profile-id">${idLabel}: ${escapeHtml(idValue || '-')}</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;" class="profile-grid">
      <!-- Edit Profil -->
      <div class="card">
        <div class="card-header"><div class="card-title">Edit Informasi</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label required">Nama Lengkap</label>
            <input type="text" class="form-control" id="p-name" value="${escapeHtml(user.name)}">
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input type="email" class="form-control" id="p-email" value="${escapeHtml(user.email)}" disabled style="background:#F8FAFC;color:var(--text-muted);">
            <div class="form-hint">Email tidak dapat diubah.</div>
          </div>
          <div class="form-group">
            <label class="form-label">${idLabel}</label>
            <input type="text" class="form-control" id="p-id" value="${escapeHtml(idValue || '')}" disabled style="background:#F8FAFC;color:var(--text-muted);">
          </div>
          <div class="form-group">
            <label class="form-label">Nomor Telepon</label>
            <input type="text" class="form-control" id="p-phone" value="${escapeHtml(user.phone || '')}">
          </div>
          <button class="btn btn-primary" id="btn-save-profile"><i data-lucide="save"></i> Simpan Perubahan</button>
        </div>
      </div>

      <!-- Ganti Password -->
      <div class="card">
        <div class="card-header"><div class="card-title">Ganti Password</div></div>
        <div class="card-body">
          <div class="form-group">
            <label class="form-label required">Password Lama</label>
            <input type="password" class="form-control" id="p-pw-old" placeholder="Password saat ini">
          </div>
          <div class="form-group">
            <label class="form-label required">Password Baru</label>
            <input type="password" class="form-control" id="p-pw-new" placeholder="Password baru (min. 6 karakter)">
          </div>
          <div class="form-group">
            <label class="form-label required">Konfirmasi Password</label>
            <input type="password" class="form-control" id="p-pw-confirm" placeholder="Ulangi password baru">
          </div>
          <button class="btn btn-primary" id="btn-save-pw"><i data-lucide="lock"></i> Ganti Password</button>
        </div>

        <div class="card-header" style="margin-top:0;border-top:1px solid var(--border);"><div class="card-title">Info Akun</div></div>
        <div class="card-body">
          <div class="detail-grid" style="grid-template-columns:1fr;">
            <div class="detail-item">
              <div class="detail-label">Role</div>
              <div class="detail-value">${getRoleBadge(user.role)}</div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Status Akun</div>
              <div class="detail-value"><span class="badge ${user.status==='aktif'?'badge-success':'badge-secondary'}">${user.status}</span></div>
            </div>
            <div class="detail-item">
              <div class="detail-label">Bergabung</div>
              <div class="detail-value">${formatDate(user.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function init() {
    document.getElementById('btn-save-profile')?.addEventListener('click', () => {
      const session = Auth.getSession();
      const name    = document.getElementById('p-name').value.trim();
      const phone   = document.getElementById('p-phone').value.trim();
      if (!name) { showToast('Nama tidak boleh kosong.', 'error'); return; }
      DB.users.update(session.id, { name, phone });
      // update session name
      const newSession = { ...Auth.getSession(), name };
      try { localStorage.setItem(PA_PREFIX + 'session', JSON.stringify(newSession)); } catch {}
      showToast('Profil berhasil diperbarui.', 'success');
      App.buildSidebar();
    });

    document.getElementById('btn-save-pw')?.addEventListener('click', () => {
      const session = Auth.getSession();
      const user    = DB.users.getById(session.id);
      const oldPw   = document.getElementById('p-pw-old').value;
      const newPw   = document.getElementById('p-pw-new').value;
      const confirm = document.getElementById('p-pw-confirm').value;
      if (!oldPw || !newPw || !confirm) { showToast('Semua field password wajib diisi.', 'error'); return; }
      if (user.password !== oldPw) { showToast('Password lama salah.', 'error'); return; }
      if (newPw.length < 6) { showToast('Password baru minimal 6 karakter.', 'error'); return; }
      if (newPw !== confirm) { showToast('Konfirmasi password tidak cocok.', 'error'); return; }
      DB.users.update(session.id, { password: newPw });
      document.getElementById('p-pw-old').value = '';
      document.getElementById('p-pw-new').value = '';
      document.getElementById('p-pw-confirm').value = '';
      showToast('Password berhasil diubah.', 'success');
    });

    // Responsive grid
    const grid = document.querySelector('.profile-grid');
    if (grid && window.innerWidth < 768) grid.style.gridTemplateColumns = '1fr';
  }

  return { render, init };
})();
