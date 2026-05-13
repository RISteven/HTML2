// ============================================================
//  server.js — Punto de entrada del servidor
//  Programación 2 (PR2) — Universidad Columbia del Paraguay
//
//  Cómo iniciar el servidor (desde la carpeta js/):
//    Desarrollo:  npm run dev   (reinicia automáticamente con nodemon)
//    Producción:  npm start     (o: node server.js)
//
//  Puerto: 3000  →  http://localhost:3000
// ============================================================

// express: framework que nos permite crear un servidor web en Node.js con pocas líneas.
const express = require('express');

// body-parser: interpreta los datos que envían los formularios HTML y el fetch() del navegador.
const bodyParser = require('body-parser');

// path: módulo de Node.js para construir rutas de carpetas de forma segura en cualquier SO.
const path = require('path');

// Importamos los grupos de rutas (cada archivo maneja un recurso de la API).
const rutasDeLogin    = require('../routes/login');     // POST /api/login
const rutasDeUsuarios = require('../routes/usuarios');  // GET / POST / PUT / DELETE /api/usuarios

// ── CONSTANTES DE CONFIGURACIÓN ────────────────────────────
const PUERTO           = 3000;
const CARPETA_PUBLICA  = path.join(__dirname, '..', 'public');  // Archivos HTML del navegador
const CARPETA_ESTILOS  = path.join(__dirname, '..', 'css');     // Archivos CSS compartidos

// ── CREAR LA APLICACIÓN EXPRESS ────────────────────────────
const app = express();

// ── MIDDLEWARES ─────────────────────────────────────────────
// Un middleware es código que se ejecuta ANTES de que la petición llegue a la ruta.

// Permite que Express lea datos de formularios HTML (enviados con method="POST").
app.use(bodyParser.urlencoded({ extended: true }));

// Permite que Express lea datos en formato JSON (enviados con fetch() y Content-Type: application/json).
app.use(bodyParser.json());

// Sirve los archivos de la carpeta public/ directamente al navegador (HTML, JS del cliente, imágenes).
app.use(express.static(CARPETA_PUBLICA));

// Sirve los archivos CSS bajo la ruta /css (accesible como <link href="/css/styles.css">).
app.use('/css', express.static(CARPETA_ESTILOS));

// ── REGISTRO DE RUTAS DE LA API ────────────────────────────
// Todas las rutas de login.js    quedan bajo: /api/login
// Todas las rutas de usuarios.js quedan bajo: /api/usuarios
app.use('/api', rutasDeLogin);
app.use('/api', rutasDeUsuarios);

// ── ARRANCAR EL SERVIDOR ────────────────────────────────────
// El servidor empieza a escuchar peticiones HTTP en el PUERTO definido.
app.listen(PUERTO, () => {
    console.log('');
    console.log('  ┌─────────────────────────────────────────────────┐');
    console.log('  │  SERVIDOR ACTIVO — Universidad Columbia del Py. │');
    console.log('  ├─────────────────────────────────────────────────┤');
    console.log(`  │  App:  http://localhost:${PUERTO}                     │`);
    console.log(`  │  API:  http://localhost:${PUERTO}/api                 │`);
    console.log('  │  BD:   Oracle XE 21c — XEPDB1                   │');
    console.log('  └─────────────────────────────────────────────────┘');
    console.log('');
});
