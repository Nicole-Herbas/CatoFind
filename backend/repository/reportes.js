const SELECTOR_REPORTES = [
  'id,fecha,hora,lugar,estado,detalle_privado',
  'objeto:objeto_id(nombre,categoria,descripcion,foto)'
].join(',');

export function crearRepositorioReportes(supabase) {
  return {
    async crearReporte(datos) {
      const { data: objeto, error: errorObjeto } = await supabase
        .from('objeto')
        .insert({
          nombre: datos.titulo,
          descripcion: datos.descripcion,
          categoria: datos.categoria,
          foto: datos.imagen
        })
        .select('id')
        .single();

      if (errorObjeto || !objeto?.id) throw errorObjeto || new Error('No se creó el objeto.');

      const { data: reporte, error: errorReporte } = await supabase
        .from('reporte')
        .insert({
          tipo: datos.tipo,
          fecha: datos.fecha,
          hora: datos.hora,
          lugar: datos.lugar,
          contacto: datos.contacto,
          detalle_privado: datos.detallePrivado || null,
          estado: datos.estado,
          estudiante_id: datos.estudianteId,
          objeto_id: objeto.id
        })
        .select('id,estado')
        .single();

      if (errorReporte || !reporte?.id) {
        await supabase.from('objeto').delete().eq('id', objeto.id);
        throw errorReporte || new Error('No se creó el reporte.');
      }

      return reporte;
    },

    async listarPendientes() {
      const { data, error } = await supabase
        .from('reporte')
        .select(SELECTOR_REPORTES)
        .eq('estado', 'PENDIENTE')
        .eq('tipo', 'ENCONTRADO')
        .order('fecha', { ascending: false });

      if (error) throw error;

      return data.map(reporte => ({
        id: reporte.id,
        titulo: reporte.objeto.nombre,
        categoria: reporte.objeto.categoria,
        lugar: reporte.lugar,
        fecha: reporte.fecha,
        hora: String(reporte.hora ?? '').slice(0, 5),
        descripcion: reporte.objeto.descripcion || '',
        detallePrivado: reporte.detalle_privado || '',
        imagen: reporte.objeto.foto || ''
      }));
    },

    async actualizarEstado({ id, estado, administrativoId, fechaRevision, motivoRechazo }) {
      const { data, error } = await supabase
        .from('reporte')
        .update({
          estado,
          administrativo_id: administrativoId,
          fecha_revision: fechaRevision,
          motivo_rechazo: motivoRechazo
        })
        .eq('id', id)
        .eq('estado', 'PENDIENTE')
        .select('id,estado,fecha_revision')
        .maybeSingle();

      if (error) throw error;
      return data;
    },

    async obtenerUrlFirmada(rutaImagen) {
      const { data, error } = await supabase.storage
        .from('reportes')
        .createSignedUrl(rutaImagen, 60 * 60);

      if (error) throw error;
      return data?.signedUrl || '';
    }
  };
}
