import { ObjetoService } from '../services/ObjetoService.js';

describe('ObjetoService', () => {
  it('debe retornar todos los objetos', () => {
    const service = new ObjetoService();
    const objetos = service.obtenerTodos();
    expect(objetos.length).toBeGreaterThan(0);
  });

  it('cada objeto debe tener las propiedades requeridas', () => {
    const service = new ObjetoService();
    const objetos = service.obtenerTodos();
    objetos.forEach((obj) => {
      expect(obj).toHaveProperty('id');
      expect(obj).toHaveProperty('titulo');
      expect(obj).toHaveProperty('categoria');
      expect(obj).toHaveProperty('estado');
    });
  });
});
