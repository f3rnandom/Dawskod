/**
 * vales.js — Generador de Vales de Préstamo IMSS
 * Lee Excel (SheetJS), muestra registros, genera vale imprimible por registro patronal.
 */
Modules.vales = {
  _dfRegistros: [], _dfRale: [], _selected: new Set(),

  render() {
    document.getElementById('vales-file-name').textContent = 'Ningún archivo seleccionado';
    this._dfRegistros = []; this._dfRale = []; this._selected.clear();
    this.renderRegistros();
  },

  onFileChange(input) {
    const file = input.files[0];
    if (!file) return;
    document.getElementById('vales-file-name').textContent = file.name;
    this.log(`📂 Cargando: ${file.name}...`);
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const wb = XLSX.read(e.target.result, { type: 'array' });
        // Hoja Registros
        const shReg = wb.SheetNames.find(n => /registr/i.test(n)) || wb.SheetNames[0];
        this._dfRegistros = XLSX.utils.sheet_to_json(wb.Sheets[shReg]);
        // Hoja RALE
        const shRale = wb.SheetNames.find(n => /rale/i.test(n)) || wb.SheetNames[1];
        this._dfRale = shRale ? XLSX.utils.sheet_to_json(wb.Sheets[shRale]) : [];
        this.log(`✅ Registros: ${this._dfRegistros.length} | RALE: ${this._dfRale.length} créditos`);
        this.renderRegistros();
      } catch (err) {
        this.log(`❌ Error al leer Excel: ${err.message}`, 'err');
      }
    };
    reader.readAsArrayBuffer(file);
  },

  log(msg, type = '') {
    const box = document.getElementById('vales-log');
    if (!box) return;
    const cls = type === 'err' ? 'log-err' : type === 'ok' ? 'log-ok' : '';
    box.innerHTML += `<div class="${cls}">${Utils.esc(msg)}</div>`;
    box.scrollTop = box.scrollHeight;
  },

  _detectCol(obj, hints) {
    const keys = Object.keys(obj);
    for (const h of hints) {
      const found = keys.find(k => k.toLowerCase().includes(h.toLowerCase()));
      if (found) return found;
    }
    return null;
  },

  renderRegistros() {
    const tbody = document.getElementById('vales-reg-tbody');
    if (!tbody) return;
    if (!this._dfRegistros.length) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:var(--text-muted);padding:30px">Carga un archivo Excel RALE para comenzar</td></tr>';
      return;
    }
    const sample = this._dfRegistros[0];
    const rpCol = this._detectCol(sample, ['Registro','RP','registro_patronal']);
    const rsCol = this._detectCol(sample, ['Razon','razon','Razón','Social']);
    tbody.innerHTML = this._dfRegistros.map((r, i) => {
      const rp = r[rpCol] || r[Object.keys(r)[0]] || '';
      const rs = r[rsCol] || r[Object.keys(r)[1]] || '';
      const creditos = this._getCreditos(String(rp));
      return `<tr>
        <td><input type="checkbox" id="chk-${i}" ${this._selected.has(i)?'checked':''} onchange="Modules.vales.toggleSelect(${i})"></td>
        <td><label for="chk-${i}">${Utils.esc(String(rp))}</label></td>
        <td>${Utils.esc(String(rs))}</td>
        <td>${creditos.length} crédito${creditos.length!==1?'s':''}</td>
        <td><button class="btn btn-sm btn-primary" onclick="Modules.vales.generateVale(${i})">📄 Generar Vale</button></td>
      </tr>`;
    }).join('');
  },

  toggleSelect(i) {
    if (this._selected.has(i)) this._selected.delete(i); else this._selected.add(i);
  },

  selectAll() { this._dfRegistros.forEach((_, i) => this._selected.add(i)); this.renderRegistros(); },
  clearSel()  { this._selected.clear(); this.renderRegistros(); },

  _getCreditos(rp) {
    if (!this._dfRale.length) return [];
    const sample = this._dfRale[0];
    const rpCol = this._detectCol(sample, ['Registro','RP']);
    return this._dfRale.filter(row => String(row[rpCol] || '') === rp);
  },

  generateVale(idx) {
    const sample = this._dfRegistros[0];
    const rpCol = this._detectCol(sample, ['Registro','RP']);
    const rsCol = this._detectCol(sample, ['Razon','razon','Social']);
    const rec = this._dfRegistros[idx];
    if (!rec) return;
    const rp = String(rec[rpCol] || '');
    const rs = String(rec[rsCol] || '');
    const creditos = this._getCreditos(rp);
    if (!creditos.length) { Utils.toast(`Sin créditos RALE para ${rp}`, 'error'); return; }
    this._printVale(rp, rs, creditos);
  },

  generateSelected() {
    if (!this._selected.size) { Utils.toast('Selecciona al menos un registro', 'error'); return; }
    this._selected.forEach(i => this.generateVale(i));
  },

  _printVale(rp, rs, creditos) {
    const dp = Utils.datePartsEs();
    const sample = creditos[0];
    const numCol = this._detectCol(sample, ['Num_Credito','num_credito','Credito','credito']);
    const perCol = this._detectCol(sample, ['Periodo','periodo']);
    const docCol = this._detectCol(sample, ['Doc','doc','TD']);
    const concCol= this._detectCol(sample, ['Concepto','concepto']);
    const incCol = this._detectCol(sample, ['INC','Inc','Incidencia']);
    const impCol = this._detectCol(sample, ['Importe','importe','Monto']);

    const rows = creditos.map((c, i) => {
      const imp = parseFloat(c[impCol] || 0);
      return `<tr>
        <td style="text-align:center">${i+1}</td>
        <td style="text-align:center">${c[numCol]||''}</td>
        <td style="text-align:center">${Utils.formatPeriodo(c[perCol]||'')}</td>
        <td style="text-align:center">${c[docCol]||''}</td>
        <td>${c[concCol]||''}</td>
        <td style="text-align:center">${c[incCol]||''}</td>
        <td style="text-align:right">${Utils.formatCurrencyShort(imp)}</td>
      </tr>`;
    }).join('');

    const totalImp = creditos.reduce((s,c) => s + (parseFloat(c[impCol]||0)), 0);

    const html = `<html><head><title>Vale — ${Utils.esc(rp)}</title>
    <style>
      body{font-family:Arial,sans-serif;font-size:11px;margin:25px;color:#000}
      h3{text-align:center;font-size:13px;margin-bottom:2px}
      .sub{text-align:center;font-size:10px;color:#444;margin-bottom:16px}
      table{width:100%;border-collapse:collapse;margin-bottom:12px}
      th{background:#d0d9ef;padding:5px 8px;border:1px solid #888;font-size:10px}
      td{padding:4px 8px;border:1px solid #ccc}
      .info{margin-bottom:14px}
      .info-row{display:flex;gap:20px;margin-bottom:6px}
      .lbl{font-weight:bold;font-size:10px;color:#555;text-transform:uppercase;margin-right:4px}
      .total-row{font-weight:bold;background:#eef2ff}
      .sign{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-top:50px}
      .sign-line{border-top:1px solid #000;text-align:center;padding-top:4px;font-size:10px}
      @media print{body{margin:15px}}
    </style></head><body>
    <h3>INSTITUTO MEXICANO DEL SEGURO SOCIAL</h3>
    <div class="sub">Vale de Préstamo de Créditos — ${dp.dia} de ${dp.mes} de ${dp.anio}</div>
    <div class="info">
      <div class="info-row"><span><span class="lbl">Registro Patronal:</span>${Utils.esc(rp)}</span><span><span class="lbl">Razón Social:</span>${Utils.esc(rs)}</span></div>
    </div>
    <table><thead><tr><th>#</th><th>Num. Crédito</th><th>Período</th><th>T.D.</th><th>Concepto</th><th>INC</th><th>Importe</th></tr></thead>
    <tbody>${rows}
    <tr class="total-row"><td colspan="6" style="text-align:right"><b>TOTAL:</b></td><td style="text-align:right"><b>${Utils.formatCurrencyShort(totalImp)}</b></td></tr>
    </tbody></table>
    <p style="font-size:10px"><b>Importe con letra:</b> ${Utils.importeALetras(totalImp)}</p>
    <div class="sign">
      <div class="sign-line">Firma del Solicitante</div>
      <div class="sign-line">V°B° Jefe de Oficina</div>
    </div>
    <script>window.print();window.onafterprint=()=>window.close();<\/script></body></html>`;
    const w = window.open('','_blank','width=820,height=700');
    if (w) { w.document.write(html); w.document.close(); }
    this.log(`✅ Vale generado: ${rp}`, 'ok');
  },
};
