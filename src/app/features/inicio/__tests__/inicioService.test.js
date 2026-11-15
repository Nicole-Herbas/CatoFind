import { Objeto } from '../../../core/models/Objeto.js';
import { crearServicioInicio } from '../services/inicioService.js';

const objetoPublicado = {
  id: 1,
  reporteId: 11,
  titulo: 'Mochila negra',
  categoria: 'Accesorios',
  lugar: 'Biblioteca',
  fecha: '2026-11-10',
  imagen: 'https://foto.test/mochila.jpg',
  estado: 'Publicado'
};

describe('servicio de Inicio', () => {
  it('obtiene los objetos recientes sin filtros y usa el modelo compartido', async () => {
    const apiObjetos = jest.fn().mockResolvedValue([objetoPublicado]);
    const servicio = crearServicioInicio(apiObjetos);

    const objetos = await servicio.obtenerRecientes();

    expect(apiObjetos).toHaveBeenCalledWith();
    expect(objetos).toHaveLength(1);
    expect(objetos[0]).toBeInstanceOf(Objeto);
    expect(objetos[0]).toEqual(objetoPublicado);
  });

  it('delega los filtros a la API y convierte sus resultados al modelo compartido', async () => {
    const apiObjetos = jest.fn().mockResolvedValue([objetoPublicado]);
    const servicio = crearServicioInicio(apiObjetos);
    const filtros = { categoria: 'Accesorios', texto: 'mochila' };

    const objetos = await servicio.filtrar(filtros);

    expect(apiObjetos).toHaveBeenCalledWith(filtros);
    expect(objetos[0]).toBeInstanceOf(Objeto);
    expect(objetos[0].reporteId).toBe(11);
  });

  it('propaga errores de la API para que el presentador los comunique', async () => {
    const error = new Error('No se pudo cargar el catálogo.');
    const servicio = crearServicioInicio(jest.fn().mockRejectedValue(error));

    await expect(servicio.obtenerRecientes()).rejects.toBe(error);
  });
});
