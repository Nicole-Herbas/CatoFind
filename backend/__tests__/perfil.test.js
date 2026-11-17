import { createServer } from 'node:http';
import { jest } from '@jest/globals';
import { crearApp } from '../app.js';

describe('API de perfil', () => {
  it('lee y actualiza el perfil de la sesión sin aceptar correo del cliente', async () => {
    const perfil = {
      nombre: 'Ana Torres',
      correo: 'ana@ucb.edu.bo',
      carrera: 'Ingeniería de Software'
    };
    const servicioAutenticacion = {
      obtenerPerfilEstudiante: jest.fn(async token => {
        expect(token).toBe('token-estudiante');
        return perfil;
      }),
      actualizarPerfilEstudiante: jest.fn(async (token, cambios) => {
        expect(token).toBe('token-estudiante');
        expect(cambios).toEqual({
          nombre: 'Ana Actualizada',
          carrera: 'Informática'
        });
        return { ...perfil, ...cambios };
      })
    };
    const servidor = createServer(crearApp(
      { listarPublicados: async () => [] },
      servicioAutenticacion
    ));
    await new Promise(resolve => servidor.listen(0, resolve));
    const url = `http://127.0.0.1:${servidor.address().port}/api/auth/perfil`;
    const encabezados = { Cookie: 'catofind_sesion=token-estudiante' };

    try {
      const lectura = await globalThis.fetch(url, { headers: encabezados });
      expect(lectura.status).toBe(200);
      expect(await lectura.json()).toEqual({ perfil });

      const actualizacion = await globalThis.fetch(url, {
        method: 'PATCH',
        headers: { ...encabezados, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: 'Ana Actualizada',
          carrera: 'Informática',
          correo: 'intruso@ucb.edu.bo'
        })
      });

      expect(actualizacion.status).toBe(200);
      expect(await actualizacion.json()).toEqual({
        perfil: {
          nombre: 'Ana Actualizada',
          correo: 'ana@ucb.edu.bo',
          carrera: 'Informática'
        }
      });
      expect(servicioAutenticacion.actualizarPerfilEstudiante).toHaveBeenCalledWith(
        'token-estudiante',
        { nombre: 'Ana Actualizada', carrera: 'Informática' }
      );
    } finally {
      await new Promise(resolve => servidor.close(resolve));
    }
  });

  it('responde no autorizado si el perfil no tiene una sesión válida', async () => {
    const servicioAutenticacion = {
      obtenerPerfilEstudiante: jest.fn(async () => {
        throw Object.assign(new Error('Debes iniciar sesión.'), {
          codigo: 'NO_AUTORIZADO'
        });
      })
    };
    const servidor = createServer(crearApp(
      { listarPublicados: async () => [] },
      servicioAutenticacion
    ));
    await new Promise(resolve => servidor.listen(0, resolve));

    try {
      const respuesta = await globalThis.fetch(
        `http://127.0.0.1:${servidor.address().port}/api/auth/perfil`
      );

      expect(respuesta.status).toBe(401);
      expect(await respuesta.json()).toEqual({ mensaje: 'Debes iniciar sesión.' });
    } finally {
      await new Promise(resolve => servidor.close(resolve));
    }
  });
});
