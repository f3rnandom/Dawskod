/**
 * analisis.js — Análisis Excel: Merger COP/RCV + Análisis RALE
 */
Modules.analisis = {
  _tab: 'merger', _mergeFiles: [], _raleRows: [], _mergeResult: [],

  render() { /* nada que re-renderizar */ },

  switchTab(tab) {
    this._tab = tab;
    document.querySelectorAll('.ana-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.getElementById('ana-merger-section').style.display = tab === 'merger' ? '' : 'none';
    document.getElementById('ana-rale-section').style.display   = tab === 'rale'   ? '' : 'none';
  },

  log(msg, type = '', section = 'merger') {
    const id = section === 'rale' ? 'rale-log' : 'merger-log';
    const box = document.getElementById(id); if (!box) return;
    const cls = type === 'err' ? 'log-err' : type === 'ok' ? 'log-ok' : '';
    box.innerHTML += `<div class="${cls}">${Utils.esc(msg)}</div>`;
    box.scrollTop = box.scrollHeight;
  },

  // ── MERGER COP / RCV ───────────────────────────────────────
  onMergerFiles(input) {
    const files = Array.from(input.files);
    this._mergeFiles = []; this._mergeResult = [];
    const list = document.getElementById('merger-file-list');
    list.innerHTML = '';
    const box = document.getElementById('merger-log'); if (box) box.innerHTML = '';
    const copFiles = files.filter(f => /^COP_/i.test(f.name));
    const rcvFiles = files.filter(f => /^RCV_/i.test(f.name));
    const ignored  = files.filter(f => !/^(COP|RCV)_/i.test(f.name));
    if (ignored.length) this.log(`⚠ Ignorados (no COP_/RCV_): ${ignored.map(f=>f.name).join(', ')}`);
    this.log(`✅ COP: ${copFiles.length} archivos | RCV: ${rcvFiles.length} archivos`);
    [...copFiles, ...rcvFiles].forEach(f => {
      this._mergeFiles.push(f);
      const badge = /^COP_/i.test(f.name) ? '<span class="badge badge-blue">COP</span>' : '<span class="badge badge-purple">RCV</span>';
      list.innerHTML += `<div class="flex gap-2" style="padding:4px 0;border-bottom:1px solid var(--border)">${badge} <span style="font-size:12px">${Utils.esc(f.name)}</span></div>`;
    });
    document.getElementById('btn-merge-run').disabled = !this._mergeFiles.length;
  },

  async runMerge() {
    if (!this._mergeFiles.length) return;
    this.log('🔄 Iniciando unión de archivos...');
    const btn = document.getElementById('btn-merge-run');
    btn.disabled = true;
    const allRows = [];
    for (const file of this._mergeFiles) {
      try {
        const buf = await file.arrayBuffer();
        const wb  = XLSX.read(buf, { type: 'array' });
        const ws  = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
        const tipo = /^COP_/i.test(file.name) ? 'COP' : 'RCV';
        rows.forEach(r => { r.TIPO = tipo; allRows.push(r); });
        this.log(`  → ${rows.length} registros de ${file.name}`);
      } catch(e) { this.log(`❌ Error leyendo ${file.name}: ${e.message}`, 'err'); }
    }
    this._mergeResult = allRows;
    this.log(`✅ Unión completada: ${allRows.length} registros totales`, 'ok');
    this.renderMergePreview(allRows.slice(0, 100));
    document.getElementById('btn-merge-export').disabled = !allRows.length;
    btn.disabled = false;
  },

  renderMergePreview(rows) {
    const container = document.getElementById('merger-preview');
    if (!container || !rows.length) return;
    const headers = Object.keys(rows[0]);
    container.innerHTML = `
      <div class="table-wrap" style="max-height:320px;overflow:auto;margin-top:12px">
        <table>
          <thead><tr>${headers.map(h=>`<th>${Utils.esc(h)}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(r=>`<tr>${headers.map(h=>`<td>${Utils.esc(String(r[h]||''))}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
      <p style="font-size:11px;color:var(--text-muted);margin-top:6px">Mostrando primeros 100 de ${this._mergeResult.length} registros</p>`;
  },

  async exportMerge() {
    if (!this._mergeResult.length) return;

    // Extrae fecha del nombre de los archivos cargados (ej: COP_14-04-2026.xlsx)
    let fechaArchivo = '';
    for (const f of this._mergeFiles) {
      const m = f.name.match(/(\d{2}-\d{2}-\d{4})/);
      if (m) { fechaArchivo = m[1]; break; }
    }
    if (!fechaArchivo) {
      const hoy = new Date();
      const dd = String(hoy.getDate()).padStart(2,'0');
      const mm = String(hoy.getMonth()+1).padStart(2,'0');
      const yyyy = hoy.getFullYear();
      fechaArchivo = `${dd}-${mm}-${yyyy}`;
    }

    const fileName = `Rale_${fechaArchivo}.xlsx`;
    const ws = XLSX.utils.json_to_sheet(this._mergeResult);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CONSOLIDADO');

    // Convertir a buffer para enviar al servidor
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob  = new Blob([wbout], { type: 'application/octet-stream' });

    // Guardar en servidor /Rale/
    let savedOnServer = false;
    try {
      const resp = await fetch('http://localhost:8080/api/rale/save', {
        method: 'POST',
        headers: { 'X-Filename': fileName, 'Content-Type': 'application/octet-stream' },
        body: blob,
      });
      const json = await resp.json();
      if (json.ok) {
        savedOnServer = true;
        Utils.toast(`✅ ${fileName} guardado en /Rale/`, 'success');
        this._addToRaleList(fileName);
        this.refreshRaleList(); // refresca el selector de la sección RALE
      } else {
        throw new Error(json.error);
      }
    } catch(e) {
      console.warn('[exportMerge] Server save failed, fallback download:', e.message);
      try {
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        if (window.showSaveFilePicker) {
          const handle = await window.showSaveFilePicker({
            suggestedName: fileName,
            types: [{
              description: 'Excel Document',
              accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
            }],
          });
          const writable = await handle.createWritable();
          await writable.write(wbout);
          await writable.close();
          Utils.toast(`⚠ Servidor no disponible. Guardado en PC: ${fileName}`, 'warning');
          this._addToRaleList(fileName);
          return;
        }
        
        const fileObj = new File([wbout], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(fileObj);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        Utils.toast(`⚠ Servidor no disponible. Descarga local: ${fileName}`, 'warning');
        this._addToRaleList(fileName);
      } catch(err) {
        if (err.name !== 'AbortError') console.error("Save failed:", err);
      }
    }
  },

  // Añade un item al panel "Rales Generados"
  _addToRaleList(fileName) {
    const list = document.getElementById('rale-generated-list');
    if (!list) return;
    if (list.querySelector('[data-placeholder]')) list.innerHTML = '';
    const now = new Date().toLocaleTimeString('es-MX', { hour:'2-digit', minute:'2-digit' });
    const item = document.createElement('div');
    item.style.cssText = 'display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);cursor:pointer';
    item.title = 'Clic para cargar en Análisis RALE';
    item.innerHTML = `<span style="color:var(--success);font-size:16px">📄</span>
      <span style="flex:1;font-weight:600">${Utils.esc(fileName)}</span>
      <span style="color:var(--text-muted);font-size:11px">${now}</span>
      <button onclick="Modules.analisis.loadRaleFromServer('${Utils.esc(fileName)}')" style="font-size:11px;padding:2px 8px;background:var(--primary);color:#fff;border:none;border-radius:4px;cursor:pointer">Usar</button>`;
    list.prepend(item);
  },

  // Refresca el select de archivos Rale del servidor en la sección Análisis RALE
  async refreshRaleList() {
    const sel = document.getElementById('rale-server-select');
    if (!sel) return;
    try {
      const resp = await fetch('http://localhost:8080/api/rale/list');
      const json = await resp.json();
      if (!json.ok) return;
      sel.innerHTML = `<option value="">-- Seleccionar Rale del servidor --</option>` +
        json.files.map(f => `<option value="${Utils.esc(f.name)}">${Utils.esc(f.name)}</option>`).join('');
      const wrap = document.getElementById('rale-server-wrap');
      if (wrap) wrap.style.display = json.files.length ? '' : 'none';
    } catch(e) { /* servidor no disponible */ }
  },

  // Carga un archivo Rale desde el servidor en la sección Análisis RALE
  async loadRaleFromServer(filename) {
    if (!filename) {
      filename = document.getElementById('rale-server-select')?.value;
      if (!filename) return;
    }
    try {
      this.log(`📥 Cargando ${filename} desde servidor...`, '', 'rale');
      const resp = await fetch(`http://localhost:8080/Rale/${encodeURIComponent(filename)}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const buf = await resp.arrayBuffer();
      const wb  = XLSX.read(buf, { type: 'array' });
      const ws  = wb.Sheets[wb.SheetNames[0]];
      this._raleRows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      document.getElementById('rale-file-name').textContent = filename;
      this.log(`✅ ${this._raleRows.length} filas cargadas desde /Rale/${filename}`, 'ok', 'rale');
      document.getElementById('btn-rale-run').disabled = false;
      // Cambiar a la pestaña RALE automáticamente
      this.switchTab('rale');
    } catch(e) {
      this.log(`❌ Error al cargar ${filename}: ${e.message}`, 'err', 'rale');
      Utils.toast(`Error cargando ${filename}`, 'error');
    }
  },

  // ── ANÁLISIS RALE ──────────────────────────────────────────
  onRaleFile(input) {
    const file = input.files[0]; if (!file) return;
    document.getElementById('rale-file-name').textContent = file.name;
    this.log(`📂 RALE cargado: ${file.name}`, '', 'rale');
    const reader = new FileReader();
    reader.onload = e => {
      const wb = XLSX.read(e.target.result, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      this._raleRows = XLSX.utils.sheet_to_json(ws, { defval: '' });
      this.log(`✅ ${this._raleRows.length} filas cargadas`, 'ok', 'rale');
      document.getElementById('btn-rale-run').disabled = false;
    };
    reader.readAsArrayBuffer(file);
  },

  runRale() {
    if (!this._raleRows.length) return;
    const box = document.getElementById('rale-log'); if (box) box.innerHTML = '';
    const fecha = document.getElementById('rale-fecha')?.value || Utils.today();
    const rpText = document.getElementById('rale-rp-list')?.value || '';
    const rpSet  = new Set(rpText.split('\n').map(r => Utils.normalizarRP(r)).filter(Boolean));
    const usarCNBV = document.getElementById('rale-usar-cnbv')?.checked !== false;
    this.log('🔄 Analizando RALE...', '', 'rale');

    // Detectar columnas
    const sample = this._raleRows[0];
    const colRP    = this._detectCol(sample, ['REG_PAT', 'Registro Patronal', 'REGISTRO', 'RP']);
    const colTipo  = this._detectCol(sample, ['COP-RCV1', 'COP-RCV']); // Estricto para COP-RCV
    const colImp   = this._detectCol(sample, ['IMPORTE', 'importe', 'MONTO']);
    const colInc   = this._detectCol(sample, ['INC', 'id_inci', 'TIPO_DOC', 'id_docu']); // Incidencia o Tipo Doc
    const colFecha = this._detectCol(sample, ['MOV_FEC', 'fecha movi Patronal', 'fecha movi', 'FECHA']);
    const colCveMov= this._detectCol(sample, ['Cve_mov', 'MOV_TIPO', 'cve_mov']);

    const filename = (document.getElementById('rale-file-name').textContent || '').toUpperCase();
    let fileTypeFallback = '';
    if (filename.includes('COP')) fileTypeFallback = 'COP';
    if (filename.includes('RCV')) fileTypeFallback = 'RCV';

    let sinRPCount = 0;
    let missingTipoCol = !colTipo; // Si _detectCol devolvió la primera opción por default pero no existe
    if (sample && !Object.keys(sample).some(k => ['COP-RCV1', 'COP-RCV'].includes(k.toUpperCase()) || k.toUpperCase().includes('COP-RCV'))) {
       this.log('⚠ Advertencia: No se encontró la columna COP-RCV en el archivo.', 'warn', 'rale');
       missingTipoCol = true;
    }

    const resultados = {};
    let processed = 0;
    this._raleRows.forEach(row => {
      const rawRP = String(row[colRP] || '').trim();
      const rp = Utils.normalizarRP(rawRP);
      if (!rp) { sinRPCount++; return; } // Ignorar fila y sumar al conteo de inválidos
      if (rpSet.size && !rpSet.has(rp)) return; // Filtro de RPs
      
      let tipo = String(row[colTipo] || '').toUpperCase().trim();
      if (tipo !== 'COP' && tipo !== 'RCV') {
        tipo = fileTypeFallback; // Fallback al nombre del archivo
      }

      const imp  = parseFloat(row[colImp]  || 0) || 0;
      const cve  = String(row[colCveMov] || '').trim();
      const inc  = String(row[colInc] || '').trim();
      const fec  = String(row[colFecha] || '').trim();

      if (!resultados[rp]) {
        resultados[rp] = { 
          rp, cop:0, rcv:0, total:0, imp_cop:0, imp_rcv:0, imp_total:0, 
          fecha: fec, cves: new Set(), incs: new Set() 
        };
      }
      const r = resultados[rp];
      if (tipo === 'COP') { r.cop++; r.imp_cop += imp; }
      else if (tipo === 'RCV') { r.rcv++; r.imp_rcv += imp; }
      
      r.total++; 
      r.imp_total += imp; 
      if (cve) r.cves.add(cve);
      if (inc) r.incs.add(inc);
      if (!r.fecha && fec) r.fecha = fec; // Tomar la primera fecha que encontremos si estaba vacía

      processed++;
    });

    if (sinRPCount > 0) {
      this.log(`⚠ Se omitieron ${sinRPCount} filas por tener un Registro Patronal vacío o inválido.`, 'warn', 'rale');
    }

    this.log(`✅ Procesadas ${processed} filas → ${Object.keys(resultados).length} patrones consolidados`, 'ok', 'rale');

    const anio = new Date(fecha.replace(/(\d{2})\/(\d{2})\/(\d{4})/,'$3-$2-$1')).getFullYear() || new Date().getFullYear();
    const output = Object.values(resultados).map(r => ({
      'Registro_Patronal': r.rp,
      'Creditos_Totales': r.total,
      'Total_COP': r.cop,
      'Importe_COP': r.imp_cop.toFixed(2),
      'Total_RCV': r.rcv,
      'Importe_RCV': r.imp_rcv.toFixed(2),
      'Total_COPRCV': r.imp_total.toFixed(2),
      'Tipo_Movimiento': Array.from(r.cves).join(', '),
      'Id_Inc': Array.from(r.incs).join(', '),
      'Fecha_Baja': r.fecha,
      'Importe_Letra': Utils.importeALetras(r.imp_total),
      'Rango': Utils.determinarRango(anio, r.imp_total)
    }));

    this._renderRaleResult(output);
    this._raleOutput = output;
    document.getElementById('btn-rale-export').disabled = false;
  },

  _detectCol(obj, hints) {
    const keys = Object.keys(obj || {});
    for (const h of hints) {
      const f = keys.find(k => k.toUpperCase().includes(h.toUpperCase()));
      if (f) return f;
    }
    return hints[0];
  },

  _renderRaleResult(rows) {
    const container = document.getElementById('rale-preview');
    if (!container || !rows.length) return;
    const hdrs = Object.keys(rows[0]);
    container.innerHTML = `
      <div class="table-wrap" style="max-height:320px;overflow:auto;margin-top:12px">
        <table>
          <thead><tr>${hdrs.map(h=>`<th>${Utils.esc(h)}</th>`).join('')}</tr></thead>
          <tbody>${rows.slice(0,100).map(r=>`<tr>${hdrs.map(h=>`<td>${Utils.esc(String(r[h]||''))}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
      <p style="font-size:11px;color:var(--text-muted);margin-top:6px">${rows.length} registros analizados</p>`;
  },

  async exportRale() {
    if (!this._raleOutput?.length) return;
    const ws = XLSX.utils.json_to_sheet(this._raleOutput);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ANALISIS_RALE');
    
    const fileName = `Analisis_RALE_${Utils.today().replace(/-/g,'')}.xlsx`;
    
    try {
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Guardar en el servidor para obtener una URL real (evita el bug del UUID en WebViews)
      const resp = await fetch('http://localhost:8080/api/rale/save', {
        method: 'POST',
        headers: { 'X-Filename': fileName, 'Content-Type': 'application/octet-stream' },
        body: blob,
      });
      
      if (resp.ok) {
        const json = await resp.json();
        if (json.ok) {
          // Redirección directa para que el navegador use la cabecera Content-Disposition
          // Esto es a prueba de balas contra bugs de UUID en Edge/Chromium
          window.location.href = `http://localhost:8080${json.path}`;
          
          Utils.toast('Análisis RALE exportado', 'success');
          // También refrescamos la lista por si quieren usarlo
          this._addToRaleList(fileName);
          this.refreshRaleList();
          return;
        }
      }
    } catch (e) {
      console.warn("Server export failed, falling back to local save", e);
    }
    
    // Fallback: usar File System Access API para evitar el bug del WebView2 con los nombres UUID
    try {
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: fileName,
          types: [{
            description: 'Excel Document',
            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
          }],
        });
        const writable = await handle.createWritable();
        await writable.write(wbout);
        await writable.close();
        Utils.toast('Análisis RALE guardado en tu PC', 'success');
        return;
      }
      
      // Fallback final si showSaveFilePicker no está disponible
      const fileObj = new File([wbout], fileName, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(fileObj);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      Utils.toast('Análisis RALE exportado (Local)', 'success');
    } catch(err) {
      if (err.name !== 'AbortError') console.error("Save failed:", err);
    }
  },
};
