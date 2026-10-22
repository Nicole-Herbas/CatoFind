
import { ReporteService } from '../../../reportar/services/ReporteService.js';

export function iniciarRevisionReportes(documento, almacenamiento) {

  const servicio = new ReporteService(almacenamiento);
  const lista = documento.getElementById('reportes-pendientes');
  const mensaje = documento.getElementById('mensaje-revision');

  if (!lista || !mensaje) return;

  function agregarTexto(contenedor, etiqueta, contenido, clase = '') {
    const elemento = documento.createElement(etiqueta);

    elemento.textContent = contenido;

    if (clase) elemento.className = clase;

    contenedor.appendChild(elemento);
    return elemento;
  }

  function mostrarPendientes() {
    lista.replaceChildren();

    const pendientes = servicio.obtenerPendientes();

    if (pendientes.length === 0) {
      agregarTexto(
        lista,
        'p',
        'No hay reportes pendientes de revisión.'
      );
      return;
    }

    pendientes.forEach(reporte => {
      const tarjeta = documento.createElement('article');
      tarjeta.className = 'panel__reporte';

      if (
        typeof reporte.imagen === 'string' &&
        /^data:image\/(jpeg|png|webp);base64,/.test(reporte.imagen)
      ) {
        const foto = documento.createElement('img');
        foto.className = 'panel__reporte-imagen';
        foto.src = reporte.imagen;
        foto.alt = `Fotografía de ${reporte.titulo}`;

        tarjeta.appendChild(foto);
      }

      const contenido = documento.createElement('div');
      contenido.className = 'panel__reporte-contenido';

      agregarTexto(
        contenido,
        'h3',
        reporte.titulo || 'Sin nombre'
      );

      agregarTexto(
        contenido,
        'p',
        `${reporte.categoria} · ${reporte.lugar}`
      );

      agregarTexto(
        contenido,
        'p',
        `${reporte.fecha} · ${reporte.hora}`
      );

      agregarTexto(
        contenido,
        'p',
        reporte.descripcion || ''
      );

      if (reporte.detallePrivado) {
        agregarTexto(
          contenido,
          'p',
          `Detalle privado: ${reporte.detallePrivado}`,
          'panel__detalle-privado'
        );
      }

      const acciones = documento.createElement('div');
      acciones.className = 'panel__acciones';

      const aprobar = documento.createElement('button');
      aprobar.type = 'button';
      aprobar.textContent = 'Aprobar';
      aprobar.dataset.accion = 'aprobar';
      aprobar.dataset.id = reporte.id;

      const rechazar = documento.createElement('button');
      rechazar.type = 'button';
      rechazar.textContent = 'Rechazar';
      rechazar.dataset.accion = 'rechazar';
      rechazar.dataset.id = reporte.id;
      rechazar.className = 'panel__boton-rechazar';

      acciones.append(aprobar, rechazar);
      contenido.appendChild(acciones);

      tarjeta.appendChild(contenido);
      lista.appendChild(tarjeta);
    });
  }

  lista.addEventListener('click', evento => {
    const boton = evento.target.closest('button[data-accion]');

    if (!boton || !lista.contains(boton)) return;

    const nuevoEstado = boton.dataset.accion === 'aprobar'
      ? 'Publicado'
      : 'Rechazado';

    try {
      const actualizado = servicio.actualizarEstado(
        boton.dataset.id,
        nuevoEstado
      );

      if (!actualizado) {
        mensaje.textContent =
          'No se pudo actualizar el reporte.';
        return;
      }

      mensaje.textContent = nuevoEstado === 'Publicado'
        ? `Reporte #${actualizado.id} aprobado. Estado: Publicado.`
        : `Reporte #${actualizado.id} rechazado.`;

      mostrarPendientes();

    } catch {
      mensaje.textContent =
        'Ocurrió un error al guardar la revisión.';
    }
  });

  mostrarPendientes();
}
