
import { readFileSync } from 'node:fs';
import { esCorreoInstitucional } from './login.js';

const html = readFileSync(
  'src/app/features/auth/pages/login/login.html',
  'utf8'
);

describe('Estructura del login', () => {

  it('debe tener dos paneles principales', () => {
    expect(html).toContain('class="login__presentacion"');
    expect(html).toContain('class="login__acceso"');
  });

});


describe('Estilos del login', () => {

  it('debe tener dos columnas y los colores principales', () => {
    const css = readFileSync(
      'src/app/features/auth/pages/login/login.css',
      'utf8'
    );

    expect(html).toContain('href="./login.css"');
    expect(css).toContain('display: grid;');
    expect(css).toContain('grid-template-columns: 1fr 1fr;');
    expect(css).toContain('min-height: 100vh;');
    expect(css).toContain('linear-gradient(');
    expect(css).toContain('background: #f5f7fa;');
  });

});

describe('Validacion del correo institucional', () => {

  it('debe aceptar un correo UCB', () => {
    expect(esCorreoInstitucional('estudiante@ucb.edu.bo')).toBe(true);
  });

  it('debe rechazar un correo Gmail', () => {
    expect(esCorreoInstitucional('estudiante@gmail.com')).toBe(false);
  });

  it('debe rechazar un correo sin usuario', () => {
    expect(esCorreoInstitucional('@ucb.edu.bo')).toBe(false);
  });

  it('debe rechazar un dominio parecido', () => {
    expect(esCorreoInstitucional('estudiante@falsoucb.edu.bo')).toBe(false);
  });

});