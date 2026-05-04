/**
 * reportes.js — Motor de generación de reportes Word (.docx) desde plantillas
 *
 * Flujo:
 *  1. Carga el .docx como binario (PizZip)
 *  2. Normaliza el XML: colapsa los runs fragmentados en párrafo para que
 *     los placeholders @@... queden en un solo <w:t>
 *  3. Reemplaza cada @@placeholder (y @@placeholder{formato}) con el valor real
 *  4. Descarga el .docx generado
 *
 * Formatos de fecha soportados en {formato}:
 *   dd   → día con cero  "05"
 *   d    → día sin cero  "5"
 *   mm   → mes numérico  "03"
 *   mmmm → mes en español "Marzo"
 *   aa   → año 2 dígitos "26"
 *   aaaa → año 4 dígitos "2026"
 *
 * Ejemplo: @@fecha{mmmm aaaa} → "Marzo 2026"
 */

const Reportes = (() => {

  // ── Meses en español ───────────────────────────────────────
  const MESES = [
    'Enero','Febrero','Marzo','Abril','Mayo','Junio',
    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
  ];

  /**
   * Formatea una fecha según el patrón dado.
   * @param {string} fechaStr  - "YYYY-MM-DD" o "dd/mm/aaaa"
   * @param {string} formato   - "mmmm aaaa", "dd", "mm", etc.
   * @returns {string}
   */
  function _formatearFecha(fechaStr, formato) {
    if (!fechaStr) return '';
    let d, m, y;
    // Detectar formato ISO (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}/.test(fechaStr)) {
      [y, m, d] = fechaStr.split('-').map(Number);
    } else {
      // Formato dd/mm/aaaa o dd/mm/aa
      const parts = fechaStr.split(/[\/\-]/).map(Number);
      d = parts[0]; m = parts[1];
      y = parts[2] < 100 ? 2000 + parts[2] : parts[2];
    }
    return formato
      .replace(/mmmm/gi, MESES[(m || 1) - 1] || '')
      .replace(/mm/gi, String(m || 0).padStart(2, '0'))
      .replace(/aaaa/gi, String(y || ''))
      .replace(/aa/gi, String(y || '').slice(-2))
      .replace(/dd/gi, String(d || 0).padStart(2, '0'))
      .replace(/['"]/g, ''); // Remover comillas simples o dobles que se usan para literales como 'de'
  }

  /**
   * Construye el mapa de reemplazos a partir de un registro de viáticos.
   * Claves: exactamente como aparecen en el texto plano de la plantilla
   * (ya normalizados, sin espacios extras).
   * @param {object} rec - registro de DB.viaticos
   * @returns {Map<string, string>}  key = placeholder sin @@, value = texto
   */
  function _buildMap(rec) {
    const map = new Map();

    // ── Campos simples ─────────────────────────────────────
    const add = (key, val) => map.set(key.toLowerCase(), String(val ?? ''));

    add('Nombre_ttd',    rec.nombre_ttd);
    add('departamento',  rec.departamento);
    add('figura',        rec.figura);
    add('jefe',          rec.jefe);
    add('subdelegado',   rec.subdelegado);
    add('leyenda',       rec.leyenda);
    add('rubricas',      rec.rubricas);
    add('estado',        rec.estado);
    add('folio',         rec.folio);

    // Total de viáticos
    const total = parseFloat(rec.total_viaticos || 0);
    add('total_viaticos', `$${total.toFixed(2)}`);
    add('Total_Visitas',  (rec.visitas_realizadas || []).reduce((sum, v) => sum + (v.registros?.length || 0), 0));

    // Fecha de cierre = fecha del registro
    add('Fecha_Cierre', rec.fecha || '');

    // ── Fechas con formato especial se resuelven en tiempo de reemplazo ──
    // Se guardan con clave 'fecha' y se procesan si tienen {formato}
    map.set('__fecha_raw__', rec.fecha || '');

    // ── Facturas por índice ────────────────────────────────
    (rec.viaticos || []).forEach((v, i) => {
      const n = i + 1;
      const f_fecha = _formatearFecha(v.fecha, 'dd/mm/aaaa');
      add(`viaticos[${n}].fecha`,    f_fecha);
      add(`viaticos[${n}].cantidad`, v.cantidad || '');
      // Alias sin brackets por si la plantilla usa índice simple
      add(`viaticos${n}_fecha`,    f_fecha);
      add(`viaticos${n}_cantidad`, v.cantidad || '');
    });

    // ── Visitas y registros ────────────────────────────────
    // La plantilla usa @@registros[n].campo — en el texto plano el [n] se
    // interpreta como el número de visita (1-5).
    (rec.visitas_realizadas || []).forEach(vr => {
      const n = vr.visita;
      const regs = vr.registros || [];
      const numVisitas = regs.length;
      
      // Mapear el conteo dinámico de diligencias para este día
      add(`viaticos[${n}].num_visitas`, numVisitas > 0 ? numVisitas : '');
      add(`viaticos[${n}].num_visitas_texto`, numVisitas > 0 ? `${numVisitas} VISITA${numVisitas !== 1 ? 'S' : ''}` : '');

      const idx1 = (n - 1) * 2 + 1; // 1, 3, 5, 7, 9
      const idx2 = (n - 1) * 2 + 2; // 2, 4, 6, 8, 10
      // Registro 1 de la visita n
      add(`registros[${idx1}].nombre`,       regs[0]?.nombre       || '');
      add(`registros[${idx1}].reg_patronal`, regs[0]?.reg_patronal || '');
      add(`registros[${idx1}].domicilio`,    regs[0]?.domicilio    || '');
      // Registro 2 de la visita n (si existe)
      add(`registros[${idx2}].nombre`,       regs[1]?.nombre       || '');
      add(`registros[${idx2}].reg_patronal`, regs[1]?.reg_patronal || '');
      add(`registros[${idx2}].domicilio`,    regs[1]?.domicilio    || '');
    });

    return map;
  }

  /**
   * Normaliza el XML de Word: colapsa los <w:r> dentro de cada <w:p>
   * para que los placeholders @@ queden en un único run de texto.
   * Estrategia: opera a nivel de texto plano del XML.
   *
   * El problema: Word escribe "@@" en un <w:t> y "Nombre_ttd" en otro.
   * Solución: extraer el texto de todos los <w:t> de cada <w:p>,
   * hacer los reemplazos en ese texto plano, y reinyectarlo en el primer
   * <w:t> del párrafo (dejando los demás vacíos).
   */
  function _normalizeAndReplace(xmlStr, map, fechaRaw) {
    return xmlStr.replace(/<w:p[ >][\s\S]*?<\/w:p>/g, para => {
      if (!para.includes('@@')) return para;

      const runs = [];
      let flat = '';
      para.replace(/<w:t(>| [^>]*>)([\s\S]*?)<\/w:t>/g, (match, attrs, content) => {
        runs.push({ attrs, content, newContent: '' });
        flat += content;
      });

      if (!flat.includes('@@')) return para;

      const charToRun = [];
      for (let i = 0; i < runs.length; i++) {
        for (let j = 0; j < runs[i].content.length; j++) {
          charToRun.push(i);
        }
      }

      // Identificar oraciones de registros vacíos para eliminarlas por completo
      const emptySentences = [];
      const emptyRegsRegex = /(?:@@viaticos\[\d+\]\.fecha\s*)?Visita ocular[\s\S]*?@@registros\[(\d+)\]\.nombre[\s\S]*?@@registros\[\1\]\.domicilio\.?/gi;
      let mEmpty;
      while ((mEmpty = emptyRegsRegex.exec(flat)) !== null) {
         const idx = mEmpty[1];
         const regName = map.get(`registros[${idx}].nombre`);
         if (!regName || regName.trim() === '') {
            emptySentences.push({ start: mEmpty.index, end: mEmpty.index + mEmpty[0].length });
         }
      }

      // IMPORTANTE: regex ajustado para NO consumir el espacio despues del grupo si no hay corchetes
      // Se añaden caracteres invisibles comunes de Word y el espacio sin separación (\u00A0) para evitar que la variable se rompa
      const regex = /@@\s*([\w\[\]._\u200B-\u200D\uFEFF\u00AD\u00A0]+)(?:\s*\{\s*([^}]+?)\s*\})?/gi;
      let m;
      let lastIndex = 0;

      while ((m = regex.exec(flat)) !== null) {
        // Copiar los caracteres originales antes de la coincidencia, omitiendo los que pertenecen a oraciones vacías
        for (let i = lastIndex; i < m.index; i++) {
           if (!emptySentences.some(e => i >= e.start && i < e.end)) {
               const runIdx = charToRun[i];
               if (runs[runIdx]) runs[runIdx].newContent += _escXml(flat[i]);
           }
        }

        const targetRun = charToRun[m.index];
        const k = m[1].replace(/[\u200B-\u200D\uFEFF\u00AD\u00A0]/g, '').trim().toLowerCase();
        let val = '';
        if (k === 'fecha') {
          val = m[2] ? _formatearFecha(fechaRaw, m[2].trim()) : fechaRaw;
        } else if (map.has(k)) {
          val = map.get(k);
          if (m[2]) val = _formatearFecha(val, m[2].trim());
        } else {
          const alt = k.replace(/\[(\d+)\]/g, '$1').replace(/\./g, '_');
          if (map.has(alt)) {
            val = map.get(alt);
            if (m[2]) val = _formatearFecha(val, m[2].trim());
          }
        }
        
        // Inyectar el texto reemplazado en el nodo de origen donde empieza el patrón,
        // siempre y cuando NO esté dentro de una oración vacía.
        const inEmpty = emptySentences.some(e => m.index >= e.start && m.index < e.end);
        if (!inEmpty) {
            runs[targetRun].newContent += _escXml(val);
        }
        
        lastIndex = m.index + m[0].length;
      }
      
      // Copiar caracteres originales sobrantes
      for (let i = lastIndex; i < flat.length; i++) {
         if (!emptySentences.some(e => i >= e.start && i < e.end)) {
             const runIdx = charToRun[i];
             if (runs[runIdx]) runs[runIdx].newContent += flat[i];
         }
      }

      // Reconstruir el párrafo, devolviendo el texto a sus respectivas etiquetas <w:t>
      let rIdx = 0;
      return para.replace(/<w:t(>| [^>]*>)([\s\S]*?)<\/w:t>/g, (match, attrs) => {
        const r = runs[rIdx++];
        const finalContent = r.newContent;
        if (!finalContent) {
           let cleanAttrs = attrs === ">" ? "" : attrs.slice(0, -1);
           return `<w:t${cleanAttrs}></w:t>`;
        }
        const spaceAttr = finalContent.startsWith(' ') || finalContent.endsWith(' ') ? ' xml:space="preserve"' : '';
        let cleanAttrs = attrs === ">" ? "" : attrs.slice(0, -1);
        if (spaceAttr && !cleanAttrs.includes('xml:space')) {
           cleanAttrs += spaceAttr;
        }
        return `<w:t${cleanAttrs}>${finalContent}</w:t>`;
      });
    });
  }

  /** Escapa caracteres especiales XML */
  function _escXml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Extrae ArrayBuffer de base64 */
  function _base64ToArrayBuffer(base64) {
    if (!base64 || typeof base64 !== 'string') return null;
    const parts = base64.split(';base64,');
    if (parts.length !== 2) return null;
    const raw = window.atob(parts[1]);
    const uInt8Array = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; ++i) uInt8Array[i] = raw.charCodeAt(i);
    return uInt8Array.buffer;
  }

  function _buildVisitaMap(rec) {
    const map = new Map();
    for (const [k, v] of Object.entries(rec)) {
      map.set(k.toLowerCase(), String(v ?? ''));
    }

    // Respaldo para cuando la plantilla Word se rompe (ej. @@Domicilio_ Verificar con espacio)
    const dv = String(rec.Domicilio_Verificar || '');
    if (dv && !map.has('domicilio_')) {
      map.set('domicilio_', dv);
    }

    // Formato global de horas: hh horas con mm minutos
    const formatHora = h => {
      if (!h) return '';
      const p = h.split(':');
      if (p.length >= 2) return `${p[0]} horas con ${p[1]} minutos`;
      return h;
    };
    
    // Lista de campos de hora conocidos en todas las secciones
    const horaFields = [
      'Hora_Inicio_Diligencia', 'Hora_Fin_Diligencia', 
      'DAD_Visita_Hora_Inc', 'DAD_Visita_Hora_Fin'
    ];
    horaFields.forEach(f => {
      if (rec[f]) map.set(f.toLowerCase(), formatHora(rec[f]));
    });

    // Lista de campos de fecha conocidos en todas las secciones
    const fechaFields = [
      'Fecha_Visita', 'Fecha_Envio', 'Fecha_Fin_Frustra', 
      'Fecha_Solicitud', 'DAD_Visita_Fecha'
    ];
    fechaFields.forEach(f => {
      if (rec[f]) map.set(f.toLowerCase(), _formatearFecha(rec[f], "dd de mmmm de aaaa"));
    });

    // Forzar la inyección de los tags de imagen para docxtemplater
    map.set('mapa', '{%Mapa}');
    map.set('foto_1', '{%FOTO_1}');
    map.set('foto_2', '{%FOTO_2}');
    map.set('foto_3', '{%FOTO_3}');
    map.set('foto_4', '{%FOTO_4}');
    return map;
  }

  /**
   * Genera el .docx rellenado y lo descarga.
   * @param {object} rec - registro de DB.viaticos
   */
  async function generarViaticos(rec) {
    // 1. Cargar la plantilla
    let arrayBuffer;
    try {
      const resp = await fetch('plantillas/Viaticos.docx');
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      arrayBuffer = await resp.arrayBuffer();
    } catch (e) {
      Utils.toast('No se pudo cargar la plantilla Viaticos.docx: ' + e.message, 'error');
      return;
    }

    // 2. Abrir con PizZip
    const zip = new PizZip(arrayBuffer);

    // 3. Leer el XML del documento
    const docFile = zip.file('word/document.xml');
    if (!docFile) { Utils.toast('Plantilla inválida: sin word/document.xml', 'error'); return; }
    let xmlStr = docFile.asText();

    // 4. Construir mapa de valores
    const map      = _buildMap(rec);
    const fechaRaw = map.get('__fecha_raw__') || rec.fecha || '';

    // 5. Normalizar y reemplazar
    xmlStr = _normalizeAndReplace(xmlStr, map, fechaRaw);

    // 6. Guardar XML modificado en el zip
    zip.file('word/document.xml', xmlStr);

    // 7. Generar blob
    const content = zip.generate({ type: 'uint8array' });
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    const safeName = (rec.nombre_ttd || 'reporte').replace(/[^a-zA-Z0-9]/g, '_');
    const safeDate = (rec.fecha || 'sin-fecha').replace(/[^a-zA-Z0-9]/g, '-');
    const nombre = `Viaticos_${safeName}_${safeDate}.docx`;
    
    // Intentar File System Access API nativa (Chrome/Edge moderno)
    try {
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: nombre,
          types: [{
            description: 'Documento Word',
            accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] }
          }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        Utils.toast(`Reporte guardado: ${nombre}`, 'success');
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') return; // Usuario canceló el guardado
      console.warn('Error en showSaveFilePicker, intentando método tradicional', err);
    }

    // Fallback método tradicional
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 2000);

    Utils.toast(`Reporte generado: ${nombre}`, 'success');
  }

  async function generarReporteVisita(rec, tab) {
    // 1. Elegir plantilla
    const tabTemplates = {
      'rest': 'Restablecimiento.docx',
      'pos':  'Positivo.docx',
      'neg':  'Negativas.docx',
      'c03':  'CORE_03.docx',
      'dad':  'DAD_Informe.docx',
      'arp':  'Informe_Socios.docx'
    };
    const tplName = tabTemplates[tab] || 'Restablecimiento.docx';

    let arrayBuffer;
    try {
      const resp = await fetch(`plantillas/${tplName}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      arrayBuffer = await resp.arrayBuffer();
    } catch (e) {
      Utils.toast(`No se pudo cargar la plantilla ${tplName}: ` + e.message, 'error');
      return;
    }

    // 2. Renderizar el texto con motor nativo _normalizeAndReplace (Unifica fragmentos)
    let zip = new PizZip(arrayBuffer);
    const docFile = zip.file('word/document.xml');
    if (!docFile) { Utils.toast('Plantilla inválida: sin word/document.xml', 'error'); return; }
    let xmlStr = docFile.asText();
    
    const map = _buildVisitaMap(rec);
    const fechaRaw = map.get('fecha_visita') || rec.Fecha_Visita || '';
    xmlStr = _normalizeAndReplace(xmlStr, map, fechaRaw);
    zip.file('word/document.xml', xmlStr);

    // 3. Renderizar imágenes con docxtemplater e ImageModule
    if (window.ImageModule) {
      const imageOpts = {
        centered: false,
        getImage: function (tagValue) {
          return _base64ToArrayBuffer(tagValue) || new ArrayBuffer(0); // Vacío si no hay foto
        },
        getSize: function (img, tagValue, tagName) {
          if (!tagValue) return [1, 1]; // Invisible si no hay imagen
          if (tagName === 'Mapa') return [450, 300];
          return [300, 225];
        }
      };
      
      const imageModule = new window.ImageModule(imageOpts);
      const doc = new window.docxtemplater(zip, {
        modules: [imageModule],
        nullGetter: function(part) { return ""; }
      });

      const dataImgs = {
        Mapa: rec.Mapa_Croquis || '',
        FOTO_1: rec.Foto_1 || '',
        FOTO_2: rec.Foto_2 || '',
        FOTO_3: rec.Foto_3 || '',
        FOTO_4: rec.Foto_4 || '',
      };

      try {
        doc.render(dataImgs);
        zip = doc.getZip(); // Zip modificado con imágenes incrustadas
      } catch (err) {
        console.warn("Advertencia al renderizar imágenes:", err);
      }
    } else {
      console.warn("ImageModule no encontrado. Las imágenes no se incrustarán.");
    }

    // 5. Guardar archivo
    const content = zip.generate({ type: 'uint8array' });
    const blob = new Blob([content], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    
    const rp = (rec.Registro_Patronal || '').replace(/[^a-zA-Z0-9_]/g, '');
    const nom = (rec.Nombre_Patron || '').replace(/[^a-zA-Z0-9_]/g, '_');
    const nombre = `${rp}_${nom}.docx`;
    
    try {
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: nombre,
          types: [{ description: 'Documento Word', accept: { 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] } }]
        });
        const writable = await handle.createWritable();
        await writable.write(blob);
        await writable.close();
        Utils.toast(`Reporte guardado: ${nombre}`, 'success');
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = nombre;
    document.body.appendChild(a);
    a.click();
    
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 2000);
    Utils.toast(`Reporte generado: ${nombre}`, 'success');
  }

  return { generarViaticos, generarReporteVisita };
})();
