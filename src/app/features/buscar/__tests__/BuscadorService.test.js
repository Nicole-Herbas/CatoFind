import { Objeto } from '../../../core/models/Objeto.js';
import { BuscadorService } from '../services/BuscadorService.js';

function crearObjeto(id, titulo, estado) {
  return new Objeto({
    id,
    titulo,
    categoria: 'Otros',
    lugar: 'Biblioteca',
    fecha: '2026-10-08',
    imagen: '',
    estado,
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
});