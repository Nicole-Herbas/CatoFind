
import { readFileSync } from 'node:fs';
import {
  esCorreoInstitucional,
  iniciarSesion,
  obtenerSesion,
  cerrarSesion,
  mensajeRecuperacion,
  crearAdministradorDemo,
  verificarAccesoAdministrador
} from './login.js';

import { UsuarioService } from '../../services/UsuarioService.js';
import { registrarEstudiante } from '../registro/registro.js';

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

describe('Autenticacion de estudiantes', () => {

  let almacenamiento;

  beforeEach(() => {
    const memoria = {};

    almacenamiento = {
      getItem: clave => memoria[clave] ?? null,
      setItem: (clave, valor) => {
        memoria[clave] = valor;
      }
    };

    const servicio = new UsuarioService(almacenamiento);

    servicio.guardarUsuario({
      nombre: 'Jose',
      apellido: 'Prueba',
      correo: 'estudiante@ucb.edu.bo',
      contrasena: 'Demo12345'
    });
  });

  it('debe iniciar sesion con credenciales correctas', () => {
    const resultado = iniciarSesion(
      'estudiante@ucb.edu.bo',
      'Demo12345',
      almacenamiento
    );

    expect(resultado.ok).toBe(true);
    expect(resultado.usuario.correo).toBe('estudiante@ucb.edu.bo');
  });

  it('debe rechazar una contrasena incorrecta', () => {
    const resultado = iniciarSesion(
      'estudiante@ucb.edu.bo',
      'Incorrecta',
      almacenamiento
    );

    expect(resultado.ok).toBe(false);
    expect(resultado.mensaje).toBe('Correo o contraseña incorrectos.');
  });

  it('debe rechazar un correo no registrado', () => {
    const resultado = iniciarSesion(
      'otro@ucb.edu.bo',
      'Demo12345',
      almacenamiento
    );

    expect(resultado.ok).toBe(false);
  });

  it('debe rechazar correos externos a la UCB', () => {
    const resultado = iniciarSesion(
      'estudiante@gmail.com',
      'Demo12345',
      almacenamiento
    );

    expect(resultado.ok).toBe(false);
  });

  it('debe rechazar campos vacios', () => {
    const resultado = iniciarSesion(
      '',
      '',
      almacenamiento
    );

    expect(resultado.ok).toBe(false);
  });

  it('debe aceptar correos con mayusculas', () => {
    const resultado = iniciarSesion(
      'ESTUDIANTE@UCB.EDU.BO',
      'Demo12345',
      almacenamiento
    );

    expect(resultado.ok).toBe(true);
  });

  it('no debe devolver la contrasena al presentador', () => {
    const resultado = iniciarSesion(
      'estudiante@ucb.edu.bo',
      'Demo12345',
      almacenamiento
    );

    expect(resultado.usuario).not.toHaveProperty('contrasena');
  });

});

describe('Conexion MVP del login', () => {

  it('debe cargar el presentador desde el HTML', () => {
    expect(html).toContain('src="./loginPresenter.js"');
    expect(html).not.toContain('src="./login.js"');
  });

});


