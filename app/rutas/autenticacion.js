const express = require('express');
const router = express.Router();

const { conexionEsclavo } = require('../conexionBD');

// Mostrar login
router.get('/login', (req, res) => {

    if (req.session.usuario) {
        return res.redirect(
            req.session.usuario.rol === 'admin'
                ? '/admin'
                : '/cliente'
        );
    }

    res.render('login', {
        error: null
    });

});

// Procesar login
router.post('/login', async (req, res) => {

    const { usuario, clave } = req.body;

    try {

        const [usuarios] = await conexionEsclavo.query(
            `
                SELECT *
                FROM usuarios
                WHERE usuario = ?
                AND clave = ?
            `,
            [usuario, clave]
        );

        if (usuarios.length === 0) {
            return res.render('login', {
                error: 'Usuario o contraseña incorrectos.'
            });
        }

        const usuarioActual = usuarios[0];

        req.session.usuario = {
            id: usuarioActual.id,
            nombre: usuarioActual.nombre_completo,
            rol: usuarioActual.rol
        };

        res.redirect(
            usuarioActual.rol === 'admin'
                ? '/admin'
                : '/cliente'
        );

    } catch (error) {

        console.error(error);

        res.render('login', {
            error: 'Error interno del servidor.'
        });

    }

});

// Cerrar sesión
router.get('/salir', (req, res) => {

    req.session.destroy(() => {
        res.redirect('/');
    });

});

module.exports = router;