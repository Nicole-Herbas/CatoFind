import { crearRepositorioObjetos } from '../repositorioObjetos.js';

describe('repositorio de objetos', () => {
  it('entrega filas planas de los reportes guardados', async () => {
    const supabase = {
      from: () => ({
        select: async () => ({
          data: [{
            fecha: '2026-10-08',
            lugar: 'Biblioteca',
            estado: 'APROBADO',
            objeto: { id: 1, titulo: 'Mochila negra', categoria: 'Accesorios', imagen_url: 'mochila.jpg' }
          }],
          error: null
        })
      })
    };

    const reportes = await crearRepositorioObjetos(supabase).listarReportes();

    expect(reportes).toEqual([{
      id: 1,
      titulo: 'Mochila negra',
      categoria: 'Accesorios',
      imagen: 'mochila.jpg',
      lugar: 'Biblioteca',
      fecha: '2026-10-08',
      estado: 'APROBADO'
    }]);
  });
});
