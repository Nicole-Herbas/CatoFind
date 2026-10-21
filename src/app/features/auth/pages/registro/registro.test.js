
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
