import { crearApiCliente } from '../core/api/apiCliente.js';

export async function obtenerObjetos(filtros = {}, fetchImpl) {
  const parametros = new URLSearchParams(filtros);
  const consulta = parametros.toString();
  try {
    return await crearApiCliente(fetchImpl).solicitar(
      consulta ? `/objetos?${consulta}` : '/objetos'
    );
  } catch (error) {
    error.message ||= 'No se pudieron cargar los objetos.';
    throw error;
  }
}
