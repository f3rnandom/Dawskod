/**
 * visitas_forms.js — Formularios ARP, DAD, Actualizaciones
 * Se carga DESPUÉS de visitas.js y extiende _buildForm y saveRecord
 */

// Helper: sección de patrón compartida (ARP, DAD, ACT)
window._vfPatron = (rec, tipoHidden) => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">1. Datos del Patrón / Sujeto Obligado</div>
    <div class="form-grid form-grid-2">
      <div class="field"><label class="field-label">Registro Patronal *</label><input id="vf-rp" class="field-input" value="${Utils.esc(rec.Registro_Patronal||'')}" onblur="window.Modules.visitas.autoFillFromOrigen(this.value)"></div>
      <div class="field"><label class="field-label">Nombre Patrón *</label><input id="vf-nom" class="field-input" value="${Utils.esc(rec.Nombre_Patron||'')}"></div>
      <div class="field"><label class="field-label">RCF</label><input id="vf-rcf" class="field-input" value="${Utils.esc(rec.RCF||'')}"></div>
      <div class="field"><label class="field-label">Actividad</label><input id="vf-act" class="field-input" value="${Utils.esc(rec.Actividad||'')}"></div>
      <div class="field" style="display:none"><input id="vf-tipo" value="${tipoHidden}"></div>
    </div>
  </div>`;

window._vfDomicilio = (rec, pref='') => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">2. Datos del Domicilio a Verificar</div>
    <div class="form-grid form-grid-2">
      <div class="field" style="grid-column:1/-1"><label class="field-label">Domicilio</label><input id="vf-dom" class="field-input" value="${Utils.esc(rec[pref+'Domicilio']||rec.Domicilio||'')}"></div>
      <div class="field"><label class="field-label">Calle</label><input id="vf-calle" class="field-input" value="${Utils.esc(rec[pref+'Calle']||rec.Calle||'')}"></div>
      <div class="field"><label class="field-label">Calle Colindante 1</label><input id="vf-col1" class="field-input" value="${Utils.esc(rec[pref+'Calle_Colindante_1']||rec.Calle_Colindante_1||rec[pref+'Calles']||'')}"></div>
      <div class="field"><label class="field-label">Calle Colindante 2</label><input id="vf-col2" class="field-input" value="${Utils.esc(rec[pref+'Calle_Colindante_2']||rec.Calle_Colindante_2||'')}"></div>
      <div class="field"><label class="field-label">Estatus Verificación (¿Se localizó el inmueble?)</label><input id="vf-estatus" class="field-input" value="${Utils.esc(rec.Estatus_Verificacion||'')}"></div>
    </div>
  </div>`;

window._vfDiligencia = (rec, pref='') => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">3. Datos de la Diligencia</div>
    <div class="form-grid form-grid-4">
      <div class="field"><label class="field-label">Fecha Visita</label><input type="date" id="vf-fecha" class="field-input" value="${rec[pref+'VFecha']||rec.Fecha_Visita||rec[pref+'Fecha']||''}"></div>
      <div class="field"><label class="field-label">Fecha Reporte</label><input type="date" id="vf-freporte" class="field-input" value="${rec.Fecha_Reporte||''}"></div>
      <div class="field"><label class="field-label">Hora Inicio</label><input type="time" id="vf-hini" class="field-input" value="${rec[pref+'Hora_Inicio']||rec.Hora_Inicio_Diligencia||''}"></div>
      <div class="field"><label class="field-label">Hora Fin</label><input type="time" id="vf-hfin" class="field-input" value="${rec[pref+'Hora_Fin']||rec.Hora_Fin_Diligencia||''}"></div>
      ${pref ? `<div class="field"><label class="field-label">Folio</label><input id="vf-folio" class="field-input" value="${Utils.esc(rec[pref+'Folio']||'')}"></div>` : ''}
    </div>
  </div>`;

window._vfInfoDiligencia = (rec, pref='') => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">4. Información de la Diligencia</div>
    <div class="form-grid form-grid-1">
      <div class="field"><label class="field-label">Descripción Inmueble / Diligencia</label><textarea id="vf-desc" class="field-input" rows="2">${Utils.esc(rec[pref+'Descripcion_Inmueble_Diligencia']||'')}</textarea></div>
      <div class="field"><label class="field-label">Descripción Persona que Atiende</label><input id="vf-persona" class="field-input" value="${Utils.esc(rec[pref+'Descricion_Persona_Atiende']||'')}"></div>
      <div class="field"><label class="field-label">Refiere Persona</label><input id="vf-refpersona" class="field-input" value="${Utils.esc(rec[pref+'Refiere_Persona']||rec.Refiere_Persona||'')}"></div>
    </div>
  </div>`;

