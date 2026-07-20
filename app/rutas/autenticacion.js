const express = require('express');
const router = express.Router();
const { conexionEsclavo } = require('../conexionBD');

// Mostrar Login
router.get('/login', (req, res) => {
    if (req.session.usuario) {
        return res.redirect(req.session.usuario.rol === 'admin' ? '/admin' : '/cliente');
    }
    res.render('login', { error: null });
});

// Procesar Login
router.post('/login', async (req, res) => {
    const { usuario, clave } = req.body;

    try {
        const [filas] = await conexionEsclavo.query(
            'SELECT * FROM usuarios WHERE usuario = ? AND clave = ?',
            [usuario, clave]
        );

        if (filas.length === 0) {
            return res.render('login', { error: 'Credenciales incorrectas' });
        }

        const usuarioEncontrado = filas[0];
        req.session.usuario = {
            id: usuarioEncontrado.id,
            nombre: usuarioEncontrado.nombre_completo,
            rol: usuarioEncontrado.rol
        };

        if (usuarioEncontrado.rol === 'admin') {
            res.redirect('/admin');
        } else {
            res.redirect('/cliente');
        }
    } catch (err) {
        console.error('Error en login:', err);
        res.render('login', { error: 'Error interno en la base de datos' });
    }
});

// Cierre de sesión
router.get('/salir', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login');
    });
});

module.exports = router;