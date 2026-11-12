import express from 'express';
import { crearControladorAutenticacion } from './controllers/autenticacion.js';
import { crearControladorObjetos } from './controllers/objetos.js';

export function crearApp(servicioObjetos, servicioAutenticacion) {
  const app = express();
  const controladorObjetos = crearControladorObjetos(servicioObjetos);
  const controladorAutenticacion = crearControladorAutenticacion(servicioAutenticacion);

  app.use(express.json());
  app.get('/api/objetos', controladorObjetos.listarPublicados);
  app.post('/api/auth/registro', controladorAutenticacion.registrar);
  app.post('/api/auth/login', controladorAutenticacion.iniciarSesion);

  return app;
}
