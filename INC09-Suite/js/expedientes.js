/**
 * modules/expedientes.js — InvestigaTrack: Expedientes IMSS
 * CRUD completo: listado, registro, control (fuentes, socios, investigaciones)
 */
Modules.expedientes = {
  _page: 1, _query: '', _editing: null,

  render() { this.renderList(); },

  // ── Listado ────────────────────────────────────────────────
  renderList() {
    const q = this._query.toLowerCase();
    let data = DB.expedientes.getAll();
    if (q) data = data.filter(e => Utils.matchSearch(e, q));
    data.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    const { items, total, pages } = Utils.paginate(data, this._page, 20);
    const tbody = document.getElementById('exp-tbody');
    if (!tbody) return;

    tbody.innerHTML = items.map(e => `
      <tr data-id="${e.id}">
        <td>${Utils.esc(e.registro_patronal)}</td>
        <td>${Utils.esc(e.razon_social)}</td>
        <td>${Utils.esc(e.rfc || '—')}</td>
        <td><span class="badge badge-blue">${Utils.esc(e.rango || '—')}</span></td>
        <td>${Utils.esc(e.tipo_persona || '—')}</td>
        <td>${Utils.formatCurrencyShort(e.importe)}</td>
        <td>${Utils.formatDate(e.created_at)}</td>
        <td class="flex gap-2">
          <button class="btn btn-sm btn-ghost" onclick="Modules.expedientes.openControl(${e.id})">🔍 Control</button>
          <button class="btn btn-sm btn-secondary" onclick="Modules.expedientes.editExp(${e.id})">✏</button>
          <button class="btn btn-sm btn-danger" onclick="Modules.expedientes.deleteExp(${e.id})">🗑</button>
        </td>
      </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:30px">Sin expedientes registrados</td></tr>';

    const info = document.getElementById('exp-page-info');
    if (info) info.textContent = `${total} expedientes — Página ${this._page} de ${pages}`;

    Modules.dashboard.render && Modules.dashboard.render();
  },

  search(q) { this._query = q; this._page = 1; this.renderList(); },

  // ── Abrir/Cerrar modal registro ────────────────────────────
  openNew() { this._editing = null; this.openModal({}); },
  editExp(id) { this._editing = id; this.openModal(DB.expedientes.getById(id) || {}); },

  openModal(data = {}) {
    const f = id => document.getElementById(id);
    const set = (id, val) => { const el = f(id); if (el) el.value = val || ''; };
    set('ef-rp', data.registro_patronal);
    set('ef-rs', data.razon_social);
    set('ef-rfc', data.rfc);
    set('ef-rango', data.rango);
    set('ef-tipo', data.tipo_persona);
    set('ef-actividad', data.actividad);
    set('ef-importe', data.importe);
    set('ef-integrador', data.integrador);
    set('ef-dom-general', data.dom_general);
    set('ef-dom-dad', data.dom_dad);
    set('ef-dom-arp', data.dom_arp_fiscal);
    set('ef-fecha-baja', data.fecha_baja);
    document.getElementById('exp-modal-title').textContent = this._editing ? 'Editar Expediente' : 'Nuevo Expediente';
    document.getElementById('exp-modal').classList.add('open');
  },

  closeModal() { document.getElementById('exp-modal').classList.remove('open'); },

  saveModal() {
    const g = id => document.getElementById(id)?.value?.trim() || '';
    const rp = g('ef-rp'); const rs = g('ef-rs');
    if (!rp || !rs) { Utils.toast('Registro Patronal y Razón Social son obligatorios', 'error'); return; }
    const data = {
      registro_patronal: rp, razon_social: rs, rfc: g('ef-rfc'),
      rango: g('ef-rango'), tipo_persona: g('ef-tipo'), actividad: g('ef-actividad'),
      importe: parseFloat(g('ef-importe')) || 0, integrador: g('ef-integrador'),
      dom_general: g('ef-dom-general'), dom_dad: g('ef-dom-dad'),
      dom_arp_fiscal: g('ef-dom-arp'), fecha_baja: g('ef-fecha-baja'),
    };
    if (this._editing) {
      DB.expedientes.update(this._editing, data);
      Utils.toast('Expediente actualizado', 'success');
    } else {
      DB.expedientes.insert(data);
      Utils.toast('Expediente registrado', 'success');
    }
    this.closeModal(); this.renderList();
  },

  deleteExp(id) {
    const e = DB.expedientes.getById(id);
    if (!e) return;
    if (!Utils.confirm(`¿Eliminar expediente "${e.razon_social}"?`)) return;
    DB.expedientes.remove(id);
    DB.socios.byExp(id).forEach(s => DB.socios.remove(s.id));
    DB.fuentes.byExp(id).forEach(f => DB.fuentes.remove(f.id));
    Utils.toast('Expediente eliminado', 'info');
    this.renderList();
  },

  // ── Control de Expediente ──────────────────────────────────
  openControl(id) {
    const exp = DB.expedientes.getById(id);
    if (!exp) return;
    this._controlId = id;
    document.getElementById('ctrl-title').textContent = exp.razon_social;
    document.getElementById('ctrl-rp').textContent    = exp.registro_patronal;
    document.getElementById('ctrl-rfc').textContent   = exp.rfc || '—';
    document.getElementById('ctrl-rango').textContent = exp.rango || '—';
    document.getElementById('ctrl-importe').textContent = Utils.formatCurrencyShort(exp.importe);
    document.getElementById('ctrl-dom').textContent   = exp.dom_general || '—';
    document.getElementById('ctrl-integrador').textContent = exp.integrador || '—';
    this.renderSocios(); this.renderFuentes('interna'); this.renderFuentes('externa');
    App.navigate('control');
  },

  // ── Socios ─────────────────────────────────────────────────
  renderSocios() {
    const id = this._controlId;
    const socios = DB.socios.byExp(id);
    const tbody = document.getElementById('ctrl-socios-tbody');
    if (!tbody) return;
    tbody.innerHTML = socios.map(s => `
      <tr>
        <td>${s.numero_socio}</td>
        <td>${Utils.esc(s.nombre || '—')}</td>
        <td>${Utils.esc(s.domicilio || '—')}</td>
        <td>${Utils.esc(s.procedencia || '—')}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="Modules.expedientes.editSocio(${s.id})">✏</button>
          <button class="btn btn-sm btn-danger" onclick="Modules.expedientes.deleteSocio(${s.id})">🗑</button>
        </td>
      </tr>`).join('') || '<tr><td colspan="5" style="text-align:center;color:var(--text-muted)">Sin socios</td></tr>';
  },

  addSocio() {
    const id = this._controlId;
    const socios = DB.socios.byExp(id);
    const nom = document.getElementById('socio-nombre')?.value?.trim() || '';
    const dom = document.getElementById('socio-domicilio')?.value?.trim() || '';
    const pro = document.getElementById('socio-procedencia')?.value?.trim() || '';
    if (!nom) { Utils.toast('Nombre del socio requerido', 'error'); return; }
    DB.socios.insert({ expediente_id: id, numero_socio: socios.length + 1, nombre: nom, domicilio: dom, procedencia: pro });
    document.getElementById('socio-nombre').value = '';
    document.getElementById('socio-domicilio').value = '';
    document.getElementById('socio-procedencia').value = '';
    Utils.toast('Socio agregado', 'success'); this.renderSocios();
  },

  editSocio(id) {
    const s = DB.socios.getAll().find(x => x.id === id);
    if (!s) return;
    const nom = prompt('Nombre del socio:', s.nombre || '');
    if (nom === null) return;
    const dom = prompt('Domicilio:', s.domicilio || '');
    const pro = prompt('Procedencia:', s.procedencia || '');
    DB.socios.update(id, { nombre: nom, domicilio: dom, procedencia: pro });
    Utils.toast('Socio actualizado', 'success'); this.renderSocios();
  },

  deleteSocio(id) {
    if (!Utils.confirm('¿Eliminar este socio?')) return;
    DB.socios.remove(id); this.renderSocios();
  },

  // ── Fuentes ────────────────────────────────────────────────
  renderFuentes(tipo) {
    const expId = this._controlId;
    const fuentes = DB.fuentes.byExp(expId).filter(f => f.tipo === tipo);
    const tbodyId = tipo === 'interna' ? 'ctrl-fi-tbody' : 'ctrl-fe-tbody';
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;
    const ESTATUS_BADGE = { Pendiente: 'badge-amber', Concluido: 'badge-green', Actualizar: 'badge-blue' };
    tbody.innerHTML = fuentes.map(f => `
      <tr>
        <td>${Utils.esc(f.nombre_fuente)}</td>
        <td>${Utils.esc(f.no_oficio || '—')}</td>
        <td>${Utils.formatDate(f.fecha_oficio)}</td>
        <td>${Utils.formatDate(f.fecha_respuesta)}</td>
        <td><span class="badge ${ESTATUS_BADGE[f.estatus] || 'badge-gray'}">${f.estatus || 'Pendiente'}</span></td>
        <td>${Utils.esc(f.observaciones || '—')}</td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="Modules.expedientes.editFuente(${f.id})">✏</button>
          <button class="btn btn-sm btn-danger" onclick="Modules.expedientes.deleteFuente(${f.id},'${tipo}')">🗑</button>
        </td>
      </tr>`).join('') || `<tr><td colspan="7" style="text-align:center;color:var(--text-muted)">Sin fuentes ${tipo}s</td></tr>`;
  },

  openFuenteModal(tipo) {
    this._fuenteTipo = tipo;
    document.getElementById('fuente-modal-title').textContent = `Nueva Fuente ${tipo === 'interna' ? 'Interna' : 'Externa'}`;
    ['fuente-nombre','fuente-oficio','fuente-fecha-oficio','fuente-no-resp','fuente-fecha-resp','fuente-caducidad','fuente-obs'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    document.getElementById('fuente-estatus').value = 'Pendiente';
    this._editingFuente = null;
    document.getElementById('fuente-modal').classList.add('open');
  },

  editFuente(id) {
    const f = DB.fuentes.getAll().find(x => x.id === id);
    if (!f) return;
    this._fuenteTipo = f.tipo; this._editingFuente = id;
    document.getElementById('fuente-modal-title').textContent = 'Editar Fuente';
    const set = (elId, val) => { const el = document.getElementById(elId); if (el) el.value = val || ''; };
    set('fuente-nombre', f.nombre_fuente); set('fuente-oficio', f.no_oficio);
    set('fuente-fecha-oficio', f.fecha_oficio); set('fuente-no-resp', f.no_respuesta);
    set('fuente-fecha-resp', f.fecha_respuesta); set('fuente-caducidad', f.fecha_caducidad);
    set('fuente-obs', f.observaciones);
    document.getElementById('fuente-estatus').value = f.estatus || 'Pendiente';
    document.getElementById('fuente-modal').classList.add('open');
  },

  saveFuente() {
    const g = id => document.getElementById(id)?.value?.trim() || '';
    const nombre = g('fuente-nombre');
    if (!nombre) { Utils.toast('Nombre de fuente requerido', 'error'); return; }
    const data = {
      expediente_id: this._controlId, tipo: this._fuenteTipo,
      nombre_fuente: nombre, no_oficio: g('fuente-oficio'),
      fecha_oficio: g('fuente-fecha-oficio'), no_respuesta: g('fuente-no-resp'),
      fecha_respuesta: g('fuente-fecha-resp'), fecha_caducidad: g('fuente-caducidad'),
      estatus: g('fuente-estatus'), observaciones: g('fuente-obs'),
    };
    if (this._editingFuente) { DB.fuentes.update(this._editingFuente, data); Utils.toast('Fuente actualizada', 'success'); }
    else { DB.fuentes.insert(data); Utils.toast('Fuente agregada', 'success'); }
    document.getElementById('fuente-modal').classList.remove('open');
    this.renderFuentes(this._fuenteTipo);
  },

  deleteFuente(id, tipo) {
    if (!Utils.confirm('¿Eliminar esta fuente?')) return;
    DB.fuentes.remove(id); this.renderFuentes(tipo);
  },

  closeFuenteModal() { document.getElementById('fuente-modal').classList.remove('open'); },
  backToList() { App.navigate('expedientes'); },
};
