import { Objeto } from '../../../core/models/Objeto.js';
import { BuscadorService } from '../services/BuscadorService.js';

function crearObjeto(id, titulo, estado, extra = {}) {
  return new Objeto({
    id,
    titulo,
    categoria: 'Otros',
    lugar: 'Biblioteca',
    fecha: '2026-10-08',
    imagen: '',
    estado,
    ...extra,
  });
}

describe('BuscadorService - catálogo (HU-07)', () => {
  it('debe devolver solo los objetos publicados', () => {
    const service = new BuscadorService([
      crearObjeto(1, 'Mochila negra', 'Publicado'),
      crearObjeto(2, 'Calculadora', 'En revisión'),
    ]);

    const titulos = service.obtenerPublicados().map((o) => o.titulo);

    expect(titulos).toEqual(['Mochila negra']);
  });
});

describe('BuscadorService - búsqueda por nombre (HU-09)', () => {
  // Ciclo 3
  it('debe encontrar objetos sin importar mayúsculas', () => {
    const service = new BuscadorService([
      crearObjeto(1, 'Celular Samsung', 'Publicado'),
      crearObjeto(2, 'Mochila negra', 'Publicado'),
    ]);

    const titulos = service.buscarPorTitulo('CELULAR').map((o) => o.titulo);

    expect(titulos).toEqual(['Celular Samsung']);
  });

  it('debe ignorar espacios al inicio y al final', () => {
    const service = new BuscadorService([
      crearObjeto(1, 'Celular Samsung', 'Publicado'),
    ]);

    const titulos = service.buscarPorTitulo('  celular  ').map((o) => o.titulo);

    expect(titulos).toEqual(['Celular Samsung']);
  });

    it('debe encontrar objetos aunque no se escriban las tildes', () => {
    const service = new BuscadorService([
      crearObjeto(1, 'Cámara Canon', 'Publicado'),
    ]);

    const titulos = service.buscarPorTitulo('camara').map((o) => o.titulo);

    expect(titulos).toEqual(['Cámara Canon']);
  });

  
});

describe('BuscadorService - filtro por categoría (HU-07)', () => {
  const service = new BuscadorService([
    crearObjeto(1, 'Celular Samsung', 'Publicado', { categoria: 'Electrónica' }),
    crearObjeto(2, 'Chompa azul', 'Publicado', { categoria: 'Ropa' }),
    crearObjeto(3, 'Laptop HP', 'En revisión', { categoria: 'Electrónica' }),
  ]);

  it('debe devolver solo los publicados de esa categoría', () => {
    const titulos = service.filtrarPorCategoria('Electrónica').map((o) => o.titulo);

    expect(titulos).toEqual(['Celular Samsung']);
  });

  it('debe devolver todos los publicados con la categoría "Todos"', () => {
    const titulos = service.filtrarPorCategoria('Todos').map((o) => o.titulo);

    expect(titulos).toEqual(['Celular Samsung', 'Chompa azul']);
  });
});

describe('BuscadorService - filtro por lugar (HU-07)', () => {
  const service = new BuscadorService([
    crearObjeto(1, 'Mochila negra', 'Publicado', { lugar: 'Biblioteca' }),
    crearObjeto(2, 'Chompa azul', 'Publicado', { lugar: 'Cafetería' }),
    crearObjeto(3, 'Cuaderno verde', 'En revisión', { lugar: 'Biblioteca' }),
  ]);

  it('debe devolver solo los publicados de ese lugar', () => {
    const titulos = service.filtrarPorLugar('Biblioteca').map((o) => o.titulo);

    expect(titulos).toEqual(['Mochila negra']);
  });

  it('debe devolver todos los publicados con el lugar "Todas"', () => {
    const titulos = service.filtrarPorLugar('Todas').map((o) => o.titulo);

    expect(titulos).toEqual(['Mochila negra', 'Chompa azul']);
  });
});

describe('BuscadorService - filtro por fecha (HU-07)', () => {
  const hoy = new Date('2026-10-21T12:00:00');
  const service = new BuscadorService([
    crearObjeto(1, 'Mochila negra', 'Publicado', { fecha: '2026-10-19' }),
    crearObjeto(2, 'Chompa azul', 'Publicado', { fecha: '2026-10-05' }),
    crearObjeto(3, 'Paraguas', 'Publicado', { fecha: '2026-08-01' }),
  ]);

  it('debe devolver los de la última semana', () => {
    const titulos = service.filtrarPorFecha('semana', hoy).map((o) => o.titulo);

    expect(titulos).toEqual(['Mochila negra']);
  });

  it('debe devolver los del último mes', () => {
    const titulos = service.filtrarPorFecha('mes', hoy).map((o) => o.titulo);

    expect(titulos).toEqual(['Mochila negra', 'Chompa azul']);
  });

  it('debe devolver todos con "cualquiera"', () => {
    const titulos = service.filtrarPorFecha('cualquiera', hoy).map((o) => o.titulo);

    expect(titulos).toEqual(['Mochila negra', 'Chompa azul', 'Paraguas']);
  });
});

describe('BuscadorService - búsqueda combinada (HU-07/09)', () => {
  const hoy = new Date('2026-10-21T12:00:00');
  const service = new BuscadorService([
    crearObjeto(1, 'Celular Samsung', 'Publicado', { categoria: 'Electrónica', lugar: 'Biblioteca' }),
    crearObjeto(2, 'Celular Xiaomi', 'Publicado', { categoria: 'Electrónica', lugar: 'Cafetería' }),
    crearObjeto(3, 'Funda de celular', 'Publicado', { categoria: 'Accesorios', lugar: 'Biblioteca' }),
    crearObjeto(4, 'Celular Motorola', 'En revisión', { categoria: 'Electrónica', lugar: 'Biblioteca' }),
  ]);

  it('debe aplicar texto, categoría y lugar al mismo tiempo', () => {
    const titulos = service
      .buscar({ texto: 'celular', categoria: 'Electrónica', lugar: 'Biblioteca' }, hoy)
      .map((o) => o.titulo);

    expect(titulos).toEqual(['Celular Samsung']);
  });

  it('debe devolver todos los publicados si no hay criterios', () => {
    const titulos = service.buscar({}, hoy).map((o) => o.titulo);

    expect(titulos).toEqual(['Celular Samsung', 'Celular Xiaomi', 'Funda de celular']);
  });
});

describe('BuscadorService - mensaje de resultados (HU-09)', () => {
  const service = new BuscadorService();

  it('debe avisar cuando no hay resultados', () => {
    expect(service.mensajeResultados([])).toBe('No se encontró ningún objeto');
  });

  it('debe usar singular con un resultado', () => {
    expect(service.mensajeResultados([{}])).toBe('1 resultado encontrado');
  });

  it('debe usar plural con varios resultados', () => {
    expect(service.mensajeResultados([{}, {}, {}])).toBe('3 resultados encontrados');
  });
});
describe('BuscadorService - detalle del objeto (HU-08)', () => {
  const service = new BuscadorService([
    crearObjeto(1, 'Mochila negra', 'Publicado'),
    crearObjeto(2, 'Calculadora', 'En revisión'),
  ]);

  it('debe devolver el objeto publicado con ese id', () => {
    expect(service.obtenerDetalle(1).titulo).toBe('Mochila negra');
  });

  it('debe devolver null si el objeto no está publicado', () => {
    expect(service.obtenerDetalle(2)).toBeNull();
  });

  it('debe devolver null si el id no existe', () => {
    expect(service.obtenerDetalle(99)).toBeNull();
  });
});