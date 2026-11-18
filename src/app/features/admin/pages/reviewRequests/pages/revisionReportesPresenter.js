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

  function crearTarjeta(titulo, metadata, href = '') {
    const tarjeta = documento.createElement(href ? 'a' : 'article');
    tarjeta.className = 'administracion__reporte';
    if (href) {
      tarjeta.href = href;
      tarjeta.classList.add('administracion__reporte-enlace');
      tarjeta.setAttribute('aria-label', `Ver detalles de ${titulo}`);
    }
    tarjeta.appendChild(crearImagenVacia());

    const contenido = documento.createElement('div');
    contenido.className = 'administracion__reporte-contenido';
    agregarTexto(contenido, 'h2', titulo);
    metadata(contenido);

    const finalTarjeta = documento.createElement('div');
    finalTarjeta.className = 'administracion__reporte-final';
    agregarTexto(finalTarjeta, 'span', 'En revisión', 'administracion__estado');
    tarjeta.append(contenido, finalTarjeta);
    return tarjeta;
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
      const titulo = reporte.titulo || 'Sin nombre';
      const tarjeta = crearTarjeta(
        titulo,
        contenido => {
          agregarTexto(contenido, 'p', `${reporte.categoria} · ${reporte.lugar}`);
          agregarTexto(
            contenido,
            'p',
            `${reporte.fecha} · ${reporte.hora || 'Hora no indicada'}`
          );
        },
        `../../viewDetailsObject/pages/viewDetailsObject.html?id=${encodeURIComponent(reporte.id)}`
      );

      if (reporte.imagen) {
        const foto = documento.createElement('img');
        foto.className = 'administracion__imagen';
        foto.src = reporte.imagen;
        foto.alt = `Fotografía de ${titulo}`;
        tarjeta.replaceChild(foto, tarjeta.firstChild);
      }

      lista.appendChild(tarjeta);
    });
  }

  function mostrarSolicitudes() {
    solicitudes.forEach(solicitud => {
      const tarjeta = crearTarjeta(
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
