import { SolicitudesApi } from '../../../../../api/solicitudes.js';

function formatearFecha(fecha) {
  const [anio, mes, dia] = String(fecha ?? '').split('-').map(Number);
  if (!anio || !mes || !dia) {
    return fecha || 'No indicada';
  }

  return new Intl.DateTimeFormat('es-BO', {
    day: 'numeric',
    month: 'long'
  }).format(new Date(anio, mes - 1, dia));
}

export async function iniciarViewRequestDetails(
  documento,
  apiSolicitudes = new SolicitudesApi(),
  busqueda = globalThis.location.search
) {
  const contenido = documento.getElementById('solicitud-contenido');
  const error = documento.getElementById('solicitud-error');
  if (!contenido || !error) {
    return;
  }

  const id = new globalThis.URLSearchParams(busqueda).get('id');
  if (!id) {
    error.textContent = 'Selecciona una solicitud desde la lista de recuperaciones.';
    error.hidden = false;
    return;
  }

  try {
    const solicitud = await apiSolicitudes.obtenerDetallePendiente(id);
    documento.getElementById('solicitante-nombre').textContent = solicitud.solicitante;
    documento.getElementById('solicitante-correo').textContent = solicitud.correoSolicitante;
    documento.getElementById('objeto-titulo').textContent = solicitud.titulo;
    documento.getElementById('objeto-categoria').textContent = solicitud.categoria;
    documento.getElementById('respuesta-lugar').textContent = solicitud.lugarEstimado;
    documento.getElementById('respuesta-fecha').textContent = formatearFecha(solicitud.fechaEstimada);
    documento.getElementById('respuesta-caracteristica').textContent =
      solicitud.caracteristicaPrivada;
    documento.getElementById('reporte-lugar').textContent = solicitud.lugarReporte;
    documento.getElementById('reporte-fecha').textContent = formatearFecha(solicitud.fechaReporte);
    documento.getElementById('reporte-detalle-privado').textContent =
      solicitud.detallePrivadoReporte || 'Sin detalle privado';

    const imagen = documento.getElementById('objeto-imagen');
    const imagenVacia = documento.getElementById('objeto-imagen-vacia');
    if (solicitud.imagen) {
      imagen.src = solicitud.imagen;
      imagen.alt = `Fotografía de ${solicitud.titulo}`;
      imagen.hidden = false;
      imagen.addEventListener('error', () => {
        imagen.hidden = true;
        imagenVacia.hidden = false;
      }, { once: true });
    } else {
      imagenVacia.hidden = false;
    }

    contenido.hidden = false;
  } catch (errorCarga) {
    error.textContent = errorCarga.message || 'No se pudo cargar el detalle de la solicitud.';
    error.hidden = false;
  }
}

if (typeof document !== 'undefined' && document.getElementById('solicitud-contenido')) {
  iniciarViewRequestDetails(document);
}
