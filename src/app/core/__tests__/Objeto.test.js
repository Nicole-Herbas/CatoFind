import { Objeto } from '../models/Objeto.js';

describe('Objeto', () => {
  it('debe crear un objeto con todas sus propiedades', () => {
    const objeto = new Objeto({
      id: 1,
      titulo: 'Mochila negra',
      categoria: 'Accesorios',
      lugar: 'Biblioteca',
      fecha: '2026-10-08',
      imagen: 'mochila.jpg',
      estado: 'Publicado',
    });

    expect(objeto.id).toBe(1);
    expect(objeto.titulo).toBe('Mochila negra');
    expect(objeto.categoria).toBe('Accesorios');
    expect(objeto.lugar).toBe('Biblioteca');
    expect(objeto.fecha).toBe('2026-10-08');
    expect(objeto.imagen).toBe('mochila.jpg');
    expect(objeto.estado).toBe('Publicado');
  });
});