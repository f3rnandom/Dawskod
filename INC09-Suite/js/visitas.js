/**
 * visitas.js — Sistema de Localización de Domicilios IMSS
 * Tabs: Negativas | Positivos | Restablecimientos | CORE_03 | Vistas Origen
 */
Modules.visitas = {
  _tab: 'neg', _query: '',

  TABS: {
    neg:    { store: 'visitas_neg',  label: 'Negativas',          hdrs: ['RP','Nombre Patrón','Actividad','Domicilio','Fecha Visita','Localizador','Tipo'], keys: ['Registro_Patronal', 'Nombre_Patron', 'Actividad', 'Domicilio_Verificar', 'Fecha_Visita', 'Rubrica_Localizador', 'Tipo_Informe'] },
    pos:    { store: 'visitas_pos',  label: 'Positivos',           hdrs: ['RP','Nombre Patrón','Actividad','Domicilio Verificado','Fecha','Localizador','Tipo'], keys: ['Registro_Patronal', 'Nombre_Patron', 'Actividad', 'Domicilio_Verificar', 'Fecha_Visita', 'Rubrica_Localizador', 'Tipo_Informe'] },
    rest:   { store: 'visitas_rest', label: 'Restablecimientos',   hdrs: ['RP','Nombre Patrón','Actividad','Domicilio Verificado','Fecha','Localizador','Tipo'], keys: ['Registro_Patronal', 'Nombre_Patron', 'Actividad', 'Domicilio_Verificar', 'Fecha_Visita', 'Rubrica_Localizador', 'Tipo_Informe'] },
    c03:    { store: 'visitas_c03',  label: 'CORE_03',             hdrs: ['RP','Nombre Patrón','RFC','Subdelegación','Núm Folio','Fecha Envío','Supuesto'], keys: ['Registro_Patronal', 'Nombre_Patron', 'RCI', 'Subdelegacion_Solicitante', 'Num_Folio_Envio', 'Fecha_Envio', 'Supuesto_C03'] },
    c02:    { store: 'visitas_c02',  label: 'Core_02',             hdrs: ['RP','Sujeto Obligado','RFC','Actividad','Núm Folio','Fecha Oficio','Subdelegación','Tipo'], keys: ['Registro_Patronal', 'Sujeto_Obligado', 'RFC', 'Actividad', 'Num_Folio', 'Fecha_Oficio', 'Nombre_Subdelegacion', 'Tipo_Informe'] },
    arp:    { store: 'visitas_arp',  label: 'ARP/Socios',          hdrs: ['RP','Nombre Patrón','RFC','Actividad','Domicilio','Fecha Visita','Localizador','Tipo'], keys: ['Registro_Patronal', 'Nombre_Patron', 'RCF', 'Actividad', 'Domicilio', 'Fecha_Visita', 'Rubrica_Localizador', 'Tipo_Informe'] },
    dad:    { store: 'visitas_dad',  label: 'DAD',                 hdrs: ['RP','Nombre Patrón','RFC','Actividad','DAD Domicilio','DAD Fecha','Localizador','Tipo'], keys: ['Registro_Patronal', 'Nombre_Patron', 'RCF', 'Actividad', 'DAD_Domicilio', 'DAD_VFecha', 'Rubrica_Localizador', 'Tipo_Informe'] },
    act:    { store: 'visitas_act',  label: 'Actualizaciones',     hdrs: ['RP','Nombre Patrón','RFC','Actividad','Domicilio','Fecha Visita','Localizador','Tipo'], keys: ['Registro_Patronal', 'Nombre_Patron', 'RCF', 'Actividad', 'Domicilio', 'Fecha_Visita', 'Rubrica_Localizador', 'Tipo_Informe'] },
    origen: { store: 'vistas_origen',label: 'Vistas Origen',       hdrs: ['REF','Reg. Patronal','Razón Social','Domicilio','Actividad SINDO','SINDO Últ. Mov','Procedencia','Notificador'], keys: ['REF', 'Reg_Patronal', 'Razon_Social', 'Domicilio', 'Actividad_SINDO', 'SINDO_Ult_Mov', 'Procedencia', 'Notificador'] },
  },

  FIELDS: {
    neg:    ['Registro_Patronal','Nombre_Patron','RCF','Actividad','Domicilio_Verificar','Nombre_Calle','Calle_Colindante_1','Calle_Colindante_2','Num_Exterior','Num_Interior','Estatus_Verificacion','Num_Ocular','Fecha_Visita','Hora_Inicio_Diligencia','Hora_Fin_Diligencia','Descripcion_Inmueble_Diligencia','Persona_En_Domicilio_o_Vecino','Refiere_Persona','Nombre_Vecino_1','Domicilio_Vecino_1','Refiere_Vecino_1','Nombre_Vecino_2','Domicilio_Vecino_2','Refiere_Vecino_2','Nombre_Vecino_3','Domicilio_Vecino_3','Refiere_Vecino_3','Nombre_Trabajador_1','Domicilio_Trabajador_1','Refiere_Trabajador_1','Nombre_Trabajador_2','Domicilio_Trabajador_2','Refiere_Trabajador_2','Nombre_Trabajador_3','Domicilio_Trabajador_3','Refiere_Trabajador_3','DAD_Domicilio','DAD_Folio','DAD_Calle','DAD_Calles','DAD_Num_Ext','DAD_Num_Int','DAD_Visita_Fecha','DAD_Visita_Hora_Inc','DAD_Visita_Hora_Fin','DAD_Descripcion_Inmueble_Situacion','DAD_Persona_En_Domicilio','DAD_Refiere_Persona','DAD_Nombre_Vecino_1','DAD_Domicilio_Vecino_1','DAD_Refiere_Vecino_1','DAD_Nombre_Vecino_2','DAD_Domicilio_Vecino_2','DAD_Refiere_Vecino_2','DAD_Nombre_Vecino_3','DAD_Domicilio_Vecino_3','DAD_Refiere_Vecino_3','Sindo_Region_1','Sindo_Region_2','Sindo_Region_3','COP','RCV','Anhio_Baja','Rango','Rubrica_Localizador','Nombre_Notificador','ID_Constancia','Tipo_Informe','Mapa_Croquis','Foto_1','Foto_2','Foto_3','Foto_4'],
    pos:    ['Registro_Patronal','Nombre_Patron','RCF','Actividad','Domicilio_Verificar','Nombre_Calle','Calle_Colindante_1','Calle_Colindante_2','Num_Exterior','Num_Interior','Estatus_Verificacion','Ubicacion','Fecha_Visita','Hora_Inicio_Diligencia','Hora_Fin_Diligencia','Num_Ocular','Descripcion_Inmueble_Diligencia','Descripcion_Persona_Atiende','Observaciones_Adicionales','Nombre_Persona_Atiende','Relacion_Con_Patron','Identificacion_Presenta','ID_Verificacion','Vigencia_Identificacion','Telefono_1','Telefono_2','Correo_Electronico','Horario_Atencion','Rubrica_Localizador','Nombre_Localizador','Constancia_Localizador','Tipo_Informe','Mapa_Croquis','Foto_1','Foto_2','Foto_3','Foto_4'],
    rest:   ['Registro_Patronal','Nombre_Patron','RCF','Actividad','Domicilio_Verificar','Nombre_Calle','Calle_Colindante_1','Calle_Colindante_2','Num_Exterior','Num_Interior','Estatus_Verificacion','Ubicacion','Fecha_Visita','Hora_Inicio_Diligencia','Hora_Fin_Diligencia','Num_Ocular','Resultado_Diligencia','Descripcion_Inmueble_Diligencia','Descripcion_Persona_Atiende','Observaciones_Adicionales','Nombre_Persona_Atiende','Relacion_Con_Patron','Identificacion_Presenta','ID_Verificacion','Vigencia_Identificacion','Telefono_1','Telefono_2','Correo_Electronico','Horario_Atencion','Rubrica_Localizador','Nombre_Localizador','Constancia_Localizador','Tipo_Informe','Mapa_Croquis','Foto_1','Foto_2','Foto_3','Foto_4'],
    c03:    ['Registro_Patronal','Nombre_Patron','RCI','Actividad','Subdelegacion_Solicitante','Domicilio_Verificar','Nombre_Calle','Calle_Colindante_1','Calle_Colindante_2','Num_Exterior','Num_Interior','Estatus_Verificacion','Coordenadas','Num_Folio_Envio','Fecha_Envio','Hora_Inicio_Diligencia','Hora_Fin_Diligencia','Fecha_Fin_Frustra','Folio_Solicitud','Fecha_Solicitud','Codigo_Subdelegacion','Nombre_Subdelegado','Nombre_Subdelegacion','Direccion_Subdelegacion','En_Domicilio','Otro_Domicilio','No_Existe_Calle','No_Existe_Numero','Cerrado_Clausurado_Vacio','Sustitucion_Patronal','Otras_Causas','Comentarios_Adicionales','Descripcion_Inmueble_Diligencia','Descricion_Persona_Atiende','Refiere_Persona','Nombre_Persona_Atiende','Relacion_Con_Patron','Identificacion_Presenta','ID_Verificacion','Vigencia_Identificacion','Telefono_1','Telefono_2','Correo_Electronico','Horario_Atencion','Nombre_Vecino_1','Domicilio_Vecino_1','Refiere_Vecino_1','Nombre_Vecino_2','Domicilio_Vecino_2','Refiere_Vecino_2','Nombre_Vecino_3','Domicilio_Vecino_3','Refiere_Vecino_3','Nombre_Trabajador_1','Domicilio_Trabajador_1','Refiere_Trabajador_1','Nombre_Trabajador_2','Domicilio_Trabajador_2','Refiere_Trabajador_2','Nombre_Trabajador_3','Domicilio_Trabajador_3','Refiere_Trabajador_3','DAD_Domicilio','DAD_Folio','DAD_Calle','DAD_Calles','DAD_Num_Ext','DAD_Num_Int','DAD_Visita_Fecha','DAD_Visita_Hora_Inc','DAD_Visita_Hora_Fin','DAD_Descripcion_Inmueble_Situacion','DAD_Persona_En_Domicilio','DAD_Refiere_Persona','DAD_Nombre_Vecino_1','DAD_Refiere_Vecino_1','DAD_Domicilio_Vecino_1','DAD_Nombre_Vecino_2','DAD_Domicilio_Vecino_2','DAD_Nombre_Vecino_3','DAD_Domicilio_Vecino_3','DAD_Refiere_Vecino_3','Sindo_Region_1','Sindo_Region_2','Sindo_Region_3','Rubrica_Localizador','Nombre_Notificador','ID_Constancia','COP','RCV','Actas_Baja','Tipo_Informe','Supuesto_C03','Mapa_Croquis','Foto_1','Foto_2','Foto_3','Foto_4'],
    c02:    ['Registro_Patronal','Sujeto_Obligado','RFC','Actividad','Domicilio','Num_Folio','Fecha_Oficio','RP_Foranea','Oficio_Antecedente','Codigo_Subdelegacion','Nombre_Subdelegado','Nombre_Subdelegacion','Direccion_Subdelegacion','COP_Periodo','COP_Importe','RCV_Periodo','RCV_Importe','Rubrica_Localizador','Tipo_Informe','Mapa_Croquis','Foto_1','Foto_2','Foto_3','Foto_4'],
    arp:    ['Registro_Patronal','Nombre_Patron','RCF','Actividad','Domicilio','Calle','Calle_Colindante_1','Calle_Colindante_2','Estatus_Verificacion','Fecha_Visita','Fecha_Reporte','Hora_Inicio_Diligencia','Hora_Fin_Diligencia','Descripcion_Inmueble_Diligencia','Descricion_Persona_Atiende','Refiere_Persona','Nombre_Vecino_1','Domicilio_Vecino_1','Refiere_Vecino_1','Nombre_Vecino_2','Domicilio_Vecino_2','Refiere_Vecino_2','Nombre_Vecino_3','Domicilio_Vecino_3','Refiere_Vecino_3','Rubrica_Localizador','Nombre_Notificador','ID_Constancia','Tipo_Informe','Mapa_Croquis','Foto_1','Foto_2','Foto_3','Foto_4'],
    dad:    ['Registro_Patronal','Nombre_Patron','RCF','Actividad','DAD_Domicilio','DAD_Calle','DAD_Calles','Estatus_Verificacion','DAD_VFecha','DAD_Hora_Inicio','DAD_Hora_Fin','DAD_Folio','DAD_Descripcion_Inmueble_Diligencia','DAD_Descricion_Persona_Atiende','DAD_Refiere_Persona','DAD_Vecino_descripcion_1','DAD_Vecino_Domicilio_1','DAD_Vecino_Refiere_1','DAD_Vecino_descripcion_2','DAD_Vecino_Domicilio_2','DAD_Vecino_Refiere_2','DAD_Vecino_descripcion_3','DAD_Vecino_Domicilio_3','DAD_Vecino_Refiere_3','Tipo_Informe','Mapa_Croquis','Foto_1','Foto_2','Foto_3','Foto_4'],
    act:    ['Registro_Patronal','Nombre_Patron','RCF','Actividad','Domicilio','Calle','Calle_Colindante_1','Calle_Colindante_2','Estatus_Verificacion','Fecha_Visita','Fecha_Reporte','Hora_Inicio_Diligencia','Hora_Fin_Diligencia','Descripcion_Inmueble_Diligencia','Descricion_Persona_Atiende','Refiere_Persona','Nombre_Vecino_1','Domicilio_Vecino_1','Refiere_Vecino_1','Nombre_Vecino_2','Domicilio_Vecino_2','Refiere_Vecino_2','Nombre_Vecino_3','Domicilio_Vecino_3','Refiere_Vecino_3','Nombre_Trabajador_1','Domicilio_Trabajador_1','Refiere_Trabajador_1','Nombre_Trabajador_2','Domicilio_Trabajador_2','Refiere_Trabajador_2','Nombre_Trabajador_3','Domicilio_Trabajador_3','Refiere_Trabajador_3','Rubrica_Localizador','Nombre_Notificador','ID_Constancia','Tipo_Informe','Mapa_Croquis','Foto_1','Foto_2','Foto_3','Foto_4'],
    origen: ['REF','Reg_Patronal','Razon_Social','Domicilio','Actividad_SINDO','SINDO_Ult_Mov','Procedencia','Notificador'],
  },

  render() { this.renderTab(this._tab); },

  switchTab(tab) { this._tab = tab; this._query = ''; document.getElementById('vis-search').value = ''; this.renderTab(tab); },

  renderTab(tab) {
    const cfg = this.TABS[tab];
    if (!cfg) return;
    // Update tab buttons
    document.querySelectorAll('.vis-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    // Update count badges
    Object.entries(this.TABS).forEach(([t, c]) => {
      const el = document.getElementById(`vis-count-${t}`);
      if (el) el.textContent = DB[c.store].getAll().length;
    });
    // Render table headers
    const thead = document.getElementById('vis-thead');
    if (thead) thead.innerHTML = '<tr>' + cfg.hdrs.map(h => `<th>${h}</th>`).join('') + '<th>Acciones</th></tr>';
    // Render rows
    const q = this._query.toLowerCase();
    let data = DB[cfg.store].getAll();
    if (q) data = data.filter(r => Utils.matchSearch(r, q));
    const fields = cfg.keys || this.FIELDS[tab];
    const tbody = document.getElementById('vis-tbody');
    if (!tbody) return;
    // Check Read-Only mode for Origen tab
    const role = App.session?.rol || 'Visitador';
    let isReadOnly = false;
    if (tab === 'origen' && (role === 'Integrador' || role === 'Visitador')) {
      isReadOnly = true;
    }
    // Check custom override if it exists
    if (App.session?.permisos_custom) {
      try {
        const custom = JSON.parse(App.session.permisos_custom);
        if (custom.visitas_origen_write !== undefined && tab === 'origen') {
          isReadOnly = !custom.visitas_origen_write;
        }
      } catch(e) {}
    }

    // Toggle "Nuevo Registro" button
    const btnNew = document.querySelector('button[onclick="Modules.visitas.openNew()"]');
    if (btnNew) {
      btnNew.style.display = isReadOnly ? 'none' : 'inline-block';
    }

    tbody.innerHTML = data.map(r => {
      let actionButtons = `<button class="btn btn-sm btn-primary" onclick="Modules.visitas.generateReport(${r.id},'${tab}')" title="Generar Reporte Word">📄</button>`;
      
      if (!isReadOnly) {
        actionButtons = `
          <button class="btn btn-sm btn-secondary" onclick="Modules.visitas.editRecord(${r.id},'${tab}')" title="Editar">✏</button>
          ${actionButtons}
          <button class="btn btn-sm btn-danger" onclick="Modules.visitas.deleteRecord(${r.id},'${tab}')" title="Eliminar">🗑</button>
        `;
      }

      return `
      <tr>
        ${fields.map(f => `<td>${Utils.esc(r[f] || '—')}</td>`).join('')}
        <td class="flex gap-2">
          ${actionButtons}
        </td>
      </tr>`;
    }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px">Sin registros</td></tr>';
  },

  search(q) { this._query = q; this.renderTab(this._tab); },

  openNew() {
    this._editingId = null;
    this._buildForm({});
    if (this._tab === 'pos' || this._tab === 'rest') {
      setTimeout(() => this.initMap({}), 100);
    }
    document.getElementById('vis-modal-title').textContent = `Nuevo — ${this.TABS[this._tab].label}`;
    document.getElementById('vis-modal').classList.add('open');
  },

  editRecord(id, tab) {
    const store = this.TABS[tab].store;
    const rec = DB[store].getAll().find(r => r.id === id);
    if (!rec) return;
    this._editingId = id;
    this._buildForm(rec);
    if (tab === 'pos' || tab === 'rest') {
      setTimeout(() => this.initMap(rec), 100);
    }
    document.getElementById('vis-modal-title').textContent = `Editar — ${this.TABS[tab].label}`;
    document.getElementById('vis-modal').classList.add('open');
  },

  generateReport(id, tab) {
    const store = this.TABS[tab].store;
    const rec = DB[store].getAll().find(r => r.id === id);
    if (!rec) { Utils.toast('Registro no encontrado', 'error'); return; }
    if (typeof Reportes !== 'undefined' && Reportes.generarReporteVisita) {
      Reportes.generarReporteVisita(rec, tab);
    } else {
      Utils.toast('El módulo de reportes no está disponible', 'error');
    }
  },

  _buildForm(rec) {
    const tab = this._tab;
    const isOrigen = tab === 'origen';
    const isPos = tab === 'pos' || tab === 'rest';
    const container = document.getElementById('vis-form-body');
    if (!container) return;

    
    if (tab === 'neg') {
      container.innerHTML = `
        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--danger);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--danger);">INFORMACION DEL PATRON O SUJETO OBLIGADO</div>
          <div class="form-grid form-grid-2">
            <div class="field"><label class="field-label">Registro Patronal</label><input id="vf-rp" class="field-input" value="${Utils.esc(rec.Registro_Patronal||'')}" onblur="window.Modules.visitas.autoFillFromOrigen(this.value)"></div>
            <div class="field"><label class="field-label">Nombre Patron</label><input id="vf-nom" class="field-input" value="${Utils.esc(rec.Nombre_Patron||'')}"></div>
            <div class="field"><label class="field-label">RCF</label><input id="vf-rcf" class="field-input" value="${Utils.esc(rec.RCF||'')}"></div>
            <div class="field"><label class="field-label">Actividad</label><input id="vf-act" class="field-input" value="${Utils.esc(rec.Actividad||'')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--danger);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--danger);">DATOS DEL DOMICILIO A VERIFICAR</div>
          <div class="form-grid form-grid-2">
            <div class="field" style="grid-column:1/-1"><label class="field-label">Domicilio Verificar</label><input id="vf-dom" class="field-input" value="${Utils.esc(rec.Domicilio_Verificar||'')}"></div>
            <div class="field"><label class="field-label">Nombre Calle</label><input id="vf-calle" class="field-input" value="${Utils.esc(rec.Nombre_Calle||'')}"></div>
            <div class="field"><label class="field-label">Calle Colindante 1</label><input id="vf-col1" class="field-input" value="${Utils.esc(rec.Calle_Colindante_1||'')}"></div>
            <div class="field"><label class="field-label">Calle Colindante 2</label><input id="vf-col2" class="field-input" value="${Utils.esc(rec.Calle_Colindante_2||'')}"></div>
            <div class="field"><label class="field-label">Num Exterior</label><input id="vf-numext" class="field-input" value="${Utils.esc(rec.Num_Exterior||'')}"></div>
            <div class="field"><label class="field-label">Num Interior</label><input id="vf-numint" class="field-input" value="${Utils.esc(rec.Num_Interior||'')}"></div>
            <div class="field" style="grid-column:1/-1"><label class="field-label">Estatus Verificacion</label><input id="vf-estatus" class="field-input" value="${Utils.esc(rec.Estatus_Verificacion||'')}"></div>
            <div class="field"><label class="field-label">Num Ocular</label><input id="vf-numocu" class="field-input" value="${Utils.esc(rec.Num_Ocular||'')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--danger);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--danger);">DETALLE DE LA DILIGENCIA</div>
          <div class="form-grid form-grid-3">
            <div class="field"><label class="field-label">Fecha Visita</label><input type="date" id="vf-fecha" class="field-input" value="${rec.Fecha_Visita||''}"></div>
            <div class="field"><label class="field-label">Hora Inicio Diligencia</label><input type="time" id="vf-hini" class="field-input" value="${rec.Hora_Inicio_Diligencia||''}"></div>
            <div class="field"><label class="field-label">Hora Fin Diligencia</label><input type="time" id="vf-hfin" class="field-input" value="${rec.Hora_Fin_Diligencia||''}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--danger);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--danger);">DESCRIPCION DE INMUBLE Y/O DILIGENCIA</div>
          <div class="form-grid form-grid-1">
            <div class="field"><label class="field-label">Descripcion Inmueble Diligencia</label><textarea id="vf-desc" class="field-input" rows="2">${Utils.esc(rec.Descripcion_Inmueble_Diligencia||'')}</textarea></div>
            <div class="field"><label class="field-label">Persona En Domicilio o Vecino</label><input id="vf-pers" class="field-input" value="${Utils.esc(rec.Persona_En_Domicilio_o_Vecino||'')}"></div>
            <div class="field"><label class="field-label">Refiere Persona</label><input id="vf-refpers" class="field-input" value="${Utils.esc(rec.Refiere_Persona||'')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--danger);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--danger);">INFORMACION DE VECINOS</div>
          <div class="form-grid form-grid-3">
            ${[1,2,3].map(n => `
            <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
              <div style="font-weight:700;font-size:11px;color:var(--text-muted);margin-bottom:8px;">VECINO ${n}</div>
              <div class="field"><label class="field-label">Nombre Vecino ${n}</label><input id="vf-v${n}nom" class="field-input" value="${Utils.esc(rec['Nombre_Vecino_'+n]||'')}"></div>
              <div class="field"><label class="field-label">Domicilio Vecino ${n}</label><input id="vf-v${n}dom" class="field-input" value="${Utils.esc(rec['Domicilio_Vecino_'+n]||'')}"></div>
              <div class="field"><label class="field-label">Refiere Vecino ${n}</label><input id="vf-v${n}ref" class="field-input" value="${Utils.esc(rec['Refiere_Vecino_'+n]||'')}"></div>
            </div>`).join('')}
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--danger);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--danger);">INFORMACION DE TRABAJADORES</div>
          <div class="form-grid form-grid-3">
            ${[1,2,3].map(n => `
            <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
              <div style="font-weight:700;font-size:11px;color:var(--text-muted);margin-bottom:8px;">TRABAJADOR ${n}</div>
              <div class="field"><label class="field-label">Nombre Trabajador ${n}</label><input id="vf-t${n}nom" class="field-input" value="${Utils.esc(rec['Nombre_Trabajador_'+n]||'')}"></div>
              <div class="field"><label class="field-label">Domicilio Trabajador ${n}</label><input id="vf-t${n}dom" class="field-input" value="${Utils.esc(rec['Domicilio_Trabajador_'+n]||'')}"></div>
              <div class="field"><label class="field-label">Refiere Trabajador ${n}</label><input id="vf-t${n}ref" class="field-input" value="${Utils.esc(rec['Refiere_Trabajador_'+n]||'')}"></div>
            </div>`).join('')}
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--danger);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--danger);">INFORMACION DAD CON DOMICILIO DIFERENTE AL ORIGEN</div>
          <div class="form-grid form-grid-3">
            <div class="field" style="grid-column:1/-1"><label class="field-label">DAD Domicilio</label><input id="vf-daddom" class="field-input" value="${Utils.esc(rec.DAD_Domicilio||'')}"></div>
            <div class="field"><label class="field-label">DAD Folio</label><input id="vf-dadfolio" class="field-input" value="${Utils.esc(rec.DAD_Folio||'')}"></div>
            <div class="field"><label class="field-label">DAD Calle</label><input id="vf-dadcalle" class="field-input" value="${Utils.esc(rec.DAD_Calle||'')}"></div>
            <div class="field"><label class="field-label">DAD Calles</label><input id="vf-dadcalles" class="field-input" value="${Utils.esc(rec.DAD_Calles||'')}"></div>
            <div class="field"><label class="field-label">DAD Num Ext</label><input id="vf-dadnumext" class="field-input" value="${Utils.esc(rec.DAD_Num_Ext||'')}"></div>
            <div class="field"><label class="field-label">DAD Num Int</label><input id="vf-dadnumint" class="field-input" value="${Utils.esc(rec.DAD_Num_Int||'')}"></div>
            <div class="field"><label class="field-label">DAD Visita Fecha</label><input type="date" id="vf-dadfecha" class="field-input" value="${rec.DAD_Visita_Fecha||''}"></div>
            <div class="field"><label class="field-label">DAD Visita Hora Inc</label><input type="time" id="vf-dadhini" class="field-input" value="${rec.DAD_Visita_Hora_Inc||''}"></div>
            <div class="field"><label class="field-label">DAD Visita Hora Fin</label><input type="time" id="vf-dadhfin" class="field-input" value="${rec.DAD_Visita_Hora_Fin||''}"></div>
            <div class="field" style="grid-column:1/-1"><label class="field-label">DAD Descripcion Inmueble Situacion</label><textarea id="vf-daddesc" class="field-input" rows="2">${Utils.esc(rec.DAD_Descripcion_Inmueble_Situacion||'')}</textarea></div>
            <div class="field"><label class="field-label">DAD Persona En Domicilio</label><input id="vf-dadpers" class="field-input" value="${Utils.esc(rec.DAD_Persona_En_Domicilio||'')}"></div>
            <div class="field" style="grid-column:span 2"><label class="field-label">DAD Refiere Persona</label><input id="vf-dadref" class="field-input" value="${Utils.esc(rec.DAD_Refiere_Persona||'')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--danger);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--danger);">INFORMACION DE VECINOS DE VISITA DAD</div>
          <div class="form-grid form-grid-3">
            ${[1,2,3].map(n => `
            <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
              <div style="font-weight:700;font-size:11px;color:var(--text-muted);margin-bottom:8px;">VECINO DAD ${n}</div>
              <div class="field"><label class="field-label">DAD Nombre Vecino ${n}</label><input id="vf-dadv${n}nom" class="field-input" value="${Utils.esc(rec['DAD_Nombre_Vecino_'+n]||'')}"></div>
              <div class="field"><label class="field-label">DAD Domicilio Vecino ${n}</label><input id="vf-dadv${n}dom" class="field-input" value="${Utils.esc(rec['DAD_Domicilio_Vecino_'+n]||'')}"></div>
              <div class="field"><label class="field-label">DAD Refiere Vecino ${n}</label><input id="vf-dadv${n}ref" class="field-input" value="${Utils.esc(rec['DAD_Refiere_Vecino_'+n]||'')}"></div>
            </div>`).join('')}
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--danger);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--danger);">DATOS ARROJADOS POR SINDOS</div>
          <div class="form-grid form-grid-3">
            <div class="field"><label class="field-label">Sindo Region 1</label><input id="vf-sindo1" class="field-input" value="${Utils.esc(rec.Sindo_Region_1||'')}"></div>
            <div class="field"><label class="field-label">Sindo Region 2</label><input id="vf-sindo2" class="field-input" value="${Utils.esc(rec.Sindo_Region_2||'')}"></div>
            <div class="field"><label class="field-label">Sindo Region 3</label><input id="vf-sindo3" class="field-input" value="${Utils.esc(rec.Sindo_Region_3||'')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--danger);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--danger);">INFORMACION RANGO</div>
          <div class="form-grid form-grid-4">
            <div class="field"><label class="field-label">COP</label><input id="vf-cop" class="field-input" type="number" value="${rec.COP||''}"></div>
            <div class="field"><label class="field-label">RCV</label><input id="vf-rcv" class="field-input" type="number" value="${rec.RCV||''}"></div>
            <div class="field"><label class="field-label">Anhio Baja</label><input id="vf-anhio" class="field-input" value="${Utils.esc(rec.Anhio_Baja||'')}"></div>
            <div class="field"><label class="field-label">Rango</label>
              <select id="vf-rango" class="field-input">
                <option value="">Seleccione Rango</option>
                <option ${rec.Rango === '0-10 Trabajadores' ? 'selected' : ''}>0-10 Trabajadores</option>
                <option ${rec.Rango === '11-50 Trabajadores' ? 'selected' : ''}>11-50 Trabajadores</option>
                <option ${rec.Rango === '51+ Trabajadores' ? 'selected' : ''}>51+ Trabajadores</option>
              </select>
            </div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--danger);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--danger);">INFORMACION DE LOCALIZADOR</div>
          <div class="form-grid form-grid-3">
            <div class="field"><label class="field-label">Rubrica Localizador</label><input id="vf-loc" class="field-input" value="${Utils.esc(rec.Rubrica_Localizador||App.session?.iniciales||'')}"></div>
            <div class="field"><label class="field-label">Nombre Notificador</label><input id="vf-notif" class="field-input" value="${Utils.esc(rec.Nombre_Notificador||'')}"></div>
            <div class="field"><label class="field-label">ID Constancia</label><input id="vf-idcons" class="field-input" value="${Utils.esc(rec.ID_Constancia||'')}"></div>
          </div>
        </div>
      `;

    } else if (isOrigen) {

      container.innerHTML = `
        <div class="form-grid form-grid-2">
          <div class="field"><label class="field-label">REF</label><input id="vf-ref" class="field-input" value="${Utils.esc(rec.REF||'')}"></div>
          <div class="field"><label class="field-label">Reg. Patronal</label><input id="vf-rp" class="field-input" value="${Utils.esc(rec.Reg_Patronal||'')}"></div>
          <div class="field"><label class="field-label">Razón Social</label><input id="vf-rs" class="field-input" value="${Utils.esc(rec.Razon_Social||'')}"></div>
          <div class="field"><label class="field-label">Domicilio</label><input id="vf-dom" class="field-input" value="${Utils.esc(rec.Domicilio||'')}"></div>
          <div class="field"><label class="field-label">Actividad SINDO</label><input id="vf-act" class="field-input" value="${Utils.esc(rec.Actividad_SINDO||'')}"></div>
          <div class="field"><label class="field-label">SINDO Últ. Mov</label><input id="vf-sindo" class="field-input" value="${Utils.esc(rec.SINDO_Ult_Mov||'')}"></div>
          <div class="field"><label class="field-label">Procedencia</label><input id="vf-proc" class="field-input" value="${Utils.esc(rec.Procedencia||'')}"></div>
          <div class="field"><label class="field-label">Notificador</label><input id="vf-not" class="field-input" value="${Utils.esc(rec.Notificador||'')}"></div>
        </div>`;
    } else if (tab === 'pos' || tab === 'rest') {
      const isRest = tab === 'rest';
      const tipoValor = isRest ? 'Restablecimiento' : 'Positivo';
      container.innerHTML = `
        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--success);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--success);">INFORMACION DEL PATRON O SUJETO OBLIGADO</div>
          <div class="form-grid form-grid-2">
            <div class="field"><label class="field-label">Registro Patronal</label><input id="vf-rp" class="field-input" value="${Utils.esc(rec.Registro_Patronal||'')}" onblur="window.Modules.visitas.autoFillFromOrigen(this.value)"></div>
            <div class="field"><label class="field-label">Nombre Patron</label><input id="vf-nom" class="field-input" value="${Utils.esc(rec.Nombre_Patron||'')}"></div>
            <div class="field"><label class="field-label">RCF</label><input id="vf-rcf" class="field-input" value="${Utils.esc(rec.RCF||'')}"></div>
            <div class="field"><label class="field-label">Actividad</label><input id="vf-act" class="field-input" value="${Utils.esc(rec.Actividad||'')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--success);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--success);">DATOS DEL DOMICILIO A VERIFICAR</div>
          <div class="form-grid form-grid-2">
            <div class="field" style="grid-column:1/-1"><label class="field-label">Domicilio Verificar</label><input id="vf-dom" class="field-input" value="${Utils.esc(rec.Domicilio_Verificar||'')}"></div>
            <div class="field"><label class="field-label">Nombre Calle</label><input id="vf-calle" class="field-input" value="${Utils.esc(rec.Nombre_Calle||'')}"></div>
            <div class="field"><label class="field-label">Calle Colindante 1</label><input id="vf-col1" class="field-input" value="${Utils.esc(rec.Calle_Colindante_1||'')}"></div>
            <div class="field"><label class="field-label">Calle Colindante 2</label><input id="vf-col2" class="field-input" value="${Utils.esc(rec.Calle_Colindante_2||'')}"></div>
            <div class="field"><label class="field-label">Num Exterior</label><input id="vf-numext" class="field-input" value="${Utils.esc(rec.Num_Exterior||'')}"></div>
            <div class="field"><label class="field-label">Num Interior</label><input id="vf-numint" class="field-input" value="${Utils.esc(rec.Num_Interior||'')}"></div>
            <div class="field"><label class="field-label">Estatus Verificacion</label><input id="vf-estatus" class="field-input" value="${Utils.esc(rec.Estatus_Verificacion||'')}"></div>
            <div class="field"><label class="field-label">Ubicacion</label><input id="vf-ubicacion" class="field-input" value="${Utils.esc(rec.Ubicacion||'')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--success);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--success);">DETALLE DE LA DILIGENCIA</div>
          <div class="form-grid form-grid-4">
            <div class="field"><label class="field-label">Fecha Visita</label><input type="date" id="vf-fecha" class="field-input" value="${rec.Fecha_Visita||''}"></div>
            <div class="field"><label class="field-label">Hora Inicio Diligencia</label><input type="time" id="vf-hini" class="field-input" value="${rec.Hora_Inicio_Diligencia||''}"></div>
            <div class="field"><label class="field-label">Hora Fin Diligencia</label><input type="time" id="vf-hfin" class="field-input" value="${rec.Hora_Fin_Diligencia||''}"></div>
            <div class="field"><label class="field-label">Num Ocular</label><input id="vf-numocu" class="field-input" value="${Utils.esc(rec.Num_Ocular||'')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--success);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--success);">DESCRIPCION DE INMUBLE Y/O DILIGENCIA</div>
          <div class="form-grid form-grid-1">
            ${isRest ? `<div class="field"><label class="field-label">Resultado Diligencia</label><input id="vf-resdil" class="field-input" value="${Utils.esc(rec.Resultado_Diligencia||'')}"></div>` : ''}
            <div class="field"><label class="field-label">Descripcion Inmueble Diligencia</label><textarea id="vf-desc" class="field-input" rows="2">${Utils.esc(rec.Descripcion_Inmueble_Diligencia||'')}</textarea></div>
            <div class="field"><label class="field-label">Descripcion Persona Atiende</label><textarea id="vf-descpers" class="field-input" rows="2">${Utils.esc(rec.Descripcion_Persona_Atiende||'')}</textarea></div>
            <div class="field"><label class="field-label">Observaciones Adicionales</label><textarea id="vf-obs" class="field-input" rows="2">${Utils.esc(rec.Observaciones_Adicionales||'')}</textarea></div>
          </div>
        </div>


        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--success);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--success);">INFORMACION DE PATRON O PERSONA OBLIGADA</div>
          <div class="form-grid form-grid-3">
            <div class="field"><label class="field-label">Nombre Persona Atiende</label><input id="vf-npersona" class="field-input" value="${Utils.esc(rec.Nombre_Persona_Atiende||'')}"></div>
            <div class="field"><label class="field-label">Relacion Con Patron</label><input id="vf-relcont" class="field-input" value="${Utils.esc(rec.Relacion_Con_Patron||'')}"></div>
            <div class="field"><label class="field-label">Identificacion Presenta</label><input id="vf-ident" class="field-input" value="${Utils.esc(rec.Identificacion_Presenta||'')}"></div>
            <div class="field"><label class="field-label">ID Verificacion</label><input id="vf-idverif" class="field-input" value="${Utils.esc(rec.ID_Verificacion||'')}"></div>
            <div class="field"><label class="field-label">Vigencia Identificacion</label><input type="date" id="vf-vigident" class="field-input" value="${rec.Vigencia_Identificacion||''}"></div>
            <div class="field"><label class="field-label">Telefono 1</label><input id="vf-tel1" class="field-input" value="${Utils.esc(rec.Telefono_1||'')}"></div>
            <div class="field"><label class="field-label">Telefono 2</label><input id="vf-tel2" class="field-input" value="${Utils.esc(rec.Telefono_2||'')}"></div>
            <div class="field"><label class="field-label">Correo Electronico</label><input type="email" id="vf-correo" class="field-input" value="${Utils.esc(rec.Correo_Electronico||'')}"></div>
            <div class="field"><label class="field-label">Horario Atencion</label><input id="vf-horario" class="field-input" value="${Utils.esc(rec.Horario_Atencion||'')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--success);">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--success);">INFORMACION DE LOCALIZADOR</div>
          <div class="form-grid form-grid-3">
            <div class="field"><label class="field-label">Rubrica Localizador</label><input id="vf-loc" class="field-input" value="${Utils.esc(rec.Rubrica_Localizador||App.session?.iniciales||'')}"></div>
            <div class="field"><label class="field-label">Nombre Localizador</label><input id="vf-nomloc" class="field-input" value="${Utils.esc(rec.Nombre_Localizador||'')}"></div>
            <div class="field"><label class="field-label">Constancia Localizador</label><input id="vf-const" class="field-input" value="${Utils.esc(rec.Constancia_Localizador||'')}"></div>
            <div class="field" style="display:none;"><input id="vf-tipo" value="${tipoValor}"></div>
          </div>
        </div>`;

    } else if (tab === 'c02') {
      container.innerHTML = `
        <div class="card" style="padding:24px;margin-bottom:24px;border-left:4px solid var(--primary);">
          <div style="font-size:18px;font-weight:700;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:8px;">1. Datos del Patrón / Sujeto Obligado</div>
          <div class="form-grid form-grid-2">
            <div class="field"><label class="field-label">Registro Patronal *</label><input id="vf-rp" class="field-input" value="${Utils.esc(rec.Registro_Patronal||'')}" onblur="window.Modules.visitas.autoFillFromOrigen(this.value)"></div>
            <div class="field"><label class="field-label">Sujeto Obligado *</label><input id="vf-sujeto" class="field-input" value="${Utils.esc(rec.Sujeto_Obligado||'')}"></div>
            <div class="field"><label class="field-label">RFC</label><input id="vf-rfc" class="field-input" value="${Utils.esc(rec.RFC||'')}"></div>
            <div class="field"><label class="field-label">Actividad</label><input id="vf-act" class="field-input" value="${Utils.esc(rec.Actividad||'')}"></div>
            <div class="field" style="grid-column:1/-1"><label class="field-label">Domicilio</label><input id="vf-dom" class="field-input" value="${Utils.esc(rec.Domicilio||'')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:24px;border-left:4px solid var(--primary);">
          <div style="font-size:18px;font-weight:700;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:8px;">2. Información de la Solicitud</div>
          <div class="form-grid form-grid-2">
            <div class="field"><label class="field-label">Núm. Folio</label><input id="vf-numfolio" class="field-input" value="${Utils.esc(rec.Num_Folio||'')}"></div>
            <div class="field"><label class="field-label">Fecha Oficio</label><input type="date" id="vf-fechaoficio" class="field-input" value="${rec.Fecha_Oficio||''}"></div>
            <div class="field"><label class="field-label">RP Foránea</label><input id="vf-rpfor" class="field-input" value="${Utils.esc(rec.RP_Foranea||'')}"></div>
            <div class="field"><label class="field-label">Oficio Antecedente</label><input id="vf-ofant" class="field-input" value="${Utils.esc(rec.Oficio_Antecedente||'')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:24px;border-left:4px solid var(--primary);">
          <div style="font-size:18px;font-weight:700;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:8px;">3. Información de la Subdelegación</div>
          <div class="form-grid form-grid-2">
            <div class="field"><label class="field-label">Código Subdelegación</label><input id="vf-codsub" class="field-input" value="${Utils.esc(rec.Codigo_Subdelegacion||'')}"></div>
            <div class="field"><label class="field-label">Nombre Subdelegado</label><input id="vf-nomsubdel" class="field-input" value="${Utils.esc(rec.Nombre_Subdelegado||'')}"></div>
            <div class="field"><label class="field-label">Nombre Subdelegación</label><input id="vf-nomsub" class="field-input" value="${Utils.esc(rec.Nombre_Subdelegacion||'')}"></div>
            <div class="field"><label class="field-label">Dirección Subdelegación</label><input id="vf-dirsub" class="field-input" value="${Utils.esc(rec.Direccion_Subdelegacion||'')}"></div>
          </div>
        </div>

        <div class="card" style="padding:24px;margin-bottom:24px;border-left:4px solid var(--primary);">
          <div style="font-size:18px;font-weight:700;margin-bottom:16px;border-bottom:1px solid var(--border);padding-bottom:8px;">4. Información del Adeudo</div>
          <div class="form-grid form-grid-2">
            <div class="field"><label class="field-label">COP — Período (MM/AAAA)</label><input id="vf-copperiodo" class="field-input" placeholder="MM/AAAA" value="${Utils.esc(rec.COP_Periodo||'')}"></div>
            <div class="field"><label class="field-label">COP — Importe</label><input type="number" id="vf-copimporte" class="field-input" value="${rec.COP_Importe||''}"></div>
            <div class="field"><label class="field-label">RCV — Período (MM/AAAA)</label><input id="vf-rcvperiodo" class="field-input" placeholder="MM/AAAA" value="${Utils.esc(rec.RCV_Periodo||'')}"></div>
            <div class="field"><label class="field-label">RCV — Importe</label><input type="number" id="vf-rcvimporte" class="field-input" value="${rec.RCV_Importe||''}"></div>
            <div class="field"><label class="field-label">Rúbrica Localizador</label><input id="vf-loc" class="field-input" value="${Utils.esc(rec.Rubrica_Localizador||App.session?.iniciales||'')}"></div>
            <div class="field" style="display:none;"><input id="vf-tipo" value="CORE_02"></div>
          </div>
        </div>`;

    } else if (tab === 'arp') {
      container.innerHTML =
        window._vfPatron(rec,'ARP') +
        window._vfDomicilio(rec,'') +
        window._vfDiligencia(rec,'') +
        window._vfInfoDiligencia(rec,'') +
        window._vfVecinos(rec,'') +
        window._vfLocalizador(rec);

    } else if (tab === 'dad') {
      container.innerHTML =
        window._vfPatron(rec,'DAD') +
        window._vfDomicilio(rec,'DAD_') +
        window._vfDiligencia(rec,'DAD_') +
        window._vfInfoDiligencia(rec,'DAD_') +
        window._vfVecinos(rec,'DAD_') +
        window._vfLocalizador(rec);

    } else if (tab === 'act') {
      container.innerHTML =
        window._vfPatron(rec,'Actualizacion') +
        window._vfDomicilio(rec,'') +
        window._vfDiligencia(rec,'') +
        window._vfInfoDiligencia(rec,'') +
        window._vfVecinos(rec,'') +
        window._vfTrabajadores(rec) +
        window._vfLocalizador(rec);

    } else if (tab === 'c03') {
      const sup = rec.Supuesto_C03 || 'POSITIVA';
      container.innerHTML = `
        <div class="card" style="padding:20px;margin-bottom:20px;border-left:4px solid #f59e0b;">
          <div style="font-size:16px;font-weight:700;margin-bottom:12px;">Supuesto CORE_03</div>
          <div class="flex gap-4">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
              <input type="radio" name="c03sup" value="POSITIVA" ${sup==='POSITIVA'?'checked':''} onchange="window._c03ChangeSup('POSITIVA')">
              <span style="color:#22c55e;font-weight:600;">Positiva</span>
            </label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
              <input type="radio" name="c03sup" value="NEGATIVA" ${sup==='NEGATIVA'?'checked':''} onchange="window._c03ChangeSup('NEGATIVA')">
              <span style="color:#ef4444;font-weight:600;">Negativa</span>
            </label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
              <input type="radio" name="c03sup" value="NEGATIVA_BAJA" ${sup==='NEGATIVA_BAJA'?'checked':''} onchange="window._c03ChangeSup('NEGATIVA_BAJA')">
              <span style="color:#f97316;font-weight:600;">Negativa con Baja</span>
            </label>
          </div>
        </div>
        <div id="c03-sections">${window._c03BuildSections(rec, sup)}</div>`;

    } else {
      // c03 genérico no debería llegar aquí, pero por seguridad:
      container.innerHTML = `<div class="card" style="padding:24px;"><p style="color:var(--text-muted);">Tab no reconocido.</p></div>`;
    }

    // Insertar evidencia global si no es origen
    if (tab !== 'origen') {
      container.insertAdjacentHTML('beforeend', this._getEvidenceHTML(rec));
    }
  },

  _getEvidenceHTML(rec) {
    return `

      <div class="card" style="padding:24px;margin-top:20px;margin-bottom:20px;border-left:4px solid var(--primary);">
        <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;color:var(--primary);">EVIDENCIA FOTOGRAFICA Y CROQUIS</div>
        <div class="form-grid form-grid-2">
          <!-- Columna Izquierda: Mapa / Croquis -->
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <label class="field-label" style="margin:0;">Croquis / Mapa</label>
              <select id="map-mode-select" class="field-input" style="width:auto;padding:2px 8px;" onchange="window.Modules.visitas.toggleMapMode(this.value)">
                <option value="interactive">Usar Mapa Interactivo</option>
                <option value="manual">Subir Imagen Manual</option>
              </select>
            </div>
            <!-- Interactive Mode -->
            <div id="map-interactive-mode">
              <div id="map-container" style="height:250px;width:100%;border:1px solid var(--border);border-radius:6px;background:#eee;"></div>
              <button type="button" class="btn btn-sm btn-primary" onclick="window.Modules.visitas.captureMap()" style="margin-top:8px;">Capturar Mapa</button>
            </div>
            <!-- Manual Upload Mode -->
            <div id="map-manual-mode" style="display:none;">
              <input type="file" accept="image/*" class="field-input" onchange="window.Modules.visitas.handleMapUpload(event)">
            </div>
            <div id="map-preview" style="margin-top:10px;">
              ${rec.Mapa_Croquis ? `<img src="${rec.Mapa_Croquis}" style="max-width:100%;max-height:200px;border:1px solid #ccc;border-radius:4px;">` : '<span style="font-size:12px;color:var(--text-muted)">Sin croquis cargado.</span>'}
            </div>
            <input type="hidden" id="vf-mapacroquis" value="${rec.Mapa_Croquis || ''}">
          </div>
          <!-- Columna Derecha: Fotos -->
          <div style="display:flex;flex-direction:column;gap:10px;">
            <label class="field-label">Fotografías (Máx 4)</label>
            <input type="file" id="vf-fotos-upload" multiple accept="image/*" class="field-input" onchange="window.Modules.visitas.handlePhotosUpload(event)">
            <div id="fotos-preview-container" style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px;">
              ${[1,2,3,4].map(n => `
                <div id="preview-foto-${n}" style="border:1px dashed var(--border);border-radius:4px;height:100px;display:flex;align-items:center;justify-content:center;overflow:hidden;">
                  ${rec['Foto_'+n] ? `<img src="${rec['Foto_'+n]}" style="max-width:100%;max-height:100%;">` : `<span style="font-size:10px;color:var(--text-muted)">Foto ${n}</span>`}
                </div>
                <input type="hidden" id="vf-foto${n}" value="${rec['Foto_'+n] || ''}">
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  },


  

  autoFillFromOrigen(rp) {
    console.log("autoFill triggered for RP:", rp);
    if (!rp || rp.length < 5) return;
    const cleanRP = rp.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const origenes = DB.vistas_origen.getAll();
    const match = origenes.find(o => (o.Reg_Patronal || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === cleanRP);
    if (match) {
      const nom = document.getElementById('vf-nom');
      const act = document.getElementById('vf-act');
      const calle = document.getElementById('vf-calle');
      const dom = document.getElementById('vf-dom');
      
      let filled = false;
      if (nom && !nom.value && match.Razon_Social) { nom.value = match.Razon_Social; filled = true; }
      if (act && !act.value && match.Actividad_SINDO) { act.value = match.Actividad_SINDO; filled = true; }
      if (calle && !calle.value && match.Domicilio) { calle.value = match.Domicilio; filled = true; }
      if (dom && !dom.value && match.Domicilio) { dom.value = match.Domicilio; filled = true; }
      
      if (filled) Utils.toast('Datos autocompletados desde Vistas Origen', 'info');
    }
  },

  addWorkerRow(nombre = '', domicilio = '', refiere = '') {
    const wCont = document.getElementById('workers-container');
    if (!wCont) return;
    const div = document.createElement('div');
    div.className = 'worker-row form-grid form-grid-3';
    div.style.background = 'var(--surface)';
    div.style.padding = '16px';
    div.style.borderRadius = '8px';
    div.style.border = '1px solid var(--border)';
    div.style.position = 'relative';
    div.innerHTML = `
      <button type="button" onclick="this.parentElement.remove()" style="position:absolute; top:8px; right:8px; background:none; border:none; color:var(--danger); cursor:pointer;" title="Eliminar trabajador">✖</button>
      <div class="field"><label class="field-label">Nombre Trabajador</label><input class="field-input w-nom" value="${Utils.esc(nombre)}"></div>
      <div class="field"><label class="field-label">Domicilio Trabajador</label><input class="field-input w-dom" value="${Utils.esc(domicilio)}"></div>
      <div class="field"><label class="field-label">Refiere Trabajador</label><input class="field-input w-ref" value="${Utils.esc(refiere)}"></div>
    `;
    wCont.appendChild(div);
  },

  saveRecord() {
    const tab = this._tab;
    const isOrigen = tab === 'origen';
    const isPos = tab === 'pos';
    const isRest = tab === 'rest';
    const isNeg = tab === 'neg';
    const isC02 = tab === 'c02';
    const g = id => document.getElementById(id)?.value?.trim() || '';
    
    let data;
    if (isOrigen) {
      if (!App.isAdmin()) { Utils.toast('Solo el Administrador puede gestionar Vistas Origen', 'error'); return; }
      data = { REF: g('vf-ref'), Reg_Patronal: g('vf-rp'), Razon_Social: g('vf-rs'), Domicilio: g('vf-dom'), Actividad_SINDO: g('vf-act'), SINDO_Ult_Mov: g('vf-sindo'), Procedencia: g('vf-proc'), Notificador: g('vf-not'), Rubrica_Localizador: App.session?.iniciales || '' };
    } else if (isNeg) {
      if (!g('vf-rp') || !g('vf-nom')) { Utils.toast('RP y Nombre son obligatorios', 'error'); return; }
      data = {
        Registro_Patronal: g('vf-rp'), Nombre_Patron: g('vf-nom'), RCF: g('vf-rcf'), Actividad: g('vf-act'),
        Domicilio_Verificar: g('vf-dom'), Nombre_Calle: g('vf-calle'), Calle_Colindante_1: g('vf-col1'), Calle_Colindante_2: g('vf-col2'),
        Num_Exterior: g('vf-numext'), Num_Interior: g('vf-numint'), Estatus_Verificacion: g('vf-estatus'), Num_Ocular: g('vf-numocu'),
        Fecha_Visita: g('vf-fecha'), Hora_Inicio_Diligencia: g('vf-hini'), Hora_Fin_Diligencia: g('vf-hfin'),
        Descripcion_Inmueble_Diligencia: g('vf-desc'), Persona_En_Domicilio_o_Vecino: g('vf-pers'), Refiere_Persona: g('vf-refpers'),
        Nombre_Vecino_1: g('vf-v1nom'), Domicilio_Vecino_1: g('vf-v1dom'), Refiere_Vecino_1: g('vf-v1ref'),
        Nombre_Vecino_2: g('vf-v2nom'), Domicilio_Vecino_2: g('vf-v2dom'), Refiere_Vecino_2: g('vf-v2ref'),
        Nombre_Vecino_3: g('vf-v3nom'), Domicilio_Vecino_3: g('vf-v3dom'), Refiere_Vecino_3: g('vf-v3ref'),
        Nombre_Trabajador_1: g('vf-t1nom'), Domicilio_Trabajador_1: g('vf-t1dom'), Refiere_Trabajador_1: g('vf-t1ref'),
        Nombre_Trabajador_2: g('vf-t2nom'), Domicilio_Trabajador_2: g('vf-t2dom'), Refiere_Trabajador_2: g('vf-t2ref'),
        Nombre_Trabajador_3: g('vf-t3nom'), Domicilio_Trabajador_3: g('vf-t3dom'), Refiere_Trabajador_3: g('vf-t3ref'),
        DAD_Domicilio: g('vf-daddom'), DAD_Folio: g('vf-dadfolio'), DAD_Calle: g('vf-dadcalle'), DAD_Calles: g('vf-dadcalles'),
        DAD_Num_Ext: g('vf-dadnumext'), DAD_Num_Int: g('vf-dadnumint'), DAD_Visita_Fecha: g('vf-dadfecha'),
        DAD_Visita_Hora_Inc: g('vf-dadhini'), DAD_Visita_Hora_Fin: g('vf-dadhfin'),
        DAD_Descripcion_Inmueble_Situacion: g('vf-daddesc'), DAD_Persona_En_Domicilio: g('vf-dadpers'), DAD_Refiere_Persona: g('vf-dadref'),
        DAD_Nombre_Vecino_1: g('vf-dadv1nom'), DAD_Domicilio_Vecino_1: g('vf-dadv1dom'), DAD_Refiere_Vecino_1: g('vf-dadv1ref'),
        DAD_Nombre_Vecino_2: g('vf-dadv2nom'), DAD_Domicilio_Vecino_2: g('vf-dadv2dom'), DAD_Refiere_Vecino_2: g('vf-dadv2ref'),
        DAD_Nombre_Vecino_3: g('vf-dadv3nom'), DAD_Domicilio_Vecino_3: g('vf-dadv3dom'), DAD_Refiere_Vecino_3: g('vf-dadv3ref'),
        Sindo_Region_1: g('vf-sindo1'), Sindo_Region_2: g('vf-sindo2'), Sindo_Region_3: g('vf-sindo3'),
        COP: g('vf-cop'), RCV: g('vf-rcv'), Anhio_Baja: g('vf-anhio'), Rango: g('vf-rango'),
        Rubrica_Localizador: g('vf-loc'), Nombre_Notificador: g('vf-notif'), ID_Constancia: g('vf-idcons'),
        Tipo_Informe: 'Negativa'
      };
    } else if (isPos || isRest) {
      if (!g('vf-rp') || !g('vf-nom')) { Utils.toast('RP y Nombre son obligatorios', 'error'); return; }
      data = {
        Registro_Patronal: g('vf-rp'), Nombre_Patron: g('vf-nom'), RCF: g('vf-rcf'), Actividad: g('vf-act'),
        Domicilio_Verificar: g('vf-dom'), Nombre_Calle: g('vf-calle'), Calle_Colindante_1: g('vf-col1'), Calle_Colindante_2: g('vf-col2'),
        Num_Exterior: g('vf-numext'), Num_Interior: g('vf-numint'), Estatus_Verificacion: g('vf-estatus'), Ubicacion: g('vf-ubicacion'),
        Fecha_Visita: g('vf-fecha'), Hora_Inicio_Diligencia: g('vf-hini'), Hora_Fin_Diligencia: g('vf-hfin'), Num_Ocular: g('vf-numocu'),
        Resultado_Diligencia: isRest ? g('vf-resdil') : undefined,
        Descripcion_Inmueble_Diligencia: g('vf-desc'), Descripcion_Persona_Atiende: g('vf-descpers'), Observaciones_Adicionales: g('vf-obs'),
        Nombre_Persona_Atiende: g('vf-npersona'), Relacion_Con_Patron: g('vf-relcont'), Identificacion_Presenta: g('vf-ident'),
        ID_Verificacion: g('vf-idverif'), Vigencia_Identificacion: g('vf-vigident'), Telefono_1: g('vf-tel1'), Telefono_2: g('vf-tel2'),
        Correo_Electronico: g('vf-correo'), Horario_Atencion: g('vf-horario'),
        Rubrica_Localizador: g('vf-loc'), Nombre_Localizador: g('vf-nomloc'), Constancia_Localizador: g('vf-const'),
        Tipo_Informe: isRest ? 'Restablecimiento' : 'Positivo'
      };
      if (!isRest) delete data.Resultado_Diligencia;
    } else if (isC02) {
      if (!g('vf-rp') || !g('vf-sujeto')) { Utils.toast('Registro Patronal y Sujeto Obligado son obligatorios', 'error'); return; }
      data = {
        Registro_Patronal: g('vf-rp'), Sujeto_Obligado: g('vf-sujeto'), RFC: g('vf-rfc'), Actividad: g('vf-act'), Domicilio: g('vf-dom'),
        Num_Folio: g('vf-numfolio'), Fecha_Oficio: g('vf-fechaoficio'), RP_Foranea: g('vf-rpfor'), Oficio_Antecedente: g('vf-ofant'),
        Codigo_Subdelegacion: g('vf-codsub'), Nombre_Subdelegado: g('vf-nomsubdel'), Nombre_Subdelegacion: g('vf-nomsub'), Direccion_Subdelegacion: g('vf-dirsub'),
        COP_Periodo: g('vf-copperiodo'), COP_Importe: g('vf-copimporte'), RCV_Periodo: g('vf-rcvperiodo'), RCV_Importe: g('vf-rcvimporte'),
        Rubrica_Localizador: g('vf-loc'), Tipo_Informe: 'CORE_02'
      };
    } else if (tab === 'c03') {
      if (!g('vf-rp') || !g('vf-nom')) { Utils.toast('RP y Nombre son obligatorios', 'error'); return; }
      const supRadio = document.querySelector('input[name="c03sup"]:checked');
      const sup = supRadio ? supRadio.value : 'POSITIVA';
      const dadVec = [1,2,3].reduce((a,n)=>({...a,
        ['DAD_Nombre_Vecino_'+n]:(document.getElementById('vf-dadv'+n+'nom')||{}).value||'',
        ['DAD_Domicilio_Vecino_'+n]:(document.getElementById('vf-dadv'+n+'dom')||{}).value||'',
        ['DAD_Refiere_Vecino_'+n]:(document.getElementById('vf-dadv'+n+'ref')||{}).value||''
      }), {});
      data = {
        Registro_Patronal: g('vf-rp'), Nombre_Patron: g('vf-nom'), RCI: g('vf-rci'), Actividad: g('vf-act'),
        Subdelegacion_Solicitante: g('vf-subdelreq'), Domicilio_Verificar: g('vf-dom'),
        Nombre_Calle: g('vf-calle'), Calle_Colindante_1: g('vf-col1'), Calle_Colindante_2: g('vf-col2'),
        Num_Exterior: g('vf-numext'), Num_Interior: g('vf-numint'), Estatus_Verificacion: g('vf-estatus'), Coordenadas: g('vf-coord'),
        Num_Folio_Envio: g('vf-numfolio'), Fecha_Envio: g('vf-fechaenv'), Hora_Inicio_Diligencia: g('vf-hini'), Hora_Fin_Diligencia: g('vf-hfin'), Fecha_Fin_Frustra: g('vf-fechafin'),
        Folio_Solicitud: g('vf-folsol'), Fecha_Solicitud: g('vf-fechasol'), Codigo_Subdelegacion: g('vf-codsub'),
        Nombre_Subdelegado: g('vf-nomsubdel'), Nombre_Subdelegacion: g('vf-nomsub'), Direccion_Subdelegacion: g('vf-dirsub'),
        En_Domicilio: g('vf-endom'), Otro_Domicilio: g('vf-otrodom'),
        No_Existe_Calle: g('vf-noexcalle'), No_Existe_Numero: g('vf-noexnum'), Cerrado_Clausurado_Vacio: g('vf-cerrado'),
        Sustitucion_Patronal: g('vf-sustpat'), Otras_Causas: g('vf-otrcausas'), Comentarios_Adicionales: g('vf-comentadd'),
        Descripcion_Inmueble_Diligencia: g('vf-desc'), Descricion_Persona_Atiende: g('vf-persona'), Refiere_Persona: g('vf-refpersona'),
        Nombre_Persona_Atiende: g('vf-nombpers'), Relacion_Con_Patron: g('vf-relcon'), Identificacion_Presenta: g('vf-identpres'),
        ID_Verificacion: g('vf-idverif'), Vigencia_Identificacion: g('vf-vigident'),
        Telefono_1: g('vf-tel1'), Telefono_2: g('vf-tel2'), Correo_Electronico: g('vf-correo'), Horario_Atencion: g('vf-horario'),
        ...window._vfGetVecinos(g,''), ...window._vfGetTrabajadores(g), ...dadVec,
        DAD_Domicilio: g('vf-daddom'), DAD_Folio: g('vf-dadfolio'), DAD_Calle: g('vf-dadcalle'), DAD_Calles: g('vf-dadcalles'),
        DAD_Num_Ext: g('vf-dadnumext'), DAD_Num_Int: g('vf-dadnumint'), DAD_Visita_Fecha: g('vf-dadfecha'),
        DAD_Visita_Hora_Inc: g('vf-dadhini'), DAD_Visita_Hora_Fin: g('vf-dadhfin'),
        DAD_Descripcion_Inmueble_Situacion: g('vf-daddesc'), DAD_Persona_En_Domicilio: g('vf-dadpers'), DAD_Refiere_Persona: g('vf-dadref'),
        Sindo_Region_1: g('vf-sindo1'), Sindo_Region_2: g('vf-sindo2'), Sindo_Region_3: g('vf-sindo3'),
        COP: g('vf-cop'), RCV: g('vf-rcv'), Actas_Baja: g('vf-actasbaja'),
        Rubrica_Localizador: g('vf-loc'), Nombre_Notificador: g('vf-notif'), ID_Constancia: g('vf-idcons'),
        Tipo_Informe: 'CORE_03', Supuesto_C03: sup
      };
    } else if (tab === 'arp') {
      if (!g('vf-rp') || !g('vf-nom')) { Utils.toast('RP y Nombre son obligatorios', 'error'); return; }
      data = {
        Registro_Patronal: g('vf-rp'), Nombre_Patron: g('vf-nom'), RCF: g('vf-rcf'), Actividad: g('vf-act'),
        Domicilio: g('vf-dom'), Calle: g('vf-calle'), Calle_Colindante_1: g('vf-col1'), Calle_Colindante_2: g('vf-col2'), Estatus_Verificacion: g('vf-estatus'),
        Fecha_Visita: g('vf-fecha'), Fecha_Reporte: g('vf-freporte'), Hora_Inicio_Diligencia: g('vf-hini'), Hora_Fin_Diligencia: g('vf-hfin'),
        Descripcion_Inmueble_Diligencia: g('vf-desc'), Descricion_Persona_Atiende: g('vf-persona'), Refiere_Persona: g('vf-refpersona'),
        ...window._vfGetVecinos(g,''),
        Rubrica_Localizador: g('vf-loc'), Nombre_Notificador: g('vf-notif'), ID_Constancia: g('vf-idcons'), Tipo_Informe: 'ARP'
      };
    } else if (tab === 'dad') {
      if (!g('vf-rp') || !g('vf-nom')) { Utils.toast('RP y Nombre son obligatorios', 'error'); return; }
      data = {
        Registro_Patronal: g('vf-rp'), Nombre_Patron: g('vf-nom'), RCF: g('vf-rcf'), Actividad: g('vf-act'),
        DAD_Domicilio: g('vf-dom'), DAD_Calle: g('vf-calle'), DAD_Calles: g('vf-col1'), Estatus_Verificacion: g('vf-estatus'),
        DAD_VFecha: g('vf-fecha'), DAD_Hora_Inicio: g('vf-hini'), DAD_Hora_Fin: g('vf-hfin'), DAD_Folio: g('vf-folio'),
        DAD_Descripcion_Inmueble_Diligencia: g('vf-desc'), DAD_Descricion_Persona_Atiende: g('vf-persona'), DAD_Refiere_Persona: g('vf-refpersona'),
        ...window._vfGetVecinos(g,'DAD_'),
        Tipo_Informe: 'DAD'
      };
    } else if (tab === 'act') {
      if (!g('vf-rp') || !g('vf-nom')) { Utils.toast('RP y Nombre son obligatorios', 'error'); return; }
      data = {
        Registro_Patronal: g('vf-rp'), Nombre_Patron: g('vf-nom'), RCF: g('vf-rcf'), Actividad: g('vf-act'),
        Domicilio: g('vf-dom'), Calle: g('vf-calle'), Calle_Colindante_1: g('vf-col1'), Calle_Colindante_2: g('vf-col2'), Estatus_Verificacion: g('vf-estatus'),
        Fecha_Visita: g('vf-fecha'), Fecha_Reporte: g('vf-freporte'), Hora_Inicio_Diligencia: g('vf-hini'), Hora_Fin_Diligencia: g('vf-hfin'),
        Descripcion_Inmueble_Diligencia: g('vf-desc'), Descricion_Persona_Atiende: g('vf-persona'), Refiere_Persona: g('vf-refpersona'),
        ...window._vfGetVecinos(g,''),
        ...window._vfGetTrabajadores(g),
        Rubrica_Localizador: g('vf-loc'), Nombre_Notificador: g('vf-notif'), ID_Constancia: g('vf-idcons'), Tipo_Informe: 'Actualizacion'
      };
    } else {
      if (!g('vf-rp') || !g('vf-nom')) { Utils.toast('RP y Nombre son obligatorios', 'error'); return; }
      data = { Registro_Patronal: g('vf-rp'), Nombre_del_patron: g('vf-nom'), RFC: g('vf-rfc'), Actividad: g('vf-act'), Domicilio_a_Verificar: g('vf-dom'), Fecha_Visita: g('vf-fecha'), Rubrica_Localizador: g('vf-loc'), Tipo_Informe: g('vf-tipo'), Observaciones: g('vf-obs') };
    }
    
    // Anexar evidencia si el tab no es origen
    if (tab !== 'origen') {
      const baseData = {
        Mapa_Croquis: g('vf-mapacroquis'),
        Foto_1: g('vf-foto1'), Foto_2: g('vf-foto2'), Foto_3: g('vf-foto3'), Foto_4: g('vf-foto4')
      };
      Object.assign(data, baseData);
    }

    const store = this.TABS[tab].store;
    if (this._editingId) { DB[store].update(this._editingId, data); Utils.toast('Registro actualizado', 'success'); }
    else { DB[store].insert(data); Utils.toast('Registro guardado', 'success'); }
    document.getElementById('vis-modal').classList.remove('open');
    this.renderTab(tab);
  },

  _deleteConfirm: {},
  deleteRecord(id, tab) {
    if (!this._deleteConfirm[`v_${id}`]) {
      this._deleteConfirm[`v_${id}`] = true;
      Utils.toast('⚠️ Presiona eliminar de nuevo para confirmar', 'info');
      setTimeout(() => { delete this._deleteConfirm[`v_${id}`]; }, 3000);
      return;
    }
    delete this._deleteConfirm[`v_${id}`];
    
    DB[this.TABS[tab].store].remove(id);
    Utils.toast('Registro eliminado', 'success');
    this.renderTab(tab);
  },

  deleteAll() {
    const q = this._query.toLowerCase();
    let data = DB[this.TABS[this._tab].store].getAll();
    if (q) data = data.filter(r => Utils.matchSearch(r, q));

    if (data.length === 0) {
      Utils.toast('No hay registros para eliminar', 'error');
      return;
    }

    if (!this._deleteConfirm['all']) {
      this._deleteConfirm['all'] = true;
      Utils.toast(`⚠️ Presiona Vaciar de nuevo para eliminar ${data.length} registros`, 'info');
      setTimeout(() => { delete this._deleteConfirm['all']; }, 3000);
      return;
    }
    delete this._deleteConfirm['all'];

    const store = DB[this.TABS[this._tab].store];
    data.forEach(r => store.remove(r.id));
    Utils.toast(`Se eliminaron ${data.length} registros`, 'success');
    this.renderTab(this._tab);
  },

  closeModal() { document.getElementById('vis-modal').classList.remove('open'); },

  exportTab() {
    const { store } = this.TABS[this._tab];
    Utils.exportCSV(DB[store].getAll(), `visitas_${this._tab}_${Utils.today()}.csv`);
  },

  openImportModal() {
    document.getElementById('vis-import-textarea').value = '';
    document.getElementById('vis-import-modal').classList.add('open');
  },

  closeImportModal() {
    document.getElementById('vis-import-modal').classList.remove('open');
  },

  processExcelImport() {
    const text = document.getElementById('vis-import-textarea').value.trim();
    if (!text) { Utils.toast('Por favor, pega los datos primero.', 'error'); return; }

    const fields = this.FIELDS[this._tab];
    const store = this.TABS[this._tab].store;
    
    // Split by lines, then by tabs (TSV from Excel)
    const rows = text.split('\n').map(row => row.split('\t'));
    
    let count = 0;
    rows.forEach(rowCols => {
      // If row has no meaningful columns, skip
      if (rowCols.length < 2 || rowCols.join('').trim() === '') return;
      
      const rec = {};
      // Map each column to the corresponding field in the database for the active tab
      fields.forEach((f, index) => {
        // Remove \r just in case
        rec[f] = rowCols[index] ? rowCols[index].replace(/\r/g, '').trim() : '';
      });
      
      DB[store].insert(rec);
      count++;
    });

    if (count > 0) {
      Utils.toast(`¡Se importaron ${count} registros exitosamente!`, 'success');
      this.closeImportModal();
      this.renderTab(this._tab);
    } else {
      Utils.toast('No se encontraron filas válidas para importar.', 'error');
    }
  },

  // ── MAPA Y FOTOS (Positivos y Restablecimientos) ─────────────────────────
  _mapInstance: null,
  _mapMarker: null,

  initMap(rec) {
    const mapDiv = document.getElementById('map-container');
    if (!mapDiv || typeof L === 'undefined') return;
    
    // Clear previous instance
    if (this._mapInstance) {
      this._mapInstance.remove();
      this._mapInstance = null;
    }

    // Default to CDMX if no coordinates
    const lat = 19.432608;
    const lng = -99.133209;

    this._mapInstance = L.map('map-container').setView([lat, lng], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(this._mapInstance);

    this._mapMarker = L.marker([lat, lng], { draggable: true }).addTo(this._mapInstance);
    
    // Auto center map when resizing modal
    setTimeout(() => this._mapInstance.invalidateSize(), 500);
  },

  captureMap() {
    const mapDiv = document.getElementById('map-container');
    if (!mapDiv || typeof html2canvas === 'undefined') return;
    
    // Use html2canvas with allowTaint and useCORS for OpenStreetMap tiles
    html2canvas(mapDiv, { useCORS: true, allowTaint: true }).then(canvas => {
      // Compress to 80% JPEG
      const base64 = canvas.toDataURL('image/jpeg', 0.8);
      document.getElementById('vf-mapacroquis').value = base64;
      document.getElementById('map-preview').innerHTML = `<img src="${base64}" style="max-width:100%;max-height:200px;border:1px solid var(--border);border-radius:4px;">`;
      Utils.toast('Croquis capturado exitosamente', 'success');
    }).catch(err => {
      console.error(err);
      Utils.toast('Error al capturar el mapa', 'error');
    });
  },

  toggleMapMode(mode) {
    if (mode === 'interactive') {
      document.getElementById('map-interactive-mode').style.display = 'block';
      document.getElementById('map-manual-mode').style.display = 'none';
      if (this._mapInstance) setTimeout(() => this._mapInstance.invalidateSize(), 100);
    } else {
      document.getElementById('map-interactive-mode').style.display = 'none';
      document.getElementById('map-manual-mode').style.display = 'block';
    }
  },

  async handleMapUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const base64 = await this.compressImage(file, 800, 0.6);
      document.getElementById('vf-mapacroquis').value = base64;
      document.getElementById('map-preview').innerHTML = `<img src="${base64}" style="max-width:100%;max-height:200px;border:1px solid var(--border);border-radius:4px;">`;
      Utils.toast('Imagen de mapa cargada', 'success');
    } catch (err) {
      console.error(err);
      Utils.toast('Error al cargar la imagen', 'error');
    }
  },

  async handlePhotosUpload(e) {
    const files = Array.from(e.target.files).slice(0, 4); // max 4 files
    if (files.length === 0) return;
    
    Utils.toast(`Procesando ${files.length} fotos...`, 'info');
    
    for (let i = 0; i < files.length; i++) {
      try {
        const base64 = await this.compressImage(files[i], 800, 0.6); // Compress to max 800px width, 60% quality
        const n = i + 1;
        document.getElementById(`vf-foto${n}`).value = base64;
        document.getElementById(`preview-foto-${n}`).innerHTML = `<img src="${base64}" style="max-width:100%;max-height:100%;">`;
      } catch (err) {
        console.error(err);
      }
    }
    Utils.toast('Fotos procesadas', 'success');
  },

  compressImage(file, maxWidth, quality) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = event => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          let w = img.width;
          let h = img.height;
          if (w > maxWidth) {
            h = Math.round((maxWidth / w) * h);
            w = maxWidth;
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }
};
