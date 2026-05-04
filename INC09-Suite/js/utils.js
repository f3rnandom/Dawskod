/**
 * utils.js — Utilidades compartidas INC09 Suite
 * Fechas, moneda, validaciones, importe en letras, normalización RP.
 */

const Utils = (() => {

  // ── Fechas ──────────────────────────────────────────────────
  const MESES_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const MESES_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];

  function today() { return new Date().toISOString().slice(0,10); }
  function nowTs()  { return new Date().toISOString(); }

  function formatDate(iso) {
    if (!iso) return '—';
    const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
    return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
  }
  function formatDateLong(iso) {
    if (!iso) return '—';
    const d = new Date(iso.includes('T') ? iso : iso + 'T00:00:00');
    return `${d.getDate()} de ${MESES_ES[d.getMonth()]} de ${d.getFullYear()}`;
  }
  function datePartsEs() {
    const n = new Date();
    return { dia: String(n.getDate()).padStart(2,'0'), mes: MESES_SHORT[n.getMonth()], anio: String(n.getFullYear()) };
  }

  // ── Moneda ──────────────────────────────────────────────────
  function formatCurrency(val) {
    const n = parseFloat(val) || 0;
    return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  }
  function formatCurrencyShort(val) {
    const n = parseFloat(val) || 0;
    return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  // ── Importe en Letras ───────────────────────────────────────
  const UNIDADES = ['','Un','Dos','Tres','Cuatro','Cinco','Seis','Siete','Ocho','Nueve','Diez','Once','Doce','Trece','Catorce','Quince','Dieciséis','Diecisiete','Dieciocho','Diecinueve','Veinte','Veintiuno','Veintidós','Veintitrés','Veinticuatro','Veinticinco','Veintiséis','Veintisiete','Veintiocho','Veintinueve'];
  const DECENAS   = ['','Diez','Veinte','Treinta','Cuarenta','Cincuenta','Sesenta','Setenta','Ochenta','Noventa'];
  const CENTENAS  = ['','Ciento','Doscientos','Trescientos','Cuatrocientos','Quinientos','Seiscientos','Setecientos','Ochocientos','Novecientos'];

  function _numRec(n) {
    if (n === 0) return 'Cero';
    if (n <= 29) return UNIDADES[n];
    if (n <= 99) { const d = DECENAS[Math.floor(n/10)]; return n%10 ? `${d} y ${_numRec(n%10)}` : d; }
    if (n === 100) return 'Cien';
    if (n <= 999) { const c = CENTENAS[Math.floor(n/100)]; return n%100 ? `${c} ${_numRec(n%100)}` : c; }
    if (n <= 1999) { const r = 'Mil'; return n%1000 ? `${r} ${_numRec(n%1000)}` : r; }
    if (n <= 999999) { const r = `${_numRec(Math.floor(n/1000))} Mil`; return n%1000 ? `${r} ${_numRec(n%1000)}` : r; }
    if (n <= 1999999) { const r = 'Un Millón'; return n%1000000 ? `${r} ${_numRec(n%1000000)}` : r; }
    const r = `${_numRec(Math.floor(n/1000000))} Millones`; return n%1000000 ? `${r} ${_numRec(n%1000000)}` : r;
  }

  function importeALetras(num) {
    if (isNaN(num) || num < 0 || num > 1999999999.99) return 'FUERA DE RANGO';
    const entero = Math.floor(num);
    const centavos = Math.round((num - entero) * 100);
    const letra = _numRec(entero);
    return `${letra} Pesos ${String(centavos).padStart(2,'0')}/100, Moneda Nacional`;
  }

  // ── Rango IMSS ──────────────────────────────────────────────
  const BASE_DIARIA = { 1992:14.27, 1993:15.27, 1994:15.98, 1995:20.15, 1996:26.45, 1997:30.20, 1998:34.45, 1999:37.90, 2000:40.35, 2001:42.15, 2002:43.65, 2003:44.05, 2004:45.24, 2005:46.80, 2006:48.67, 2007:50.57, 2008:52.59, 2009:54.80, 2010:57.46, 2011:59.82, 2012:62.33, 2013:64.76, 2014:67.29, 2015:70.10, 2016:73.04, 2017:80.04, 2018:88.36, 2019:102.68, 2020:123.22, 2021:141.70, 2022:172.87, 2023:207.44, 2024:248.93, 2025:278.80, 2026:315.04 };

  function determinarRango(anio, importe) {
    const bd = BASE_DIARIA[anio] || BASE_DIARIA[2026];
    const r1 = bd * 365 * 1, r2 = bd * 365 * 2, r3 = bd * 365 * 4, r4 = bd * 365 * 25;
    if (importe <= r1) return 'Rango I';
    if (importe <= r2) return 'Rango II';
    if (importe <= r3) return 'Rango III';
    if (importe <= r4) return 'Rango IV';
    return 'Rango V';
  }

  // ── Registro Patronal ───────────────────────────────────────
  function normalizarRP(val) {
    if (!val) return '';
    const txt = String(val).toUpperCase().replace(/-/g,'').replace(/\s/g,'').trim();
    if (txt.length !== 10) return '';
    return `${txt.slice(0,3)}-${txt.slice(3,8)}-${txt.slice(8,10)}`;
  }

  // ── Generar Folio ───────────────────────────────────────────
  function generarFolio(prefix = 'REG') {
    const now = new Date();
    return `${prefix}-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${String(now.getTime()).slice(-5)}`;
  }

  // ── Formatear Periodo ────────────────────────────────────────
  function formatPeriodo(val) {
    if (!val) return '';
    const s = String(val).trim();
    if (s.includes('/')) {
      const [a, b] = s.split('/');
      return a.length === 4 ? `${b.padStart(2,'0')}/${a}` : `${a.padStart(2,'0')}/${b}`;
    }
    if (s.includes('-')) {
      const parts = s.split('-');
      return `${parts[1].padStart(2,'0')}/${parts[0]}`;
    }
    return s;
  }

  // ── Texto de búsqueda ───────────────────────────────────────
  function matchSearch(record, query) {
    const q = query.toLowerCase();
    return Object.values(record).some(v => String(v||'').toLowerCase().includes(q));
  }

  // ── Paginación ──────────────────────────────────────────────
  function paginate(arr, page, size = 25) {
    const total = arr.length, pages = Math.ceil(total / size) || 1;
    const start = (page - 1) * size;
    return { items: arr.slice(start, start + size), total, pages, page };
  }

  // ── Escape HTML ─────────────────────────────────────────────
  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  // ── Toast ───────────────────────────────────────────────────
  function toast(msg, type = 'info', duration = 3500) {
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const container = document.getElementById('toast-container');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${esc(msg)}</span>`;
    container.appendChild(el);
    setTimeout(() => { el.style.transition = '0.3s'; el.style.opacity = '0'; el.style.transform = 'translateX(100%)'; setTimeout(() => el.remove(), 300); }, duration);
  }

  // ── Confirm dialog ──────────────────────────────────────────
  function confirm(msg) { return window.confirm(msg); }

  // ── Exportar CSV ────────────────────────────────────────────
  function exportCSV(data, filename = 'export.csv') {
    if (!data || !data.length) return;
    const headers = Object.keys(data[0]);
    const rows = data.map(r => headers.map(h => `"${String(r[h]||'').replace(/"/g,'""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    a.click(); URL.revokeObjectURL(url);
  }

  return { today, nowTs, formatDate, formatDateLong, datePartsEs, formatCurrency, formatCurrencyShort, importeALetras, determinarRango, normalizarRP, generarFolio, formatPeriodo, matchSearch, paginate, esc, toast, confirm, exportCSV };
})();
