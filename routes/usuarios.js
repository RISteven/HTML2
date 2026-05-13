// ============================================================
//  routes/usuarios.js — Rutas CRUD de usuarios
//  Programación 2 (PR2) — Universidad Columbia del Paraguay
//
//  Endpoints disponibles:
//    GET    /api/usuarios          → Listar todos los usuarios
//    POST   /api/usuarios          → Crear un usuario nuevo
//    PUT    /api/usuarios/:nombre  → Actualizar contraseña por nombre
//    DELETE /api/usuarios/:nombre  → Eliminar un usuario por nombre
//
//  CRUD = Create (POST) / Read (GET) / Update (PUT) / Delete (DELETE)
// ============================================================

// express: necesario para crear el enrutador (agrupador de rutas).
const express = require('express');

// oracledb: librería que abre la conexión con Oracle XE.
const oracledb = require('oracledb');

// Importamos los datos de conexión (usuario, clave, PDB) desde js/db.js.
const configuracionBaseDatos = require('../js/db');

// Creamos el enrutador que agrupará todas las operaciones sobre usuarios.
const rutasDeUsuarios = express.Router();


// ════════════════════════════════════════════════════════════
//  LISTAR — GET /api/usuarios
//  El navegador pide la lista completa de usuarios registrados.
//  Respuesta: { exito: true, usuarios: [ {...}, {...} ] }
// ════════════════════════════════════════════════════════════
rutasDeUsuarios.get('/usuarios', async (peticion, respuesta) => {

    // Declaramos la variable fuera del try para poder cerrarla en finally.
    let conexionOracle;

    try {
        // PASO 1: Abrimos la conexión a Oracle XE.
        conexionOracle = await oracledb.getConnection(configuracionBaseDatos);

        // PASO 2: Definimos el SQL de consulta.
        // No pedimos "passw" por seguridad — las contraseñas nunca se envían al navegador.
        const consultaListarUsuarios = `
            SELECT id_usuario,
                   nombre,
                   apellido,
                   email,
                   fecha_creacion,
                   estado
            FROM   usuarios
            ORDER  BY id_usuario
        `;

        // PASO 3: Ejecutamos la consulta.
        // outFormat OBJECT → cada fila llega como { ID_USUARIO: 1, NOMBRE: "Ana", ... }
        const resultadoConsulta = await conexionOracle.execute(
            consultaListarUsuarios,
            [],                                             // Sin parámetros en este SELECT
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        // PASO 4: Enviamos la lista al navegador en formato JSON.
        const listaDeUsuarios = resultadoConsulta.rows;
        respuesta.json({ exito: true, usuarios: listaDeUsuarios });

    } catch (errorDeOracle) {
        console.error('[USUARIOS - GET] Error:', errorDeOracle.message);
        respuesta.status(500).json({
            exito:  false,
            mensaje: 'Error al listar usuarios: ' + errorDeOracle.message
        });

    } finally {
        // Siempre cerramos la conexión, haya error o no.
        if (conexionOracle) await conexionOracle.close();
    }
});


// ════════════════════════════════════════════════════════════
//  CREAR (ALTA) — POST /api/usuarios
//  El formulario "crear.html" envía los datos del nuevo usuario.
//  Recibe (JSON): { nombre, apellido, email, passw }
//  Respuesta:     { exito: true, mensaje: "..." }
// ════════════════════════════════════════════════════════════
rutasDeUsuarios.post('/usuarios', async (peticion, respuesta) => {

    // Extraemos los datos enviados desde el formulario HTML.
    const datosDelNuevoUsuario = {
        nombre:   peticion.body.nombre,
        apellido: peticion.body.apellido,
        email:    peticion.body.email,
        passw:    peticion.body.passw
    };

    // Validación: todos los campos son obligatorios.
    const { nombre, apellido, email, passw } = datosDelNuevoUsuario;
    if (!nombre || !apellido || !email || !passw) {
        return respuesta.status(400).json({
            exito:  false,
            mensaje: 'Todos los campos son obligatorios (nombre, apellido, email, passw)'
        });
    }

    let conexionOracle;

    try {
        // PASO 1: Abrimos conexión.
        conexionOracle = await oracledb.getConnection(configuracionBaseDatos);

        // PASO 2: Definimos el SQL de inserción.
        // Los :parametros son seguros contra inyección SQL.
        const consultaInsertarUsuario = `
            INSERT INTO usuarios (nombre, apellido, email, passw)
            VALUES (:nombre, :apellido, :email, :passw)
        `;

        // PASO 3: Ejecutamos el INSERT.
        // autoCommit: true → confirma el cambio en Oracle automáticamente (sin rollback manual).
        const resultadoInsercion = await conexionOracle.execute(
            consultaInsertarUsuario,
            datosDelNuevoUsuario,
            { autoCommit: true }
        );

        // PASO 4: Confirmamos cuántas filas se insertaron.
        const filasInsertadas = resultadoInsercion.rowsAffected;
        respuesta.json({
            exito:          true,
            mensaje:        'Usuario creado correctamente',
            filasInsertadas: filasInsertadas
        });

    } catch (errorDeOracle) {
        // ORA-00001 = constraint única violada (email o nombre ya existe).
        if (errorDeOracle.message.includes('ORA-00001')) {
            return respuesta.status(409).json({
                exito:  false,
                mensaje: 'Ya existe un usuario con ese nombre o email'
            });
        }
        console.error('[USUARIOS - POST] Error:', errorDeOracle.message);
        respuesta.status(500).json({
            exito:  false,
            mensaje: 'Error al crear usuario: ' + errorDeOracle.message
        });

    } finally {
        if (conexionOracle) await conexionOracle.close();
    }
});


// ════════════════════════════════════════════════════════════
//  MODIFICAR — PUT /api/usuarios/:nombre
//  El formulario "actualizar.html" envía el nombre y la nueva clave.
//  URL ejemplo:   PUT /api/usuarios/Richard
//  Recibe (JSON): { passw: "nuevaClave" }
//  Respuesta:     { exito: true, mensaje: "..." }
// ════════════════════════════════════════════════════════════
rutasDeUsuarios.put('/usuarios/:nombre', async (peticion, respuesta) => {

    // Leemos el nombre desde la URL: /api/usuarios/Richard → "Richard"
    const nombreAModificar = peticion.params.nombre;

    // Leemos la nueva contraseña del cuerpo de la petición.
    const nuevaContrasena  = peticion.body.passw;

    if (!nuevaContrasena) {
        return respuesta.status(400).json({
            exito:  false,
            mensaje: 'La nueva contraseña es obligatoria'
        });
    }

    let conexionOracle;

    try {
        // PASO 1: Abrimos conexión.
        conexionOracle = await oracledb.getConnection(configuracionBaseDatos);

        // PASO 2: SQL de actualización.
        const consultaActualizarContrasena = `
            UPDATE usuarios
            SET    passw = :nuevaContrasena
            WHERE  nombre = :nombreAModificar
        `;

        // PASO 3: Ejecutamos el UPDATE.
        const resultadoActualizacion = await conexionOracle.execute(
            consultaActualizarContrasena,
            { nuevaContrasena, nombreAModificar },
            { autoCommit: true }
        );

        // PASO 4: Verificamos si se modificó algo.
        // rowsAffected = 0 → el nombre no existe en la tabla.
        if (resultadoActualizacion.rowsAffected === 0) {
            return respuesta.status(404).json({
                exito:  false,
                mensaje: `No se encontró ningún usuario con el nombre "${nombreAModificar}"`
            });
        }

        respuesta.json({ exito: true, mensaje: 'Contraseña actualizada correctamente' });

    } catch (errorDeOracle) {
        console.error('[USUARIOS - PUT] Error:', errorDeOracle.message);
        respuesta.status(500).json({
            exito:  false,
            mensaje: 'Error al actualizar usuario: ' + errorDeOracle.message
        });

    } finally {
        if (conexionOracle) await conexionOracle.close();
    }
});


// ════════════════════════════════════════════════════════════
//  ELIMINAR (BAJA) — DELETE /api/usuarios/:nombre
//  El formulario "eliminar.html" confirma la eliminación.
//  URL ejemplo:  DELETE /api/usuarios/Richard
//  Respuesta:    { exito: true, mensaje: "..." }
// ════════════════════════════════════════════════════════════
rutasDeUsuarios.delete('/usuarios/:nombre', async (peticion, respuesta) => {

    // Leemos el nombre desde la URL: /api/usuarios/Richard → "Richard"
    const nombreAEliminar = peticion.params.nombre;

    let conexionOracle;

    try {
        // PASO 1: Abrimos conexión.
        conexionOracle = await oracledb.getConnection(configuracionBaseDatos);

        // PASO 2: SQL de eliminación.
        const consultaEliminarUsuario = `
            DELETE FROM usuarios
            WHERE  nombre = :nombreAEliminar
        `;

        // PASO 3: Ejecutamos el DELETE.
        const resultadoEliminacion = await conexionOracle.execute(
            consultaEliminarUsuario,
            { nombreAEliminar },
            { autoCommit: true }
        );

        // PASO 4: Verificamos si se eliminó algo.
        if (resultadoEliminacion.rowsAffected === 0) {
            return respuesta.status(404).json({
                exito:  false,
                mensaje: `No se encontró ningún usuario con el nombre "${nombreAEliminar}"`
            });
        }

        respuesta.json({ exito: true, mensaje: 'Usuario eliminado correctamente' });

    } catch (errorDeOracle) {
        console.error('[USUARIOS - DELETE] Error:', errorDeOracle.message);
        respuesta.status(500).json({
            exito:  false,
            mensaje: 'Error al eliminar usuario: ' + errorDeOracle.message
        });

    } finally {
        // Cerramos la conexión siempre, incluso si hubo un error.
        if (conexionOracle) await conexionOracle.close();
    }
});


// Exportamos el enrutador para que server.js lo registre con app.use('/api', rutasDeUsuarios).
module.exports = rutasDeUsuarios;
