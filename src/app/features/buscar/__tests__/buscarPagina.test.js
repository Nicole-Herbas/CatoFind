/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'node:fs';

const html = readFileSync('src/app/features/buscar/pages/buscar/buscar.html', 'utf8');
const pagina = new DOMParser().parseFromString(html, 'text/html');

describe('Página Buscar - estructura', () => {
  it('debe tener el buscador de texto', () => {
    expect(pagina.querySelector('#buscador')).not.toBeNull();
  });

  it('debe tener los filtros de categoría, lugar y fecha', () => {
    expect(pagina.querySelector('#filtro-categoria')).not.toBeNull();
    expect(pagina.querySelector('#filtro-lugar')).not.toBeNull();
    expect(pagina.querySelector('#filtro-fecha')).not.toBeNull();
  });

  it('debe tener el mensaje y el contenedor de resultados', () => {
    expect(pagina.querySelector('#mensaje-resultados')).not.toBeNull();
    expect(pagina.querySelector('#resultados')).not.toBeNull();
  });

  it('debe enlazar su hoja de estilos', () => {
    expect(pagina.querySelector('link[href="./buscar.css"]')).not.toBeNull();
  });

  it('debe tener los enlaces correctos en la barra de navegacion', () => {
    const navLinks = pagina.querySelectorAll('header.navbar nav a');
    expect(navLinks[0].getAttribute('href')).toBe('../../../inicio/pages/inicio/inicio.html');
    expect(navLinks[1].getAttribute('href')).toBe('./buscar.html');
    expect(navLinks[2].getAttribute('href')).toBe('../../../recoveryRequest/pages/recoveryRequest.html');
  });
});