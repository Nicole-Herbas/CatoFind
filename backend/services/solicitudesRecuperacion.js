function crearError(mensaje, codigo) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

export function crearSolicitudesRecuperacion(supabase, repositorio) {
  return {
    async listarMisSolicitudes({ token }) {
      if (!token) {
        throw crearError('Inicia sesión para consultar tus solicitudes.', 'NO_AUTORIZADO');
      }

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        throw crearError('Inicia sesión para consultar tus solicitudes.', 'NO_AUTORIZADO');
      }

      const estudiante = await repositorio.obtenerEstudiante(data.user.id);
      if (!estudiante || estudiante.rol !== 'ESTUDIANTE') {
        throw crearError('Inicia sesión para consultar tus solicitudes.', 'NO_AUTORIZADO');
      }

      const solicitudes = await repositorio.listarPorSolicitante(estudiante.id);
      return solicitudes.map(solicitud => ({
        id: solicitud.id,
        nombreObjeto: solicitud.reporte?.objeto?.nombre || 'Objeto no disponible',
        fechaSolicitud: solicitud.fecha_solicitud,
        estado: solicitud.estado,
        motivoRechazo: solicitud.motivo_rechazo
      }));
    },

    async crear({ token, reporteId, lugarEstimado, fechaEstimada, caracteristicaPrivada }) {
      const id = Number(reporteId);
      const lugar = String(lugarEstimado ?? '').trim();
      const fecha = String(fechaEstimada ?? '').trim();
      const caracteristica = String(caracteristicaPrivada ?? '').trim();
      const fechaUTC = new Date(`${fecha}T00:00:00.000Z`);
      const fechaValida = /^\d{4}-\d{2}-\d{2}$/.test(fecha)
        && !Number.isNaN(fechaUTC.getTime())
        && fechaUTC.toISOString().slice(0, 10) === fecha;

      if (!Number.isInteger(id) || id < 1 || !lugar || !fechaValida || !caracteristica) {
        throw crearError('Completa los datos de la solicitud.', 'VALIDACION');
      }

      if (!token) throw crearError('Inicia sesión para enviar una solicitud.', 'NO_AUTORIZADO');

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        throw crearError('Inicia sesión para enviar una solicitud.', 'NO_AUTORIZADO');
      }

      const estudiante = await repositorio.obtenerEstudiante(data.user.id);
      if (!estudiante || estudiante.rol !== 'ESTUDIANTE') {
        throw crearError('Solo estudiantes pueden solicitar un objeto.', 'NO_AUTORIZADO');
      }

      if (!await repositorio.esReporteEncontrado(id)) {
        throw crearError('El objeto solicitado no está disponible.', 'REPORTE_INVALIDO');
      }

      return repositorio.crear({
        reporteId: id,
        solicitanteId: estudiante.id,
        lugarEstimado: lugar,
        fechaEstimada: fecha,
        caracteristicaPrivada: caracteristica
      });
    }
  };
}
