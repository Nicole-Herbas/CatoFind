import { crearApiReportes } from '../../../../../api/reportes.js';

function formatearFecha(fecha) {
  const [anio, mes, dia] = String(fecha).split('-').map(Number);
  if (!anio || !mes || !dia) {
    return fecha;
  }

  return new Intl.DateTimeFormat('es-BO', {
    day: 'numeric',
    month: 'long'
  }).format(new Date(anio, mes - 1, dia));
}

function configurarAccionesRevision(documento, apiReportes, id) {
  const acciones = documento.getElementById('revision-acciones');
  const mensaje = documento.getElementById('revision-mensaje');
  const estado = documento.getElementById('objeto-estado');
  const botones = Array.from(acciones.querySelectorAll('button[data-estado]'));

  acciones.addEventListener('click', async evento => {
    const boton = evento.target.closest('button[data-estado]');
    if (!boton || !acciones.contains(boton) || boton.disabled) {
      return;
    }

    botones.forEach(accion => {
      accion.disabled = true;
    });
    mensaje.hidden = true;
    mensaje.classList.remove('detalle-admin__revision-mensaje--error');

    try {
      const resultado = await apiReportes.actualizarEstado(id, boton.dataset.estado);
      const aprobado = resultado.estado === 'APROBADO';
      estado.textContent = aprobado ? 'Publicado' : 'Rechazado';
      mensaje.textContent = aprobado
        ? `Reporte #${resultado.id} aprobado y publicado.`
        : `Reporte #${resultado.id} rechazado.`;
      acciones.hidden = true;
      mensaje.hidden = false;
    } catch (error) {
      mensaje.textContent = error.message || 'No se pudo guardar la revisión.';
      mensaje.classList.add('detalle-admin__revision-mensaje--error');
      mensaje.hidden = false;
      botones.forEach(accion => {
        accion.disabled = false;
      });
    }
  });
}

export async function iniciarViewDetailsObject(
  documento,
  apiReportes = crearApiReportes(),
  busqueda = globalThis.location.search
) {
  const contenido = documento.getElementById('detalle-contenido');
  const error = documento.getElementById('detalle-error');
  if (!contenido || !error) {
    return;
  }

  const id = new globalThis.URLSearchParams(busqueda).get('id');
  if (!id) {
    error.textContent = 'Selecciona un reporte desde la lista de solicitudes.';
    error.hidden = false;
    return;
  }

  try {
    const reporte = await apiReportes.obtenerDetallePendiente(id);
    documento.getElementById('objeto-titulo').textContent = reporte.titulo;
    documento.getElementById('objeto-estado').textContent = reporte.estado === 'PENDIENTE'
      ? 'En revisión'
      : reporte.estado;
    documento.getElementById('objeto-categoria').textContent = reporte.categoria;
    documento.getElementById('objeto-lugar').textContent = reporte.lugar;
    documento.getElementById('objeto-fecha').textContent = formatearFecha(reporte.fecha);
    documento.getElementById('objeto-hora').textContent = reporte.hora || 'No indicada';
    documento.getElementById('reportante-nombre').textContent = reporte.reportante;
    documento.getElementById('detalle-privado').textContent = reporte.detallePrivado;

    const descripcion = documento.getElementById('objeto-descripcion');
    if (reporte.descripcion) {
      descripcion.textContent = reporte.descripcion;
      descripcion.hidden = false;
    }

    const imagen = documento.getElementById('objeto-imagen');
    const imagenVacia = documento.getElementById('objeto-imagen-vacia');
    if (reporte.imagen) {
      imagen.src = reporte.imagen;
      imagen.alt = `Fotografía de ${reporte.titulo}`;
      imagen.hidden = false;
      imagen.addEventListener('error', () => {
        imagen.hidden = true;
        imagenVacia.hidden = false;
      }, { once: true });
    } else {
      imagenVacia.hidden = false;
    }

    configurarAccionesRevision(documento, apiReportes, id);
    contenido.hidden = false;
  } catch (errorCarga) {
    error.textContent = errorCarga.message || 'No se pudo cargar el detalle del reporte.';
    error.hidden = false;
  }
}

if (typeof document !== 'undefined' && document.getElementById('detalle-contenido')) {
  iniciarViewDetailsObject(document);
}
