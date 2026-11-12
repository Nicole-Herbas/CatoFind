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
