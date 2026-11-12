import { BuscadorService } from '../../services/BuscadorService.js';

export const RUTA_SOLICITUD = '../../../recoveryRequest/pages/recoveryRequest.html';

export function crearBuscador(objetos = []) {
  return new BuscadorService(objetos);
}

export function opcionesDeFiltros(objetos = []) {
  return {
    categorias: ['Todos', ...new Set(objetos.map((objeto) => objeto.categoria).filter(Boolean))],
    lugares: ['Todas', ...new Set(objetos.map((objeto) => objeto.lugar).filter(Boolean))]
  };
}

export function obtenerBusquedaInicial(textoUrl) {
  const texto = new URLSearchParams(textoUrl ?? '').get('q');
  return texto ? texto.trim() : '';
}

export function obtenerResultados(servicio, criterios, hoy = new Date()) {
  const objetos = servicio.buscar(criterios, hoy);
  return { objetos, mensaje: servicio.mensajeResultados(objetos) };
}

export function datosTarjeta(objeto) {
  return {
    id: objeto.id,
    titulo: objeto.titulo,
    imagen: objeto.imagen || '',
    estado: objeto.estado,
    datos: [objeto.categoria, objeto.lugar, objeto.fecha],
  };
}

export function datosDetalle(servicio, id) {
  const objeto = servicio.obtenerDetalle(Number(id));
  if (!objeto) return null;

  return {
    titulo: objeto.titulo,
    reporteId: objeto.reporteId,
    lineas: [
      `Categoría: ${objeto.categoria}`,
      `Lugar: ${objeto.lugar}`,
      `Fecha: ${objeto.fecha}`,
    ],
    rutaSolicitud: objeto.reporteId
      ? `${RUTA_SOLICITUD}?reporteId=${encodeURIComponent(objeto.reporteId)}`
      : RUTA_SOLICITUD,
  };
}
