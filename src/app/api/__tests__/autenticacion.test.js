import { AutenticacionApi } from '../autenticacion.js';

describe('API de autenticación del frontend', () => {
  it('envía el inicio de sesión y deja la sesión al backend', async () => {
    const solicitar = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        usuario: { nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo', rol: 'ESTUDIANTE' }
      })
    }));

    const resultado = await new AutenticacionApi(solicitar).iniciarSesion(
      'ana@ucb.edu.bo', 'clave'
    );

    expect(solicitar).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'ana@ucb.edu.bo', contrasena: 'clave' })
    });
    expect(resultado.ok).toBe(true);
  });

  it('registra con el nombre del diagrama y no persiste la contraseña en el navegador', async () => {
    const solicitar = jest.fn(async () => ({
      ok: true,
      json: async () => ({ usuario: { nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo' } })
    }));
    const api = new AutenticacionApi(solicitar);

    const resultado = await api.registrarEstudiante({
      nombre: 'Ana', apellido: 'Torres', correo: 'ana@ucb.edu.bo', contrasena: 'clave',
      confirmarContrasena: 'clave'
    });

    expect(solicitar).toHaveBeenCalledWith('/api/auth/registro', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo', contrasena: 'clave' })
    }));
    expect(resultado.ok).toBe(true);
  });

  it('no envía el registro si las contraseñas no coinciden', async () => {
    const solicitar = jest.fn();
    const api = new AutenticacionApi(solicitar);

    const resultado = await api.registrarEstudiante({
      nombre: 'Ana', apellido: 'Torres', correo: 'ana@ucb.edu.bo',
      contrasena: 'clave', confirmarContrasena: 'otra'
    });

    expect(resultado).toEqual({ ok: false, mensaje: 'Las contraseñas no coinciden.' });
    expect(solicitar).not.toHaveBeenCalled();
  });

  it('trata una sesión HTTP inválida como sesión inexistente', async () => {
    const solicitar = jest.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ mensaje: 'La sesión no es válida.' })
    }));

    await expect(new AutenticacionApi(solicitar).obtenerSesion()).resolves.toBeNull();
  });

  it('muestra el rechazo de inicio de sesión devuelto por el backend', async () => {
    const solicitar = jest.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ mensaje: 'Correo o contraseña incorrectos.' })
    }));

    await expect(new AutenticacionApi(solicitar).iniciarSesion('ana@ucb.edu.bo', 'mal'))
      .resolves.toEqual({ ok: false, mensaje: 'Correo o contraseña incorrectos.' });
  });

  it('obtiene el perfil con la cookie de sesión', async () => {
    const perfil = {
      nombre: 'Ana Torres',
      correo: 'ana@ucb.edu.bo',
      carrera: 'Ingeniería de Software'
    };
    const solicitar = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ perfil })
    }));

    await expect(new AutenticacionApi(solicitar).obtenerPerfil()).resolves.toEqual(perfil);
    expect(solicitar).toHaveBeenCalledWith('/api/auth/perfil', {
      method: 'GET',
      credentials: 'same-origin',
      headers: {}
    });
  });

  it('actualiza solo nombre y carrera y conserva errores HTTP', async () => {
    const perfil = { nombre: 'Ana Torres', carrera: 'Informática' };
    const solicitar = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ perfil })
    }));

    await expect(new AutenticacionApi(solicitar).actualizarPerfil({
      ...perfil,
      correo: 'intruso@ucb.edu.bo'
    })).resolves.toEqual(perfil);
    expect(solicitar).toHaveBeenCalledWith('/api/auth/perfil', {
      method: 'PATCH',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(perfil)
    });

    const apiConError = new AutenticacionApi(jest.fn(async () => ({
      ok: false,
      status: 401,
      json: async () => ({ mensaje: 'Debes iniciar sesión.' })
    })));
    await expect(apiConError.obtenerPerfil())
      .rejects.toMatchObject({ status: 401, message: 'Debes iniciar sesión.' });
  });

  it('cierra sesión cuando el servidor responde 204 sin cuerpo', async () => {
    const solicitar = jest.fn(async () => ({ ok: true, status: 204 }));

    await expect(new AutenticacionApi(solicitar).cerrarSesion()).resolves.toBeUndefined();
    expect(solicitar).toHaveBeenCalledWith('/api/auth/logout', expect.objectContaining({
      method: 'POST',
      credentials: 'same-origin'
    }));
  });

  it('conserva el mensaje de una sesión administrativa rechazada', async () => {
    const solicitar = jest.fn(async () => ({
      ok: false,
      status: 403,
      json: async () => ({ mensaje: 'No tienes permisos administrativos.' })
    }));

    await expect(new AutenticacionApi(solicitar).obtenerSesionAdministrador())
      .rejects.toMatchObject({ status: 403, message: 'No tienes permisos administrativos.' });
  });

  it('muestra el mensaje del backend cuando el registro es rechazado', async () => {
    const solicitar = jest.fn(async () => ({
      ok: false,
      status: 409,
      json: async () => ({ mensaje: 'El correo ya está registrado.' })
    }));

    await expect(new AutenticacionApi(solicitar).registrarEstudiante({
      nombre: 'Ana', correo: 'ana@ucb.edu.bo', contrasena: 'clave'
    })).resolves.toEqual({ ok: false, mensaje: 'El correo ya está registrado.' });
  });

});