window._vfVecinos = (rec, pref='') => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">5. Información de Vecinos</div>
    <div class="form-grid form-grid-3">
      ${[1,2,3].map(n => `
      <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
        <div style="font-weight:700;font-size:11px;color:var(--text-muted);margin-bottom:8px;">VECINO ${n}</div>
        <div class="field"><label class="field-label">${pref ? 'Descripción' : 'Nombre'}</label><input id="vf-v${n}nom" class="field-input" value="${Utils.esc(rec[pref+'Vecino_descripcion_'+n]||rec['Nombre_Vecino_'+n]||'')}"></div>
        <div class="field"><label class="field-label">Domicilio</label><input id="vf-v${n}dom" class="field-input" value="${Utils.esc(rec[pref+'Vecino_Domicilio_'+n]||rec['Domicilio_Vecino_'+n]||'')}"></div>
        <div class="field"><label class="field-label">Refiere</label><input id="vf-v${n}ref" class="field-input" value="${Utils.esc(rec[pref+'Vecino_Refiere_'+n]||rec['Refiere_Vecino_'+n]||'')}"></div>
      </div>`).join('')}
    </div>
  </div>`;

window._vfTrabajadores = (rec) => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">6. Información de Trabajadores</div>
    <div class="form-grid form-grid-3">
      ${[1,2,3].map(n => `
      <div style="padding:12px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
        <div style="font-weight:700;font-size:11px;color:var(--text-muted);margin-bottom:8px;">TRABAJADOR ${n}</div>
        <div class="field"><label class="field-label">Nombre</label><input id="vf-t${n}nom" class="field-input" value="${Utils.esc(rec['Nombre_Trabajador_'+n]||'')}"></div>
        <div class="field"><label class="field-label">Domicilio</label><input id="vf-t${n}dom" class="field-input" value="${Utils.esc(rec['Domicilio_Trabajador_'+n]||'')}"></div>
        <div class="field"><label class="field-label">Refiere</label><input id="vf-t${n}ref" class="field-input" value="${Utils.esc(rec['Refiere_Trabajador_'+n]||'')}"></div>
      </div>`).join('')}
    </div>
  </div>`;

window._vfLocalizador = (rec) => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">Información de Localizador</div>
    <div class="form-grid form-grid-3">
      <div class="field"><label class="field-label">Rúbrica Localizador</label><input id="vf-loc" class="field-input" value="${Utils.esc(rec.Rubrica_Localizador||App.session?.iniciales||'')}"></div>
      <div class="field"><label class="field-label">Nombre Notificador</label><input id="vf-notif" class="field-input" value="${Utils.esc(rec.Nombre_Notificador||'')}"></div>
      <div class="field"><label class="field-label">ID Constancia</label><input id="vf-idcons" class="field-input" value="${Utils.esc(rec.ID_Constancia||'')}"></div>
    </div>
  </div>`;

// Helper para recoger datos de vecinos del DOM
window._vfGetVecinos = (g, pref='') => {
  const r = {};
  [1,2,3].forEach(n => {
    if (pref) {
      r[pref+'Vecino_descripcion_'+n] = g('vf-v'+n+'nom');
      r[pref+'Vecino_Domicilio_'+n]   = g('vf-v'+n+'dom');
      r[pref+'Vecino_Refiere_'+n]     = g('vf-v'+n+'ref');
    } else {
      r['Nombre_Vecino_'+n]    = g('vf-v'+n+'nom');
      r['Domicilio_Vecino_'+n] = g('vf-v'+n+'dom');
      r['Refiere_Vecino_'+n]   = g('vf-v'+n+'ref');
    }
  });
  return r;
};

window._vfGetTrabajadores = (g) => {
  const r = {};
  [1,2,3].forEach(n => {
    r['Nombre_Trabajador_'+n]    = g('vf-t'+n+'nom');
    r['Domicilio_Trabajador_'+n] = g('vf-t'+n+'dom');
    r['Refiere_Trabajador_'+n]   = g('vf-t'+n+'ref');
  });
  return r;
};

/* ========================================================
   CORE_03 — helpers por sección
   ======================================================== */

window._c03Patron = (rec) => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">1. Datos del Patrón / Sujeto Obligado</div>
    <div class="form-grid form-grid-2">
      <div class="field"><label class="field-label">Registro Patronal *</label><input id="vf-rp" class="field-input" value="${Utils.esc(rec.Registro_Patronal||'')}" onblur="window.Modules.visitas.autoFillFromOrigen(this.value)"></div>
      <div class="field"><label class="field-label">Nombre Patrón *</label><input id="vf-nom" class="field-input" value="${Utils.esc(rec.Nombre_Patron||'')}"></div>
      <div class="field"><label class="field-label">RCI</label><input id="vf-rci" class="field-input" value="${Utils.esc(rec.RCI||'')}"></div>
      <div class="field"><label class="field-label">Actividad</label><input id="vf-act" class="field-input" value="${Utils.esc(rec.Actividad||'')}"></div>
      <div class="field" style="grid-column:1/-1"><label class="field-label">Subdelegación Solicitante</label><input id="vf-subdelreq" class="field-input" value="${Utils.esc(rec.Subdelegacion_Solicitante||'')}"></div>
    </div>
  </div>`;

