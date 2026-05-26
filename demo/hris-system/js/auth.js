'use strict';

const SESSION_KEY = STORAGE_PREFIX + 'session';

const Auth = {
  login(email, password) {
    const employees = DB.get('employees') || [];
    const user = employees.find(e =>
      e.loginEmail.toLowerCase() === email.toLowerCase().trim() &&
      e.password === password
    );
    if (!user) return { success: false, message: 'Email atau password salah.' };
    if (user.status !== 'Aktif') return { success: false, message: 'Akun tidak aktif. Hubungi HR.' };

    const session = {
      id: user.id, name: user.name, email: user.loginEmail,
      role: user.role, department: user.department, position: user.position,
      loginAt: new Date().toISOString(),
    };
    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch(e) {}
    return { success: true, session };
  },

  logout() {
    localStorage.removeItem(SESSION_KEY);
    window.location.href = 'index.html';
  },

  getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
  },

  isLoggedIn() { return !!this.getSession(); },

  getUser() {
    const session = this.getSession();
    if (!session) return null;
    return DB.employees.getById(session.id) || null;
  },

  can(action) {
    const session = this.getSession();
    if (!session) return false;
    return PERMISSIONS[session.role]?.includes(action) ?? false;
  },

  requireAuth() {
    if (!this.isLoggedIn()) {
      window.location.href = 'index.html';
      return false;
    }
    return true;
  },

  requireLogin() {
    if (this.isLoggedIn()) {
      window.location.href = 'app.html';
      return false;
    }
    return true;
  },
};

const PERMISSIONS = {
  superadmin: [
    'view_dashboard','view_employees','create_employee','edit_employee','delete_employee',
    'view_attendance','create_attendance','edit_attendance',
    'view_leave','approve_leave','create_leave',
    'view_payroll','create_payroll','mark_paid_payroll',
    'view_recruitment','create_recruitment','edit_recruitment','delete_recruitment',
    'view_performance','create_performance','edit_performance','delete_performance',
    'view_training','create_training','edit_training','delete_training',
    'view_announcements','create_announcement','edit_announcement','delete_announcement','pin_announcement',
    'view_organization','edit_organization',
    'view_reports','export_reports',
    'view_settings','edit_settings','manage_users','reset_data',
  ],
  hrmanager: [
    'view_dashboard','view_employees','create_employee','edit_employee',
    'view_attendance','create_attendance','edit_attendance',
    'view_leave','approve_leave','create_leave',
    'view_payroll','create_payroll','mark_paid_payroll',
    'view_recruitment','create_recruitment','edit_recruitment','delete_recruitment',
    'view_performance','create_performance','edit_performance',
    'view_training','create_training','edit_training',
    'view_announcements','create_announcement','edit_announcement','pin_announcement',
    'view_organization',
    'view_reports','export_reports',
  ],
  hrstaff: [
    'view_dashboard','view_employees','create_employee','edit_employee',
    'view_attendance','create_attendance',
    'view_leave','approve_leave','create_leave',
    'view_payroll',
    'view_training','edit_training',
    'view_announcements','create_announcement','edit_announcement',
    'view_organization',
    'view_reports',
  ],
  employee: [
    'view_dashboard',
    'view_own_attendance','create_own_attendance',
    'view_own_leave','create_leave',
    'view_own_payroll',
    'view_own_performance',
    'view_training',
    'view_announcements',
    'view_organization',
  ],
};

const MENUS = {
  superadmin: [
    { id: 'dashboard',     label: 'Dashboard',     icon: 'layout-dashboard' },
    { id: 'employees',     label: 'Karyawan',       icon: 'users' },
    { id: 'attendance',    label: 'Kehadiran',      icon: 'clock' },
    { id: 'leave',         label: 'Cuti',           icon: 'calendar-off' },
    { id: 'payroll',       label: 'Penggajian',     icon: 'wallet' },
    { id: 'recruitment',   label: 'Rekrutmen',      icon: 'user-search' },
    { id: 'performance',   label: 'Kinerja',        icon: 'bar-chart-2' },
    { id: 'training',      label: 'Pelatihan',      icon: 'graduation-cap' },
    { id: 'announcements', label: 'Pengumuman',     icon: 'megaphone' },
    { id: 'organization',  label: 'Organisasi',     icon: 'git-fork' },
    { id: 'reports',       label: 'Laporan',        icon: 'file-bar-chart' },
    { id: 'settings',      label: 'Pengaturan',     icon: 'settings' },
  ],
  hrmanager: [
    { id: 'dashboard',     label: 'Dashboard',     icon: 'layout-dashboard' },
    { id: 'employees',     label: 'Karyawan',       icon: 'users' },
    { id: 'attendance',    label: 'Kehadiran',      icon: 'clock' },
    { id: 'leave',         label: 'Cuti',           icon: 'calendar-off' },
    { id: 'payroll',       label: 'Penggajian',     icon: 'wallet' },
    { id: 'recruitment',   label: 'Rekrutmen',      icon: 'user-search' },
    { id: 'performance',   label: 'Kinerja',        icon: 'bar-chart-2' },
    { id: 'training',      label: 'Pelatihan',      icon: 'graduation-cap' },
    { id: 'announcements', label: 'Pengumuman',     icon: 'megaphone' },
    { id: 'organization',  label: 'Organisasi',     icon: 'git-fork' },
    { id: 'reports',       label: 'Laporan',        icon: 'file-bar-chart' },
  ],
  hrstaff: [
    { id: 'dashboard',     label: 'Dashboard',     icon: 'layout-dashboard' },
    { id: 'employees',     label: 'Karyawan',       icon: 'users' },
    { id: 'attendance',    label: 'Kehadiran',      icon: 'clock' },
    { id: 'leave',         label: 'Cuti',           icon: 'calendar-off' },
    { id: 'training',      label: 'Pelatihan',      icon: 'graduation-cap' },
    { id: 'announcements', label: 'Pengumuman',     icon: 'megaphone' },
    { id: 'organization',  label: 'Organisasi',     icon: 'git-fork' },
    { id: 'reports',       label: 'Laporan',        icon: 'file-bar-chart' },
  ],
  employee: [
    { id: 'dashboard',     label: 'Dashboard',     icon: 'layout-dashboard' },
    { id: 'attendance',    label: 'Kehadiran Saya', icon: 'clock' },
    { id: 'leave',         label: 'Cuti Saya',      icon: 'calendar-off' },
    { id: 'payroll',       label: 'Slip Gaji',      icon: 'wallet' },
    { id: 'performance',   label: 'Kinerja Saya',   icon: 'bar-chart-2' },
    { id: 'training',      label: 'Pelatihan',      icon: 'graduation-cap' },
    { id: 'announcements', label: 'Pengumuman',     icon: 'megaphone' },
    { id: 'organization',  label: 'Organisasi',     icon: 'git-fork' },
  ],
};

function getRoleLabel(role) {
  const map = { superadmin: 'Super Admin', hrmanager: 'HR Manager', hrstaff: 'HR Staff', employee: 'Karyawan' };
  return map[role] || role;
}
