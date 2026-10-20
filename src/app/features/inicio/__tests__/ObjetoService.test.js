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

  it('debe filtrar objetos por categoría', () => {
    const service = new ObjetoService();
    const ropa = service.filtrarPorCategoria('Ropa');
    expect(ropa.length).toBeGreaterThan(0);
    expect(ropa.every((o) => o.categoria === 'Ropa')).toBe(true);
  });

  it('debe retornar todos cuando la categoría es Todos', () => {
    const service = new ObjetoService();
    const todos = service.filtrarPorCategoria('Todos');
    expect(todos.length).toBe(service.obtenerTodos().length);
  });

  it('debe retornar lista vacía si la categoría no existe', () => {
    const service = new ObjetoService();
    const resultado = service.filtrarPorCategoria('CategoriaInexistente');
    expect(resultado.length).toBe(0);
  });

  it('debe buscar objetos por título (case insensitive)', () => {
    const service = new ObjetoService();
    const resultado = service.buscarPorTitulo('mochila');
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado[0].titulo.toLowerCase()).toContain('mochila');
  });

  it('debe retornar todos los objetos si la búsqueda está vacía', () => {
    const service = new ObjetoService();
    const resultado = service.buscarPorTitulo('');
    expect(resultado.length).toBe(service.obtenerTodos().length);
  });

  it('debe retornar lista vacía si no hay coincidencias', () => {
    const service = new ObjetoService();
    const resultado = service.buscarPorTitulo('xyzabcnoexiste');
    expect(resultado.length).toBe(0);
  });
});
