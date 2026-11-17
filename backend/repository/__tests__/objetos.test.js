import { crearRepositorioObjetos } from '../objetos.js';
import { Reporte } from '../../models/Reporte.js';

describe('repositorio de objetos', () => {
  it('devuelve reportes con su objeto como entidades de dominio', async () => {
    const supabase = {
      from: () => ({
        select: async () => ({
          data: [{
            id: 4,
            tipo: 'ENCONTRADO',
            fecha: '2026-10-08',
            lugar: 'Biblioteca',
            contacto: 'estudiante@ucb.edu.bo',
            estado: 'APROBADO',
            objeto: {
              id: 2,
              nombre: 'Mochila negra',
              descripcion: 'Con una costura roja',
              categoria: 'Accesorios',
              foto: 'mochila.jpg'
            }
          }],
          error: null
        })
      })
    };

    const [reporte] = await crearRepositorioObjetos(supabase).listarReportes();

    expect(reporte).toBeInstanceOf(Reporte);
    expect(reporte.objeto).toEqual({
      id: 2,
      nombre: 'Mochila negra',
      descripcion: 'Con una costura roja',
      categoria: 'Accesorios',
      foto: 'mochila.jpg'
    });
  });
});
