import { ObjetoPublicadoDto } from '../dtos/objetoPublicadoDto.js';

function normalizar(valor) {
  return String(valor ?? '').trim().toLocaleLowerCase('es');
}

function coincideConFiltros(objeto, filtros) {
  const coincideTexto = normalizar(objeto.titulo).includes(normalizar(filtros.texto));
  const coincideCategoria = !filtros.categoria || filtros.categoria === 'Todos'
    || objeto.categoria === filtros.categoria;
  const coincideLugar = !filtros.lugar || filtros.lugar === 'Todas'
    || objeto.lugar === filtros.lugar;
  const diasLimite = filtros.fecha === 'semana' ? 7 : filtros.fecha === 'mes' ? 30 : null;
  const diasAntiguedad = (Date.now() - new Date(`${objeto.fecha}T00:00:00`).getTime()) / 86400000;
  return coincideTexto && coincideCategoria && coincideLugar
    && (diasLimite === null || diasAntiguedad <= diasLimite);
}

export function crearServicioObjetos(repositorio) {
  return {
    async listarPublicados(filtros = {}) {
      const reportes = await repositorio.listarReportes();
      const publicados = reportes
        .filter(reporte => reporte.estado === 'APROBADO')
        .map(reporte => new ObjetoPublicadoDto(reporte))
        .filter(objeto => coincideConFiltros(objeto, filtros));

      return Promise.all(publicados.map(async objeto => {
        const rutaFoto = objeto.imagen;
        if (!rutaFoto || /^https?:\/\//i.test(rutaFoto)
          || !repositorio.obtenerUrlFirmada) return objeto;
        return { ...objeto, imagen: await repositorio.obtenerUrlFirmada(rutaFoto) };
      }));
    }
  };
}
