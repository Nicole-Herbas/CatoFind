export function crearSolicitudesRecuperacion(supabase) {
  return {
    async listarPendientes() {
      const { data, error } = await supabase
        .from('solicitud_recuperacion')
        .select([
          'id,reporte_id,solicitante_id,lugar_estimado,fecha_estimada,caracteristica_privada,estado,',
          'reporte:reporte!solicitud_recuperacion_reporte_id_fkey(',
          'objeto:objeto!reporte_objeto_id_fkey(nombre,categoria)',
          '),solicitante:usuario!solicitud_recuperacion_solicitante_id_fkey(nombre)'
        ].join(''))
        .eq('estado', 'PENDIENTE')
        .order('id', { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(solicitud => ({
        id: solicitud.id,
        reporteId: solicitud.reporte_id,
        titulo: solicitud.reporte?.objeto?.nombre || `Reporte #${solicitud.reporte_id}`,
        categoria: solicitud.reporte?.objeto?.categoria || '',
        solicitante: solicitud.solicitante?.nombre || '',
        lugarEstimado: solicitud.lugar_estimado,
        fechaEstimada: solicitud.fecha_estimada,
        caracteristicaPrivada: solicitud.caracteristica_privada,
        estado: solicitud.estado
      }));
    },

    async obtenerDetallePendiente(id) {
      const { data, error } = await supabase
        .from('solicitud_recuperacion')
        .select([
          'id,reporte_id,lugar_estimado,fecha_estimada,caracteristica_privada,estado,',
          'solicitante:usuario!solicitud_recuperacion_solicitante_id_fkey(nombre,correo_institucional),',
          'reporte:reporte!solicitud_recuperacion_reporte_id_fkey(',
          'fecha,hora,lugar,detalle_privado,estado,',
          'objeto:objeto!reporte_objeto_id_fkey(nombre,categoria,descripcion,foto)',
          ')'
        ].join(''))
        .eq('id', id)
        .eq('estado', 'PENDIENTE')
        .maybeSingle();

      if (error) {
        throw error;
      }
      if (!data) {
        return null;
      }

      return {
        id: data.id,
        reporteId: data.reporte_id,
        estado: data.estado,
        solicitante: data.solicitante?.nombre || '',
        correoSolicitante: data.solicitante?.correo_institucional || '',
        lugarEstimado: data.lugar_estimado,
        fechaEstimada: data.fecha_estimada,
        caracteristicaPrivada: data.caracteristica_privada,
        titulo: data.reporte?.objeto?.nombre || '',
        categoria: data.reporte?.objeto?.categoria || '',
        descripcion: data.reporte?.objeto?.descripcion || '',
        imagen: data.reporte?.objeto?.foto || '',
        lugarReporte: data.reporte?.lugar || '',
        fechaReporte: data.reporte?.fecha || '',
        horaReporte: String(data.reporte?.hora ?? '').slice(0, 5),
        detallePrivadoReporte: data.reporte?.detalle_privado || ''
      };
    },

    async obtenerIdAdministrador(authUid) {
      const { data, error } = await supabase
        .from('usuario')
        .select('id')
        .eq('auth_uid', authUid)
        .eq('rol', 'ADMINISTRATIVO')
        .single();

      if (error) {
        throw error;
      }

      return data.id;
    },

    async resolverPendiente({ solicitudId, accion, administrativoId }) {
      const { error } = await supabase.rpc('resolver_solicitud_recuperacion', {
        p_solicitud_id: solicitudId,
        p_accion: accion,
        p_administrativo_id: administrativoId
      });

      if (error) {
        throw error;
      }

      return { id: solicitudId, accion };
    },

    async obtenerEstudiante(authUid) {
      const { data, error } = await supabase
        .from('usuario')
        .select('id,rol')
        .eq('auth_uid', authUid)
        .single();

      if (error) {
        throw error;
      }
      return data;
    },

    async esReporteEncontrado(reporteId) {
      const { data, error } = await supabase
        .from('reporte')
        .select('id')
        .eq('id', reporteId)
        .eq('tipo', 'ENCONTRADO')
        .eq('estado', 'APROBADO')
        .maybeSingle();

      if (error) {
        throw error;
      }
      return Boolean(data);
    },

    async crear(solicitud) {
      const { data, error } = await supabase
        .from('solicitud_recuperacion')
        .insert({
          reporte_id: solicitud.reporteId,
          solicitante_id: solicitud.solicitanteId,
          lugar_estimado: solicitud.lugarEstimado,
          fecha_estimada: solicitud.fechaEstimada,
          caracteristica_privada: solicitud.caracteristicaPrivada
        })
        .select('id')
        .single();

      if (error) {
        throw error;
      }
      return data;
    }
  };
}