window._c03Domicilio = (rec) => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">2. Datos del Domicilio a Verificar</div>
    <div class="form-grid form-grid-2">
      <div class="field" style="grid-column:1/-1"><label class="field-label">Domicilio a Verificar</label><input id="vf-dom" class="field-input" value="${Utils.esc(rec.Domicilio_Verificar||'')}"></div>
      <div class="field"><label class="field-label">Nombre Calle</label><input id="vf-calle" class="field-input" value="${Utils.esc(rec.Nombre_Calle||'')}"></div>
      <div class="field"><label class="field-label">Calle Colindante 1</label><input id="vf-col1" class="field-input" value="${Utils.esc(rec.Calle_Colindante_1||'')}"></div>
      <div class="field"><label class="field-label">Calle Colindante 2</label><input id="vf-col2" class="field-input" value="${Utils.esc(rec.Calle_Colindante_2||'')}"></div>
      <div class="field"><label class="field-label">Núm. Exterior</label><input id="vf-numext" class="field-input" value="${Utils.esc(rec.Num_Exterior||'')}"></div>
      <div class="field"><label class="field-label">Núm. Interior</label><input id="vf-numint" class="field-input" value="${Utils.esc(rec.Num_Interior||'')}"></div>
      <div class="field"><label class="field-label">Estatus Verificación</label><input id="vf-estatus" class="field-input" value="${Utils.esc(rec.Estatus_Verificacion||'')}"></div>
      <div class="field"><label class="field-label">Coordenadas</label><input id="vf-coord" class="field-input" value="${Utils.esc(rec.Coordenadas||'')}"></div>
    </div>
  </div>`;

window._c03DatosC03 = (rec, supuesto) => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">3. Datos de CORE_03</div>
    <div class="form-grid form-grid-4">
      <div class="field"><label class="field-label">Núm. Folio Envío</label><input id="vf-numfolio" class="field-input" value="${Utils.esc(rec.Num_Folio_Envio||'')}"></div>
      ${supuesto !== 'NEGATIVA_BAJA' ? `<div class="field"><label class="field-label">Fecha Envío</label><input type="date" id="vf-fechaenv" class="field-input" value="${rec.Fecha_Envio||''}"></div>` : ''}
      <div class="field"><label class="field-label">Hora Inicio Diligencia</label><input type="time" id="vf-hini" class="field-input" value="${rec.Hora_Inicio_Diligencia||''}"></div>
      <div class="field"><label class="field-label">Hora Fin Diligencia</label><input type="time" id="vf-hfin" class="field-input" value="${rec.Hora_Fin_Diligencia||''}"></div>
      ${supuesto !== 'POSITIVA' ? `<div class="field"><label class="field-label">Fecha Fin Frustrada</label><input type="date" id="vf-fechafin" class="field-input" value="${rec.Fecha_Fin_Frustra||''}"></div>` : ''}
    </div>
  </div>`;

