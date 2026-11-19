import { crearClienteApi } from '../clienteApi.js';

export function crearRepositorioObjetos(cliente = crearClienteApi()) {
  return {
    listar(filtros = {}) {
      const parametros = new globalThis.URLSearchParams();
      Object.entries(filtros).forEach(([clave, valor]) => {
        if (valor !== undefined && valor !== null) {
          parametros.set(clave, valor);
        }
      });
      const query = parametros.toString();
      return cliente.get(`/objetos${query ? `?${query}` : ''}`);
    }
  };
}
