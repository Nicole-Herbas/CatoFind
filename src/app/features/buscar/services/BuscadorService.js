function normalizar(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export class BuscadorService {
  constructor(objetos = []) {
    this.objetos = objetos;
  }

  obtenerPublicados() {
    return this.objetos.filter((objeto) => objeto.estado === 'Publicado');
  }

  buscarPorTitulo(texto) {
    const buscado = normalizar(texto);
    return this.obtenerPublicados().filter((objeto) =>
      normalizar(objeto.titulo).includes(buscado)
    );
  }
}