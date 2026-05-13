// ============================================================
//  db.js — Configuración de conexión a Oracle XE 21c
//  Programación 2 (PR2) — Universidad Columbia del Paraguay
//
//  Este archivo define CÓMO Node.js se conecta a Oracle.
//  Es importado por todos los archivos de rutas (routes/).
// ============================================================

// oracledb: librería oficial de Oracle para conectar Node.js con la base de datos.
// Versión 6+ soporta modo Thin (no necesita Oracle Instant Client instalado aparte).
const oracledb = require('oracledb');

// ── MODO THIN ──────────────────────────────────────────────
// Thin = liviano. No requiere Oracle Client adicional instalado en Windows.
// Compatible con Oracle XE 21c y la PDB XEPDB1.
// IMPORTANTE: debe configurarse ANTES de abrir cualquier conexión.
oracledb.thin = true;

// ── CONFIGURACIÓN DE CONEXIÓN ──────────────────────────────
// Estos son los datos que Oracle necesita para identificar quién se conecta y a qué base.
const configuracionBaseDatos = {
    user:          'prg2',              // Usuario Oracle creado en XEPDB1 (ver oracle.txt sección 5)
    password:      'curso2026',         // Contraseña del usuario prg2
    connectString: 'localhost/XEPDB1'   // host/nombre-de-la-PDB (XEPDB1 = base de datos del proyecto)
};

// Exportamos la configuración para que login.js y usuarios.js puedan importarla.
module.exports = configuracionBaseDatos;
