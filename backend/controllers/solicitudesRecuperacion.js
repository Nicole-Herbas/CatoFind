export function crearControladorSolicitudesRecuperacion(servicio) {
  return {
    async listarMisSolicitudes(solicitud, respuesta) {
      const token = solicitud.cookies?.catofind_sesion || '';

      try {
        const solicitudes = await servicio.listarMisSolicitudes({ token });
        return respuesta.json({ solicitudes });
      } catch (error) {
        const noAutorizado = error.codigo === 'NO_AUTORIZADO';
        return respuesta.status(noAutorizado ? 401 : 500).json({
          mensaje: noAutorizado
            ? error.message
            : 'No se pudieron cargar las solicitudes.'
        });
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
