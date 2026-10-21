import { OBJETOS_INICIALES, CATEGORIAS, LUGARES } from '../data/datosIniciales.js';

describe('Datos iniciales', () => {
  it('debe tener objetos de ejemplo', () => {
    expect(OBJETOS_INICIALES.length).toBeGreaterThan(0);
  });

  it('las listas de filtros deben empezar con la opción "sin filtro"', () => {
    expect(CATEGORIAS[0]).toBe('Todos');
    expect(LUGARES[0]).toBe('Todas');
  });

  it('cada objeto debe usar una categoría y un lugar válidos', () => {
    OBJETOS_INICIALES.forEach((objeto) => {
      expect(CATEGORIAS).toContain(objeto.categoria);
      expect(LUGARES).toContain(objeto.lugar);
    });
  });
});