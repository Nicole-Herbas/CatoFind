import { Objeto } from '../models/Objeto.js';

describe('Objeto', () => {
  it('debe crear un objeto con todas sus propiedades', () => {
    const obj = new Objeto({
      id: 1,
      titulo: 'Mochila negra',
      categoria: 'Ropa',
      lugar: 'Biblioteca Central',
      fecha: '2026-10-01',
      imagen: 'mochila.jpg',
      estado: 'Publicado',
    });

    expect(obj.id).toBe(1);
    expect(obj.titulo).toBe('Mochila negra');
    expect(obj.categoria).toBe('Ropa');
    expect(obj.lugar).toBe('Biblioteca Central');
    expect(obj.fecha).toBe('2026-10-01');
    expect(obj.imagen).toBe('mochila.jpg');
    expect(obj.estado).toBe('Publicado');
  });
});
