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

    async obtenerDetallePendiente(solicitud, respuesta) {
      try {
        const detalle = await servicio.obtenerDetallePendiente({
          id: solicitud.params.id,
          token: solicitud.cookies?.catofind_sesion
        });
        return respuesta.json({ solicitud: detalle });
      } catch (error) {
        const estado = error.codigo === 'NO_AUTORIZADO' ? 401
          : error.codigo === 'SIN_PERMISOS' ? 403
            : error.codigo === 'SOLICITUD_NO_ENCONTRADA' ? 404 : 500;
        const mensaje = estado < 500
          ? error.message
          : 'No se pudo cargar el detalle de la solicitud.';
        return respuesta.status(estado).json({ mensaje });
      }
    },

    async resolverPendiente(solicitud, respuesta) {
      try {
        const resultado = await servicio.resolverPendiente({
          id: solicitud.params.id,
          accion: solicitud.body?.accion,
          token: solicitud.cookies?.catofind_sesion
        });
        return respuesta.json({ resultado });
      } catch (error) {
        const estado = error.codigo === 'VALIDACION' ? 400
          : error.codigo === 'NO_AUTORIZADO' ? 401
            : error.codigo === 'SIN_PERMISOS' ? 403
              : error.codigo === 'SOLICITUD_NO_ENCONTRADA' ? 404
                : error.codigo === 'REPORTE_NO_DISPONIBLE' ? 409
                  : error.codigo === 'MIGRACION_PENDIENTE' ? 503 : 500;
        const mensaje = error.codigo === 'MIGRACION_PENDIENTE'
          ? error.message
          : estado < 500 ? error.message : 'No se pudo resolver la solicitud de recuperación.';
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
