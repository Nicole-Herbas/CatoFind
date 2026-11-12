export class ObjetoPublicadoDto {
  constructor(reporte) {
    this.id = reporte.objeto.id;
    this.titulo = reporte.objeto.nombre;
    this.categoria = reporte.objeto.categoria;
    this.lugar = reporte.lugar;
    this.fecha = reporte.fecha;
    this.imagen = reporte.objeto.foto;
    this.estado = 'Publicado';
  }
}
