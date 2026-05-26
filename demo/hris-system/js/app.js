'use strict';

// ============================================================
// ROUTER
// ============================================================

const App = {
  currentModule: null,
  currentRoute: null,

  init() {
    DB.init();
    if (!Auth.requireAuth()) return;
    this.buildSidebar();
    this.buildTopbar();
    this.updateUserInfo();
    this.bindEvents();
    this.navigate(this.getRoute() || 'dashboard');
    this.startClock();
  },

  getRoute() {
    const hash = window.location.hash.replace('#/', '').split('?')[0];
    return hash || 'dashboard';
  },

  navigate(route) {
    const session = Auth.getSession();
    const allowedRoutes = MENUS[session.role]?.map(m => m.id) || ['dashboard'];

    // Map employee sub-routes
    const routeMap = {
      'attendance-self': 'attendance',
      'leave-self': 'leave',
      'payroll-self': 'payroll',
      'performance-self': 'performance',
    };
    const resolvedRoute = routeMap[route] || route;

    if (!allowedRoutes.includes(resolvedRoute)) {
      this.navigate('dashboard');
      return;
    }

    if (this.currentModule && typeof this.currentModule.destroy === 'function') {
      this.currentModule.destroy();
    }
    destroyAllCharts();

    this.currentRoute = resolvedRoute;
    window.location.hash = `/${resolvedRoute}`;
    this.updateActiveMenu(resolvedRoute);
    this.updatePageTitle(resolvedRoute);

    const moduleMap = {
      dashboard:     window.DashboardModule,
      employees:     window.EmployeesModule,
      attendance:    window.AttendanceModule,
      leave:         window.LeaveModule,
      payroll:       window.PayrollModule,
      recruitment:   window.RecruitmentModule,
      performance:   window.PerformanceModule,
      training:      window.TrainingModule,
      announcements: window.AnnouncementsModule,
      organization:  window.OrganizationModule,
      reports:       window.ReportsModule,
      settings:      window.SettingsModule,
    };

    const mod = moduleMap[resolvedRoute];
    if (!mod) {
      document.getElementById('app-content').innerHTML = `<div class="empty-state"><i data-lucide="construction"></i><h3>Modul tidak ditemukan</h3></div>`;
      lucide.createIcons();
      return;
    }

    this.currentModule = mod;
    const content = document.getElementById('app-content');
    content.innerHTML = '<div class="page-loader"><div class="spinner"></div></div>';

    requestAnimationFrame(() => {
      content.innerHTML = mod.render();
      if (window.lucide) lucide.createIcons();
      if (typeof mod.init === 'function') mod.init();
    });
  },

  buildSidebar() {
    const session = Auth.getSession();
    const menus = MENUS[session.role] || [];
    const settings = DB.settings.get();

    const navItems = menus.map(m => `
      <li>
        <a href="#/${m.id}" class="nav-link" data-route="${m.id}">
          <i data-lucide="${m.icon}" class="nav-icon"></i>
          <span class="nav-label">${m.label}</span>
        </a>
      </li>`).join('');

    document.getElementById('sidebar').innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <div class="logo-mark">${escapeHtml(settings.shortName)}</div>
          <div class="logo-text">
            <div class="logo-name">${escapeHtml(settings.name)}</div>
            <div class="logo-sub">HRIS System</div>
          </div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <ul class="nav-list" id="nav-list">${navItems}</ul>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          ${avatarHtml(session.name, 36, 'flex-shrink-0')}
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${escapeHtml(session.name)}</div>
            <div class="sidebar-user-role">${getRoleLabel(session.role)}</div>
          </div>
        </div>
        <button class="btn-logout" id="btn-logout" title="Keluar">
          <i data-lucide="log-out"></i>
        </button>
      </div>`;

    if (window.lucide) lucide.createIcons({ nodes: [document.getElementById('sidebar')] });
  },

  buildTopbar() {
    const topbar = document.getElementById('topbar');
    const pending = DB.leave.getPending().length;
    topbar.innerHTML = `
      <div class="topbar-left">
        <button class="sidebar-toggle" id="sidebar-toggle">
          <i data-lucide="menu"></i>
        </button>
        <div class="breadcrumb" id="page-breadcrumb">
          <span>Dashboard</span>
        </div>
      </div>
      <div class="topbar-right">
        <div class="topbar-date" id="topbar-clock"></div>
        <div class="notif-btn-wrap">
          <button class="icon-btn" id="notif-btn" title="Notifikasi">
            <i data-lucide="bell"></i>
            ${pending > 0 ? `<span class="notif-badge">${pending}</span>` : ''}
          </button>
        </div>
      </div>`;
    if (window.lucide) lucide.createIcons({ nodes: [topbar] });
  },

  updateUserInfo() {},

  updateActiveMenu(route) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.route === route);
    });
  },

  updatePageTitle(route) {
    const menus = [...(MENUS[Auth.getSession()?.role] || [])];
    const menu = menus.find(m => m.id === route);
    const label = menu ? menu.label : 'HRIS';
    document.title = `${label} — HRIS PT CG`;
    const bc = document.getElementById('page-breadcrumb');
    if (bc) bc.innerHTML = `<span>${label}</span>`;
  },

  bindEvents() {
    window.addEventListener('hashchange', () => {
      const route = this.getRoute();
      if (route !== this.currentRoute) this.navigate(route);
    });

    document.addEventListener('click', e => {
      const navLink = e.target.closest('.nav-link');
      if (navLink) {
        e.preventDefault();
        const route = navLink.dataset.route;
        this.navigate(route);
        // close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay')?.classList.remove('active');
      }

      if (e.target.closest('#sidebar-toggle')) {
        document.getElementById('sidebar').classList.toggle('open');
        const overlay = document.getElementById('sidebar-overlay');
        if (overlay) overlay.classList.toggle('active');
      }

      if (e.target.closest('#sidebar-overlay')) {
        document.getElementById('sidebar').classList.remove('open');
        e.target.classList.remove('active');
      }

      if (e.target.closest('#btn-logout')) {
        confirmDialog('Apakah Anda yakin ingin keluar dari sistem?', () => Auth.logout());
      }

      // close modals on backdrop click
      if (e.target.classList.contains('modal')) closeAllModals();
    });
  },

  startClock() {
    const update = () => {
      const el = document.getElementById('topbar-clock');
      if (!el) return;
      const now = new Date();
      const day = HARI[now.getDay()];
      const date = `${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}`;
      const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
      el.textContent = `${day}, ${date} — ${time}`;
    };
    update();
    setInterval(update, 60000);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
