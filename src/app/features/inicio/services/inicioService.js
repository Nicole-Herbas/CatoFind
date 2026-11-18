import { crearRepositorioObjetos } from '../../../api/repositorios/objetos.js';
import { Objeto } from '../../../core/models/Objeto.js';

function convertirAObjetos(objetos) {
  return objetos.map(objeto => new Objeto(objeto));
}

export function crearServicioInicio(repositorioObjetos = crearRepositorioObjetos()) {
  return {
    async obtenerRecientes() {
      return convertirAObjetos(await repositorioObjetos.listar());
    },

    async filtrar(filtros) {
      return convertirAObjetos(await repositorioObjetos.listar(filtros));
    }
  };
}
