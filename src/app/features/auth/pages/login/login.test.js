
/** @jest-environment jsdom */

import { readFileSync } from 'node:fs';

const html = readFileSync(
  'src/app/features/auth/pages/login/login.html',
  'utf8'
);

const pagina = new window.DOMParser().parseFromString(
  html,
  'text/html'
);

describe('Login de CatoFind', () => {
  it('debe contener dos paneles principales', () => {
    const presentacion = pagina.querySelector(
      '.login__presentacion'
    );
    const acceso = pagina.querySelector(
      '.login__acceso'
    );

    expect(presentacion).not.toBeNull();
    expect(acceso).not.toBeNull();
  });

  it('debe mostrar el lema de CatoFind', () => {
    const titulo = pagina.querySelector(
      '.login__presentacion h1'
    );

    expect(titulo?.textContent).toContain('No todo está');
    expect(titulo?.textContent).toContain('perdido.');
  });

  it('debe mostrar el titulo de inicio de sesion', () => {
    const titulo = pagina.querySelector(
      '.login__acceso h2'
    );

    expect(titulo?.textContent).toContain('Iniciar sesión');
  });
});
