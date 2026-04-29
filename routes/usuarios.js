// Importamos Express para crear el enrutador con las rutas CRUD de usuarios.
const express = require('express');

// Importamos oracledb para conectarnos a la base de datos Oracle.
const oracledb = require('oracledb');

// Importamos la configuración de conexión desde js/db.js.
const configuracion = require('../js/db');

// Creamos el enrutador que agrupará todas las operaciones sobre usuarios.
const enrutador = express.Router();

// ─────────────────────────────────────────────────────────────
// LISTAR — GET /api/usuarios
// Se activa cuando el navegador pide la lista de todos los usuarios.
// ─────────────────────────────────────────────────────────────
enrutador.get('/usuarios', async (peticion, respuesta) => {
  try {
    // Abrimos conexión a Oracle.
    const conexion = await oracledb.getConnection(configuracion);

    // Ejecutamos el SELECT. Pedimos todas las columnas excepto la contraseña.
    // ORDER BY id_usuario ordena la lista de menor a mayor ID.
    // OUT_FORMAT_OBJECT devuelve cada fila como un objeto { NOMBRE: "...", EMAIL: "..." }
    // en lugar de un array [ "...", "..." ], lo que hace más fácil acceder a los datos.
    const resultado = await conexion.execute(
      `SELECT id_usuario, nombre, apellido, email, fecha_creacion, estado
         FROM usuarios
        ORDER BY id_usuario`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // Cerramos la conexión.
    await conexion.close();

    // Enviamos al navegador el listado de usuarios en formato JSON.
    respuesta.json({ exito: true, usuarios: resultado.rows });

  } catch (error) {
    // Si falla, informamos el error con código HTTP 500 (error interno del servidor).
    respuesta.status(500).json({ exito: false, mensaje: 'Error al listar: ' + error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// GUARDAR (ALTA) — POST /api/usuarios
// Se activa cuando el formulario "crear.html" envía los datos del nuevo usuario.
// ─────────────────────────────────────────────────────────────
enrutador.post('/usuarios', async (peticion, respuesta) => {

  // Extraemos los datos del cuerpo de la petición (lo que envió el formulario).
  const { nombre, apellido, email, passw } = peticion.body;

  try {
    // Abrimos conexión a Oracle.
    const conexion = await oracledb.getConnection(configuracion);

    // Ejecutamos el INSERT para agregar el nuevo usuario.
    // Los parámetros con ":" son seguros y evitan inyección SQL.
    // autoCommit: true confirma el cambio en la base de datos automáticamente.
    await conexion.execute(
      `INSERT INTO usuarios (nombre, apellido, email, passw)
       VALUES (:nombre, :apellido, :email, :passw)`,
      { nombre, apellido, email, passw },
      { autoCommit: true }
    );

    // Cerramos la conexión.
    await conexion.close();

    // Informamos al navegador que el usuario fue guardado correctamente.
    respuesta.json({ exito: true, mensaje: 'Usuario guardado correctamente' });

  } catch (error) {
    respuesta.status(500).json({ exito: false, mensaje: 'Error al guardar: ' + error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// MODIFICAR — PUT /api/usuarios/:nombre
// Se activa cuando "actualizar.html" envía los datos a modificar.
// El ":nombre" en la URL es un parámetro dinámico. Ejemplo: /api/usuarios/Richard
// ─────────────────────────────────────────────────────────────
enrutador.put('/usuarios/:nombre', async (peticion, respuesta) => {

  // Leemos el nombre desde la URL (peticion.params).
  const { nombre } = peticion.params;

  // Leemos la nueva contraseña desde el cuerpo de la petición (peticion.body).
  const { passw } = peticion.body;

  try {
    // Abrimos conexión a Oracle.
    const conexion = await oracledb.getConnection(configuracion);

    // Ejecutamos el UPDATE para cambiar la contraseña del usuario indicado.
    const resultado = await conexion.execute(
      `UPDATE usuarios SET passw = :passw WHERE nombre = :nombre`,
      { passw, nombre },
      { autoCommit: true }
    );

    // Cerramos la conexión.
    await conexion.close();

    // "rowsAffected" indica cuántas filas fueron modificadas.
    // Si es 0, significa que no existe un usuario con ese nombre.
    if (resultado.rowsAffected === 0) {
      return respuesta.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
    }

    // Si llegamos aquí, la modificación fue exitosa.
    respuesta.json({ exito: true, mensaje: 'Usuario modificado correctamente' });

  } catch (error) {
    respuesta.status(500).json({ exito: false, mensaje: 'Error al modificar: ' + error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// ELIMINAR (BAJA) — DELETE /api/usuarios/:nombre
// Se activa cuando "eliminar.html" confirma la eliminación.
// ─────────────────────────────────────────────────────────────
enrutador.delete('/usuarios/:nombre', async (peticion, respuesta) => {

  // Leemos el nombre desde la URL.
  const { nombre } = peticion.params;

  try {
    // Abrimos conexión a Oracle.
    const conexion = await oracledb.getConnection(configuracion);

    // Ejecutamos el DELETE para eliminar el usuario con ese nombre.
    const resultado = await conexion.execute(
      `DELETE FROM usuarios WHERE nombre = :nombre`,
      { nombre },
      { autoCommit: true }
    );

    // Cerramos la conexión.
    await conexion.close();

    // Si no se eliminó ninguna fila, el usuario no existía.
    if (resultado.rowsAffected === 0) {
      return respuesta.status(404).json({ exito: false, mensaje: 'Usuario no encontrado' });
    }

    // Eliminación exitosa.
    respuesta.json({ exito: true, mensaje: 'Usuario eliminado correctamente' });

  } catch (error) {
    respuesta.status(500).json({ exito: false, mensaje: 'Error al eliminar: ' + error.message });
  }
});

// Exportamos el enrutador para que server.js pueda registrarlo.
module.exports = enrutador;
