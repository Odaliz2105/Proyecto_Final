// Este script maneja el modal de detalle de productos
// y la acción básica de agregar al pedido.

document.addEventListener('DOMContentLoaded', () => {
    const fondo = document.getElementById('modal-fondo');

    if (fondo) {
        fondo.addEventListener('click', (evento) => {
            if (evento.target === fondo) {
                cerrarModalCliente();
            }
        });
    }

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') {
            cerrarModalCliente();
        }
    });
});

async function abrirDetalleCliente(id) {
    try {
        const respuesta = await fetch(`/cliente/producto/${id}`);

        if (!respuesta.ok) {
            alert('Este producto ya no está disponible.');
            return;
        }

        const producto = await respuesta.json();

        const imagenPorDefecto =
            'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80';

        document.getElementById('detalle-imagen').src =
            producto.imagen_url || imagenPorDefecto;

        document.getElementById('detalle-categoria').textContent =
            producto.categoria;

        document.getElementById('detalle-nombre').textContent =
            producto.nombre;

        document.getElementById('detalle-stock').textContent =
            producto.stock;

        document.getElementById('detalle-unidad').textContent =
            producto.unidad;

        document.getElementById('detalle-precio').textContent =
            Number(producto.precio).toFixed(2);

        document.getElementById('detalle-descripcion').textContent =
            producto.descripcion || 'Sin descripción registrada.';

        // El botón temporal fue eliminado, ya no se asocia evento de clic.

        document
            .getElementById('modal-fondo')
            .classList.add('activo');

    } catch (err) {
        console.error(err);
        alert('Error de conexión al consultar el producto.');
    }
}

function cerrarModalCliente() {
    document
        .getElementById('modal-fondo')
        .classList.remove('activo');
}
