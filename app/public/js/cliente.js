// Este script maneja las funciones del navegador del usuario final: modal de detalle y agregar al menú
document.addEventListener('DOMContentLoaded', () => {
    const fondo = document.getElementById('modal-fondo');
    if (fondo) {
        fondo.addEventListener('click', (evento) => {
            if (evento.target === fondo) cerrarModalCliente();
        });
    }

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') cerrarModalCliente();
    });
});

async function abrirDetalleCliente(id) {
    try {
        const respuesta = await fetch(`/cliente/receta/${id}`);
        if (!respuesta.ok) {
            alert('Esta receta ya no está disponible.');
            return;
        }
        const receta = await respuesta.json();

        const imagenPorDefecto = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80';
        document.getElementById('detalle-imagen').src = receta.imagen_url || imagenPorDefecto;
        document.getElementById('detalle-categoria').textContent = receta.categoria;
        document.getElementById('detalle-nombre').textContent = receta.nombre;
        document.getElementById('detalle-porciones').textContent = `${receta.porciones} ${receta.unidad || 'porciones'}`;
        document.getElementById('detalle-descripcion').textContent = receta.descripcion || 'Sin descripción registrada.';
        document.getElementById('detalle-ingredientes').textContent = receta.ingredientes || 'Sin ingredientes registrados.';

        const enlaceVideo = document.getElementById('detalle-video');
        if (receta.video_url) {
            enlaceVideo.href = receta.video_url;
            enlaceVideo.style.display = 'inline-block';
        } else {
            enlaceVideo.style.display = 'none';
        }

        document.getElementById('detalle-agregar').onclick = () => agregarAlMenu(receta.nombre);

        document.getElementById('modal-fondo').classList.add('activo');
    } catch (err) {
        console.error(err);
        alert('Error de conexión al consultar la receta.');
    }
}

function cerrarModalCliente() {
    document.getElementById('modal-fondo').classList.remove('activo');
}

// Función básica simulando agregar al carrito/plan de cocina
function agregarAlMenu(nombreReceta) {
    alert(`¡Excelente elección! La receta de "${nombreReceta}" ha sido añadida a tu planificación de cocina.`);
}