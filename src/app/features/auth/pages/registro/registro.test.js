
import { readFileSync } from 'node:fs';

const html = readFileSync(
  'src/app/features/auth/pages/registro/registro.html',
  'utf8'
);

describe('Formulario de registro', () => {

  it('debe mostrar el logo y titulo', () => {
    expect(html).toContain('ucb.png');
    expect(html).toContain('CATO');
    expect(html).toContain('FIND');
    expect(html).toContain('Crear cuenta');
  });

  it('debe tener los cinco campos del registro', () => {
    expect(html).toContain('id="nombre"');
    expect(html).toContain('id="apellido"');
    expect(html).toContain('id="correo-registro"');
    expect(html).toContain('id="contrasena-registro"');
    expect(html).toContain('id="confirmar-contrasena"');
  });

  it('debe tener el boton para crear cuenta', () => {
    expect(html).toContain('id="registro-form"');
    expect(html).toContain('type="submit"');
    expect(html).toContain('Crear cuenta</button>');
  });

  it('debe permitir volver al login', () => {
    expect(html).toContain(
      'href="../login/login.html"'
    );
    expect(html).toContain('Inicia sesión</a>');
  });

});




const css = readFileSync(
  'src/app/features/auth/pages/registro/registro.css',
  'utf8'
);

describe('Estilos del formulario de registro', () => {

  it('debe centrar el formulario en pantalla', () => {
    const estilos = css.split('.registro {')[1]?.split('}')[0] || '';

    expect(estilos).toContain('display: flex;');
    expect(estilos).toContain('justify-content: center;');
    expect(estilos).toContain('align-items: center;');
    expect(estilos).toContain('min-height: 100vh;');
  });

  it('debe mostrar una tarjeta blanca redondeada', () => {
    const estilos = css.split('.registro__tarjeta {')[1]?.split('}')[0] || '';

    expect(estilos).toContain('background: #ffffff;');
    expect(estilos).toContain('max-width: 448px;');
    expect(estilos).toContain('border-radius: 28px;');
  });

  it('debe organizar nombre y apellido en dos columnas', () => {
    const estilos = css.split('.registro__nombres {')[1]?.split('}')[0] || '';

    expect(estilos).toContain('display: grid;');
    expect(estilos).toContain('grid-template-columns: 1fr 1fr;');
  });

  it('debe tener campos redondeados', () => {
    const estilos = css.split('#registro-form input {')[1]?.split('}')[0] || '';

    expect(estilos).toContain('border-radius: 24px;');
    expect(estilos).toContain('padding: 14px 16px;');
  });

  it('debe mostrar un boton azul', () => {
    const estilos = css.split('#registro-form button {')[1]?.split('}')[0] || '';

    expect(estilos).toContain('background: #0b3979;');
    expect(estilos).toContain('color: white;');
    expect(estilos).toContain('border-radius: 24px;');
  });

});
