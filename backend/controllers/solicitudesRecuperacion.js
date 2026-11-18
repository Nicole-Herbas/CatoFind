export function crearControladorSolicitudesRecuperacion(servicio) {
  return {
    async listarPendientes(solicitud, respuesta) {
      try {
        const solicitudes = await servicio.listarPendientes(
          solicitud.cookies?.catofind_sesion
        );
        return respuesta.json({ solicitudes });
      } catch (error) {
        const estado = error.codigo === 'NO_AUTORIZADO' ? 401
          : error.codigo === 'SIN_PERMISOS' ? 403 : 500;
        const mensaje = estado < 500
          ? error.message
          : 'No se pudieron cargar las solicitudes de recuperación.';
        return respuesta.status(estado).json({ mensaje });
      }
    },

    async crear(solicitud, respuesta) {
      const token = solicitud.cookies?.catofind_sesion || '';

      try {
        const resultado = await servicio.crear({ ...solicitud.body, token });
        return respuesta.status(201).json(resultado);
      } catch (error) {
        const estado = error.codigo === 'VALIDACION' ? 400
          : error.codigo === 'NO_AUTORIZADO' ? 401
            : error.codigo === 'REPORTE_INVALIDO' ? 404 : 500;
        const mensaje = estado === 400 || estado === 401 || estado === 404
          ? error.message : 'No se pudo guardar la solicitud.';
        return respuesta.status(estado).json({ mensaje });
      }
    }
  };
}
