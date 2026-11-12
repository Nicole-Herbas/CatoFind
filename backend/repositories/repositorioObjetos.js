export function crearRepositorioObjetos(supabase) {
  return {
    async listarReportes() {
      const { data, error } = await supabase
        .from('reporte')
        .select('fecha,lugar,estado,objeto:objeto_id(id,titulo,categoria,imagen_url)');

      if (error) {
        throw error;
      }

      return data.map(reporte => ({
        id: reporte.objeto.id,
        titulo: reporte.objeto.titulo,
        categoria: reporte.objeto.categoria,
        imagen: reporte.objeto.imagen_url,
        lugar: reporte.lugar,
        fecha: reporte.fecha,
        estado: reporte.estado
      }));
    }
  };
}
