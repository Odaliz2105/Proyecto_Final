const express = require('express');
const router = express.Router();
const { conexionMaestro, conexionEsclavo } = require('../conexionBD');

// Middleware: solo usuarios autenticados pueden ver o editar su perfil
const estaAutenticado = (req, res, next) => {
    if (req.session.usuario) {
        return next();
    }

    res.redirect('/login');
};

// Mostrar formulario de perfil
router.get('/perfil', estaAutenticado, async (req, res) => {
    try {
        const [filas] = await conexionEsclavo.query(
            'SELECT id, usuario, nombre_completo, correo, telefono, rol FROM usuarios WHERE id = ?',
            [req.session.usuario.id]
        );

        if (filas.length === 0) {
            return res.redirect('/login');
        }

        res.render('perfil', {
            datos: filas[0],
            error: null,
            exito: null
        });
    } catch (err) {
        console.error(err);

        res.render('perfil', {
            datos: req.session.usuario,
            error: 'No se pudo cargar el perfil.',
            exito: null
        });
    }
});

// Actualizar datos del perfil
router.post('/perfil', estaAutenticado, async (req, res) => {
    const {
        nombre_completo,
        correo,
        telefono,
        clave_actual,
        clave_nueva,
        clave_confirmar
    } = req.body;

    const idUsuario = req.session.usuario.id;

    try {
        // Se consulta el maestro porque aquí se validará y actualizará información
        const [filas] = await conexionMaestro.query(
            'SELECT * FROM usuarios WHERE id = ?',
            [idUsuario]
        );

        if (filas.length === 0) {
            return res.redirect('/login');
        }

        const usuarioActual = filas[0];

        // Validar cambio de contraseña
        if (clave_actual || clave_nueva || clave_confirmar) {
            if (usuarioActual.clave !== clave_actual) {
                return res.render('perfil', {
                    datos: usuarioActual,
                    error: 'La contraseña actual no es correcta.',
                    exito: null
                });
            }

            if (clave_nueva !== clave_confirmar) {
                return res.render('perfil', {
                    datos: usuarioActual,
                    error: 'La nueva contraseña y su confirmación no coinciden.',
                    exito: null
                });
            }
        }

        const nuevaClave = clave_nueva
            ? clave_nueva
            : usuarioActual.clave;

        await conexionMaestro.query(
            'UPDATE usuarios SET nombre_completo = ?, correo = ?, telefono = ?, clave = ? WHERE id = ?',
            [
                nombre_completo,
                correo || null,
                telefono || null,
                nuevaClave,
                idUsuario
            ]
        );

        // Actualizar el nombre guardado en la sesión
        req.session.usuario.nombre = nombre_completo;

        // Se consulta el maestro para mostrar inmediatamente los datos actualizados
        const [actualizado] = await conexionMaestro.query(
            'SELECT id, usuario, nombre_completo, correo, telefono, rol FROM usuarios WHERE id = ?',
            [idUsuario]
        );

        res.render('perfil', {
            datos: actualizado[0],
            error: null,
            exito: 'Perfil actualizado correctamente.'
        });
    } catch (err) {
        console.error(err);

        res.render('perfil', {
            datos: req.session.usuario,
            error: 'Ocurrió un error al actualizar el perfil.',
            exito: null
        });
    }
});

module.exports = router;