import { obtenerObjetos } from '../../../api/objetos.js';
import { Objeto } from '../../../core/models/Objeto.js';

function convertirAObjetos(objetos) {
  return objetos.map(objeto => new Objeto(objeto));
}

export function crearServicioInicio(apiObjetos = obtenerObjetos) {
  return {
    async obtenerRecientes() {
      return convertirAObjetos(await apiObjetos());
    },

    async filtrar(filtros) {
      return convertirAObjetos(await apiObjetos(filtros));
    }
  };
}
