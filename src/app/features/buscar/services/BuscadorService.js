export class BuscadorService {
  constructor(objetos = []) {
    this.objetos = objetos;
  }

  obtenerPublicados() {
    return this.objetos.filter((objeto) => objeto.estado === 'Publicado');
  }
}