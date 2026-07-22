const express = require('express');
const router = express.Router();
const { conexionMaestro } = require('../conexionBD');

// Middleware para proteger rutas del cliente
const esCliente = (req, res, next) => {
    if (req.session.usuario && req.session.usuario.rol === 'cliente') {
        return next();
    }
    res.redirect('/login');
};

// 3. GET /carrito
router.get('/carrito', esCliente, async (req, res) => {
    const usuarioId = req.session.usuario.id;
    const mensaje = req.query.mensaje || null;
    const error = req.query.error || null;

    try {
        const [carritos] = await conexionMaestro.query(
            'SELECT id FROM carritos WHERE usuario_id = ? AND estado = "activo"',
            [usuarioId]
        );

        if (carritos.length === 0) {
            return res.render('carrito', { detalles: [], total: 0, mensaje, error });
        }

        const carritoId = carritos[0].id;

        const [detalles] = await conexionMaestro.query(
            `SELECT
                cd.id AS detalle_id,
                cd.producto_id,
                cd.cantidad,
                p.codigo,
                p.nombre,
                p.imagen_url,
                p.unidad,
                p.precio,
                p.stock,
                (cd.cantidad * p.precio) AS subtotal
            FROM carrito_detalles cd
            INNER JOIN productos p ON p.id = cd.producto_id
            WHERE cd.carrito_id = ?
            ORDER BY p.nombre ASC`,
            [carritoId]
        );

        const total = detalles.reduce((sum, item) => sum + Number(item.subtotal), 0);

        res.render('carrito', { detalles, total, mensaje, error });
    } catch (err) {
        console.error(err);
        res.render('carrito', { detalles: [], total: 0, mensaje: null, error: 'No se pudo completar la operación.' });
    }
});

// 4. POST /carrito/agregar/:productoId
router.post('/carrito/agregar/:productoId', esCliente, async (req, res) => {
    const usuarioId = req.session.usuario.id;
    const productoId = req.params.productoId;

    try {
        const [productos] = await conexionMaestro.query(
            'SELECT id, stock FROM productos WHERE id = ?',
            [productoId]
        );

        if (productos.length === 0 || productos[0].stock <= 0) {
            return res.redirect('/cliente?error=No puedes agregar más unidades que el stock disponible.');
        }

        const stockActual = productos[0].stock;

        let [carritos] = await conexionMaestro.query(
            'SELECT id FROM carritos WHERE usuario_id = ? AND estado = "activo"',
            [usuarioId]
        );

        let carritoId;
        if (carritos.length === 0) {
            const [result] = await conexionMaestro.query(
                'INSERT INTO carritos (usuario_id, estado) VALUES (?, "activo")',
                [usuarioId]
            );
            carritoId = result.insertId;
        } else {
            carritoId = carritos[0].id;
        }

        const [detalles] = await conexionMaestro.query(
            'SELECT id, cantidad FROM carrito_detalles WHERE carrito_id = ? AND producto_id = ?',
            [carritoId, productoId]
        );

        if (detalles.length === 0) {
            await conexionMaestro.query(
                'INSERT INTO carrito_detalles (carrito_id, producto_id, cantidad) VALUES (?, ?, 1)',
                [carritoId, productoId]
            );
        } else {
            const nuevaCantidad = detalles[0].cantidad + 1;
            if (nuevaCantidad > stockActual) {
                return res.redirect('/cliente?error=No puedes agregar más unidades que el stock disponible.');
            }
            await conexionMaestro.query(
                'UPDATE carrito_detalles SET cantidad = ? WHERE id = ?',
                [nuevaCantidad, detalles[0].id]
            );
        }

        res.redirect('/cliente?mensaje=Producto agregado al carrito.');
    } catch (err) {
        console.error(err);
        res.redirect('/cliente?error=No se pudo completar la operación.');
    }
});

// 5. POST /carrito/actualizar/:detalleId
router.post('/carrito/actualizar/:detalleId', esCliente, async (req, res) => {
    const usuarioId = req.session.usuario.id;
    const detalleId = req.params.detalleId;
    const cantidad = parseInt(req.body.cantidad, 10);

    if (isNaN(cantidad) || cantidad < 1) {
        return res.redirect('/carrito?error=La cantidad no es válida.');
    }

    try {
        const [detalles] = await conexionMaestro.query(
            `SELECT cd.id, cd.cantidad, p.stock 
             FROM carrito_detalles cd
             INNER JOIN carritos c ON c.id = cd.carrito_id
             INNER JOIN productos p ON p.id = cd.producto_id
             WHERE cd.id = ? AND c.usuario_id = ? AND c.estado = 'activo'`,
            [detalleId, usuarioId]
        );

        if (detalles.length === 0) {
            return res.redirect('/carrito?error=No se pudo completar la operación.');
        }

        const stockActual = detalles[0].stock;
        if (cantidad > stockActual) {
            return res.redirect('/carrito?error=La cantidad seleccionada supera el stock disponible.');
        }

        await conexionMaestro.query(
            'UPDATE carrito_detalles SET cantidad = ? WHERE id = ?',
            [cantidad, detalleId]
        );

        res.redirect('/carrito?mensaje=Cantidad actualizada.');
    } catch (err) {
        console.error(err);
        res.redirect('/carrito?error=No se pudo completar la operación.');
    }
});

// 6. POST /carrito/eliminar/:detalleId
router.post('/carrito/eliminar/:detalleId', esCliente, async (req, res) => {
    const usuarioId = req.session.usuario.id;
    const detalleId = req.params.detalleId;

    try {
        const [detalles] = await conexionMaestro.query(
            `SELECT cd.id 
             FROM carrito_detalles cd
             INNER JOIN carritos c ON c.id = cd.carrito_id
             WHERE cd.id = ? AND c.usuario_id = ? AND c.estado = 'activo'`,
            [detalleId, usuarioId]
        );

        if (detalles.length === 0) {
            return res.redirect('/carrito?error=No se pudo completar la operación.');
        }

        await conexionMaestro.query(
            'DELETE FROM carrito_detalles WHERE id = ?',
            [detalleId]
        );

        res.redirect('/carrito?mensaje=Producto eliminado del carrito.');
    } catch (err) {
        console.error(err);
        res.redirect('/carrito?error=No se pudo completar la operación.');
    }
});

// 7. POST /carrito/vaciar
router.post('/carrito/vaciar', esCliente, async (req, res) => {
    const usuarioId = req.session.usuario.id;

    try {
        const [carritos] = await conexionMaestro.query(
            'SELECT id FROM carritos WHERE usuario_id = ? AND estado = "activo"',
            [usuarioId]
        );

        if (carritos.length > 0) {
            await conexionMaestro.query(
                'DELETE FROM carrito_detalles WHERE carrito_id = ?',
                [carritos[0].id]
            );
        }

        res.redirect('/carrito?mensaje=Carrito vaciado.');
    } catch (err) {
        console.error(err);
        res.redirect('/carrito?error=No se pudo completar la operación.');
    }
});

module.exports = router;
