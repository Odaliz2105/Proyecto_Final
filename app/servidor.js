require('dotenv').config();
const express = require('express');
const session = require('express-session');
const AlmacenMySQL = require('express-mysql-session')(session);
const os = require('os');
const path = require('path');

const rutasAutenticacion = require('./rutas/autenticacion');
const rutasRecetas = require('./rutas/recetas');

const app = express();

// Configuración de vistas y estáticos
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'vistas'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Manejo de Sesiones compartidas en MySQL
const opcionesSesion = {
    host: process.env.BD_HOST_ESCRITURA || 'servidor-maestro',
    port: 3306,
    user: 'root',
    password: 'rootpass123',
    database: 'recetas_db',
    schema: { tableName: 'sesiones' }
};

const almacenSesiones = new AlmacenMySQL(opcionesSesion);

app.use(session({
    secret: 'clave-secreta-epn',
    store: almacenSesiones,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 4 } // 4 horas
}));

// Pasar nombre del nodo a todas las vistas para evidenciar el balanceo
app.use((req, res, next) => {
    res.locals.nombreNodo = os.hostname();
    res.locals.usuarioSesion = req.session.usuario || null;
    next();
});

// Endpoint de prueba para el balanceador NGINX
app.get('/salud', (req, res) => {
    res.json({ estado: 'ok', nodo: os.hostname() });
});

// Rutas del sistema
app.use('/', rutasAutenticacion);
app.use('/', rutasRecetas);

// Manejo de error 404
app.use((req, res) => {
    res.status(404).render('error', { mensaje: 'Página no encontrada.' });
});

const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
    console.log(`Nodo [${os.hostname()}] activo en el puerto ${PUERTO}`);
});