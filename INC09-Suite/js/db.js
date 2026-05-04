/**
 * db.js — Capa de persistencia en localStorage
 * Provee CRUD genérico para todos los módulos de INC09 Suite.
 */

const DB = (() => {
  // ── Llave por colección ─────────────────────────────────────
  const KEY = {
    users:          'inc9_users',
    expedientes:    'inc9_expedientes',
    socios:         'inc9_socios',
    fuentes:        'inc9_fuentes',
    inv_socios:     'inc9_inv_socios',
    visitas_neg:    'inc9_vis_neg',
    visitas_pos:    'inc9_vis_pos',
    visitas_rest:   'inc9_vis_rest',
    visitas_c03:    'inc9_vis_c03',
    visitas_c02:    'inc9_vis_c02',
    visitas_arp:    'inc9_vis_arp',
    visitas_dad:    'inc9_vis_dad',
    visitas_act:    'inc9_vis_act',
    vistas_origen:  'inc9_vis_origen',
    viaticos:       'inc9_viaticos',
    encargados:     'inc9_encargados',
    session:        'inc9_session',
  };

  // ── Caché en Memoria ────────────────────────────────────────
  let memoryCache = null;

  async function initServerLoad() {
    try {
      const res = await fetch('/api/db/load-json');
      if (res.ok) {
        memoryCache = await res.json();
      } else {
        memoryCache = {};
      }
    } catch (e) {
      console.error('[DB] Error cargando DB JSON del servidor:', e);
      memoryCache = {};
    }

    // Auto-migración desde localStorage si el servidor está vacío
    if (Object.keys(memoryCache).length === 0) {
      let migrated = false;
      Object.values(KEY).forEach(k => {
        if (k === KEY.session || k === KEY.users) return;
        const local = localStorage.getItem(k);
        if (local) {
          try {
            const arr = JSON.parse(local);
            if (arr.length > 0) {
              memoryCache[k] = arr;
              migrated = true;
            }
          } catch(e){}
        }
      });
      // Si migró algo, subirlo inmediatamente al servidor
      if (migrated) {
        console.log('[DB] Migrando datos locales al servidor...');
        fetch('/api/db/save-json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(memoryCache)
        }).catch(e => {});
      }
    }
  }

  // ── Helpers internos ────────────────────────────────────────
  function load(key) {
    if (key === KEY.session) {
      try { return JSON.parse(localStorage.getItem(key) || '[]'); }
      catch { return []; }
    }
    if (!memoryCache) return [];
    return memoryCache[key] || [];
  }

  function save(key, data) {
    if (key === KEY.session) {
      localStorage.setItem(key, JSON.stringify(data));
      return;
    }
    if (!memoryCache) memoryCache = {};
    memoryCache[key] = data;
    
    // Guardar en el servidor asincronamente
    fetch('/api/db/save-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(memoryCache)
    }).catch(e => console.error('[DB] Error guardando en servidor:', e));
  }

  function nextId(arr) {
    return arr.length ? Math.max(...arr.map(r => r.id || 0)) + 1 : 1;
  }

  // ── CRUD genérico ───────────────────────────────────────────
  function getAll(key)    { return load(key); }
  function getById(key, id) { return load(key).find(r => r.id === id) || null; }
  function insert(key, data) {
    const arr = load(key);
    const record = { id: nextId(arr), ...data, created_at: new Date().toISOString() };
    arr.push(record);
    save(key, arr);
    return record;
  }
  function update(key, id, data) {
    const arr = load(key);
    const idx = arr.findIndex(r => r.id === id);
    if (idx === -1) return null;
    arr[idx] = { ...arr[idx], ...data, updated_at: new Date().toISOString() };
    save(key, arr);
    return arr[idx];
  }
  function remove(key, id) {
    const arr = load(key).filter(r => r.id !== id);
    save(key, arr);
  }
  function filter(key, fn) { return load(key).filter(fn); }

  // ── Sesión ──────────────────────────────────────────────────
  function getSession() {
    try { return JSON.parse(localStorage.getItem(KEY.session) || 'null'); }
    catch { return null; }
  }
  function setSession(user) {
    localStorage.setItem(KEY.session, JSON.stringify(user));
  }
  function clearSession() {
    localStorage.removeItem(KEY.session);
  }

  // ── Seed de datos iniciales ─────────────────────────────────
  function seed() {
    // Usuarios por defecto
    if (!load(KEY.users).length) {
      save(KEY.users, [
        { id: 1, username: 'admin', password: 'admin123', nombre: 'Administrador', rol: 'admin', activo: true, iniciales: 'ADM', departamento: 'Dirección General', figura: 'Titular' },
        { id: 2, username: 'localizador1', password: '1234', nombre: 'Juan López Pérez', rol: 'usuario', activo: true, iniciales: 'JLP', departamento: 'Cobranza', figura: 'Notificador-Localizador' },
      ]);
    }
    // Expedientes de ejemplo
    if (!load(KEY.expedientes).length) {
      save(KEY.expedientes, [
        { id: 1, registro_patronal: 'MEX-12345-01', razon_social: 'EMPRESAS SA DE CV', rfc: 'EMP010101ABC', rango: 'rango_ii', tipo_persona: 'moral', actividad: 'Comercio al por mayor', importe: 145000.00, integrador: 'ADM', dom_general: 'Av. Insurgentes 1234, Col. Centro', created_at: '2026-01-15T10:00:00.000Z' },
        { id: 2, registro_patronal: 'JAL-98765-23', razon_social: 'CONSTRUCTORA XYZ SC', rfc: 'CXY920301DEF', rango: 'rango_iii', tipo_persona: 'moral', actividad: 'Construcción', importe: 320500.00, integrador: 'JLP', dom_general: 'Blvd. Tlajomulco 456, Guadalajara', created_at: '2026-02-10T09:30:00.000Z' },
      ]);
    }
    // Encargados de ejemplo
    if (!load(KEY.encargados).length) {
      save(KEY.encargados, [
        { id: 1, nombre: 'María González Ruiz', cargo: 'Jefa de Oficina', departamento: 'Cobranza' },
        { id: 2, nombre: 'Roberto Sánchez Torres', cargo: 'Subdelegado', departamento: 'Dirección General' },
      ]);
    }
  }

  // ── API pública ─────────────────────────────────────────────
  return {
    KEY,
    initServerLoad,
    seed,
    getSession, setSession, clearSession,
    // Genéricos
    getAll, getById, insert, update, remove, filter,
    // Atajos por módulo
    users:         { getAll: () => getAll(KEY.users), getById: id => getById(KEY.users, id), insert: d => insert(KEY.users, d), update: (id,d) => update(KEY.users, id, d), remove: id => remove(KEY.users, id) },
    expedientes:   { getAll: () => getAll(KEY.expedientes), getById: id => getById(KEY.expedientes, id), insert: d => insert(KEY.expedientes, d), update: (id,d) => update(KEY.expedientes, id, d), remove: id => remove(KEY.expedientes, id), filter: fn => filter(KEY.expedientes, fn) },
    socios:        { getAll: () => getAll(KEY.socios), insert: d => insert(KEY.socios, d), update: (id,d) => update(KEY.socios, id, d), remove: id => remove(KEY.socios, id), byExp: expId => filter(KEY.socios, r => r.expediente_id === expId) },
    fuentes:       { getAll: () => getAll(KEY.fuentes), insert: d => insert(KEY.fuentes, d), update: (id,d) => update(KEY.fuentes, id, d), remove: id => remove(KEY.fuentes, id), byExp: expId => filter(KEY.fuentes, r => r.expediente_id === expId) },
    inv_socios:    { getAll: () => getAll(KEY.inv_socios), insert: d => insert(KEY.inv_socios, d), update: (id,d) => update(KEY.inv_socios, id, d), remove: id => remove(KEY.inv_socios, id), bySocio: socioId => filter(KEY.inv_socios, r => r.socio_id === socioId) },
    visitas_neg:   { getAll: () => getAll(KEY.visitas_neg), insert: d => insert(KEY.visitas_neg, d), update: (id,d) => update(KEY.visitas_neg, id, d), remove: id => remove(KEY.visitas_neg, id) },
    visitas_pos:   { getAll: () => getAll(KEY.visitas_pos), insert: d => insert(KEY.visitas_pos, d), update: (id,d) => update(KEY.visitas_pos, id, d), remove: id => remove(KEY.visitas_pos, id) },
    visitas_rest:  { getAll: () => getAll(KEY.visitas_rest), insert: d => insert(KEY.visitas_rest, d), update: (id,d) => update(KEY.visitas_rest, id, d), remove: id => remove(KEY.visitas_rest, id) },
    visitas_c03:   { getAll: () => getAll(KEY.visitas_c03), insert: d => insert(KEY.visitas_c03, d), update: (id,d) => update(KEY.visitas_c03, id, d), remove: id => remove(KEY.visitas_c03, id) },
    visitas_c02:   { getAll: () => getAll(KEY.visitas_c02), insert: d => insert(KEY.visitas_c02, d), update: (id,d) => update(KEY.visitas_c02, id, d), remove: id => remove(KEY.visitas_c02, id) },
    visitas_arp:   { getAll: () => getAll(KEY.visitas_arp), insert: d => insert(KEY.visitas_arp, d), update: (id,d) => update(KEY.visitas_arp, id, d), remove: id => remove(KEY.visitas_arp, id) },
    visitas_dad:   { getAll: () => getAll(KEY.visitas_dad), insert: d => insert(KEY.visitas_dad, d), update: (id,d) => update(KEY.visitas_dad, id, d), remove: id => remove(KEY.visitas_dad, id) },
    visitas_act:   { getAll: () => getAll(KEY.visitas_act), insert: d => insert(KEY.visitas_act, d), update: (id,d) => update(KEY.visitas_act, id, d), remove: id => remove(KEY.visitas_act, id) },
    vistas_origen: { getAll: () => getAll(KEY.vistas_origen), insert: d => insert(KEY.vistas_origen, d), update: (id,d) => update(KEY.vistas_origen, id, d), remove: id => remove(KEY.vistas_origen, id) },
    viaticos:      { getAll: () => getAll(KEY.viaticos), getById: id => getById(KEY.viaticos, id), insert: d => insert(KEY.viaticos, d), update: (id,d) => update(KEY.viaticos, id, d), remove: id => remove(KEY.viaticos, id) },
    encargados:    { getAll: () => getAll(KEY.encargados), insert: d => insert(KEY.encargados, d), update: (id,d) => update(KEY.encargados, id, d), remove: id => remove(KEY.encargados, id) },
  };
})();
