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

    async obtenerEstudiante(authUid) {
      const { data, error } = await supabase
        .from('usuario')
        .select('id,rol')
        .eq('auth_uid', authUid)
        .single();

      if (error) throw error;
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

      if (error) throw error;
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

      if (error) throw error;
      return data;
    }
  };
}
