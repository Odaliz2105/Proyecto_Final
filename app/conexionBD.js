const mysql = require('mysql2/promise');

const conexionMaestro = mysql.createPool({
    host: process.env.BD_HOST_ESCRITURA || 'servidor-maestro',
    port: 3306,
    user: 'root',
    password: 'rootpass123',
    database: 'recetas_db',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10
});

const conexionEsclavo = mysql.createPool({
    host: process.env.BD_HOST_LECTURA || 'servidor-esclavo',
    port: 3306,
    user: 'root',
    password: 'rootpass123',
    database: 'recetas_db',
    charset: 'utf8mb4',
    waitForConnections: true,
    connectionLimit: 10
});

module.exports = { conexionMaestro, conexionEsclavo };