export async function iniciarRevisionReportes(documento, apiReportes, apiSolicitudes) {
  const lista = documento.getElementById('reportes-pendientes');
  const mensaje = documento.getElementById('mensaje-revision');
  const resumen = documento.getElementById('resumen-reportes');
  const filtros = Array.from(documento.querySelectorAll('[data-filtro]'));

  if (!lista || !mensaje || filtros.length === 0) {
    return;
  }

  let reportes = [];
  let solicitudes = [];
  let errorReportes = '';
  let errorSolicitudes = '';
  let filtroActivo = 'reportes';

  function agregarTexto(contenedor, etiqueta, contenido, clase = '') {
    const elemento = documento.createElement(etiqueta);
    elemento.textContent = contenido;
    if (clase) {
      elemento.className = clase;
    }
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

  function crearTarjeta(titulo, metadata) {
    const tarjeta = documento.createElement('article');
    tarjeta.className = 'administracion__reporte';
    tarjeta.appendChild(crearImagenVacia());

    const contenido = documento.createElement('div');
    contenido.className = 'administracion__reporte-contenido';
    agregarTexto(contenido, 'h2', titulo);
    metadata(contenido);

    const finalTarjeta = documento.createElement('div');
    finalTarjeta.className = 'administracion__reporte-final';
    agregarTexto(finalTarjeta, 'span', 'En revisión', 'administracion__estado');
    tarjeta.append(contenido, finalTarjeta);
    return { tarjeta, contenido, finalTarjeta };
  }

  function actualizarContadores() {
    const contadorReportes = documento.getElementById('contador-reportes');
    const contadorRecuperaciones = documento.getElementById('contador-recuperaciones');
    if (contadorReportes) {
      contadorReportes.textContent = `(${errorReportes ? '—' : reportes.length})`;
    }
    if (contadorRecuperaciones) {
      contadorRecuperaciones.textContent = `(${errorSolicitudes ? '—' : solicitudes.length})`;
    }
  }

  function mostrarReportes() {
    reportes.forEach(reporte => {
      const { tarjeta, finalTarjeta } = crearTarjeta(
        reporte.titulo || 'Sin nombre',
        contenedor => {
          agregarTexto(contenedor, 'p', `${reporte.categoria} · ${reporte.lugar}`);
          agregarTexto(
            contenedor,
            'p',
            `${reporte.fecha} · ${reporte.hora || 'Hora no indicada'}`
          );
          if (reporte.descripcion) {
            agregarTexto(
              contenedor,
              'p',
              reporte.descripcion,
              'administracion__descripcion'
            );
          }
          if (reporte.detallePrivado) {
            agregarTexto(
              contenedor,
              'p',
              `Detalle privado: ${reporte.detallePrivado}`,
              'administracion__detalle-privado'
            );
          }
        }
      );

      if (reporte.imagen) {
        const foto = documento.createElement('img');
        foto.className = 'administracion__imagen';
        foto.src = reporte.imagen;
        foto.alt = `Fotografía de ${reporte.titulo}`;
        tarjeta.replaceChild(foto, tarjeta.firstChild);
      }

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
        if (accion === 'rechazar') {
          boton.className = 'administracion__rechazar';
        }
        acciones.appendChild(boton);
      });
      finalTarjeta.appendChild(acciones);
      lista.appendChild(tarjeta);
    });
  }

  function mostrarSolicitudes() {
    solicitudes.forEach(solicitud => {
      const { tarjeta } = crearTarjeta(
        solicitud.titulo || `Solicitud #${solicitud.id}`,
        contenido => {
          const referencia = solicitud.categoria || `Reporte #${solicitud.reporteId}`;
          const solicitante = solicitud.solicitante || 'Estudiante';
          agregarTexto(
            contenido,
            'p',
            `${referencia} · Solicitado por ${solicitante}`,
            'administracion__solicitud-detalle'
          );
          agregarTexto(
            contenido,
            'p',
            `Lugar estimado: ${solicitud.lugarEstimado} · Fecha estimada: ${solicitud.fechaEstimada}`
          );
          agregarTexto(
            contenido,
            'p',
            `Característica privada: ${solicitud.caracteristicaPrivada}`,
            'administracion__detalle-privado'
          );
        }
      );
      lista.appendChild(tarjeta);
    });
  }

  function mostrarFiltro() {
    lista.replaceChildren();
    filtros.forEach(filtro => {
      const seleccionado = filtro.dataset.filtro === filtroActivo;
      filtro.setAttribute('aria-pressed', String(seleccionado));
      filtro.classList.toggle('administracion__filtro--activo', seleccionado);
    });

    const mostrarReportesActivos = filtroActivo === 'reportes';
    const errorActivo = mostrarReportesActivos ? errorReportes : errorSolicitudes;
    const listaActiva = mostrarReportesActivos ? reportes : solicitudes;

    if (resumen) {
      const plural = listaActiva.length === 1 ? '' : 's';
      resumen.textContent = mostrarReportesActivos
        ? `${listaActiva.length} reporte${plural} pendiente${plural}`
        : `${listaActiva.length} solicitud${plural} de recuperación pendiente${plural}`;
    }

    if (errorActivo) {
      mensaje.textContent = errorActivo;
      return;
    }

    if (listaActiva.length === 0) {
      agregarTexto(
        lista,
        'p',
        mostrarReportesActivos
          ? 'No hay reportes pendientes de revisión.'
          : 'No hay solicitudes de recuperación pendientes.'
      );
      return;
    }

    if (mostrarReportesActivos) {
      mostrarReportes();
    } else {
      mostrarSolicitudes();
    }
  }

  async function cargarDatos(peticion, mensajePredeterminado) {
    try {
      return { datos: await peticion(), error: '' };
    } catch (error) {
      return { datos: [], error: error.message || mensajePredeterminado };
    }
  }

  filtros.forEach(filtro => {
    filtro.addEventListener('click', () => {
      filtroActivo = filtro.dataset.filtro;
      mensaje.textContent = '';
      mostrarFiltro();
    });
  });

  lista.addEventListener('click', async evento => {
    const boton = evento.target.closest('button[data-accion]');
    if (!boton || !lista.contains(boton)) {
      return;
    }

    boton.disabled = true;
    try {
      const reporte = await apiReportes.actualizarEstado(
        boton.dataset.id,
        boton.dataset.estado
      );
      mensaje.textContent = boton.dataset.estado === 'APROBADO'
        ? `Reporte #${reporte.id} aprobado. Estado: Publicado.`
        : `Reporte #${reporte.id} rechazado.`;
      const resultado = await cargarDatos(
        () => apiReportes.listarPendientes(),
        'No se pudieron cargar los reportes pendientes.'
      );
      reportes = resultado.datos;
      errorReportes = resultado.error;
      actualizarContadores();
      mostrarFiltro();
    } catch (error) {
      mensaje.textContent = error.message || 'No se pudo guardar la revisión.';
      boton.disabled = false;
    }
  });

  const [resultadoReportes, resultadoSolicitudes] = await Promise.all([
    cargarDatos(
      () => apiReportes.listarPendientes(),
      'No se pudieron cargar los reportes pendientes.'
    ),
    cargarDatos(
      () => apiSolicitudes.listarPendientes(),
      'No se pudieron cargar las solicitudes de recuperación.'
    )
  ]);
  reportes = resultadoReportes.datos;
  errorReportes = resultadoReportes.error;
  solicitudes = resultadoSolicitudes.datos;
  errorSolicitudes = resultadoSolicitudes.error;
  actualizarContadores();
  mostrarFiltro();
}
