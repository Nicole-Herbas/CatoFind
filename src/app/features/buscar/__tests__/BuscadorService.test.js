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