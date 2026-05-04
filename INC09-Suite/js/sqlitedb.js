/**
 * sqlitedb.js — Gestión de Usuarios con SQLite (sql.js / WASM) + bcrypt
 *
 * - La base de datos SQLite se mantiene en memoria (sql.js / WebAssembly).
 * - Se persiste como blob binario en localStorage bajo la clave 'inc9_sqlite'.
 * - Las contraseñas se almacenan SIEMPRE como hash bcrypt (salt rounds = 12).
 * - API pública: SqliteDB.init(), .getUsers(), .addUser(), .updateUser(),
 *   .deleteUser(), .verifyLogin(), .getUserById(), .getUserByUsername()
 */

const SqliteDB = (() => {
  // ── Configuración ────────────────────────────────────────
  const STORAGE_KEY  = 'inc9_sqlite';
  const SALT_ROUNDS  = 12;
  const WASM_CDN     = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.10.2/';

  /** Obtiene la referencia a bcryptjs en tiempo de ejecución (no de carga). */
  function _getBcrypt() {
    return window.bcrypt
        || (window.dcodeIO && window.dcodeIO.bcrypt)
        || null;
  }

  /**
   * Hashea una contraseña con bcrypt (wraps callback en Promise).
   * bcryptjs v2.4.3 UMD usa callbacks, no Promises nativas.
   */
  function _hashPassword(password, saltRounds) {
    return new Promise((resolve, reject) => {
      const b = _getBcrypt();
      if (!b) { reject(new Error('bcryptjs no disponible')); return; }
      b.hash(password, saltRounds, (err, hash) => {
        if (err) reject(err); else resolve(hash);
      });
    });
  }

  /**
   * Compara contraseña con hash bcrypt (wraps callback en Promise).
   */
  function _comparePassword(password, hash) {
    return new Promise((resolve, reject) => {
      const b = _getBcrypt();
      if (!b) { reject(new Error('bcryptjs no disponible')); return; }
      b.compare(password, hash, (err, result) => {
        if (err) reject(err); else resolve(result);
      });
    });
  }

  let _db   = null;  // instancia sql.js Database
  let _SQL  = null;  // clase sql.js (para re-crear si se necesita)
  let _ready = false;

  // ── Persistencia ─────────────────────────────────────────

  /** Exporta la DB a localStorage como array de enteros. */
  function _save() {
    if (!_db) return;
    try {
      const data = _db.export();
      fetch('/api/db/save-sqlite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: data
      }).catch(e => console.error('[SqliteDB] Error al guardar DB en servidor:', e));
    } catch (e) {
      console.error('[SqliteDB] Error al exportar DB:', e);
    }
  }

  // ── DDL ──────────────────────────────────────────────────

  function _createSchema() {
    _db.run(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        username            TEXT    UNIQUE NOT NULL COLLATE NOCASE,
        password_hash       TEXT    NOT NULL,
        nombre              TEXT    NOT NULL,
        iniciales           TEXT,
        constancia_matricula TEXT,
        email               TEXT,
        figura              TEXT,
        departamento        TEXT,
        rol                 TEXT    NOT NULL DEFAULT 'usuario',
        permisos_custom     TEXT,
        activo              INTEGER NOT NULL DEFAULT 1,
        created_at          TEXT    DEFAULT (datetime('now','localtime')),
        updated_at          TEXT
      )
    `);
    _save();
  }

  // ── Seed de usuarios por defecto ─────────────────────────

  async function _seed() {
    const count = _db.exec('SELECT COUNT(*) AS n FROM usuarios')[0]?.values[0][0] || 0;
    if (count > 0) return; // Ya tiene usuarios

    const adminHash = await _hashPassword('admin123', SALT_ROUNDS);
    const userHash  = await _hashPassword('1234', SALT_ROUNDS);

    _db.run(
      `INSERT INTO usuarios (username, password_hash, nombre, iniciales, rol, departamento, figura)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      ['admin', adminHash, 'Administrador', 'ADM', 'admin', 'Dirección General', 'Titular']
    );
    _db.run(
      `INSERT INTO usuarios
         (username, password_hash, nombre, iniciales, constancia_matricula, rol, departamento, figura)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['localizador1', userHash, 'Juan López Pérez', 'JLP', '98765', 'usuario', 'Cobranza', 'Notificador-Localizador']
    );
    _save();
  }

  // ── Helpers de consulta ──────────────────────────────────

  /** Convierte el resultado de exec() en array de objetos. */
  function _toObjects(result) {
    if (!result || !result.length) return [];
    const { columns, values } = result[0];
    return values.map(row => {
      const obj = {};
      columns.forEach((col, i) => { obj[col] = row[i]; });
      return obj;
    });
  }

  function _run(sql, params = []) {
    _db.run(sql, params);
    _save();
  }

  // ── API pública ──────────────────────────────────────────

  /** Inicializa sql.js y carga/crea la base de datos.
   *  Debe llamarse con await antes de usar cualquier otra función. */
  async function init() {
    if (_ready) return;
    // 1. Cargar sql.js desde CDN
    _SQL = await initSqlJs({
      locateFile: file => `${WASM_CDN}${file}`,
    });
    // 2. Cargar DB existente desde el servidor o crear nueva
    let raw = null;
    let fromServer = false;
    try {
      const res = await fetch('/api/db/load-sqlite');
      if (res.ok) {
        const buf = await res.arrayBuffer();
        if (buf.byteLength > 0) {
          raw = new Uint8Array(buf);
          fromServer = true;
        }
      }
    } catch(e) {
      console.warn('[SqliteDB] No se pudo cargar base de datos del servidor o no existe aún.', e);
    }

    // Auto-migración si el servidor no tiene datos
    if (!fromServer) {
      try {
        const local = localStorage.getItem(STORAGE_KEY);
        if (local) {
          raw = new Uint8Array(JSON.parse(local));
          console.log('[SqliteDB] Migrando datos SQLite locales al servidor...');
        }
      } catch(e) {}
    }

    _db = raw ? new _SQL.Database(raw) : new _SQL.Database();
    
    // Si se migró, forzar un guardado en el servidor inmediatamente
    if (!fromServer && raw) {
      _save();
    }
    // 3. Crear esquema si no existe
    _createSchema();
    // 3.5 Actualizar esquema si es versión antigua
    try {
      _db.run('ALTER TABLE usuarios ADD COLUMN permisos_custom TEXT');
      _save();
    } catch (e) { /* Columna ya existe u otro error, se ignora */ }
    
    // Migración de datos heredados (viejos roles a nuevos)
    _db.run("UPDATE usuarios SET rol = 'Administrador' WHERE rol = 'admin'");
    _db.run("UPDATE usuarios SET rol = 'Visitador' WHERE rol = 'usuario'");
    _save();

    // 4. Seed si la tabla está vacía
    await _seed();
    _ready = true;
    console.log('[SqliteDB] ✅ Base de datos lista.');
  }

  /** Retorna todos los usuarios (sin exponer el hash). */
  function getUsers() {
    const res = _db.exec(`
      SELECT id, username, nombre, iniciales, constancia_matricula,
             email, figura, departamento, rol, permisos_custom, activo, created_at, updated_at
      FROM usuarios ORDER BY id ASC
    `);
    return _toObjects(res);
  }

  /** Retorna un usuario por ID (sin hash). */
  function getUserById(id) {
    const res = _db.exec(`
      SELECT id, username, nombre, iniciales, constancia_matricula,
             email, figura, departamento, rol, permisos_custom, activo, created_at, updated_at
      FROM usuarios WHERE id = ?
    `, [id]);
    return _toObjects(res)[0] || null;
  }

  /** Busca por username exacto. */
  function getUserByUsername(username) {
    const res = _db.exec(`
      SELECT id, username, nombre, iniciales, constancia_matricula,
             email, figura, departamento, rol, permisos_custom, activo, created_at, updated_at
      FROM usuarios WHERE username = ? COLLATE NOCASE
    `, [username]);
    return _toObjects(res)[0] || null;
  }

  /**
   * Agrega un nuevo usuario.
   * @param {object} data - { username, password, nombre, iniciales,
   *   constancia_matricula, email, figura, departamento, rol }
   * @returns {object} usuario creado (sin hash)
   * @throws si el username ya existe
   */
  async function addUser(data) {
    const { username, password, nombre, iniciales = '',
            constancia_matricula = '', email = '',
            figura = '', departamento = '', rol = 'usuario', permisos_custom = null } = data;

    if (!username || !password || !nombre) {
      throw new Error('username, password y nombre son obligatorios.');
    }

    // Verificar unicidad
    const existing = _db.exec('SELECT id FROM usuarios WHERE username = ? COLLATE NOCASE', [username]);
    if (existing.length && existing[0].values.length) {
      throw new Error(`El usuario "${username}" ya existe.`);
    }

    const hash = await _hashPassword(password, SALT_ROUNDS);

    _run(
      `INSERT INTO usuarios
         (username, password_hash, nombre, iniciales, constancia_matricula,
          email, figura, departamento, rol, permisos_custom)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, hash, nombre, iniciales, constancia_matricula, email, figura, departamento, rol, permisos_custom]
    );

    return getUserByUsername(username);
  }

  /**
   * Actualiza datos de un usuario.
   * Si se provee `password`, se re-hashea.
   * @param {number} id
   * @param {object} data - campos a actualizar
   */
  async function updateUser(id, data) {
    const existing = getUserById(id);
    if (!existing) throw new Error(`Usuario #${id} no encontrado.`);

    const fields = [];
    const params = [];

    const allowed = ['username','nombre','iniciales','constancia_matricula',
                     'email','figura','departamento','rol','permisos_custom','activo'];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    // Re-hashear contraseña si se provee
    if (data.password && data.password.trim()) {
      const hash = await _hashPassword(data.password.trim(), SALT_ROUNDS);
      fields.push('password_hash = ?');
      params.push(hash);
    }

    if (!fields.length) return getUserById(id);

    fields.push(`updated_at = datetime('now','localtime')`);
    params.push(id);

    _run(`UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`, params);
    return getUserById(id);
  }

  /** Elimina un usuario por ID. */
  function deleteUser(id) {
    _run('DELETE FROM usuarios WHERE id = ?', [id]);
  }

  /**
   * Verifica credenciales.
   * @returns {object|null} usuario completo (sin hash) si correcto, null si falla.
   */
  async function verifyLogin(username, password) {
    if (!username || !password) return null;
    // Obtener hash del usuario
    const res = _db.exec(
      'SELECT id, password_hash, activo FROM usuarios WHERE username = ? COLLATE NOCASE',
      [username]
    );
    const rows = _toObjects(res);
    if (!rows.length) return null;
    const { id, password_hash, activo } = rows[0];
    if (!activo) return null;

    const ok = await _comparePassword(password, password_hash);
    if (!ok) return null;

    return getUserById(id);
  }

  /** Fuerza una persistencia inmediata (útil tras operaciones masivas). */
  function persist() { _save(); }

  /** Limpia toda la DB (útil para tests/reset). */
  function resetDB() {
    localStorage.removeItem(STORAGE_KEY);
    _db = new _SQL.Database();
    _createSchema();
  }

  return { init, getUsers, getUserById, getUserByUsername, addUser, updateUser, deleteUser, verifyLogin, persist, resetDB };
})();
