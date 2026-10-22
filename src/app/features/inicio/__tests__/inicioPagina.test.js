/**
 * @jest-environment jsdom
 */
import { readFileSync } from 'node:fs';

const html = readFileSync('src/app/features/inicio/pages/inicio/inicio.html', 'utf8');
const pagina = new DOMParser().parseFromString(html, 'text/html');

describe('Página Inicio - navegación y enlaces', () => {
  it('debe tener el enlace de inicio apuntando a inicio.html', () => {
    const link = pagina.querySelector('#nav-inicio');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('./inicio.html');
  });

  it('debe tener el enlace de buscar apuntando a buscar.html', () => {
    const link = pagina.querySelector('#nav-buscar');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('../../../buscar/pages/buscar/buscar.html');
  });

  it('debe tener el enlace de reportar apuntando a recoveryRequest.html', () => {
    const link = pagina.querySelector('#nav-reportar');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('../../../recoveryRequest/pages/recoveryRequest.html');
  });

  it('debe tener el enlace de ver todo apuntando a buscar.html', () => {
    const link = pagina.querySelector('#link-ver-todo');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toBe('../../../buscar/pages/buscar/buscar.html');
  });

  it('debe tener el boton de logout', () => {
    expect(pagina.querySelector('#btn-logout')).not.toBeNull();
  });
});
