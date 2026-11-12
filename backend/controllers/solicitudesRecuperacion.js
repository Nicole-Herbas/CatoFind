export function crearControladorSolicitudesRecuperacion(servicio) {
  return {
    async crear(solicitud, respuesta) {
      const autorizacion = solicitud.get('authorization') || '';
      const token = autorizacion.startsWith('Bearer ') ? autorizacion.slice(7) : '';

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
