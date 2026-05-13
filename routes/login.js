// ============================================================
//  routes/login.js — Ruta de autenticación
//  Programación 2 (PR2) — Universidad Columbia del Paraguay
//
//  Endpoint disponible:
//    POST /api/login
//
//  Recibe (JSON):  { usuario: "nombre", clave: "contraseña" }
//  Devuelve (JSON):
//    Éxito →  { success: true,  usuario: "nombre" }
//    Error  →  { success: false, message: "motivo" }
// ============================================================

// express: necesario para crear el enrutador (agrupador de rutas).
const express = require('express');

// oracledb: librería que abre la conexión con Oracle XE.
const oracledb = require('oracledb');

// Importamos los datos de conexión (usuario, clave, PDB) desde js/db.js.
const configuracionBaseDatos = require('../js/db');

// Creamos el enrutador. Es como un mini-servidor dedicado solo a las rutas de login.
const rutaLogin = express.Router();

// ── ENDPOINT: POST /api/login ────────────────────────────────
//
// Flujo completo:
//   1. El navegador envía usuario+clave con fetch()
//   2. Verificamos en la tabla "usuarios" de Oracle
//   3. Si existe: respondemos con success: true
//   4. Si no existe: respondemos con success: false (error 401)
//
rutaLogin.post('/login', async (peticion, respuesta) => {

    // Leemos los datos que envió el formulario HTML (o el fetch del navegador).
    const nombreDeUsuario = peticion.body.usuario;
    const claveIngresada  = peticion.body.clave;

    // Validación previa: no procesamos si faltan campos obligatorios.
    if (!nombreDeUsuario || !claveIngresada) {
        return respuesta.status(400).json({
            success: false,
            message: 'El usuario y la clave son obligatorios'
        });
    }

    // Declaramos la conexión fuera del try para poder cerrarla en el bloque finally.
    let conexionOracle;

    try {
        // PASO 1: Abrimos la conexión a Oracle XE usando los datos de db.js.
        conexionOracle = await oracledb.getConnection(configuracionBaseDatos);

        // PASO 2: Preparamos la consulta SQL.
        // Los :parametros (con dos puntos) son seguros — Oracle los reemplaza por los valores reales.
        // NUNCA concatenar variables directamente en el SQL (riesgo de inyección SQL).
        const consultaSQL = `
            SELECT nombre, apellido, email
            FROM   usuarios
            WHERE  nombre = :nombreDeUsuario
            AND    passw  = :claveIngresada
        `;

        // Los valores que Oracle colocará en :nombreDeUsuario y :claveIngresada.
        const parametrosSQL = {
            nombreDeUsuario: nombreDeUsuario,
            claveIngresada:  claveIngresada
        };

        // PASO 3: Ejecutamos la consulta.
        // OUT_FORMAT_OBJECT → cada fila se devuelve como { NOMBRE: "...", EMAIL: "..." }
        //                     en vez de array ["...", "..."], más fácil de usar.
        const resultadoConsulta = await conexionOracle.execute(
            consultaSQL,
            parametrosSQL,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // PASO 4: Analizamos el resultado.
        // rows[0] = primera fila encontrada. Si no existe, rows[0] es undefined.
        const usuarioEncontrado = resultadoConsulta.rows[0];

        if (usuarioEncontrado) {
            // Credenciales correctas: el usuario existe en la base de datos.
            respuesta.json({
                success: true,
                usuario: usuarioEncontrado.NOMBRE
            });
        } else {
            // No se encontró ningún registro: usuario o clave incorrectos.
            // HTTP 401 = No autorizado.
            respuesta.status(401).json({
                success: false,
                message: 'Usuario o contraseña incorrectos'
            });
        }

    } catch (errorDeOracle) {
        // Error inesperado: problemas de red, SQL inválido, Oracle apagado, etc.
        console.error('[LOGIN] Error en Oracle:', errorDeOracle.message);
        respuesta.status(500).json({
            success: false,
            message: 'Error interno del servidor al verificar credenciales'
        });

    } finally {
        // PASO 5: Siempre cerramos la conexión, ocurra error o no.
        // Esto evita "fugas" de conexiones que degradarían el rendimiento.
        if (conexionOracle) {
            await conexionOracle.close();
        }
    }
});

// Exportamos el enrutador para que server.js pueda registrarlo con app.use('/api', rutaLogin).
module.exports = rutaLogin;
