// Lógica del modal de detalle y edición de productos
let idProductoActual = null;

async function abrirDetalle(id) {
    idProductoActual = id;

    try {
        const respuesta = await fetch(`/admin/producto/${id}`);

        if (!respuesta.ok) {
            alert('No se pudo cargar el producto.');
            return;
        }

        const producto = await respuesta.json();

        rellenarDetalle(producto);
        rellenarFormularioEdicion(producto);
        mostrarDetalle();

        document
            .getElementById('modal-fondo')
            .classList.add('activo');

    } catch (err) {
        console.error(err);
        alert('Error de conexión al consultar el producto.');
    }
}

function rellenarDetalle(producto) {
    const imagenPorDefecto =
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';

    document.getElementById('detalle-imagen').src =
        producto.imagen_url || imagenPorDefecto;

    document.getElementById('detalle-categoria').textContent =
        producto.categoria;

    document.getElementById('detalle-nombre').textContent =
        producto.nombre;

    document.getElementById('detalle-codigo').textContent =
        'Código: ' + producto.codigo;

    document.getElementById('detalle-stock').textContent =
        producto.stock;

    document.getElementById('detalle-unidad').textContent =
        producto.unidad;

    document.getElementById('detalle-precio').textContent =
        Number(producto.precio).toFixed(2);

    document.getElementById('detalle-descripcion').textContent =
        producto.descripcion || 'Sin descripción registrada.';

    document.getElementById('detalle-eliminar').href =
        `/admin/eliminar/${producto.id}`;
}

function rellenarFormularioEdicion(producto) {
    document.getElementById('form-edicion').action =
        `/admin/editar/${producto.id}`;

    document.getElementById('editar-codigo').value =
        producto.codigo;

    document.getElementById('editar-nombre').value =
        producto.nombre;

    document.getElementById('editar-categoria').value =
        producto.categoria;

    document.getElementById('editar-unidad').value =
        producto.unidad;

    document.getElementById('editar-stock').value =
        producto.stock;

    document.getElementById('editar-precio').value =
        producto.precio;

    document.getElementById('editar-descripcion').value =
        producto.descripcion || '';

    document.getElementById('editar-imagen').value =
        producto.imagen_url || '';
}

function mostrarDetalle() {
    document.getElementById('vista-detalle').style.display =
        'block';

    document.getElementById('form-edicion').style.display =
        'none';
}

function mostrarEdicion() {
    document.getElementById('vista-detalle').style.display =
        'none';

    document.getElementById('form-edicion').style.display =
        'block';
}

function cerrarModal() {
    document
        .getElementById('modal-fondo')
        .classList.remove('activo');

    idProductoActual = null;
}

document.addEventListener('DOMContentLoaded', () => {
    const fondo = document.getElementById('modal-fondo');

    if (fondo) {
        fondo.addEventListener('click', evento => {
            if (evento.target === fondo) {
                cerrarModal();
            }
        });
    }

    document.addEventListener('keydown', evento => {
        if (evento.key === 'Escape') {
            cerrarModal();
        }
    });
});