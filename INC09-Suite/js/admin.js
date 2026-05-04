/**
 * admin.js — Módulo de Administración: Usuarios y Encargados
 * Usuarios gestionados via SqliteDB (SQLite + bcrypt).
 * Encargados gestionados via DB (localStorage).
 */
Modules.admin = {
  _tab: 'usuarios', _editingUser: null, _editingEnc: null,

  async render() {
    await this.renderUsers();
    this.renderEncargados();
  },

  switchTab(tab) {
    this._tab = tab;
    document.querySelectorAll('.adm-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.getElementById('adm-usuarios-sec').style.display   = tab === 'usuarios'   ? '' : 'none';
    document.getElementById('adm-encargados-sec').style.display = tab === 'encargados' ? '' : 'none';
  },

  // ── USUARIOS ───────────────────────────────────────────────

  async renderUsers() {
    const tbody = document.getElementById('adm-users-tbody');
    if (!tbody) return;
    const users = SqliteDB.getUsers();
    const ROLES = {
      admin:   '<span class="badge badge-purple">👑 Admin</span>',
      usuario: '<span class="badge badge-gray">Usuario</span>',
    };
    tbody.innerHTML = users.map(u => `
      <tr>
        <td style="color:var(--text-muted)">${u.id}</td>
        <td>${Utils.esc(u.nombre)}</td>
        <td><code style="color:var(--accent)">${Utils.esc(u.username)}</code></td>
        <td>${Utils.esc(u.iniciales || '—')}</td>
        <td>${Utils.esc(u.constancia_matricula || '—')}</td>
        <td>${Utils.esc(u.departamento || '—')}</td>
        <td>${Utils.esc(u.figura || '—')}</td>
        <td>${ROLES[u.rol] || u.rol}</td>
        <td>
          <span class="badge ${u.activo ? 'badge-green' : 'badge-red'}">${u.activo ? 'Activo' : 'Inactivo'}</span>
        </td>
        <td class="flex gap-2">
          <button class="btn btn-sm btn-secondary" onclick="Modules.admin.editUser(${u.id})">✏</button>
          <button class="btn btn-sm btn-danger"    onclick="Modules.admin.deleteUser(${u.id})"
            ${u.id === App.session?.id ? 'disabled title="No puedes eliminar tu propia cuenta"' : ''}>🗑</button>
        </td>
      </tr>`).join('') || '<tr><td colspan="10" style="text-align:center;color:var(--text-muted)">Sin usuarios</td></tr>';
  },

  openUserModal(data = {}) {
    this._editingUser = data.id || null;
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val ?? ''; };
    set('au-nombre',               data.nombre);
    set('au-username',             data.username);
    set('au-iniciales',            data.iniciales);
    set('au-constancia-matricula', data.constancia_matricula);
    set('au-email',                data.email);
    set('au-depto',                data.departamento);
    set('au-figura',               data.figura);
    set('au-password',             '');
    if (document.getElementById('au-rol')) {
      document.getElementById('au-rol').value = data.rol || 'Visitador';
    }
    // Contraseña: obligatoria solo si es nuevo
    const pwNote = document.getElementById('au-pw-note');
    if (pwNote) pwNote.textContent = this._editingUser
      ? 'Dejar vacío para no cambiar la contraseña.'
      : 'Obligatoria para nuevo usuario.';

    // Permisos Custom
    const permCont = document.getElementById('au-permisos-container');
    if (permCont) {
      if (App.session?.rol === 'Administrador') {
        permCont.style.display = 'block';
        if (data.permisos_custom) {
          try {
            const custom = JSON.parse(data.permisos_custom);
            document.querySelectorAll('.au-perm').forEach(chk => {
              chk.checked = !!custom[chk.value];
            });
          } catch(e) {}
        } else {
          this.onRoleChange(data.rol || 'Visitador');
        }
      } else {
        permCont.style.display = 'none';
      }
    }

    document.getElementById('au-modal-title').textContent = this._editingUser
      ? '✏️ Editar Usuario'
      : '👤 Nuevo Usuario';
    document.getElementById('au-modal').classList.add('open');
  },

  editUser(id) {
    const user = SqliteDB.getUserById(id);
    if (user) this.openUserModal(user);
  },

  onRoleChange(role) {
    const defaults = {
      dashboard: false, expedientes: false, visitas: false, viaticos: false,
      analisis: false, vales: false, admin: false,
      visitas_origen_write: false, viaticos_write: false
    };
    if (role === 'Administrador') {
      Object.keys(defaults).forEach(k => defaults[k] = true);
    } else if (role === 'Supervisor') {
      Object.keys(defaults).forEach(k => defaults[k] = true);
      defaults.admin = false;
    } else if (role === 'Integrador') {
      defaults.expedientes = true; defaults.viaticos = true; defaults.visitas = true;
      defaults.viaticos_write = true; // Integrador can write viaticos, but not vales
    } else if (role === 'Visitador') {
      defaults.visitas = true; defaults.viaticos = true;
    }
    document.querySelectorAll('.au-perm').forEach(chk => {
      chk.checked = !!defaults[chk.value];
    });
  },

  async saveUser() {
    const g = id => document.getElementById(id)?.value?.trim() || '';
    const nombre    = g('au-nombre');
    const username  = g('au-username');
    const password  = g('au-password');
    const constancia = g('au-constancia-matricula');

    if (!nombre || !username) {
      Utils.toast('Nombre y Usuario son obligatorios', 'error'); return;
    }
    if (!this._editingUser && !password) {
      Utils.toast('La contraseña es obligatoria para nuevos usuarios', 'error'); return;
    }

    const data = {
      username, nombre,
      iniciales:            g('au-iniciales'),
      constancia_matricula: constancia,
      email:                g('au-email'),
      figura:               g('au-figura'),
      departamento:         g('au-depto'),
      rol:                  document.getElementById('au-rol')?.value || 'Visitador',
    };
    if (password) data.password = password;

    if (App.session?.rol === 'Administrador') {
      const custom = {};
      document.querySelectorAll('.au-perm').forEach(chk => {
        custom[chk.value] = chk.checked;
      });
      data.permisos_custom = JSON.stringify(custom);
    }

    // Mostrar spinner en botón
    const btn = document.getElementById('au-save-btn');
    const orig = btn?.textContent || '💾 Guardar';
    if (btn) { btn.disabled = true; btn.textContent = '⏳ Guardando...'; }

    try {
      if (this._editingUser) {
        await SqliteDB.updateUser(this._editingUser, data);
        Utils.toast('Usuario actualizado correctamente', 'success');
        // Si el usuario editó su propia sesión, actualizar sesión
        if (this._editingUser === App.session?.id) {
          const updated = SqliteDB.getUserById(this._editingUser);
          DB.setSession(updated);
          App.session = updated;
          App.renderUserInfo();
        }
      } else {
        await SqliteDB.addUser(data);
        Utils.toast(`Usuario "${username}" creado correctamente`, 'success');
      }
      document.getElementById('au-modal').classList.remove('open');
      this.renderUsers();
    } catch (err) {
      Utils.toast(err.message || 'Error al guardar usuario', 'error');
    } finally {
      if (btn) { btn.disabled = false; btn.textContent = orig; }
    }
  },

  _deleteConfirm: {},
  async deleteUser(id) {
    if (id === App.session?.id) {
      Utils.toast('No puedes eliminar tu propia cuenta', 'error'); return;
    }
    const user = SqliteDB.getUserById(id);
    if (!user) return;
    
    // Bypass native confirm by requiring a double click
    if (!this._deleteConfirm[`u_${id}`]) {
      this._deleteConfirm[`u_${id}`] = true;
      Utils.toast('⚠️ Presiona el botón de eliminar de nuevo para confirmar', 'info');
      setTimeout(() => { delete this._deleteConfirm[`u_${id}`]; }, 3000);
      return;
    }
    delete this._deleteConfirm[`u_${id}`];
    
    SqliteDB.deleteUser(id);
    Utils.toast('Usuario eliminado', 'success');
    this.renderUsers();
  },

  closeUserModal() { document.getElementById('au-modal').classList.remove('open'); },

  // ── ENCARGADOS ─────────────────────────────────────────────

  renderEncargados() {
    const tbody = document.getElementById('adm-enc-tbody');
    if (!tbody) return;
    const encs = DB.encargados.getAll();
    tbody.innerHTML = encs.map(e => `
      <tr>
        <td style="color:var(--text-muted)">${e.id}</td>
        <td>${Utils.esc(e.nombre)}</td>
        <td><span class="badge badge-blue">${Utils.esc(e.cargo)}</span></td>
        <td>${Utils.esc(e.departamento || '—')}</td>
        <td class="flex gap-2">
          <button class="btn btn-sm btn-secondary" onclick="Modules.admin.editEnc(${e.id})">✏</button>
          <button class="btn btn-sm btn-danger"    onclick="Modules.admin.deleteEnc(${e.id})">🗑</button>
        </td>
      </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Sin encargados</td></tr>';
  },

  openEncModal(data = {}) {
    this._editingEnc = data.id || null;
    ['ae-nombre','ae-cargo','ae-depto'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = data[id.replace('ae-','').replace('depto','departamento')] || '';
    });
    document.getElementById('ae-nombre').value = data.nombre || '';
    document.getElementById('ae-cargo').value  = data.cargo  || '';
    document.getElementById('ae-depto').value  = data.departamento || '';
    document.getElementById('ae-modal').classList.add('open');
  },

  editEnc(id) {
    const enc = DB.encargados.getAll().find(e => e.id === id);
    if (enc) this.openEncModal(enc);
  },

  saveEnc() {
    const g = id => document.getElementById(id)?.value?.trim() || '';
    const nombre = g('ae-nombre'), cargo = g('ae-cargo');
    if (!nombre) { Utils.toast('Nombre del encargado requerido', 'error'); return; }
    const data = { nombre, cargo, departamento: g('ae-depto') };
    if (this._editingEnc) {
      DB.encargados.update(this._editingEnc, data);
      Utils.toast('Encargado actualizado', 'success');
    } else {
      DB.encargados.insert(data);
      Utils.toast('Encargado registrado', 'success');
    }
    document.getElementById('ae-modal').classList.remove('open');
    this.renderEncargados();
  },

  deleteEnc(id) {
    if (!this._deleteConfirm[`e_${id}`]) {
      this._deleteConfirm[`e_${id}`] = true;
      Utils.toast('⚠️ Presiona el botón de eliminar de nuevo para confirmar', 'info');
      setTimeout(() => { delete this._deleteConfirm[`e_${id}`]; }, 3000);
      return;
    }
    delete this._deleteConfirm[`e_${id}`];
    
    DB.encargados.remove(id);
    Utils.toast('Encargado eliminado', 'success');
    this.renderEncargados();
  },

  closeEncModal() { document.getElementById('ae-modal').classList.remove('open'); },
};
