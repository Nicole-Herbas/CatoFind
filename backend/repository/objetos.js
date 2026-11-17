import { Reporte } from '../models/Reporte.js';

export function crearRepositorioObjetos(supabase) {
  return {
    async listarReportes() {
      const { data, error } = await supabase
        .from('reporte')
        .select('id,tipo,fecha,lugar,contacto,estado,motivo_rechazo,fecha_revision,estudiante_id,administrativo_id,objeto:objeto_id(id,nombre,descripcion,categoria,foto)');

      if (error) {
        throw error;
      }

      return data.map(reporte => new Reporte({
        id: reporte.id,
        tipo: reporte.tipo,
        fecha: reporte.fecha,
        lugar: reporte.lugar,
        contacto: reporte.contacto,
        estado: reporte.estado,
        motivoRechazo: reporte.motivo_rechazo,
        fechaRevision: reporte.fecha_revision,
        estudianteId: reporte.estudiante_id,
        administrativoId: reporte.administrativo_id,
        objeto: reporte.objeto
      }));
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
