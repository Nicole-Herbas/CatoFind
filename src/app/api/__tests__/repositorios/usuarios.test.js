import { jest } from '@jest/globals';
import { crearRepositorioUsuarios } from '../../repositorios/usuarios.js';

describe('repositorio de usuarios del frontend', () => {
  it('obtiene los datos de sesión usando el cliente común', async () => {
    const usuario = { nombre: 'Ana Torres', rol: 'ESTUDIANTE' };
    const cliente = { get: jest.fn().mockResolvedValue({ usuario }) };
    const repositorio = crearRepositorioUsuarios(cliente);

    await expect(repositorio.obtenerSesion()).resolves.toEqual(usuario);
    expect(cliente.get).toHaveBeenCalledWith('/auth/sesion');
  });

  it('inicia sesión usando el endpoint de autenticación y devuelve el usuario', async () => {
    const usuario = { nombre: 'Ana Torres', rol: 'ESTUDIANTE' };
    const cliente = { post: jest.fn().mockResolvedValue({ usuario }) };
    const repositorio = crearRepositorioUsuarios(cliente);

    await expect(repositorio.iniciarSesion('ana@ucb.edu.bo', 'clave'))
      .resolves.toEqual({
        ok: true,
        mensaje: 'Inicio de sesión correcto.',
        usuario
      });
    expect(cliente.post).toHaveBeenCalledWith('/auth/login', {
      correo: 'ana@ucb.edu.bo',
      contrasena: 'clave'
    });
  });
});
