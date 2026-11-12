import { crearServicioAutenticacion } from '../autenticacion.js';

describe('autenticación de estudiantes', () => {
  it('crea la cuenta en Supabase Auth y guarda el perfil sin la contraseña', async () => {
    const supabase = {
      auth: {
        admin: {
          createUser: jest.fn(async () => ({
            data: { user: { id: 'auth-1' } },
            error: null
          })),
          deleteUser: jest.fn()
        }
      }
    };
    const usuarios = { crearPerfil: jest.fn() };
    const servicio = crearServicioAutenticacion(supabase, usuarios);

    const usuario = await servicio.registrarEstudiante({
      nombre: 'Ana Torres',
      correo: 'ana@ucb.edu.bo',
      contrasena: 'clave-segura'
    });

    expect(supabase.auth.admin.createUser).toHaveBeenCalledWith({
      email: 'ana@ucb.edu.bo',
      password: 'clave-segura',
      email_confirm: true
    });
    expect(usuarios.crearPerfil).toHaveBeenCalledWith({
      authUid: 'auth-1',
      nombre: 'Ana Torres',
      correo: 'ana@ucb.edu.bo',
      rol: 'ESTUDIANTE'
    });
    expect(usuario).toEqual({ nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo', rol: 'ESTUDIANTE' });
    expect(JSON.stringify(usuarios.crearPerfil.mock.calls)).not.toContain('clave-segura');
  });

  it('rechaza correos que no son de la UCB antes de llamar a Auth', async () => {
    const supabase = { auth: { admin: { createUser: jest.fn() } } };
    const servicio = crearServicioAutenticacion(supabase, {});

    await expect(servicio.registrarEstudiante({
      nombre: 'Ana Torres',
      correo: 'ana@example.com',
      contrasena: 'clave-segura'
    })).rejects.toMatchObject({ codigo: 'VALIDACION' });

    expect(supabase.auth.admin.createUser).not.toHaveBeenCalled();
  });

  it('elimina la cuenta de Auth si falla guardar el perfil', async () => {
    const supabase = {
      auth: {
        admin: {
          createUser: jest.fn(async () => ({ data: { user: { id: 'auth-1' } }, error: null })),
          deleteUser: jest.fn()
        }
      }
    };
    const usuarios = { crearPerfil: jest.fn(async () => { throw new Error('fallo de base'); }) };

    await expect(crearServicioAutenticacion(supabase, usuarios).registrarEstudiante({
      nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo', contrasena: 'clave-segura'
    })).rejects.toMatchObject({ codigo: 'PERSISTENCIA' });

    expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith('auth-1');
  });

  it('devuelve el perfil y el token de Auth sin persistir la contraseña', async () => {
    const supabase = {
      auth: {
        signInWithPassword: jest.fn(async () => ({
          data: {
            user: { id: 'auth-1' },
            session: { access_token: 'token-de-sesion' }
          },
          error: null
        }))
      }
    };
    const usuarios = {
      obtenerPorAuthUid: jest.fn(async () => ({
        nombre: 'Ana Torres',
        correo_institucional: 'ana@ucb.edu.bo',
        rol: 'ESTUDIANTE'
      }))
    };

    const usuario = await crearServicioAutenticacion(supabase, usuarios).iniciarSesion({
      correo: 'ana@ucb.edu.bo',
      contrasena: 'clave-segura'
    });

    expect(usuario).toEqual({
      accessToken: 'token-de-sesion',
      usuario: { nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo', rol: 'ESTUDIANTE' }
    });
    expect(usuarios.obtenerPorAuthUid).toHaveBeenCalledWith('auth-1');
  });

  it('rechaza el inicio de sesión con correos fuera del dominio UCB', async () => {
    const supabase = { auth: { signInWithPassword: jest.fn() } };
    const servicio = crearServicioAutenticacion(supabase, {});

    await expect(servicio.iniciarSesion({
      correo: 'persona@example.com', contrasena: 'clave'
    })).rejects.toMatchObject({ codigo: 'VALIDACION' });

    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });
});
