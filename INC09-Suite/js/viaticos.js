/**
 * viaticos.js — Control de Viáticos IMSS
 * Sección "Visitas Realizadas": 5 visitas, máx. 2 registros c/u.
 * Cada registro: Núm. | Reg. Patronal | Nombre/Razón Social | Domicilio
 */
Modules.viaticos = {
  _tab: 'form',
  _editingFolio: null,
  _query: '',
  _visitasRows: [0, 0, 0, 0, 0], // conteo de filas activas por visita (índice 0 = Visita 1)

  render() {
    this.loadEncargados();
    if (this._tab === 'list') this.renderList();
  },

  loadEncargados() {
    const encs = DB.encargados.getAll().map(e => e.nombre);
    ['vt-jefe', 'vt-subdelegado'].forEach(id => {
      const sel = document.getElementById(id); if (!sel) return;
      const cur = sel.value;
      sel.innerHTML = '<option value="">— Seleccionar —</option>' +
        encs.map(n => `<option ${cur === n ? 'selected' : ''}>${Utils.esc(n)}</option>`).join('');
    });
    if (!this._editingFolio && App.session) {
      const u = App.session;
      const fn = document.getElementById('vt-nombre'); if (fn && !fn.value) fn.value = u.nombre || '';
      const ff = document.getElementById('vt-figura'); if (ff && !ff.value) ff.value = u.figura || '';
      const fd = document.getElementById('vt-depto');  if (fd && !fd.value) fd.value = u.departamento || '';
    }
    this.recalcTotal();
  },

  switchTab(tab) {
    this._tab = tab;
    document.querySelectorAll('.vt-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.getElementById('vt-form-section').style.display = tab === 'form' ? '' : 'none';
    document.getElementById('vt-list-section').style.display = tab === 'list' ? '' : 'none';
    if (tab === 'list') this.renderList();
  },

  recalcTotal() {
    let total = 0;
    for (let i = 1; i <= 5; i++) {
      const v = parseFloat(document.getElementById(`vt-cant-${i}`)?.value || '0') || 0;
      total += v;
    }
    const el = document.getElementById('vt-total-display');
    if (el) el.textContent = Utils.formatCurrencyShort(total);
  },

  // ── Visitas Realizadas ─────────────────────────────────────

  /**
   * Agrega una fila de registro a la visita indicada (máx. 2).
   * @param {number} v - número de visita (1-5)
   */
  addVisitaRow(v) {
    const idx = v - 1;
    if (this._visitasRows[idx] >= 2) {
      Utils.toast('Máximo 2 registros por visita', 'error');
      return;
    }
    this._visitasRows[idx]++;
    this._renderVisitaTable(v);
  },

  /**
   * Elimina una fila específica de una visita, preservando el resto.
   * @param {number} v   - visita (1-5)
   * @param {number} row - número de fila dentro de la visita (1-2)
   */
  removeVisitaRow(v, row) {
    // Guardar datos actuales antes de renderizar
    const saved = this._getVisitaRowsData(v);
    saved.splice(row - 1, 1); // quitar la fila seleccionada
    this._visitasRows[v - 1] = Math.max(0, this._visitasRows[v - 1] - 1);
    this._renderVisitaTable(v);
    // Repoblar con los datos guardados
    saved.forEach((d, i) => {
      const r = i + 1;
      const rp  = document.getElementById(`v${v}-rp-${r}`);
      const nom = document.getElementById(`v${v}-nom-${r}`);
      const dom = document.getElementById(`v${v}-dom-${r}`);
      if (rp)  rp.value  = d.reg_patronal || '';
      if (nom) nom.value = d.nombre       || '';
      if (dom) dom.value = d.domicilio    || '';
    });
  },

  /**
   * Re-renderiza la columna de una visita (cards con field-input).
   * @param {number} v - visita (1-5)
   */
  _renderVisitaTable(v) {
    const body = document.getElementById(`visita-tbody-${v}`);
    if (!body) return;
    const count = this._visitasRows[v - 1];

    if (count === 0) {
      body.innerHTML = `<div class="vr-empty">Sin registros<br><span style="font-size:10px;opacity:.7">Usa "+ Agregar"</span></div>`;
    } else {
      let html = '';
      for (let r = 1; r <= count; r++) {
        html += `
          <div class="vr-card">
            <span class="vr-card-num">${r}</span>
            <button class="vr-card-del" onclick="Modules.viaticos.removeVisitaRow(${v},${r})" title="Eliminar">✕</button>
            <div class="field" style="margin-top:14px">
              <label class="field-label">Reg. Patronal</label>
              <input class="field-input" id="v${v}-rp-${r}" placeholder="MEX-12345-01">
            </div>
            <div class="field">
              <label class="field-label">Razón Social</label>
              <input class="field-input" id="v${v}-nom-${r}" placeholder="Nombre de la empresa">
            </div>
            <div class="field">
              <label class="field-label">Domicilio</label>
              <input class="field-input" id="v${v}-dom-${r}" placeholder="Calle, Núm., Colonia">
            </div>
          </div>`;
      }
      body.innerHTML = html;
    }

    // Estado del botón Agregar
    const btn = document.getElementById(`visita-btn-${v}`);
    if (btn) {
      btn.disabled = count >= 2;
      btn.title    = count >= 2 ? 'Máx. 2 registros por visita' : 'Agregar registro';
    }
  },

  /**
   * Lee los datos actuales de inputs para una visita.
   * @param {number} v - visita (1-5)
   * @returns {Array<{num, reg_patronal, nombre, domicilio}>}
   */
  _getVisitaRowsData(v) {
    const count = this._visitasRows[v - 1];
    const result = [];
    for (let r = 1; r <= count; r++) {
      result.push({
        num: r,
        reg_patronal: document.getElementById(`v${v}-rp-${r}`)?.value?.trim()  || '',
        nombre:       document.getElementById(`v${v}-nom-${r}`)?.value?.trim() || '',
        domicilio:    document.getElementById(`v${v}-dom-${r}`)?.value?.trim() || '',
      });
    }
    return result;
  },

  /**
   * Obtiene el array completo de las 5 visitas.
   * @returns {Array<{visita, registros[]}>}
   */
  getVisitasRealizadas() {
    const out = [];
    for (let v = 1; v <= 5; v++) {
      out.push({ visita: v, registros: this._getVisitaRowsData(v) });
    }
    return out;
  },

  /**
   * Resetea todas las tablas de visitas a 0 filas.
   */
  _clearVisitas() {
    this._visitasRows = [0, 0, 0, 0, 0];
    for (let v = 1; v <= 5; v++) this._renderVisitaTable(v);
  },

  /**
   * Carga visitas guardadas de un registro en edición.
   * @param {Array<{visita, registros[]}>} visitasData
   */
  _loadVisitas(visitasData = []) {
    this._clearVisitas();
    visitasData.forEach(vr => {
      const v   = vr.visita;
      const idx = v - 1;
      this._visitasRows[idx] = vr.registros.length;
      this._renderVisitaTable(v);
      vr.registros.forEach((reg, i) => {
        const r   = i + 1;
        const rp  = document.getElementById(`v${v}-rp-${r}`);
        const nom = document.getElementById(`v${v}-nom-${r}`);
        const dom = document.getElementById(`v${v}-dom-${r}`);
        if (rp)  rp.value  = reg.reg_patronal || '';
        if (nom) nom.value = reg.nombre       || '';
        if (dom) dom.value = reg.domicilio    || '';
      });
    });
  },

  // ── Formulario ─────────────────────────────────────────────

  clearForm() {
    this._editingFolio = null;
    ['vt-nombre','vt-figura','vt-depto','vt-estado','vt-jefe','vt-subdelegado','vt-rubricas','vt-leyenda'].forEach(id => {
      const el = document.getElementById(id); if (el) el.value = '';
    });
    const dateEl = document.getElementById('vt-fecha');
    if (dateEl) dateEl.value = Utils.today();
    for (let i = 1; i <= 5; i++) {
      const fd = document.getElementById(`vt-fecha-${i}`); if (fd) fd.value = '';
      const fc = document.getElementById(`vt-cant-${i}`);  if (fc) fc.value = '';
    }
    this._clearVisitas();
    this.recalcTotal();
    this.loadEncargados();
  },

  saveForm() {
    const g = id => document.getElementById(id)?.value?.trim() || '';
    const nombre = g('vt-nombre');
    if (!nombre) { Utils.toast('Nombre TTD es obligatorio', 'error'); return; }

    // Facturas
    const viaticos = [];
    for (let i = 1; i <= 5; i++) {
      viaticos.push({ fecha: g(`vt-fecha-${i}`), cantidad: g(`vt-cant-${i}`) });
    }
    const total = viaticos.reduce((s, v) => s + (parseFloat(v.cantidad) || 0), 0);

    // Visitas realizadas
    const visitas_realizadas = this.getVisitasRealizadas();

    const data = {
      folio:             this._editingFolio || Utils.generarFolio('VT'),
      nombre_ttd:        nombre,
      figura:            g('vt-figura'),
      departamento:      g('vt-depto'),
      estado:            g('vt-estado') || 'Borrador',
      fecha:             g('vt-fecha'),
      jefe:              g('vt-jefe'),
      subdelegado:       g('vt-subdelegado'),
      rubricas:          g('vt-rubricas'),
      leyenda:           g('vt-leyenda'),
      viaticos,
      visitas_realizadas,
      total_viaticos:    total,
    };

    if (this._editingFolio) {
      const existing = DB.viaticos.getAll().find(v => v.folio === this._editingFolio);
      if (existing) DB.viaticos.update(existing.id, data);
      Utils.toast('Registro actualizado', 'success');
    } else {
      DB.viaticos.insert(data);
      Utils.toast(`Registro guardado. Folio: ${data.folio}`, 'success');
    }
    this.clearForm();
    this.switchTab('list');
  },

  // ── Lista de registros ─────────────────────────────────────

  renderList() {
    const q = this._query.toLowerCase();
    let data = DB.viaticos.getAll();
    if (q) data = data.filter(r => Utils.matchSearch(r, q));
    data.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));

    const EST_BADGE = { Borrador:'badge-gray', Enviado:'badge-blue', Aprobado:'badge-green', Rechazado:'badge-red' };
    const tbody = document.getElementById('vt-list-tbody');
    if (!tbody) return;

    // Check Read-Only mode
    const role = App.session?.rol || 'Visitador';
    let isReadOnly = false;
    if (role === 'Visitador') {
      isReadOnly = true;
    }
    // Check custom override if it exists
    if (App.session?.permisos_custom) {
      try {
        const custom = JSON.parse(App.session.permisos_custom);
        if (custom.viaticos_write !== undefined) {
          isReadOnly = !custom.viaticos_write;
        }
      } catch(e) {}
    }

    // Hide Captura tab and New Button if read-only
    const tabCaptura = document.querySelector('button[onclick="Modules.viaticos.switchTab(\\'form\\')"]');
    if (tabCaptura) tabCaptura.style.display = isReadOnly ? 'none' : 'inline-block';
    
    // Si esta en Captura pero es readOnly, mandarlo a lista
    if (isReadOnly && this._tab === 'form') {
      this.switchTab('list');
      return;
    }

    tbody.innerHTML = data.map(r => {
      // Total de registros individuales (diligencias)
      const totalVis = (r.visitas_realizadas || []).reduce((sum, v) => sum + (v.registros?.length || 0), 0);
      return `
        <tr>
          <td><code style="color:var(--accent)">${Utils.esc(r.folio)}</code></td>
          <td>${Utils.esc(r.nombre_ttd)}</td>
          <td>${Utils.esc(r.figura || '—')}</td>
          <td>${Utils.formatDate(r.fecha)}</td>
          <td style="text-align:center">${totalVis > 0 ? `<span class="badge badge-blue">${totalVis} visita${totalVis !== 1 ? 's' : ''}</span>` : '<span class="badge badge-gray">—</span>'}</td>
          <td>${Utils.formatCurrencyShort(r.total_viaticos)}</td>
          <td><span class="badge ${EST_BADGE[r.estado] || 'badge-gray'}">${r.estado || 'Borrador'}</span></td>
          <td class="flex gap-2">
            <button class="btn btn-sm btn-success"   onclick="Reportes.generarViaticos(DB.viaticos.getAll().find(r=>r.folio==='${r.folio}'))" title="Generar reporte Word">📄 Word</button>
            <button class="btn btn-sm btn-primary"   onclick="Modules.viaticos.printReport('${r.folio}')" title="Vista previa imprimible">🖨</button>
            ${!isReadOnly ? `
            <button class="btn btn-sm btn-secondary" onclick="Modules.viaticos.editRecord('${r.folio}')">✏</button>
            <button class="btn btn-sm btn-danger"    onclick="Modules.viaticos.deleteRecord('${r.folio}')">🗑</button>
            ` : ''}
          </td>
        </tr>`;
    }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:30px">Sin registros de viáticos</td></tr>';

    const count = document.getElementById('vt-count');
    if (count) count.textContent = `${data.length} registros`;
  },

  editRecord(folio) {
    const rec = DB.viaticos.getAll().find(r => r.folio === folio);
    if (!rec) return;
    this._editingFolio = folio;
    this.switchTab('form');
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
    set('vt-nombre',      rec.nombre_ttd);
    set('vt-figura',      rec.figura);
    set('vt-depto',       rec.departamento);
    set('vt-estado',      rec.estado);
    set('vt-fecha',       rec.fecha);
    set('vt-jefe',        rec.jefe);
    set('vt-subdelegado', rec.subdelegado);
    set('vt-rubricas',    rec.rubricas);
    set('vt-leyenda',     rec.leyenda);
    (rec.viaticos || []).forEach((v, i) => {
      set(`vt-fecha-${i+1}`, v.fecha);
      set(`vt-cant-${i+1}`,  v.cantidad);
    });
    // Cargar visitas realizadas
    this._loadVisitas(rec.visitas_realizadas || []);
    this.recalcTotal();
  },

  deleteRecord(folio) {
    if (!Utils.confirm(`¿Eliminar el registro ${folio}?`)) return;
    const rec = DB.viaticos.getAll().find(r => r.folio === folio);
    if (rec) DB.viaticos.remove(rec.id);
    this.renderList();
  },

  // ── Reporte imprimible ─────────────────────────────────────

  printReport(folio) {
    const rec = DB.viaticos.getAll().find(r => r.folio === folio);
    if (!rec) return;
    const dp = Utils.datePartsEs();

    // Tabla de facturas
    const rows = (rec.viaticos || []).filter(v => v.fecha || v.cantidad).map((v, i) => `
      <tr>
        <td style="text-align:center">${i+1}</td>
        <td style="text-align:center">${v.fecha || ''}</td>
        <td style="text-align:right">$${parseFloat(v.cantidad || 0).toFixed(2)}</td>
      </tr>`).join('');
    const total = Utils.formatCurrencyShort(rec.total_viaticos);

    // Tablas de visitas realizadas
    const visitasHtml = (rec.visitas_realizadas || [])
      .filter(vr => vr.registros && vr.registros.length > 0)
      .map(vr => `
        <div style="margin-bottom:12px">
          <div style="font-weight:700;font-size:11px;margin-bottom:4px;color:#2e4a8a">Visita ${vr.visita}</div>
          <table>
            <thead><tr><th style="width:30px;text-align:center">#</th><th style="width:120px">Reg. Patronal</th><th>Nombre / Razón Social</th><th>Domicilio</th></tr></thead>
            <tbody>
              ${vr.registros.map(r => `
                <tr>
                  <td style="text-align:center">${r.num}</td>
                  <td>${Utils.esc(r.reg_patronal)}</td>
                  <td>${Utils.esc(r.nombre)}</td>
                  <td>${Utils.esc(r.domicilio)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`).join('') || '<p style="color:#888;font-style:italic">Sin visitas registradas</p>';

    const html = `
      <html><head><title>Reporte Viáticos — ${Utils.esc(rec.folio)}</title>
      <style>
        body{font-family:Arial,sans-serif;font-size:11px;margin:25px;color:#000}
        h3{text-align:center;font-size:13px;margin-bottom:2px}
        .sub{text-align:center;font-size:10px;color:#444;margin-bottom:16px}
        table{width:100%;border-collapse:collapse;margin-bottom:12px}
        th{background:#d0d9ef;padding:4px 8px;border:1px solid #888;font-size:10px;text-align:left}
        td{padding:4px 8px;border:1px solid #ccc;font-size:11px}
        .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:14px}
        .info-row{border-bottom:1px solid #ddd;padding:3px 0}
        .lbl{font-weight:bold;font-size:10px;color:#555;text-transform:uppercase;margin-right:4px}
        .total-row{font-weight:bold;background:#eef2ff}
        .section-title{font-size:12px;font-weight:bold;margin:14px 0 6px;padding:4px 8px;background:#e8edf5;border-left:3px solid #2e4a8a}
        .sign{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:50px}
        .sign-line{border-top:1px solid #000;text-align:center;padding-top:4px;font-size:10px}
        @media print{body{margin:15px}}
      </style></head><body>
      <h3>INSTITUTO MEXICANO DEL SEGURO SOCIAL</h3>
      <div class="sub">Comprobación de Gastos de Viáticos — Folio: ${Utils.esc(rec.folio)}</div>
      <div class="info-grid">
        <div><div class="lbl">Nombre TTD</div><div class="info-row">${Utils.esc(rec.nombre_ttd)}</div></div>
        <div><div class="lbl">Figura</div><div class="info-row">${Utils.esc(rec.figura || '')}</div></div>
        <div><div class="lbl">Departamento</div><div class="info-row">${Utils.esc(rec.departamento || '')}</div></div>
        <div><div class="lbl">Fecha</div><div class="info-row">${Utils.esc(rec.fecha || '')}</div></div>
        <div><div class="lbl">Jefe de Oficina</div><div class="info-row">${Utils.esc(rec.jefe || '')}</div></div>
        <div><div class="lbl">Subdelegado</div><div class="info-row">${Utils.esc(rec.subdelegado || '')}</div></div>
      </div>

      <div class="section-title">💰 Detalle de Facturas</div>
      <table><thead><tr><th>#</th><th>Fecha</th><th>Cantidad</th></tr></thead>
      <tbody>${rows}
      <tr class="total-row"><td colspan="2" style="text-align:right"><b>TOTAL:</b></td><td style="text-align:right"><b>${total}</b></td></tr>
      </tbody></table>
      <p style="font-size:10px"><b>Importe con letra:</b> ${Utils.importeALetras(rec.total_viaticos)}</p>

      <div class="section-title">🗺️ Visitas Realizadas</div>
      ${visitasHtml}

      ${rec.leyenda ? `<p style="font-size:10px;color:#555;margin-top:12px">${Utils.esc(rec.leyenda)}</p>` : ''}
      <div class="sign">
        <div class="sign-line">${Utils.esc(rec.nombre_ttd)}<br>${Utils.esc(rec.figura || 'TTD')}</div>
        <div class="sign-line">${Utils.esc(rec.jefe || 'Jefe de Oficina')}<br>V°B°</div>
      </div>
      <script>window.print();window.onafterprint=()=>window.close();<\/script>
      </body></html>`;

    const w = window.open('', '_blank', 'width=840,height=750');
    if (w) { w.document.write(html); w.document.close(); }
  },

  // ── Utilidades ─────────────────────────────────────────────
  searchList(q) { this._query = q; this.renderList(); },
  exportList()  { Utils.exportCSV(DB.viaticos.getAll(), `viaticos_${Utils.today()}.csv`); },
};
