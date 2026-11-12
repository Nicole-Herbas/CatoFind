
import {
  esCorreoInstitucional,
  mensajeRecuperacion,
  obtenerRutaPostLogin
} from './login.js';
import { readFileSync } from 'node:fs';


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

  it('debe tener un boton de recuperacion sin navegar', () => {
  expect(html).toContain(
    '<button type="button" id="recuperar-contrasena">'
  );

  expect(html).not.toContain(
    'href="../recuperar-password/recuperar-password.html"'
  );
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

   
  });

});

describe('Conexion MVP del login', () => {

  it('debe cargar el presentador desde el HTML', () => {
    expect(html).toContain('src="./loginPresenter.js"');
    expect(html).not.toContain('src="./login.js"');
  });

});


describe('Recuperacion de contrasena', () => {

  it('debe devolver el mensaje de confirmacion', () => {
    expect(mensajeRecuperacion()).toBe(
      'Te enviaríamos un enlace de recuperación a tu correo ' 
    );
  });

});
describe('Notificacion flotante de recuperacion', () => {

  it('debe tener un contenedor para la notificacion', () => {
    expect(html).toContain('id="mensaje-recuperacion"');
    expect(html).toContain('class="login__toast"');
    expect(html).toContain('role="status"');
    expect(html).toContain('hidden');
  });

  it('debe mostrar la notificacion arriba y centrada', () => {
    const estilos = css.split('.login__toast {')[1]?.split('}')[0] || '';

    expect(estilos).toContain('position: fixed;');
    expect(estilos).toContain('top: 38px;');
    expect(estilos).toContain('left: 50%;');
    expect(estilos).toContain('transform: translateX(-50%);');
  });

});


describe('Redireccion despues del login HU-02', () => {

  it('debe enviar al administrador al panel administrativo', () => {
    const resultado = {
      ok: true,
      usuario: {
        correo: 'bienestar@ucb.edu.bo',
        rol: 'ADMIN'
      }
    };

    expect(obtenerRutaPostLogin(resultado))
      .toBe('../../../admin/pages/panel/panel.html');
  });

  it('debe enviar al estudiante a inicio', () => {
    const resultado = {
      ok: true,
      usuario: {
        correo: 'estudiante@ucb.edu.bo',
        rol: 'ESTUDIANTE'
      }
    };

    expect(obtenerRutaPostLogin(resultado))
      .toBe('../../../inicio/pages/inicio/inicio.html');
  });

  it('no debe redirigir con credenciales incorrectas', () => {
    const resultado = {
      ok: false,
      mensaje: 'Correo o contraseña incorrectos.'
    };

    expect(obtenerRutaPostLogin(resultado))
      .toBeNull();
  });

  it('no debe redirigir si el resultado es invalido', () => {
    expect(obtenerRutaPostLogin(null)).toBeNull();
  });

});