window._c03DatosC02 = (rec) => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">4. Datos de CORE_02</div>
    <div class="form-grid form-grid-2">
      <div class="field"><label class="field-label">Folio Solicitud</label><input id="vf-folsol" class="field-input" value="${Utils.esc(rec.Folio_Solicitud||'')}"></div>
      <div class="field"><label class="field-label">Fecha Solicitud</label><input type="date" id="vf-fechasol" class="field-input" value="${rec.Fecha_Solicitud||''}"></div>
      <div class="field"><label class="field-label">Código Subdelegación</label><input id="vf-codsub" class="field-input" value="${Utils.esc(rec.Codigo_Subdelegacion||'')}"></div>
      <div class="field"><label class="field-label">Nombre Subdelegado</label><input id="vf-nomsubdel" class="field-input" value="${Utils.esc(rec.Nombre_Subdelegado||'')}"></div>
      <div class="field"><label class="field-label">Nombre Subdelegación</label><input id="vf-nomsub" class="field-input" value="${Utils.esc(rec.Nombre_Subdelegacion||'')}"></div>
      <div class="field"><label class="field-label">Dirección Subdelegación</label><input id="vf-dirsub" class="field-input" value="${Utils.esc(rec.Direccion_Subdelegacion||'')}"></div>
    </div>
  </div>`;

window._c03Supuestos = (rec, supuesto) => {
  const posHTML = `
    <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid #22c55e;">
      <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">5. Datos en el Supuesto Positivo</div>
      <div class="form-grid form-grid-2">
        <div class="field"><label class="field-label">En Domicilio</label><input id="vf-endom" class="field-input" value="${Utils.esc(rec.En_Domicilio||'')}"></div>
        <div class="field"><label class="field-label">Otro Domicilio</label><input id="vf-otrodom" class="field-input" value="${Utils.esc(rec.Otro_Domicilio||'')}"></div>
      </div>
    </div>`;
  const negHTML = `
    <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid #ef4444;">
      <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">6. Datos en el Supuesto Negativo</div>
      <div class="form-grid form-grid-2">
        <div class="field"><label class="field-label">No Existe Calle</label><input id="vf-noexcalle" class="field-input" value="${Utils.esc(rec.No_Existe_Calle||'')}"></div>
        <div class="field"><label class="field-label">No Existe Número</label><input id="vf-noexnum" class="field-input" value="${Utils.esc(rec.No_Existe_Numero||'')}"></div>
        <div class="field"><label class="field-label">Cerrado / Clausurado / Vacío</label><input id="vf-cerrado" class="field-input" value="${Utils.esc(rec.Cerrado_Clausurado_Vacio||'')}"></div>
        <div class="field"><label class="field-label">Sustitución Patronal</label><input id="vf-sustpat" class="field-input" value="${Utils.esc(rec.Sustitucion_Patronal||'')}"></div>
        <div class="field"><label class="field-label">Otras Causas</label><input id="vf-otrcausas" class="field-input" value="${Utils.esc(rec.Otras_Causas||'')}"></div>
        <div class="field" style="grid-column:1/-1"><label class="field-label">Comentarios Adicionales</label><textarea id="vf-comentadd" class="field-input" rows="2">${Utils.esc(rec.Comentarios_Adicionales||'')}</textarea></div>
      </div>
    </div>`;
  if (supuesto === 'POSITIVA') return posHTML;
  if (supuesto === 'NEGATIVA') return posHTML + negHTML;
  return posHTML + negHTML; // NEGATIVA_BAJA también incluye ambos
};

window._c03Contacto = (rec) => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">7. Descripción Inmueble / Diligencia y Contacto</div>
    <div class="form-grid form-grid-2">
      <div class="field" style="grid-column:1/-1"><label class="field-label">Descripción Inmueble/Diligencia</label><textarea id="vf-desc" class="field-input" rows="2">${Utils.esc(rec.Descripcion_Inmueble_Diligencia||'')}</textarea></div>
      <div class="field"><label class="field-label">Persona en Domicilio o Persona</label><input id="vf-persona" class="field-input" value="${Utils.esc(rec.Descricion_Persona_Atiende||'')}"></div>
      <div class="field"><label class="field-label">Refiere Persona</label><input id="vf-refpersona" class="field-input" value="${Utils.esc(rec.Refiere_Persona||'')}"></div>
      <div class="field"><label class="field-label">Nombre Persona Atiende</label><input id="vf-nombpers" class="field-input" value="${Utils.esc(rec.Nombre_Persona_Atiende||'')}"></div>
      <div class="field"><label class="field-label">Relación con Patrón</label><input id="vf-relcon" class="field-input" value="${Utils.esc(rec.Relacion_Con_Patron||'')}"></div>
      <div class="field"><label class="field-label">Identificación Presenta</label><input id="vf-identpres" class="field-input" value="${Utils.esc(rec.Identificacion_Presenta||'')}"></div>
      <div class="field"><label class="field-label">ID Verificación</label><input id="vf-idverif" class="field-input" value="${Utils.esc(rec.ID_Verificacion||'')}"></div>
      <div class="field"><label class="field-label">Vigencia Identificación</label><input type="date" id="vf-vigident" class="field-input" value="${rec.Vigencia_Identificacion||''}"></div>
      <div class="field"><label class="field-label">Teléfono 1</label><input id="vf-tel1" class="field-input" value="${Utils.esc(rec.Telefono_1||'')}"></div>
      <div class="field"><label class="field-label">Teléfono 2</label><input id="vf-tel2" class="field-input" value="${Utils.esc(rec.Telefono_2||'')}"></div>
      <div class="field"><label class="field-label">Correo Electrónico</label><input type="email" id="vf-correo" class="field-input" value="${Utils.esc(rec.Correo_Electronico||'')}"></div>
      <div class="field"><label class="field-label">Horario Atención</label><input id="vf-horario" class="field-input" value="${Utils.esc(rec.Horario_Atencion||'')}"></div>
    </div>
  </div>`;

