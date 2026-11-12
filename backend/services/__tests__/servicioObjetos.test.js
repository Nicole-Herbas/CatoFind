import { crearServicioObjetos } from '../objetos.js';
import { Reporte } from '../../models/Reporte.js';

describe('servicio de objetos', () => {
  it('entrega los reportes aprobados como objetos publicados del catálogo', async () => {
    const repositorio = {
      listarReportes: async () => [
        new Reporte({ id: 1, fecha: '2026-10-08', lugar: 'Biblioteca', estado: 'APROBADO',
          objeto: { id: 1, nombre: 'Mochila negra', categoria: 'Accesorios', foto: 'mochila.jpg' } }),
        new Reporte({ id: 2, fecha: '2026-10-09', lugar: 'Aula 1', estado: 'PENDIENTE',
          objeto: { id: 2, nombre: 'Calculadora', categoria: 'Electrónica', foto: '' } })
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

  it('adapta el reporte del dominio al contrato del catálogo', async () => {
    const repositorio = {
      listarReportes: async () => [new Reporte({
        id: 4,
        tipo: 'ENCONTRADO',
        fecha: '2026-10-08',
        lugar: 'Biblioteca',
        estado: 'APROBADO',
        objeto: {
          id: 2,
          nombre: 'Mochila negra',
          descripcion: 'Costura roja',
          categoria: 'Accesorios',
          foto: 'mochila.jpg'
        }
      })]
    };

    const objetos = await crearServicioObjetos(repositorio).listarPublicados();

    expect(objetos).toEqual([{
      id: 2,
      titulo: 'Mochila negra',
      categoria: 'Accesorios',
      imagen: 'mochila.jpg',
      lugar: 'Biblioteca',
      fecha: '2026-10-08',
      estado: 'Publicado'
    }]);
  });
});
