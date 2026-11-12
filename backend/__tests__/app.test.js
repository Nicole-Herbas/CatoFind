import { createServer } from 'node:http';
import { crearApp } from '../app.js';

describe('API de objetos', () => {
  it('GET /api/objetos devuelve los objetos publicados', async () => {
    const app = crearApp({
      listarPublicados: async () => [{
        id: 7,
        titulo: 'Mochila negra',
        categoria: 'Accesorios',
        imagen: 'mochila.jpg',
        lugar: 'Biblioteca',
        fecha: '2026-10-08',
        estado: 'Publicado'
      }]
    });
    const servidor = createServer(app);

    await new Promise(resolve => servidor.listen(0, resolve));
    const { port } = servidor.address();

    try {
      const respuesta = await fetch(`http://127.0.0.1:${port}/api/objetos`);

      expect(respuesta.status).toBe(200);
      expect(await respuesta.json()).toEqual([{
        id: 7,
        titulo: 'Mochila negra',
        categoria: 'Accesorios',
        imagen: 'mochila.jpg',
        lugar: 'Biblioteca',
        fecha: '2026-10-08',
        estado: 'Publicado'
      }]);
    } finally {
      await new Promise((resolve, reject) => servidor.close(error => error ? reject(error) : resolve()));
    }
  });

  it('no expone detalles internos cuando falla la consulta', async () => {
    const app = crearApp({ listarPublicados: async () => {
      throw new Error('error interno con detalles');
    } });
    const servidor = createServer(app);

    await new Promise(resolve => servidor.listen(0, resolve));
    const { port } = servidor.address();

    try {
      const respuesta = await fetch(`http://127.0.0.1:${port}/api/objetos`);

      expect(respuesta.status).toBe(500);
      expect(await respuesta.json()).toEqual({
        mensaje: 'No se pudieron cargar los objetos.'
      });
    } finally {
      await new Promise((resolve, reject) => servidor.close(error => error ? reject(error) : resolve()));
    }
  });
});

describe('API de autenticación', () => {
  it('registra estudiantes mediante el servicio y devuelve el perfil público', async () => {
    const servicioAutenticacion = {
      registrarEstudiante: jest.fn(async () => ({
        nombre: 'Ana Torres',
        correo: 'ana@ucb.edu.bo',
        rol: 'ESTUDIANTE'
      }))
    };
    const app = crearApp({ listarPublicados: async () => [] }, servicioAutenticacion);
    const servidor = createServer(app);
    await new Promise(resolve => servidor.listen(0, resolve));

    try {
      const respuesta = await fetch(`http://127.0.0.1:${servidor.address().port}/api/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo', contrasena: 'privada' })
      });

      expect(respuesta.status).toBe(201);
      expect(await respuesta.json()).toEqual({
        usuario: { nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo', rol: 'ESTUDIANTE' }
      });
      expect(servicioAutenticacion.registrarEstudiante).toHaveBeenCalledWith({
        nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo', contrasena: 'privada'
      });
    } finally {
      await new Promise(resolve => servidor.close(resolve));
    }
  });

  it('inicia sesión sin devolver la contraseña', async () => {
    const servicioAutenticacion = {
      iniciarSesion: jest.fn(async () => ({
        accessToken: 'token-sesion',
        usuario: { nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo', rol: 'ESTUDIANTE' }
      }))
    };
    const app = crearApp({ listarPublicados: async () => [] }, servicioAutenticacion);
    const servidor = createServer(app);
    await new Promise(resolve => servidor.listen(0, resolve));

    try {
      const respuesta = await fetch(`http://127.0.0.1:${servidor.address().port}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ correo: 'ana@ucb.edu.bo', contrasena: 'privada' })
      });
      const resultado = await respuesta.json();

      expect(respuesta.status).toBe(200);
      expect(resultado).toEqual({
        usuario: { nombre: 'Ana Torres', correo: 'ana@ucb.edu.bo', rol: 'ESTUDIANTE' }
      });
      expect(respuesta.headers.get('set-cookie')).toContain('HttpOnly');
      expect(resultado).not.toHaveProperty('contrasena');
    } finally {
      await new Promise(resolve => servidor.close(resolve));
    }
  });
});

