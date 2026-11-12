import express from 'express';
import { crearControladorAutenticacion } from './controllers/autenticacion.js';
import { crearControladorObjetos } from './controllers/objetos.js';
import { crearControladorSolicitudesRecuperacion } from './controllers/solicitudesRecuperacion.js';
import { crearControladorReportes } from './controllers/reportes.js';

export function crearApp(servicioObjetos, servicioAutenticacion, servicioSolicitudes, servicioReportes) {
  const app = express();
  const controladorObjetos = crearControladorObjetos(servicioObjetos);
  const controladorAutenticacion = crearControladorAutenticacion(servicioAutenticacion);
  const controladorSolicitudes = crearControladorSolicitudesRecuperacion(servicioSolicitudes);
  const controladorReportes = crearControladorReportes(servicioReportes);

  app.use(express.json({ limit: '2mb' }));
  app.use((req, _res, next) => {
    req.cookies = Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map((item) => {
      const [key, ...value] = item.trim().split('=');
      return [key, decodeURIComponent(value.join('='))];
    }));
    next();
  });
  app.get('/api/objetos', controladorObjetos.listarPublicados);
  app.post('/api/auth/registro', controladorAutenticacion.registrar);
  app.post('/api/auth/login', controladorAutenticacion.iniciarSesion);
  app.get('/api/auth/sesion', controladorAutenticacion.obtenerSesion);
  app.get('/api/admin/sesion', controladorAutenticacion.obtenerSesionAdministrador);
  app.post('/api/auth/logout', controladorAutenticacion.cerrarSesion);
  app.post('/api/solicitudes-recuperacion', controladorSolicitudes.crear);
  app.get('/api/reportes/opciones', controladorReportes.obtenerOpciones);
  app.post('/api/reportes', controladorReportes.crear);
  app.get('/api/admin/reportes', controladorReportes.listarPendientes);
  app.patch('/api/admin/reportes/:id', controladorReportes.actualizarEstado);

  return app;
}
