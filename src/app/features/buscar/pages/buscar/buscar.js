export const RUTA_SOLICITUD = '../../../recoveryRequest/pages/recoveryRequest.html';

export function obtenerBusquedaInicial(textoUrl) {
  const texto = new URLSearchParams(textoUrl ?? '').get('q');
  return texto ? texto.trim() : '';
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

export function datosDetalle(objeto) {
  return {
    titulo: objeto.titulo,
    imagen: objeto.imagen || '',
    descripcion: objeto.descripcion?.trim() || 'Sin descripción',
    lineas: [`Categoría: ${objeto.categoria}`, `Lugar: ${objeto.lugar}`, `Fecha: ${objeto.fecha}`],
  };
}
