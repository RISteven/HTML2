// Importamos Express para poder crear un enrutador (grupo de rutas).
const express = require('express');

// Importamos oracledb para conectarnos a la base de datos Oracle.
const oracledb = require('oracledb');

// Importamos la configuración de conexión definida en js/db.js.
const configuracion = require('../js/db');

// Creamos un enrutador de Express. Es como un mini-servidor que agrupa rutas relacionadas.
const enrutador = express.Router();

// Definimos la ruta POST /login. Se activa cuando el formulario de acceso envía los datos.
// "async" indica que la función puede usar "await" para esperar operaciones lentas (como la BD).
enrutador.post('/login', async (peticion, respuesta) => {

  // Extraemos el usuario y la clave que el usuario escribió en el formulario.
  // "peticion.body" contiene los datos enviados desde el navegador.
  const { usuario, clave } = peticion.body;

  try {
    // Abrimos una conexión a la base de datos Oracle usando la configuración.
    const conexion = await oracledb.getConnection(configuracion);

    // Ejecutamos una consulta SQL para buscar el usuario con ese nombre y contraseña.
    // Los ":usuario" y ":passw" son parámetros seguros (evitan inyección SQL).
    const resultado = await conexion.execute(
      `SELECT * FROM usuarios WHERE nombre = :usuario AND passw = :passw`,
      { usuario: usuario, passw: clave }  // Vinculamos las variables del formulario al SQL
    );

    // Cerramos la conexión a la base de datos para liberar recursos.
    await conexion.close();

    // Si encontramos al menos una fila, el usuario existe y la clave es correcta.
    if (resultado.rows.length > 0) {
      // Respondemos con éxito y enviamos el nombre del usuario al navegador.
      respuesta.json({ success: true, usuario });
    } else {
      // Si no hay filas, las credenciales son incorrectas. Respondemos con error 401.
      respuesta.status(401).json({ success: false, message: "Credenciales incorrectas" });
    }

  } catch (error) {
    // Si ocurre cualquier error inesperado, lo mostramos en la terminal del servidor
    // y enviamos el mensaje de error al navegador para facilitar el diagnóstico.
    console.error('Error en login:', error.message);
    respuesta.status(500).json({ success: false, message: error.message });
  }
});

// Exportamos el enrutador para que server.js pueda usarlo.
module.exports = enrutador;
