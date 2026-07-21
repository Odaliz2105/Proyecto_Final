const express = require('express');
const router = express.Router();

const {
    conexionMaestro,
    conexionEsclavo
} = require('../conexionBD');

// Middleware para proteger rutas
const esAdmin = (req, res, next) => {
    if (
        req.session.usuario &&
        req.session.usuario.rol === 'admin'
    ) {
        return next();
    }
    res.redirect('/login');
};
const esCliente = (req, res, next) => {
    if (
        req.session.usuario &&
        req.session.usuario.rol === 'cliente'
    ) {
        return next();
    }
    res.redirect('/login');
};
// Redirección inicial
router.get('/', (req, res) => {
    if (!req.session.usuario) {
        return res.redirect('/login');
    }
    res.redirect(
        req.session.usuario.rol === 'admin'
            ? '/admin' : '/cliente'
    );
});

// ROL ADMINISTRADOR: CRUD DE PRODUCTOS
// Mostrar productos
router.get('/admin', esAdmin, async (req, res) => {
    try {
        const [productos] = await conexionEsclavo.query(
            'SELECT * FROM productos ORDER BY id DESC'
        );
        res.render('panel-admin', {
            productos,
            error: null,
            exito: null
        });
    } catch (err) {
        console.error(err);
        res.render('panel-admin', {
            productos: [],
            error: 'Error al consultar el inventario.',
            exito: null
        });
    }
});

// Crear producto con validación de código duplicado
router.post('/admin/crear', esAdmin, async (req, res) => {
    const { codigo, nombre, descripcion, categoria, unidad, stock, precio, imagen_url } = req.body;
    try {
        // Se consulta el maestro para evitar problemas
        // por retrasos en la replicación.
        const [existe] = await conexionMaestro.query(
            'SELECT id FROM productos WHERE codigo = ?',
            [codigo]
        );
        if (existe.length > 0) {
            const [productos] = await conexionEsclavo.query(
                'SELECT * FROM productos ORDER BY id DESC'
            );
            return res.render('panel-admin', {
                productos,
                error: `El código "${codigo}" ya está registrado. Ingresa uno diferente.`,
                exito: null
            });
        }
        await conexionMaestro.query(
            `INSERT INTO productos (codigo,nombre,descripcion,categoria,unidad,stock,precio,imagen_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [codigo, nombre, descripcion || null, categoria, unidad, stock || 0, precio || 0, imagen_url || null]
        );
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            const [productos] = await conexionEsclavo.query(
                'SELECT * FROM productos ORDER BY id DESC'
            );
            return res.render('panel-admin', {
                productos,
                error: `El código "${codigo}" ya está registrado.`,
                exito: null
            });
        }
        res.redirect('/admin');
    }
});

// Obtener un producto en JSON
// Se utiliza en el modal para ver o editar
router.get('/admin/producto/:id', esAdmin, async (req, res) => {
    try {
        const [filas] = await conexionEsclavo.query(
            'SELECT * FROM productos WHERE id = ?',
            [req.params.id]
        );
        if (filas.length === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado.'
            });
        }
        res.json(filas[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Error al consultar el producto.'
        });
    }
});

// Actualizar producto
router.post('/admin/editar/:id', esAdmin, async (req, res) => {
    const { codigo, nombre, descripcion, categoria, unidad, stock, precio, imagen_url } = req.body;
    const { id } = req.params;
    try {
        // Validar que el código no pertenezca
        // a otro producto diferente.
        const [existe] = await conexionMaestro.query(
            `SELECT id
             FROM productos
             WHERE codigo = ?
             AND id <> ?`,
            [codigo, id]
        );
        if (existe.length > 0) {
            const [productos] = await conexionEsclavo.query(
                'SELECT * FROM productos ORDER BY id DESC'
            );
            return res.render('panel-admin', {
                productos,
                error: `El código "${codigo}" ya pertenece a otro producto.`,
                exito: null
            });
        }
        await conexionMaestro.query(
            `UPDATE productos
             SET codigo = ?,nombre = ?,descripcion = ?,categoria = ?,unidad = ?,stock = ?,precio = ?,imagen_url = ? WHERE id = ?`,
            [
                codigo, nombre, descripcion || null, categoria, unidad, stock || 0, precio || 0, imagen_url || null, id
            ]
        );
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

// Eliminar producto
router.get('/admin/eliminar/:id', esAdmin, async (req, res) => {
    try {
        await conexionMaestro.query(
            'DELETE FROM productos WHERE id = ?',
            [req.params.id]
        );
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.redirect('/admin');
    }
});

// ROL CLIENTE: CONSULTA DE PRODUCTOS
router.get('/cliente', esCliente, async (req, res) => {
    const categoriaFiltro =
        req.query.categoria || '';
    let sql = `
        SELECT *
        FROM productos
        WHERE disponible = 1
    `;
    const parametros = [];
    if (categoriaFiltro) {
        sql += ' AND categoria = ?';
        parametros.push(categoriaFiltro);
    }
    sql += ' ORDER BY nombre ASC';
    try {
        const [productos] = await conexionEsclavo.query(
            sql,
            parametros
        );
        res.render('catalogo-cliente', {
            productos,
            categoriaFiltro
        });
    } catch (err) {
        console.error(err);
        res.render('catalogo-cliente', {
            productos: [],
            categoriaFiltro: ''
        });
    }
});

// Obtener el detalle de un producto disponible
router.get('/cliente/producto/:id', esCliente, async (req, res) => {
    try {
        const [filas] = await conexionEsclavo.query(
            `SELECT *
             FROM productos
             WHERE id = ?
             AND disponible = 1`,
            [req.params.id]
        );
        if (filas.length === 0) {
            return res.status(404).json({
                error: 'Producto no disponible.'
            });
        }
        res.json(filas[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Error al consultar el producto.'
        });
    }
});

module.exports = router;