describe('API de solicitudes de recuperación', () => {
  it('asocia al usuario autenticado y devuelve la solicitud creada', async () => {
    const servicioSolicitudes = {
      crear: jest.fn(async () => ({ id: 12 }))
    };
    const app = crearApp(
      { listarPublicados: async () => [] },
      {},
      servicioSolicitudes
    );
    const servidor = createServer(app);
    await new Promise(resolve => servidor.listen(0, resolve));

    try {
      const respuesta = await fetch(`http://127.0.0.1:${servidor.address().port}/api/solicitudes-recuperacion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'catofind_sesion=token-estudiante'
        },
        body: JSON.stringify({
          reporteId: '14', lugarEstimado: 'biblioteca',
          fechaEstimada: '2026-10-20', caracteristicaPrivada: 'Costura en la manga'
        })
      });

      expect(respuesta.status).toBe(201);
      expect(await respuesta.json()).toEqual({ id: 12 });
      expect(servicioSolicitudes.crear).toHaveBeenCalledWith({
        reporteId: '14', lugarEstimado: 'biblioteca',
        fechaEstimada: '2026-10-20', caracteristicaPrivada: 'Costura en la manga',
        token: 'token-estudiante'
      });
    } finally {
      await new Promise(resolve => servidor.close(resolve));
    }
  });
});

describe('API de revisión de reportes', () => {
  it('autoriza al administrador, lista pendientes, revisa y cierra la sesión', async () => {
    const servicioAutenticacion = {
      obtenerSesionAdministrador: jest.fn(async token => {
        if (token !== 'token-admin') throw new Error('Sesión inválida.');
        return { usuario: { nombre: 'Administradora', rol: 'ADMIN' } };
      }),
      cerrarSesion: jest.fn()
    };
    let reportesPendientes = [{ id: 7, titulo: 'Mochila negra' }];
    const servicioReportes = {
      listarPendientes: jest.fn(async () => reportesPendientes),
      actualizarEstado: jest.fn(async ({ id, estado }) => {
        const reporte = { id: Number(id), estado };
        reportesPendientes = [];
        return reporte;
      })
    };
    const app = crearApp(
      { listarPublicados: async () => [] },
      servicioAutenticacion,
      {},
      servicioReportes
    );
    const servidor = createServer(app);
    await new Promise(resolve => servidor.listen(0, resolve));
    const baseUrl = `http://127.0.0.1:${servidor.address().port}`;
    const encabezadosSesion = { Cookie: 'catofind_sesion=token-admin' };

    try {
      const sesion = await fetch(`${baseUrl}/api/admin/sesion`, {
        headers: encabezadosSesion
      });
      expect(sesion.status).toBe(200);
      expect((await sesion.json()).usuario.rol).toBe('ADMIN');

      const pendientes = await fetch(`${baseUrl}/api/admin/reportes?estado=PENDIENTE`, {
        headers: encabezadosSesion
      });
      expect(pendientes.status).toBe(200);
      expect((await pendientes.json()).reportes).toEqual([
        { id: 7, titulo: 'Mochila negra' }
      ]);
      expect(servicioAutenticacion.obtenerSesionAdministrador)
        .toHaveBeenCalledWith('token-admin');
      expect(servicioReportes.listarPendientes)
        .toHaveBeenCalledWith('token-admin');

      const revision = await fetch(`${baseUrl}/api/admin/reportes/7`, {
        method: 'PATCH',
        headers: { ...encabezadosSesion, 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'APROBADO' })
      });
      expect(revision.status).toBe(200);
      expect((await revision.json()).reporte).toEqual({ id: 7, estado: 'APROBADO' });
      expect(servicioReportes.actualizarEstado).toHaveBeenCalledWith({
        id: '7', estado: 'APROBADO', token: 'token-admin'
      });

      const cierre = await fetch(`${baseUrl}/api/auth/logout`, { method: 'POST' });
      expect(cierre.status).toBe(204);
      expect(cierre.headers.get('set-cookie')).toContain('Max-Age=0');
    } finally {
      await new Promise(resolve => servidor.close(resolve));
    }
  });
});
describe('API de creación de reportes', () => {
  it('entrega el reporte y la sesión al caso de uso backend', async () => {
    const servicioReportes = {
      crear: jest.fn(async () => ({ id: 21, estado: 'PENDIENTE' }))
    };
    const app = crearApp(
      { listarPublicados: async () => [] },
      {},
      {},
      servicioReportes
    );
    const servidor = createServer(app);
    await new Promise(resolve => servidor.listen(0, resolve));
    const reporte = {
      titulo: 'Mochila negra',
      categoria: 'Accesorios',
      lugar: 'Biblioteca',
      fecha: '2026-11-10',
      hora: '10:30',
      descripcion: 'Mochila encontrada junto a la entrada.',
      detallePrivado: 'Tiene una costura roja.',
      imagen: 'data:image/jpeg;base64,Zm90bw=='
    };

    try {
      const respuesta = await fetch(
        `http://127.0.0.1:${servidor.address().port}/api/reportes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: 'catofind_sesion=token-estudiante'
          },
          body: JSON.stringify(reporte)
        }
      );

      expect(respuesta.status).toBe(201);
      expect(await respuesta.json()).toEqual({ reporte: { id: 21, estado: 'PENDIENTE' } });
      expect(servicioReportes.crear).toHaveBeenCalledWith({
        ...reporte,
        token: 'token-estudiante'
      });
    } finally {
      await new Promise(resolve => servidor.close(resolve));
    }
  });
});
