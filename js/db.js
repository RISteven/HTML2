// Importamos el módulo oracledb, que es la librería que nos permite
// conectar Node.js con una base de datos Oracle.
const oracledb = require('oracledb');

// Definimos un objeto llamado "configuracion" con los datos de conexión.
// Estos datos los proporciona el administrador de la base de datos.
const configuracion = {
  user:          "prg2",             // Usuario de Oracle
  password:      "curso2026",        // Contraseña del usuario
  connectString: "localhost/XEPDB1"  // Dirección del servidor Oracle (XEPDB1 es la base de datos)
};

// Exportamos el objeto para poder usarlo en otros archivos del proyecto.
module.exports = configuracion;
