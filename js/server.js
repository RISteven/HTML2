// Importamos Express, el framework que nos permite crear el servidor web.
const express = require('express');

// Importamos body-parser, que nos permite leer los datos que envían los formularios HTML.
const bodyParser = require('body-parser');

// Importamos "path", un módulo de Node que nos ayuda a construir rutas de carpetas
// de forma compatible con cualquier sistema operativo.
const path = require('path');

// Importamos las rutas de login y usuarios que definimos en archivos separados.
// El ".." significa "subir una carpeta" (desde js/ hacia la raíz del proyecto).
const loginRoutes    = require('../routes/login');
const usuarioRoutes  = require('../routes/usuarios');

// Creamos la aplicación Express. Esta es la base de todo el servidor.
const app = express();

// Le decimos a Express que entienda formularios enviados desde HTML (formato URL).
app.use(bodyParser.urlencoded({ extended: true }));

// Le decimos a Express que entienda datos enviados en formato JSON (el que usa fetch()).
app.use(bodyParser.json());

// Le indicamos a Express que sirva los archivos HTML, CSS e imágenes de la carpeta "public".
// path.join construye la ruta: sube una carpeta con ".." y entra a "public".
app.use(express.static(path.join(__dirname, '..', 'public')));

// Servimos también la carpeta "css" para que los estilos sean accesibles desde el navegador.
app.use('/css', express.static(path.join(__dirname, '..', 'css')));

// Registramos las rutas de login bajo el prefijo /api.
// Ejemplo: POST /api/login
app.use('/api', loginRoutes);

// Registramos las rutas de usuarios bajo el prefijo /api.
// Ejemplo: GET /api/usuarios, POST /api/usuarios, etc.
app.use('/api', usuarioRoutes);

// Ponemos el servidor a escuchar en el puerto 3000.
// Cuando arranque, muestra un mensaje en la terminal para confirmar que está activo.
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
