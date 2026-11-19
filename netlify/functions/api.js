import serverless from 'serverless-http';
import { crearAppConSupabase } from '../../backend/crearAppConSupabase.js';

let manejador;

// Netlify ejecuta esta función para cada petición a /api/* (ver netlify.toml).
export async function handler(evento, contexto) {
  if (!manejador) {
    const app = crearAppConSupabase(process.env);
    manejador = serverless(app, {
      // Si la petición llega con la ruta interna de Netlify, la devolvemos a /api/...
      request(solicitud) {
        solicitud.url = solicitud.url.replace(/^\/\.netlify\/functions\/api/, '/api');
      }
    });
  }
  return manejador(evento, contexto);
}
