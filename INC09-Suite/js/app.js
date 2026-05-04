/**
 * app.js — Router y controlador principal INC09 Suite
 * Login usa SqliteDB.verifyLogin() con bcrypt asíncrono.
 */

const App = {
  session: null,
  page: '',

  // ── Inicialización ────────────────────────────────────────
  async init() {
    const initMsg = document.getElementById('login-init-msg');
    if (initMsg) { initMsg.style.display = 'block'; initMsg.textContent = '⏳ Cargando bases de datos desde el servidor...'; }
    
    // 1. Inicializar base de datos JSON centralizada
    await DB.initServerLoad();
    DB.seed();

    // 2. Inicializar SQLite + bcrypt para usuarios
    try {
      await SqliteDB.init();
      if (initMsg) initMsg.style.display = 'none';
    } catch (e) {
      console.error('[App] Error inicializando SqliteDB:', e);
      if (initMsg) { initMsg.textContent = '⚠️ Error al cargar la base de datos. Recarga la página.'; }
      return;
    }

    // 3. Restaurar sesión si existe
    const sess = DB.getSession();
    if (sess) {
      // Verificar que el usuario aún existe en SQLite
      const fresh = SqliteDB.getUserById(sess.id);
      if (fresh && fresh.activo) {
        this.session = fresh;
        DB.setSession(fresh); // Refrescar con datos actuales
        this.showApp();
        return;
      }
      DB.clearSession(); // Sesión inválida
    }
    this.showLogin();
  },

  // ── Pantallas ─────────────────────────────────────────────
  showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('app').style.display = 'none';
  },

  showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    this.renderUserInfo();
    this.updateSidebarVisibility();
    
    const perms = this.getPermissions(this.session);
    if (perms.dashboard) this.navigate('dashboard');
    else if (perms.expedientes) this.navigate('expedientes');
    else if (perms.visitas) this.navigate('visitas');
    else if (perms.viaticos) this.navigate('viaticos');
    else this.navigate('dashboard');
  },

  // ── Permisos (RBAC) ───────────────────────────────────────
  getPermissions(user) {
    if (!user) return {};
    
    const perms = {
      dashboard: false, expedientes: false, control: false,
      analisis: false, vales: false, visitas: false,
      viaticos: false, admin: false
    };

    const role = user.rol || 'Visitador';

    if (role === 'Administrador' || role === 'admin') {
      Object.keys(perms).forEach(k => perms[k] = true);
    } else if (role === 'Supervisor') {
      Object.keys(perms).forEach(k => perms[k] = true);
      perms.admin = false;
    } else if (role === 'Integrador') {
      perms.expedientes = true;
      perms.viaticos = true;
      perms.visitas = true;
    } else if (role === 'Visitador' || role === 'usuario') {
      perms.visitas = true;
      perms.viaticos = true;
    }

    if (user.permisos_custom) {
      try {
        const custom = JSON.parse(user.permisos_custom);
        Object.assign(perms, custom);
      } catch (e) {
        console.error('[App] Error parsing permisos_custom', e);
      }
    }
    return perms;
  },

  updateSidebarVisibility() {
    const perms = this.getPermissions(this.session);
    document.querySelectorAll('.nav-item').forEach(el => {
      const page = el.dataset.page;
      if (page && page !== 'logout') {
        el.style.display = perms[page] ? 'flex' : 'none';
      }
    });
  },

  // ── Login async (bcrypt) ──────────────────────────────────
  async login(username, password) {
    const btn     = document.getElementById('btn-login');
    const spinner = document.getElementById('login-spinner');
    const err     = document.getElementById('login-error');

    // UI: loading state
    if (btn)     { btn.disabled = true; btn.textContent = 'Verificando...'; }
    if (spinner) spinner.style.display = 'inline';
    if (err)     err.classList.remove('show');

    try {
      const user = await SqliteDB.verifyLogin(username, password);
      if (!user) {
        if (err) { err.textContent = '❌ Usuario o contraseña incorrectos.'; err.classList.add('show'); }
        document.getElementById('login-pass').value = '';
        return false;
      }
      this.session = user;
      DB.setSession(user);
      this.showApp();
      return true;
    } catch (e) {
      console.error('[App] Error en login:', e);
      if (err) { err.textContent = '⚠️ Error interno. Intenta de nuevo.'; err.classList.add('show'); }
      return false;
    } finally {
      if (btn)     { btn.disabled = false; btn.textContent = 'Iniciar Sesión'; }
      if (spinner) spinner.style.display = 'none';
    }
  },

  logout() {
    DB.clearSession();
    this.session = null;
    document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Limpiar campos de login por seguridad
    const loginUser = document.getElementById('login-user');
    const loginPass = document.getElementById('login-pass');
    if (loginUser) loginUser.value = '';
    if (loginPass) loginPass.value = '';
    
    this.showLogin();
  },

  // ── Navegación ────────────────────────────────────────────
  navigate(pageId) {
    if (this.page === pageId) return;

    if (pageId !== 'logout') {
      const perms = this.getPermissions(this.session);
      if (!perms[pageId]) {
        Utils.toast('No tienes permiso para acceder a esta sección.', 'error');
        return;
      }
    }

    this.page = pageId;

    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const target = document.getElementById(`page-${pageId}`);
    if (target) target.classList.add('active');

    document.querySelectorAll('.nav-item').forEach(b => {
      b.classList.toggle('active', b.dataset.page === pageId);
    });

    const PAGE_TITLES = {
      dashboard:   { title: '📊 Dashboard',              sub: 'Resumen general del sistema' },
      expedientes: { title: '📂 Expedientes',             sub: 'Gestión de expedientes IMSS' },
      control:     { title: '🔍 Control de Expediente',   sub: 'Seguimiento y fuentes' },
      analisis:    { title: '📈 Analisis',           sub: 'Merger COP/RCV y Análisis RALE' },
      vales:       { title: '📄 Generador de Vales',      sub: 'Vales de préstamo IMSS' },
      visitas:     { title: '🗺️ Control de Visitas',     sub: 'Localización de domicilios IMSS' },
      viaticos:    { title: '💰 Viáticos',               sub: 'Registro y reporte de viáticos' },
      admin:       { title: '⚙️ Administración',          sub: 'Usuarios, encargados y configuración' },
    };
    const info = PAGE_TITLES[pageId] || { title: pageId, sub: '' };
    document.getElementById('topbar-title').textContent = info.title;
    document.getElementById('topbar-sub').textContent   = info.sub;

    const renders = {
      dashboard:   () => Modules.dashboard.render(),
      expedientes: () => Modules.expedientes.render(),
      analisis:    () => Modules.analisis.render(),
      visitas:     () => Modules.visitas.render(),
      viaticos:    () => Modules.viaticos.render(),
      admin:       () => Modules.admin.render(),
      vales:       () => Modules.vales.render(),
    };
    if (renders[pageId]) renders[pageId]();
  },

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('collapsed');
  },

  renderUserInfo() {
    const u = this.session;
    if (!u) return;
    const avatar = document.getElementById('user-avatar');
    const name   = document.getElementById('user-name');
    const role   = document.getElementById('user-role');
    if (avatar) avatar.textContent = (u.iniciales || u.nombre || '?').slice(0, 2).toUpperCase();
    if (name)   name.textContent   = u.nombre || u.username;
    if (role)   role.textContent   = u.rol === 'admin' ? '👑 Administrador' : '👤 Usuario';

    const adminNav = document.getElementById('nav-admin');
    if (adminNav) adminNav.style.display = u.rol === 'admin' ? '' : 'none';
  },

  isAdmin() { return this.session?.rol === 'admin'; },
};

// ── Bootstrap ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Formulario de login (async)
  document.getElementById('login-form').addEventListener('submit', async e => {
    e.preventDefault();
    const user = document.getElementById('login-user').value.trim();
    const pass = document.getElementById('login-pass').value;
    await App.login(user, pass);
  });

  // Sidebar toggle
  document.getElementById('btn-sidebar-toggle').addEventListener('click', () => App.toggleSidebar());

  // Nav items
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page === 'logout') { App.logout(); return; }
      App.navigate(page);
    });
  });

  // Iniciar app
  App.init();
});
