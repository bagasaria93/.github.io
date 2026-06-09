'use strict';

const App = {
  currentModule: null,
  currentRoute:  null,

  init() {
    DB.init();
    if (!Auth.requireAuth()) return;
    this.buildSidebar();
    this.buildTopbar();
    this.bindEvents();
    const route = this.getRoute() || 'dashboard';
    this.navigate(route);
    this.startClock();
  },

  getRoute() {
    return window.location.hash.replace('#/','').split('?')[0] || 'dashboard';
  },

  navigate(route) {
    const session = Auth.getSession();
    const allowed = (MENUS[session.role] || []).map(m => m.id);
    if (!allowed.includes(route)) { this.navigate('dashboard'); return; }

    if (this.currentModule && typeof this.currentModule.destroy === 'function') this.currentModule.destroy();
    destroyAllCharts();

    this.currentRoute = route;
    window.location.hash = `/${route}`;
    this.updateActiveMenu(route);
    this.updatePageTitle(route);

    const moduleMap = {
      dashboard:      window.DashboardModule,
      users:          window.UsersModule,
      courses:        window.CoursesModule,
      reports:        window.ReportsModule,
      'my-courses':   window.MyCoursesModule,
      materials:      window.MaterialsModule,
      assignments:    window.AssignmentsModule,
      grades:         window.GradesModule,
      'my-materials': window.MyMaterialsModule,
      'my-assignments': window.MyAssignmentsModule,
      profile:        window.ProfileModule,
    };

    const mod = moduleMap[route];
    if (!mod) {
      document.getElementById('app-content').innerHTML = `<div class="empty-state"><i data-lucide="construction"></i><h3>Modul tidak ditemukan</h3></div>`;
      if (window.lucide) lucide.createIcons();
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
    const navItems = menus.map(m => `
      <li><a href="#/${m.id}" class="nav-link" data-route="${m.id}">
        <i data-lucide="${m.icon}" class="nav-icon"></i>
        <span class="nav-label">${m.label}</span>
      </a></li>`).join('');

    document.getElementById('sidebar').innerHTML = `
      <div class="sidebar-header">
        <div class="sidebar-logo">
          <div class="logo-mark">PA</div>
          <div>
            <div class="logo-name">Portal Akademik</div>
            <div class="logo-sub">E-Learning System</div>
          </div>
        </div>
      </div>
      <nav class="sidebar-nav">
        <ul class="nav-list" id="nav-list">${navItems}</ul>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          ${avatarHtml(session.name, 34, 'flex-shrink-0')}
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${escapeHtml(session.name)}</div>
            <div class="sidebar-user-role">${getRoleLabel(session.role)}</div>
          </div>
        </div>
        <button class="btn-logout" id="btn-logout" title="Keluar">
          <i data-lucide="log-out"></i>
        </button>
        <a href="https://bagasaria93.github.io" target="_blank" rel="noopener noreferrer" style="font-size:10px;color:rgba(255,255,255,0.25);text-decoration:none;display:block;text-align:center;padding:8px 0 4px;">by Bagas Aria Sativa</a>
      </div>`;
    if (window.lucide) lucide.createIcons({ nodes: [document.getElementById('sidebar')] });
  },

  buildTopbar() {
    document.getElementById('topbar').innerHTML = `
      <div class="topbar-left">
        <button class="sidebar-toggle" id="sidebar-toggle"><i data-lucide="menu"></i></button>
        <div class="breadcrumb" id="page-breadcrumb">Dashboard</div>
      </div>
      <div class="topbar-right">
        <div class="topbar-date" id="topbar-clock"></div>
      </div>`;
    if (window.lucide) lucide.createIcons({ nodes: [document.getElementById('topbar')] });
  },

  updateActiveMenu(route) {
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.route === route);
    });
  },

  updatePageTitle(route) {
    const session = Auth.getSession();
    const menu = (MENUS[session.role] || []).find(m => m.id === route);
    const label = menu ? menu.label : 'Dashboard';
    document.title = `${label} | Portal Akademik`;
    const bc = document.getElementById('page-breadcrumb');
    if (bc) bc.textContent = label;
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
        this.navigate(navLink.dataset.route);
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay')?.classList.remove('active');
      }
      if (e.target.closest('#sidebar-toggle')) {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebar-overlay')?.classList.toggle('active');
      }
      if (e.target.closest('#sidebar-overlay')) {
        document.getElementById('sidebar').classList.remove('open');
        e.target.classList.remove('active');
      }
      if (e.target.closest('#btn-logout')) {
        confirmDialog('Apakah Anda yakin ingin keluar?', () => Auth.logout());
      }
      if (e.target.classList.contains('modal')) closeAllModals();
    });
  },

  startClock() {
    const update = () => {
      const el = document.getElementById('topbar-clock');
      if (!el) return;
      const now = new Date();
      el.textContent = `${HARI[now.getDay()]}, ${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}`;
    };
    update();
    setInterval(update, 60000);
  },
};

document.addEventListener('DOMContentLoaded', () => App.init());
