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

});
