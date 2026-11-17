export async function iniciarRevisionReportes(documento, apiReportes) {
  const lista = documento.getElementById('reportes-pendientes');
  const mensaje = documento.getElementById('mensaje-revision');
  const resumen = documento.getElementById('resumen-reportes');

  if (!lista || !mensaje) return;

  function agregarTexto(contenedor, etiqueta, contenido, clase = '') {
    const elemento = documento.createElement(etiqueta);
    elemento.textContent = contenido;
    if (clase) elemento.className = clase;
    contenedor.appendChild(elemento);
    return elemento;
  }

  function crearImagenVacia() {
    const imagenVacia = documento.createElement('div');
    imagenVacia.className = 'administracion__imagen-vacia';
    imagenVacia.setAttribute('aria-hidden', 'true');
    imagenVacia.innerHTML = `
      <svg viewBox="0 0 24 24">
        <rect x="3" y="3" width="18" height="18" rx="3"></rect>
        <circle cx="8.5" cy="8.5" r="1.5"></circle>
        <path d="m21 15-5-5L5 21"></path>
      </svg>
    `;
    return imagenVacia;
  }

  async function mostrarPendientes() {
    lista.replaceChildren();

    try {
      const reportes = await apiReportes.listarPendientes();
      if (resumen) {
        resumen.textContent = `${reportes.length} ${reportes.length === 1 ? 'reporte pendiente' : 'reportes pendientes'}`;
      }

      if (reportes.length === 0) {
        agregarTexto(lista, 'p', 'No hay reportes pendientes de revisión.');
        return;
      }

      reportes.forEach(reporte => {
        const tarjeta = documento.createElement('article');
        tarjeta.className = 'administracion__reporte';

        if (reporte.imagen) {
          const foto = documento.createElement('img');
          foto.className = 'administracion__imagen';
          foto.src = reporte.imagen;
          foto.alt = `Fotografía de ${reporte.titulo}`;
          tarjeta.appendChild(foto);
        } else {
          tarjeta.appendChild(crearImagenVacia());
        }

        const contenido = documento.createElement('div');
        contenido.className = 'administracion__reporte-contenido';
        agregarTexto(contenido, 'h2', reporte.titulo || 'Sin nombre');
        agregarTexto(contenido, 'p', `${reporte.categoria} · ${reporte.lugar}`);
        agregarTexto(
          contenido,
          'p',
          `${reporte.fecha} · ${reporte.hora || 'Hora no indicada'}`
        );
        if (reporte.descripcion) {
          agregarTexto(
            contenido,
            'p',
            reporte.descripcion,
            'administracion__descripcion'
          );
        }

        if (reporte.detallePrivado) {
          agregarTexto(
            contenido,
            'p',
            `Detalle privado: ${reporte.detallePrivado}`,
            'administracion__detalle-privado'
          );
        }

        const finalTarjeta = documento.createElement('div');
        finalTarjeta.className = 'administracion__reporte-final';
        agregarTexto(finalTarjeta, 'span', 'En revisión', 'administracion__estado');

        const acciones = documento.createElement('div');
        acciones.className = 'administracion__acciones-reporte';

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
          if (accion === 'rechazar') boton.className = 'administracion__rechazar';
          acciones.appendChild(boton);
        });

        finalTarjeta.appendChild(acciones);
        tarjeta.append(contenido, finalTarjeta);
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
