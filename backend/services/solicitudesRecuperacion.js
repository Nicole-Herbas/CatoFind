function crearError(mensaje, codigo) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

const ACCIONES_REVISION = ['VALIDAR_PROPIETARIO', 'RECHAZAR'];

export function crearSolicitudesRecuperacion(supabase, repositorio, autenticacion) {
  return {
    async listarPendientes(token) {
      await autenticacion.obtenerSesionAdministrador(token);
      return repositorio.listarPendientes();
    },

    async obtenerDetallePendiente({ id, token }) {
      await autenticacion.obtenerSesionAdministrador(token);
      const idNumerico = Number(id);
      if (!Number.isInteger(idNumerico) || idNumerico < 1) {
        throw crearError('La solicitud pendiente no existe.', 'SOLICITUD_NO_ENCONTRADA');
      }

      const solicitud = await repositorio.obtenerDetallePendiente(idNumerico);
      if (!solicitud) {
        throw crearError('La solicitud pendiente no existe.', 'SOLICITUD_NO_ENCONTRADA');
      }

      let imagen = solicitud.imagen;
      if (imagen && !/^https?:\/\//i.test(imagen)) {
        const { data, error } = await supabase.storage
          .from('reportes')
          .createSignedUrl(imagen, 60 * 60);
        if (error || !data?.signedUrl) {
          throw crearError('No se pudo cargar la fotografía del objeto.', 'PERSISTENCIA');
        }
        imagen = data.signedUrl;
      }

      return { ...solicitud, imagen };
    },

    async resolverPendiente({ id, accion, token }) {
      await autenticacion.obtenerSesionAdministrador(token);
      const solicitudId = Number(id);
      if (!Number.isInteger(solicitudId) || solicitudId < 1) {
        throw crearError('La solicitud pendiente no existe.', 'SOLICITUD_NO_ENCONTRADA');
      }
      if (!ACCIONES_REVISION.includes(accion)) {
        throw crearError('Selecciona una acción válida.', 'VALIDACION');
      }

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        throw crearError('Debes iniciar sesión.', 'NO_AUTORIZADO');
      }

      const administrativoId = await repositorio.obtenerIdAdministrador(data.user.id);
      try {
        return await repositorio.resolverPendiente({
          solicitudId,
          accion,
          administrativoId
        });
      } catch (errorPersistencia) {
        if (errorPersistencia.code === 'PGRST202') {
          throw crearError(
            'Falta aplicar la migración de resolución de solicitudes en Supabase.',
            'MIGRACION_PENDIENTE'
          );
        }
        if (errorPersistencia.code === 'P0002') {
          throw crearError('La solicitud pendiente no existe o ya fue revisada.', 'SOLICITUD_NO_ENCONTRADA');
        }
        if (errorPersistencia.code === 'P0001') {
          throw crearError('El reporte ya no está disponible para recuperación.', 'REPORTE_NO_DISPONIBLE');
        }
        if (errorPersistencia.code === '22023') {
          throw crearError('Selecciona una acción válida.', 'VALIDACION');
        }
        throw errorPersistencia;
      }
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

      if (!token) {
        throw crearError('Inicia sesión para enviar una solicitud.', 'NO_AUTORIZADO');
      }

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
