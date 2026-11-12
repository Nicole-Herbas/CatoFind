import { Objeto } from '../models/Objeto.js';

export class ObjetoService {
  constructor(solicitar = globalThis.fetch.bind(globalThis)) {
    this.objetos = [];
    this.solicitar = solicitar;
  }

  async cargarObjetos() {
    const respuesta = await this.solicitar('/api/objetos');
    if (!respuesta.ok) throw new Error('No se pudieron cargar los objetos.');
    this.objetos = (await respuesta.json()).map((datos) => new Objeto(datos));
    return this.objetos;
  }
  obtenerTodos() {
    return this.objetos;
  }

  filtrarPorCategoria(categoria) {
    if (categoria === 'Todos') return this.objetos;
    return this.objetos.filter((o) => o.categoria === categoria);
  }

  buscarPorTitulo(query) {
    if (!query) return this.objetos;
    return this.objetos.filter((o) =>
      o.titulo.toLowerCase().includes(query.toLowerCase())
    );
  }
}
