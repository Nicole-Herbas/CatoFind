import { AutenticacionApi } from '../AutenticacionApi.js';

describe('API de autenticación del frontend', () => {
  it('envía el inicio de sesión y guarda solo el token y perfil en la sesión', async () => {
    const sesion = { setItem: jest.fn() };
    const solicitar = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        accessToken: 'token-de-prueba',
        usuario: { nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo', rol: 'ESTUDIANTE' }
      })
    }));

    const resultado = await new AutenticacionApi(solicitar, sesion).iniciarSesion(
      'ana@ucb.edu.bo', 'clave'
    );

    expect(solicitar).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correo: 'ana@ucb.edu.bo', contrasena: 'clave' })
    });
    expect(sesion.setItem).toHaveBeenCalledWith('catofind_sesion', JSON.stringify({
      nombre: 'Ana Torres',
      correo: 'ana@ucb.edu.bo',
      rol: 'ESTUDIANTE',
      accessToken: 'token-de-prueba'
    }));
    expect(resultado.ok).toBe(true);
  });

  it('registra con el nombre del diagrama y no persiste la contraseña en el navegador', async () => {
    const solicitar = jest.fn(async () => ({
      ok: true,
      json: async () => ({ usuario: { nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo' } })
    }));
    const api = new AutenticacionApi(solicitar, { setItem: jest.fn() });

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
    const api = new AutenticacionApi(solicitar, { setItem: jest.fn() });

    const resultado = await api.registrarEstudiante({
      nombre: 'Ana', apellido: 'Torres', correo: 'ana@ucb.edu.bo',
      contrasena: 'clave', confirmarContrasena: 'otra'
    });

    expect(resultado).toEqual({ ok: false, mensaje: 'Las contraseñas no coinciden.' });
    expect(solicitar).not.toHaveBeenCalled();
  });

  it('migra la cuenta estudiantil local al autenticarse y la quita del almacenamiento antiguo', async () => {
    const usuariosLocales = [{
      nombre: 'Ana', apellido: 'Torres', correo: 'ana@ucb.edu.bo',
      contrasena: 'clave-anterior', rol: 'ESTUDIANTE'
    }];
    const almacenamiento = {
      getItem: jest.fn(() => JSON.stringify(usuariosLocales)),
      setItem: jest.fn()
    };
    const sesion = { setItem: jest.fn() };
    const solicitar = jest.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ usuario: {} }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        accessToken: 'token-nuevo',
        usuario: { nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo', rol: 'ESTUDIANTE' }
      }) });

    const resultado = await new AutenticacionApi(solicitar, sesion).migrarCuentaAnterior(
      'ana@ucb.edu.bo', 'clave-anterior', almacenamiento
    );

    expect(resultado.ok).toBe(true);
    expect(solicitar).toHaveBeenCalledTimes(2);
    expect(almacenamiento.setItem).toHaveBeenCalledWith('catofind_usuarios', '[]');
  });

  it('no migra cuentas administrativas desde datos locales manipulables', async () => {
    const almacenamiento = {
      getItem: () => JSON.stringify([{
        nombre: 'Admin', correo: 'bienestar@ucb.edu.bo', contrasena: 'admin', rol: 'ADMIN'
      }]),
      setItem: jest.fn()
    };
    const solicitar = jest.fn();
    const resultado = await new AutenticacionApi(solicitar, { setItem: jest.fn() })
      .migrarCuentaAnterior('bienestar@ucb.edu.bo', 'admin', almacenamiento);

    expect(resultado).toBeNull();
    expect(solicitar).not.toHaveBeenCalled();
    expect(almacenamiento.setItem).not.toHaveBeenCalled();
  });
});
