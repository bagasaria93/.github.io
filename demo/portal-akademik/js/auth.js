'use strict';

const SESSION_KEY = PA_PREFIX + 'session';

const Auth = {
  login(email, password) {
    const user = DB.users.getByEmail(email);
    if (!user) return { success: false, message: 'Email tidak terdaftar.' };
    if (user.password !== password) return { success: false, message: 'Password salah.' };
    if (user.status !== 'aktif') return { success: false, message: 'Akun tidak aktif.' };
    const session = { id: user.id, name: user.name, email: user.email, role: user.role, loginAt: new Date().toISOString() };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch(e) {}
    return { success: true, session };
  },
  logout() { localStorage.removeItem(SESSION_KEY); window.location.href = 'index.html'; },
  getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } },
  isLoggedIn() { return !!this.getSession(); },
  getUser() { const s = this.getSession(); return s ? DB.users.getById(s.id) : null; },
  requireAuth() { if (!this.isLoggedIn()) { window.location.href = 'index.html'; return false; } return true; },
  requireLogin() { if (this.isLoggedIn()) { window.location.href = 'app.html'; return false; } return true; },
};

const MENUS = {
  admin: [
    { id: 'dashboard', label: 'Dashboard',           icon: 'layout-dashboard' },
    { id: 'users',     label: 'Manajemen Pengguna',  icon: 'users' },
    { id: 'courses',   label: 'Mata Kuliah',          icon: 'book-open' },
    { id: 'reports',   label: 'Laporan',              icon: 'file-bar-chart' },
    { id: 'profile',   label: 'Profil Saya',          icon: 'user-circle' },
  ],
  dosen: [
    { id: 'dashboard',   label: 'Dashboard',       icon: 'layout-dashboard' },
    { id: 'my-courses',  label: 'Mata Kuliah Saya', icon: 'book-open' },
    { id: 'materials',   label: 'Materi',           icon: 'file-text' },
    { id: 'assignments', label: 'Tugas',            icon: 'clipboard-list' },
    { id: 'grades',      label: 'Rekap Nilai',      icon: 'bar-chart-2' },
    { id: 'profile',     label: 'Profil Saya',      icon: 'user-circle' },
  ],
  mahasiswa: [
    { id: 'dashboard',       label: 'Dashboard',        icon: 'layout-dashboard' },
    { id: 'my-courses',      label: 'Mata Kuliah',       icon: 'book-open' },
    { id: 'my-materials',    label: 'Materi',            icon: 'file-text' },
    { id: 'my-assignments',  label: 'Tugas & Nilai',     icon: 'clipboard-check' },
    { id: 'profile',         label: 'Profil Saya',       icon: 'user-circle' },
  ],
};

function getRoleLabel(role) {
  return { admin: 'Administrator', dosen: 'Dosen', mahasiswa: 'Mahasiswa' }[role] || role;
}

function getRoleBadge(role) {
  const cfg = {
    admin:     { cls: 'badge-danger',    label: 'Admin' },
    dosen:     { cls: 'badge-indigo',    label: 'Dosen' },
    mahasiswa: { cls: 'badge-success',   label: 'Mahasiswa' },
  };
  const c = cfg[role] || { cls: 'badge-secondary', label: role };
  return `<span class="badge ${c.cls}">${c.label}</span>`;
}
