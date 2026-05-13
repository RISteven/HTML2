Paso a paso: Conectar Node.js con Oracle XE y usar login
1. Instalar el cliente de Oracle para Node.js
En tu proyecto, ejecutá:

powershell
npm install oracledb
Esto instala el driver oficial de Oracle para Node.js.

2. Configurar la conexión
Crea un archivo db.js con la configuración:

javascript
const oracledb = require('oracledb');

const config = {
  user: "system",              // Usuario de Oracle
  password: "tu_contraseña",   // Contraseña definida en la instalación
  connectString: "localhost/XEPDB1" // Servicio de Oracle (puede ser XE o XEPDB1 según tu instalación)
};

module.exports = config;
3. Crear el servidor con Express
En server.js:

javascript
const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const config = require('./db');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ruta de login
app.post('/login', async (req, res) => {
  const { usuario, clave } = req.body;

  try {
    const connection = await oracledb.getConnection(config);

    // Consulta a la tabla usuario
    const result = await connection.execute(
      `SELECT * FROM usuario WHERE nombre = :usuario AND clave = :clave`,
      [usuario, clave]
    );

    await connection.close();

    if (result.rows.length > 0) {
      res.send("Login exitoso. Bienvenido " + usuario);
    } else {
      res.status(401).send("Usuario o contraseña incorrectos");
    }

  } catch (err) {
    console.error(err);
    res.status(500).send("Error en el servidor");
  }
});

app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
4. Crear el formulario HTML
En tu carpeta public/index.html:

html
<!DOCTYPE html>
<html>
<head>
  <title>Login</title>
</head>
<body>
  <form action="/login" method="POST">
    <label>Usuario:</label>
    <input type="text" name="usuario" required>
    <br>
    <label>Contraseña:</label>
    <input type="password" name="clave" required>
    <br>
    <button type="submit">Ingresar</button>
  </form>
</body>
</html>
5. Probar el login
Ejecutá el servidor:

powershell
node server.js
Abrí en el navegador:

Código
http://localhost:3000/index.html


Ahora se debe conectar node a Oracle
en la carpeta js
npm init -y
npm install express oracledb body-parser
Verifica que se instalaron
En la carpeta del proyecto deberías ver:

Código
/node_modules
package.json
package-lock.json
server.js
db.js