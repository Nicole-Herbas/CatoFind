import { BuscadorService } from '../../services/BuscadorService.js';
import { CATEGORIAS, LUGARES, OBJETOS_INICIALES } from '../../../../core/data/datosIniciales.js';

export const RUTA_SOLICITUD = '../../../recoveryRequest/pages/recoveryRequest.html';

export function crearBuscador(objetos = OBJETOS_INICIALES) {
  return new BuscadorService(objetos);
}

export function opcionesDeFiltros() {
  return { categorias: CATEGORIAS, lugares: LUGARES };
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
    lineas: [
      `Categoría: ${objeto.categoria}`,
      `Lugar: ${objeto.lugar}`,
      `Fecha: ${objeto.fecha}`,
    ],
    rutaSolicitud: RUTA_SOLICITUD,
  };
}
