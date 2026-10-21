function normalizar(texto) {
  return texto
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

const DIAS_POR_RANGO = { semana: 7, mes: 30 };
const MS_POR_DIA = 24 * 60 * 60 * 1000;

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

  filtrarPorCategoria(categoria) {
    const publicados = this.obtenerPublicados();
    if (categoria === 'Todos') return publicados;
    return publicados.filter((objeto) => objeto.categoria === categoria);
  }

  filtrarPorLugar(lugar) {
    const publicados = this.obtenerPublicados();
    if (lugar === 'Todas') return publicados;
    return publicados.filter((objeto) => objeto.lugar === lugar);
  }

  filtrarPorFecha(rango, hoy = new Date()) {
    const publicados = this.obtenerPublicados();
    const dias = DIAS_POR_RANGO[rango];
    if (!dias) return publicados;

    return publicados.filter((objeto) => {
      const fecha = new Date(objeto.fecha + 'T00:00:00');
      const diasPasados = (hoy - fecha) / MS_POR_DIA;
      return diasPasados <= dias;
    });
  }

  buscar(criterios = {}, hoy = new Date()) {
    const {
      texto = '',
      categoria = 'Todos',
      lugar = 'Todas',
      fecha = 'cualquiera',
    } = criterios;

    const ids = (lista) => new Set(lista.map((objeto) => objeto.id));
    const porCategoria = ids(this.filtrarPorCategoria(categoria));
    const porLugar = ids(this.filtrarPorLugar(lugar));
    const porFecha = ids(this.filtrarPorFecha(fecha, hoy));

    return this.buscarPorTitulo(texto).filter(
      (objeto) =>
        porCategoria.has(objeto.id) &&
        porLugar.has(objeto.id) &&
        porFecha.has(objeto.id)
    );
  }
}