window._c03DAD = (rec) => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">Información DAD con Domicilio de Parte al Origen</div>
    <div class="form-grid form-grid-2">
      <div class="field" style="grid-column:1/-1"><label class="field-label">DAD Domicilio</label><input id="vf-daddom" class="field-input" value="${Utils.esc(rec.DAD_Domicilio||'')}"></div>
      <div class="field"><label class="field-label">DAD Folio</label><input id="vf-dadfolio" class="field-input" value="${Utils.esc(rec.DAD_Folio||'')}"></div>
      <div class="field"><label class="field-label">DAD Calle</label><input id="vf-dadcalle" class="field-input" value="${Utils.esc(rec.DAD_Calle||'')}"></div>
      <div class="field"><label class="field-label">DAD Calles</label><input id="vf-dadcalles" class="field-input" value="${Utils.esc(rec.DAD_Calles||'')}"></div>
      <div class="field"><label class="field-label">DAD Núm. Exterior</label><input id="vf-dadnumext" class="field-input" value="${Utils.esc(rec.DAD_Num_Ext||'')}"></div>
      <div class="field"><label class="field-label">DAD Núm. Interior</label><input id="vf-dadnumint" class="field-input" value="${Utils.esc(rec.DAD_Num_Int||'')}"></div>
      <div class="field"><label class="field-label">DAD Fecha Visita</label><input type="date" id="vf-dadfecha" class="field-input" value="${rec.DAD_Visita_Fecha||''}"></div>
      <div class="field"><label class="field-label">DAD Hora Inicio</label><input type="time" id="vf-dadhini" class="field-input" value="${rec.DAD_Visita_Hora_Inc||''}"></div>
      <div class="field"><label class="field-label">DAD Hora Fin</label><input type="time" id="vf-dadhfin" class="field-input" value="${rec.DAD_Visita_Hora_Fin||''}"></div>
      <div class="field" style="grid-column:1/-1"><label class="field-label">DAD Descripción Inmueble Situación</label><textarea id="vf-daddesc" class="field-input" rows="2">${Utils.esc(rec.DAD_Descripcion_Inmueble_Situacion||'')}</textarea></div>
      <div class="field"><label class="field-label">DAD Persona en Domicilio</label><input id="vf-dadpers" class="field-input" value="${Utils.esc(rec.DAD_Persona_En_Domicilio||'')}"></div>
      <div class="field"><label class="field-label">DAD Refiere Persona</label><input id="vf-dadref" class="field-input" value="${Utils.esc(rec.DAD_Refiere_Persona||'')}"></div>
    </div>
    <div style="font-size:13px;font-weight:600;margin:16px 0 8px;color:var(--text-muted);">VECINOS DE VISITA DAD</div>
    <div class="form-grid form-grid-3">
      ${[1,2,3].map(n=>`
      <div style="padding:10px;background:var(--surface);border:1px solid var(--border);border-radius:8px;">
        <div style="font-weight:700;font-size:11px;color:var(--text-muted);margin-bottom:6px;">VECINO DAD ${n}</div>
        <div class="field"><label class="field-label">Nombre</label><input id="vf-dadv${n}nom" class="field-input" value="${Utils.esc(rec['DAD_Nombre_Vecino_'+n]||'')}"></div>
        <div class="field"><label class="field-label">Domicilio</label><input id="vf-dadv${n}dom" class="field-input" value="${Utils.esc(rec['DAD_Domicilio_Vecino_'+n]||'')}"></div>
        <div class="field"><label class="field-label">Refiere</label><input id="vf-dadv${n}ref" class="field-input" value="${Utils.esc(rec['DAD_Refiere_Vecino_'+n]||'')}"></div>
      </div>`).join('')}
    </div>
  </div>`;

window._c03SINDO = (rec) => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">Datos Arrojados por SINDO e Información IMSS</div>
    <div class="form-grid form-grid-3">
      <div class="field"><label class="field-label">SINDO Región 1</label><input id="vf-sindo1" class="field-input" value="${Utils.esc(rec.Sindo_Region_1||'')}"></div>
      <div class="field"><label class="field-label">SINDO Región 2</label><input id="vf-sindo2" class="field-input" value="${Utils.esc(rec.Sindo_Region_2||'')}"></div>
      <div class="field"><label class="field-label">SINDO Región 3</label><input id="vf-sindo3" class="field-input" value="${Utils.esc(rec.Sindo_Region_3||'')}"></div>
      <div class="field"><label class="field-label">COP</label><input type="number" id="vf-cop" class="field-input" value="${rec.COP||''}"></div>
      <div class="field"><label class="field-label">RCV</label><input type="number" id="vf-rcv" class="field-input" value="${rec.RCV||''}"></div>
      <div class="field"><label class="field-label">Actas Baja</label><input id="vf-actasbaja" class="field-input" value="${Utils.esc(rec.Actas_Baja||'')}"></div>
    </div>
  </div>`;