describe('Sesion del estudiante', () => {

  let cuentas;
  let sesion;

  beforeEach(() => {
    const datosCuentas = {};
    const datosSesion = {};

    cuentas = {
      getItem: clave => datosCuentas[clave] ?? null,
      setItem: (clave, valor) => {
        datosCuentas[clave] = valor;
      }
    };

    sesion = {
      getItem: clave => datosSesion[clave] ?? null,
      setItem: (clave, valor) => {
        datosSesion[clave] = valor;
      },
      removeItem: clave => {
        delete datosSesion[clave];
      }
    };

    const servicio = new UsuarioService(cuentas);

    servicio.guardarUsuario({
      nombre: 'Jose',
      apellido: 'Prueba',
      correo: 'estudiante@ucb.edu.bo',
      contrasena: 'Demo12345'
    });
  });

  it('debe guardar la sesion cuando el login es correcto', () => {
    const resultado = iniciarSesion(
      'estudiante@ucb.edu.bo',
      'Demo12345',
      cuentas,
      sesion
    );

    expect(resultado.ok).toBe(true);
    expect(obtenerSesion(sesion).correo).toBe('estudiante@ucb.edu.bo');
  });

  it('no debe guardar contrasenas en la sesion', () => {
    iniciarSesion(
      'estudiante@ucb.edu.bo',
      'Demo12345',
      cuentas,
      sesion
    );

    expect(obtenerSesion(sesion)).not.toHaveProperty('contrasena');
  });

  it('no debe crear sesion con credenciales incorrectas', () => {
    iniciarSesion(
      'estudiante@ucb.edu.bo',
      'Incorrecta',
      cuentas,
      sesion
    );

    expect(obtenerSesion(sesion)).toBeNull();
  });

  it('debe retornar null si no existe una sesion', () => {
    expect(obtenerSesion(sesion)).toBeNull();
  });

  it('debe permitir cerrar la sesion sin borrar las cuentas', () => {
    iniciarSesion(
      'estudiante@ucb.edu.bo',
      'Demo12345',
      cuentas,
      sesion
    );

    cerrarSesion(sesion);

    expect(obtenerSesion(sesion)).toBeNull();

    const servicio = new UsuarioService(cuentas);
    expect(servicio.obtenerUsuarios()).toHaveLength(1);
  });

});
describe('Integracion registro y login', () => {

  it('debe iniciar sesion con una cuenta recien registrada', () => {
    const datos = {};
    const datosSesion = {};

    const almacenamiento = {
      getItem: clave => datos[clave] ?? null,
      setItem: (clave, valor) => {
        datos[clave] = valor;
      }
    };

    const sesion = {
      getItem: clave => datosSesion[clave] ?? null,
      setItem: (clave, valor) => {
        datosSesion[clave] = valor;
      },
      removeItem: clave => {
        delete datosSesion[clave];
      }
    };

    const registro = registrarEstudiante({
      nombre: 'Estudiante',
      apellido: 'Prueba',
      correo: 'prueba@ucb.edu.bo',
      contrasena: 'Demo12345',
      confirmarContrasena: 'Demo12345'
    }, almacenamiento);

    expect(registro.ok).toBe(true);

    const login = iniciarSesion(
      'prueba@ucb.edu.bo',
      'Demo12345',
      almacenamiento,
      sesion
    );

    expect(login.ok).toBe(true);
    expect(obtenerSesion(sesion).correo).toBe('prueba@ucb.edu.bo');
    expect(obtenerSesion(sesion)).not.toHaveProperty('contrasena');
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


describe('Autenticacion de administradores HU-02', () => {

  let almacenamiento;
  let sesion;

  beforeEach(() => {
    const usuarios = {};
    const sesiones = {};

    almacenamiento = {
      getItem: clave => usuarios[clave] ?? null,
      setItem: (clave, valor) => {
        usuarios[clave] = valor;
      }
    };

    sesion = {
      getItem: clave => sesiones[clave] ?? null,
      setItem: (clave, valor) => {
        sesiones[clave] = valor;
      },
      removeItem: clave => {
        delete sesiones[clave];
      }
    };

    const servicio = new UsuarioService(almacenamiento);

    servicio.guardarUsuario({
      nombre: 'Admin',
      apellido: 'Bienestar',
      correo: 'bienestar@ucb.edu.bo',
      contrasena: 'Admin12345',
      rol: 'ADMIN'
    });

    servicio.guardarUsuario({
      nombre: 'Jose',
      apellido: 'Prueba',
      correo: 'estudiante@ucb.edu.bo',
      contrasena: 'Demo12345'
    });
  });

  it('debe identificar al administrador al iniciar sesion', () => {
    const resultado = iniciarSesion(
      'bienestar@ucb.edu.bo',
      'Admin12345',
      almacenamiento,
      sesion
    );

    expect(resultado.ok).toBe(true);
    expect(resultado.usuario.rol).toBe('ADMIN');
  });

  it('debe guardar el rol ADMIN en la sesion', () => {
    iniciarSesion(
      'bienestar@ucb.edu.bo',
      'Admin12345',
      almacenamiento,
      sesion
    );

    expect(obtenerSesion(sesion).rol).toBe('ADMIN');
  });

  it('debe identificar cuentas antiguas como ESTUDIANTE', () => {
    const resultado = iniciarSesion(
      'estudiante@ucb.edu.bo',
      'Demo12345',
      almacenamiento,
      sesion
    );

    expect(resultado.ok).toBe(true);
    expect(resultado.usuario.rol).toBe('ESTUDIANTE');
    expect(obtenerSesion(sesion).rol).toBe('ESTUDIANTE');
  });

  it('debe rechazar una contrasena administrativa incorrecta', () => {
    const resultado = iniciarSesion(
      'bienestar@ucb.edu.bo',
      'Incorrecta',
      almacenamiento,
      sesion
    );

    expect(resultado.ok).toBe(false);
    expect(obtenerSesion(sesion)).toBeNull();
  });

  it('no debe guardar la contrasena del administrador en sesion', () => {
    iniciarSesion(
      'bienestar@ucb.edu.bo',
      'Admin12345',
      almacenamiento,
      sesion
    );

    expect(obtenerSesion(sesion)).not.toHaveProperty('contrasena');
  });

});
describe('Cuenta administrativa de demostracion HU-02', () => {

  let almacenamiento;

  beforeEach(() => {
    const datos = {};

    almacenamiento = {
      getItem: clave => datos[clave] ?? null,
      setItem: (clave, valor) => {
        datos[clave] = valor;
      }
    };
  });

  it('debe crear una cuenta ADMIN de Bienestar', () => {
    crearAdministradorDemo(almacenamiento);

    const servicio = new UsuarioService(almacenamiento);
    const usuarios = servicio.obtenerUsuarios();

    expect(usuarios).toHaveLength(1);
    expect(usuarios[0].correo).toBe('bienestar@ucb.edu.bo');
    expect(usuarios[0].rol).toBe('ADMIN');
  });

  it('debe permitir iniciar sesion con la cuenta demo', () => {
    crearAdministradorDemo(almacenamiento);

    const resultado = iniciarSesion(
      'bienestar@ucb.edu.bo',
      'Admin12345',
      almacenamiento
    );

    expect(resultado.ok).toBe(true);
    expect(resultado.usuario.rol).toBe('ADMIN');
  });

  it('no debe duplicar la cuenta al iniciar dos veces', () => {
    crearAdministradorDemo(almacenamiento);
    crearAdministradorDemo(almacenamiento);

    const servicio = new UsuarioService(almacenamiento);

    expect(servicio.obtenerUsuarios()).toHaveLength(1);
  });

  it('no debe convertir una cuenta existente en ADMIN', () => {
    const servicio = new UsuarioService(almacenamiento);

    servicio.guardarUsuario({
      nombre: 'Alumno',
      apellido: 'Prueba',
      correo: 'bienestar@ucb.edu.bo',
      contrasena: 'OtraClave',
      rol: 'ESTUDIANTE'
    });

    crearAdministradorDemo(almacenamiento);

    const usuarios = servicio.obtenerUsuarios();

    expect(usuarios).toHaveLength(1);
    expect(usuarios[0].rol).toBe('ESTUDIANTE');
  });

});


describe('Permisos administrativos HU-02', () => {

  function crearSesion(datos) {
    return {
      getItem: clave =>
        clave === 'catofind_sesion' ? datos : null
    };
  }

  it('debe permitir el acceso a un administrador', () => {
    const sesion = crearSesion(JSON.stringify({
      nombre: 'Administrador',
      apellido: 'Bienestar',
      correo: 'bienestar@ucb.edu.bo',
      rol: 'ADMIN'
    }));

    const resultado = verificarAccesoAdministrador(sesion);

    expect(resultado.permitido).toBe(true);
  });

  it('debe rechazar el acceso a un estudiante', () => {
    const sesion = crearSesion(JSON.stringify({
      nombre: 'Jose',
      apellido: 'Prueba',
      correo: 'estudiante@ucb.edu.bo',
      rol: 'ESTUDIANTE'
    }));

    const resultado = verificarAccesoAdministrador(sesion);

    expect(resultado.permitido).toBe(false);
    expect(resultado.mensaje).toBe(
      'No tienes permisos para acceder al panel administrativo.'
    );
  });

  it('debe rechazar el acceso sin iniciar sesion', () => {
    const sesion = crearSesion(null);

    const resultado = verificarAccesoAdministrador(sesion);

    expect(resultado.permitido).toBe(false);
    expect(resultado.mensaje).toBe(
      'Debes iniciar sesión para acceder al panel administrativo.'
    );
  });

  it('debe rechazar una sesion invalida', () => {
    const sesion = crearSesion('{datos invalidos');

    const resultado = verificarAccesoAdministrador(sesion);

    expect(resultado.permitido).toBe(false);
  });

  it('debe rechazar cuentas antiguas sin rol', () => {
    const sesion = crearSesion(JSON.stringify({
      nombre: 'Alumno',
      apellido: 'Prueba',
      correo: 'alumno@ucb.edu.bo'
    }));

    const resultado = verificarAccesoAdministrador(sesion);

    expect(resultado.permitido).toBe(false);
  });

});
