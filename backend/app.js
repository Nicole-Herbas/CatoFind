import express from 'express';
import { crearControladorAutenticacion } from './controllers/autenticacion.js';
import { crearControladorObjetos } from './controllers/objetos.js';
import { crearControladorSolicitudesRecuperacion } from './controllers/solicitudesRecuperacion.js';

export function crearApp(servicioObjetos, servicioAutenticacion, servicioSolicitudes) {
  const app = express();
  const controladorObjetos = crearControladorObjetos(servicioObjetos);
  const controladorAutenticacion = crearControladorAutenticacion(servicioAutenticacion);
  const controladorSolicitudes = crearControladorSolicitudesRecuperacion(servicioSolicitudes);

  app.use(express.json());
  app.get('/api/objetos', controladorObjetos.listarPublicados);
  app.post('/api/auth/registro', controladorAutenticacion.registrar);
  app.post('/api/auth/login', controladorAutenticacion.iniciarSesion);
  app.post('/api/solicitudes-recuperacion', controladorSolicitudes.crear);

  return app;
}
