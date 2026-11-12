import express from 'express';
import { crearControladorObjetos } from './controllers/objetos.js';

export function crearApp(servicioObjetos) {
  const app = express();
  const controladorObjetos = crearControladorObjetos(servicioObjetos);

  app.get('/api/objetos', controladorObjetos.listarPublicados);

  return app;
}
