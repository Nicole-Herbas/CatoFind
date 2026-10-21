export class BuscadorService {
  constructor(objetos = []) {
    this.objetos = objetos;
  }

  obtenerPublicados() {
    return this.objetos.filter((objeto) => objeto.estado === 'Publicado');
  }

  buscarPorTitulo(texto) {
    const buscado = texto.trim().toLowerCase();
    return this.obtenerPublicados().filter((objeto) =>
      objeto.titulo.toLowerCase().includes(buscado)
    );
  }
}