window._c03LocFinal = (rec) => `
  <div class="card" style="padding:24px;margin-bottom:20px;border-left:4px solid var(--primary);">
    <div style="font-size:16px;font-weight:700;margin-bottom:12px;border-bottom:1px solid var(--border);padding-bottom:6px;">Información de Localizador</div>
    <div class="form-grid form-grid-3">
      <div class="field"><label class="field-label">Rúbrica Localizador</label><input id="vf-loc" class="field-input" value="${Utils.esc(rec.Rubrica_Localizador||App.session?.iniciales||'')}"></div>
      <div class="field"><label class="field-label">Nombre Notificador</label><input id="vf-notif" class="field-input" value="${Utils.esc(rec.Nombre_Notificador||'')}"></div>
      <div class="field"><label class="field-label">ID Constancia</label><input id="vf-idcons" class="field-input" value="${Utils.esc(rec.ID_Constancia||'')}"></div>
    </div>
  </div>`;

// Ensambla el formulario completo según supuesto
window._c03BuildSections = (rec, supuesto) => {
  let html = window._c03Patron(rec) + window._c03Domicilio(rec) +
    window._c03DatosC03(rec, supuesto) + window._c03DatosC02(rec) +
    window._c03Supuestos(rec, supuesto);
  if (supuesto === 'POSITIVA') {
    html += window._c03Contacto(rec);
  } else {
    html += window._vfVecinos(rec, '');
  }
  if (supuesto === 'NEGATIVA_BAJA') {
    html += window._vfTrabajadores(rec) + window._c03DAD(rec) + window._c03SINDO(rec);
  }
  html += window._c03LocFinal(rec);
  return html;
};

// Cuando el usuario cambia el supuesto en el formulario c03
window._c03ChangeSup = (supuesto) => {
  const body = document.getElementById('c03-sections');
  if (!body) return;
  const rec = {}; // vacío para nuevo; al editar el rec ya está cargado
  body.innerHTML = window._c03BuildSections(rec, supuesto);
};

