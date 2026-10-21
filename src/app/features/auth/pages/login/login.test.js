
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

describe('Presentacion de CatoFind', () => {

  it('debe mostrar el logo de CatoFind', () => {
    expect(html).toContain('class="login__marca"');
    expect(html).toContain('ucb.png');
    expect(html).toContain('CATO');
    expect(html).toContain('FIND');
  });

  it('debe mostrar el lema principal', () => {
    expect(html).toContain('No todo está');
    expect(html).toContain('perdido.');
  });

  it('debe mostrar la descripcion', () => {
    expect(html).toContain(
      'Busca, reporta y recupera objetos'
    );
  });

});

describe('Fotografias de CatoFind', () => {

  it('debe mostrar las tres imagenes', () => {
    expect(html).toContain('mochila.jpg');
    expect(html).toContain('perro.jpg');
    expect(html).toContain('audifonos.jpg');
  });

  it('debe tener el contenedor de imagenes', () => {
    expect(html).toContain('class="login__imagenes"');
  });

});
describe('Logo institucional del login', () => {

  it('debe mostrar el logo de la UCB', () => {
    expect(html).toContain('class="login__logo-ucb"');
    expect(html).toContain('Escudo Universidad Católica Boliviana');
    expect(html).toContain('UNIVERSIDAD');
    expect(html).toContain('CATÓLICA');
    expect(html).toContain('BOLIVIANA');
  });

});



const css = readFileSync(
  'src/app/features/auth/pages/login/login.css',
  'utf8'
);

describe('Estilos del logo institucional', () => {

  it('debe organizar el logo horizontalmente', () => {
    expect(css).toContain('.login__logo-ucb {');
    expect(css).toContain('gap: 8px;');
  });

  it('debe establecer el tamaño del escudo', () => {
    expect(css).toContain('.login__logo-ucb img {');
    expect(css).toContain('width: 40px;');
    expect(css).toContain('height: 56px;');
  });

  it('debe tener estilos para el texto', () => {
    expect(css).toContain('.login__logo-texto {');
    expect(css).toContain('.login__logo-texto strong {');
  });

});


describe('Opciones de cuenta', () => {

  it('debe mostrar la opcion de registrarse', () => {
    expect(html).toContain('Registrarse');
  });

  it('debe mostrar la opcion de recuperar contraseña', () => {
    expect(html).toContain('Recuperar contraseña');
  });

  it('debe tener el contenedor de opciones', () => {
    expect(html).toContain('class="login__enlaces"');
  });

});


describe('Enlaces del login', () => {

  it('debe tener un enlace para registrarse', () => {
    expect(html).toContain(
      'href="../registro/registro.html"'
    );
    expect(html).toContain('Registrarse</a>');
  });

  it('debe tener un enlace para recuperar contraseña', () => {
    expect(html).toContain(
      'href="../recuperar-password/recuperar-password.html"'
    );
    expect(html).toContain('Recuperar contraseña</a>');
  });

});

describe('Estilos de los enlaces', () => {

  it('debe distribuir los enlaces horizontalmente', () => {
    const estilos = css.split('.login__enlaces {')[1]?.split('}')[0] || '';

    expect(estilos).toContain('display: flex;');
    expect(estilos).toContain('justify-content: space-between;');
  });

  it('debe dar estilos a los enlaces', () => {
    const estilos = css.split('.login__enlaces a {')[1]?.split('}')[0] || '';

    expect(estilos).toContain('color: #24518f;');
    expect(estilos).toContain('text-decoration: none;');
  });

});

describe('Rutas del login', () => {

  it('debe encontrar las paginas de destino', () => {
    expect(() => readFileSync(
      'src/app/features/auth/pages/registro/registro.html',
      'utf8'
    )).not.toThrow();

    expect(() => readFileSync(
      'src/app/features/auth/pages/recuperar-password/recuperar-password.html',
      'utf8'
    )).not.toThrow();
  });

});