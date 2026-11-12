import { ObjetoPublicadoDto } from '../dtos/objetoPublicadoDto.js';

export function crearServicioObjetos(repositorio) {
  return {
    async listarPublicados() {
      const reportes = await repositorio.listarReportes();
      const aprobados = reportes.filter(reporte => reporte.estado === 'APROBADO');
      return aprobados.map(reporte => new ObjetoPublicadoDto(reporte));
    }
  };
}
