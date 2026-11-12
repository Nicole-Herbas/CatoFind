import { ObjetoService } from '../services/ObjetoService.js';

const publicados = [
  { id: 10, titulo: 'Mochila azul', categoria: 'Accesorios', lugar: 'Biblioteca', fecha: '2026-11-01', estado: 'Publicado' },
  { id: 11, titulo: 'Chompa roja', categoria: 'Ropa', lugar: 'Patio', fecha: '2026-11-02', estado: 'Publicado' }
];

describe('ObjetoService', () => {
  it('empieza sin objetos locales y carga los publicados desde la API', async () => {
    const solicitar = jest.fn(async () => ({ ok: true, json: async () => publicados }));
    const service = new ObjetoService(solicitar);
    expect(service.obtenerTodos()).toEqual([]);

    await service.cargarObjetos();

    expect(solicitar).toHaveBeenCalledWith('/api/objetos');
    expect(service.obtenerTodos()).toEqual(publicados);
    expect(service.filtrarPorCategoria('Ropa').map((objeto) => objeto.id)).toEqual([11]);
    expect(service.buscarPorTitulo('MOCHILA').map((objeto) => objeto.id)).toEqual([10]);
  });

  it('no muestra ejemplos locales cuando falla la API', async () => {
    const service = new ObjetoService(async () => ({ ok: false }));
    await expect(service.cargarObjetos()).rejects.toThrow('No se pudieron cargar los objetos.');
    expect(service.obtenerTodos()).toEqual([]);
  });
});
