function obtenerEstadoError(error) {
  if (error.codigo === 'VALIDACION') return 400;
  if (error.codigo === 'NO_AUTORIZADO') return 401;
  if (error.codigo === 'SIN_PERMISOS') return 403;
  if (error.codigo === 'REPORTE_NO_ENCONTRADO') return 404;
  return 500;
}

function responderError(respuesta, error, mensajeInterno) {
  const estado = obtenerEstadoError(error);
  const mensaje = estado < 500 ? error.message : mensajeInterno;
  return respuesta.status(estado).json({ mensaje });
}

export function crearControladorReportes(servicio) {
  async function crear(solicitud, respuesta) {
    try {
      const reporte = await servicio.crear({
        ...solicitud.body,
        token: solicitud.cookies?.catofind_sesion
      });
      return respuesta.status(201).json({ reporte });
    } catch (error) {
      return responderError(respuesta, error, 'No se pudo guardar el reporte.');
    }
  }
  return {
    async obtenerOpciones(_solicitud, respuesta) {
      return respuesta.json({ opciones: servicio.obtenerOpciones() });
    },
    crear,
    async listarPendientes(solicitud, respuesta) {
      try {
        const reportes = await servicio.listarPendientes(
          solicitud.cookies?.catofind_sesion
        );
        return respuesta.json({ reportes });
      } catch (error) {
        return responderError(
          respuesta,
          error,
          'No se pudieron cargar los reportes pendientes.'
        );
      }
    },

    async actualizarEstado(solicitud, respuesta) {
      try {
        const reporte = await servicio.actualizarEstado({
          id: solicitud.params.id,
          estado: solicitud.body?.estado,
          motivoRechazo: solicitud.body?.motivoRechazo,
          token: solicitud.cookies?.catofind_sesion
        });
        return respuesta.json({ reporte });
      } catch (error) {
        return responderError(
          respuesta,
          error,
          'No se pudo actualizar el reporte.'
        );
      }
    }
  };
}
