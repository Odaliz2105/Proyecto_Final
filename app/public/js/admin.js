// Lógica del modal de detalle / edición de recetas para el panel de administración
let idRecetaActual = null;

async function abrirDetalle(id) {
    idRecetaActual = id;
    try {
        const respuesta = await fetch(`/admin/receta/${id}`);
        if (!respuesta.ok) {
            alert('No se pudo cargar la receta.');
            return;
        }
        const receta = await respuesta.json();
        rellenarDetalle(receta);
        rellenarFormularioEdicion(receta);
        mostrarDetalle();
        document.getElementById('modal-fondo').classList.add('activo');
    } catch (err) {
        console.error(err);
        alert('Error de conexión al consultar la receta.');
    }
}

function rellenarDetalle(receta) {
    const imagenPorDefecto = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=600&q=80';
    document.getElementById('detalle-imagen').src = receta.imagen_url || imagenPorDefecto;
    document.getElementById('detalle-categoria').textContent = receta.categoria;
    document.getElementById('detalle-nombre').textContent = receta.nombre;
    document.getElementById('detalle-codigo').textContent = 'Código: ' + receta.codigo;
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

    document.getElementById('detalle-eliminar').href = `/admin/eliminar/${receta.id}`;
}

function rellenarFormularioEdicion(receta) {
    document.getElementById('form-edicion').action = `/admin/editar/${receta.id}`;
    document.getElementById('editar-codigo').value = receta.codigo;
    document.getElementById('editar-nombre').value = receta.nombre;
    document.getElementById('editar-categoria').value = receta.categoria;
    document.getElementById('editar-porciones').value = receta.porciones;
    document.getElementById('editar-unidad').value = receta.unidad || 'porciones';
    document.getElementById('editar-descripcion').value = receta.descripcion || '';
    document.getElementById('editar-ingredientes').value = receta.ingredientes || '';
    document.getElementById('editar-imagen').value = receta.imagen_url || '';
    document.getElementById('editar-video').value = receta.video_url || '';
    document.getElementById('editar-disponible').checked = !!receta.disponible;
}

function mostrarDetalle() {
    document.getElementById('vista-detalle').style.display = 'block';
    document.getElementById('form-edicion').style.display = 'none';
}

function mostrarEdicion() {
    document.getElementById('vista-detalle').style.display = 'none';
    document.getElementById('form-edicion').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modal-fondo').classList.remove('activo');
    idRecetaActual = null;
}

// Cerrar el modal si se hace clic fuera de la tarjeta
document.addEventListener('DOMContentLoaded', () => {
    const fondo = document.getElementById('modal-fondo');
    if (fondo) {
        fondo.addEventListener('click', (evento) => {
            if (evento.target === fondo) cerrarModal();
        });
    }

    document.addEventListener('keydown', (evento) => {
        if (evento.key === 'Escape') cerrarModal();
    });
});