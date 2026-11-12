import { crearServicioObjetos } from '../objetos.js';

describe('servicio de objetos', () => {
  it('entrega los reportes aprobados como objetos publicados del catálogo', async () => {
    const repositorio = {
      listarReportes: async () => [
        { id: 1, titulo: 'Mochila negra', categoria: 'Accesorios', imagen: 'mochila.jpg',
          lugar: 'Biblioteca', fecha: '2026-10-08', estado: 'APROBADO' },
        { id: 2, titulo: 'Calculadora', categoria: 'Electrónica', imagen: '',
          lugar: 'Aula 1', fecha: '2026-10-09', estado: 'PENDIENTE' }
      ]
    };

    const objetos = await crearServicioObjetos(repositorio).listarPublicados();

    expect(objetos).toEqual([{
      id: 1,
      titulo: 'Mochila negra',
      categoria: 'Accesorios',
      lugar: 'Biblioteca',
      fecha: '2026-10-08',
      imagen: 'mochila.jpg',
      estado: 'Publicado'
    }]);
  });
});
