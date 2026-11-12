export async function iniciarRevisionReportes(documento, apiReportes) {
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

  async function mostrarPendientes() {
    lista.replaceChildren();

    try {
      const reportes = await apiReportes.listarPendientes();

      if (reportes.length === 0) {
        agregarTexto(lista, 'p', 'No hay reportes pendientes de revisión.');
        return;
      }

      reportes.forEach(reporte => {
        const tarjeta = documento.createElement('article');
        tarjeta.className = 'panel__reporte';

        if (reporte.imagen) {
          const foto = documento.createElement('img');
          foto.className = 'panel__reporte-imagen';
          foto.src = reporte.imagen;
          foto.alt = `Fotografía de ${reporte.titulo}`;
          tarjeta.appendChild(foto);
        }

        const contenido = documento.createElement('div');
        contenido.className = 'panel__reporte-contenido';
        agregarTexto(contenido, 'h3', reporte.titulo || 'Sin nombre');
        agregarTexto(contenido, 'p', `${reporte.categoria} · ${reporte.lugar}`);
        agregarTexto(contenido, 'p', `${reporte.fecha} · ${reporte.hora || 'Hora no indicada'}`);
        agregarTexto(contenido, 'p', reporte.descripcion || '');

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

        [
          { etiqueta: 'Aprobar', accion: 'aprobar', estado: 'APROBADO' },
          { etiqueta: 'Rechazar', accion: 'rechazar', estado: 'RECHAZADO' }
        ].forEach(({ etiqueta, accion, estado }) => {
          const boton = documento.createElement('button');
          boton.type = 'button';
          boton.textContent = etiqueta;
          boton.dataset.accion = accion;
          boton.dataset.estado = estado;
          boton.dataset.id = reporte.id;
          if (accion === 'rechazar') boton.className = 'panel__boton-rechazar';
          acciones.appendChild(boton);
        });

        contenido.appendChild(acciones);
        tarjeta.appendChild(contenido);
        lista.appendChild(tarjeta);
      });
    } catch {
      mensaje.textContent = 'No se pudieron cargar los reportes pendientes.';
    }
  }

  lista.addEventListener('click', async evento => {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton || !lista.contains(boton)) return;

    boton.disabled = true;
    try {
      const reporte = await apiReportes.actualizarEstado(
        boton.dataset.id,
        boton.dataset.estado
      );
      mensaje.textContent = boton.dataset.estado === 'APROBADO'
        ? `Reporte #${reporte.id} aprobado. Estado: Publicado.`
        : `Reporte #${reporte.id} rechazado.`;
      await mostrarPendientes();
    } catch (error) {
      mensaje.textContent = error.message || 'No se pudo guardar la revisión.';
      boton.disabled = false;
    }
  });

  await mostrarPendientes();
}
