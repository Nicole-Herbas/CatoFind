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

  it('obtiene la sesión administrativa usando el cliente común', async () => {
    const usuario = { nombre: 'Admin', rol: 'ADMIN' };
    const cliente = { get: jest.fn().mockResolvedValue({ usuario }) };
    const repositorio = crearRepositorioUsuarios(cliente);

    await expect(repositorio.obtenerSesionAdministrador()).resolves.toEqual(usuario);
    expect(cliente.get).toHaveBeenCalledWith('/admin/sesion');
  });

  it('cierra la sesión usando el endpoint de autenticación', async () => {
    const cliente = { post: jest.fn().mockResolvedValue(null) };
    const repositorio = crearRepositorioUsuarios(cliente);

    await expect(repositorio.cerrarSesion()).resolves.toBeUndefined();
    expect(cliente.post).toHaveBeenCalledWith('/auth/logout', {});
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

  it('lee y actualiza el perfil sin enviar un cambio de correo', async () => {
    const perfil = {
      nombre: 'Ana Torres',
      correo: 'ana@ucb.edu.bo',
      carrera: 'Informática'
    };
    const cliente = {
      get: jest.fn().mockResolvedValue({ perfil }),
      patch: jest.fn().mockResolvedValue({ perfil })
    };
    const repositorio = crearRepositorioUsuarios(cliente);

    await expect(repositorio.obtenerPerfil()).resolves.toEqual(perfil);
    await expect(repositorio.actualizarPerfil({
      nombre: 'Ana Torres',
      carrera: 'Informática',
      correo: 'otro@ucb.edu.bo'
    })).resolves.toEqual(perfil);

    expect(cliente.get).toHaveBeenCalledWith('/auth/perfil');
    expect(cliente.patch).toHaveBeenCalledWith('/auth/perfil', {
      nombre: 'Ana Torres',
      carrera: 'Informática'
    });
  });
});
