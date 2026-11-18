import { formatearFecha, obtenerObjetoSeleccionado } from './reviewRecoveryRequest.js';

const contenido = document.getElementById('detalle-contenido');
const mensajeError = document.getElementById('detalle-error');

if (!contenido || !mensajeError) {
    throw new Error('No se encontraron los elementos requeridos de la página de detalle.');
}

try {
    const objeto = obtenerObjetoSeleccionado(window.sessionStorage);
    document.title = `CatoFind | ${objeto.titulo}`;

    document.getElementById('objeto-estado').textContent = objeto.estado || 'Publicado';
    document.getElementById('objeto-titulo').textContent = objeto.titulo;
    document.getElementById('objeto-categoria').textContent = objeto.categoria;
    document.getElementById('objeto-lugar').textContent = objeto.lugar;
    document.getElementById('objeto-fecha').textContent = formatearFecha(objeto.fecha);

    if (objeto.descripcion) {
        const descripcion = document.getElementById('objeto-descripcion');
        descripcion.textContent = objeto.descripcion;
        descripcion.hidden = false;
    }

    if (objeto.hora) {
        document.getElementById('objeto-hora').textContent = objeto.hora;
        document.getElementById('objeto-hora-contenedor').hidden = false;
    }

    const imagen = document.getElementById('objeto-imagen');
    const imagenVacia = document.getElementById('objeto-imagen-vacia');
    if (objeto.imagen) {
        imagen.src = objeto.imagen;
        imagen.alt = objeto.titulo;
        imagen.addEventListener('error', () => {
            imagen.hidden = true;
            imagenVacia.hidden = false;
        }, { once: true });
    } else {
        imagen.hidden = true;
        imagenVacia.hidden = false;
    }

    contenido.hidden = false;
} catch {
    mensajeError.hidden = false;
}
