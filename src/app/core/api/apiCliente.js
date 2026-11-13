const API_BASE = '/api';

export class ErrorApi extends Error {
  constructor(mensaje, status = null) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.status = status;
  }
}

function obtenerRuta(ruta) {
  return ruta.startsWith(`${API_BASE}/`) || ruta === API_BASE
    ? ruta
    : `${API_BASE}${ruta.startsWith('/') ? ruta : `/${ruta}`}`;
}

async function leerRespuesta(respuesta) {
  if (respuesta.status === 204 || respuesta.status === 205) return null;

  if (typeof respuesta.text === 'function') {
    const texto = await respuesta.text();
    if (!texto) return null;
    try {
      return JSON.parse(texto);
    } catch {
      return texto;
    }
  }

  try {
    return await respuesta.json();
  } catch {
    return null;
  }
}

export function crearApiCliente(fetchImpl) {
  async function solicitar(ruta, opciones = {}) {
    const { method = 'GET', headers = {}, body, ...otrasOpciones } = opciones;
    const encabezados = { ...headers };
    const opcionesFetch = {
      ...otrasOpciones,
      method,
      credentials: 'same-origin',
      headers: encabezados
    };

    if (body !== undefined) {
      if (typeof body === 'string') {
        opcionesFetch.body = body;
      } else {
        if (!Object.keys(encabezados).some(nombre => nombre.toLowerCase() === 'content-type')) {
          encabezados['Content-Type'] = 'application/json';
        }
        opcionesFetch.body = JSON.stringify(body);
      }
    }

    let respuesta;
    try {
      const transporte = fetchImpl || globalThis.fetch?.bind(globalThis);
      respuesta = await transporte(obtenerRuta(ruta), opcionesFetch);
    } catch {
      throw new ErrorApi('No se pudo conectar con el servidor.');
    }

    let resultado;
    try {
      resultado = await leerRespuesta(respuesta);
    } catch {
      throw new ErrorApi('No se pudo conectar con el servidor.');
    }
    if (!respuesta.ok) {
      throw new ErrorApi(resultado?.mensaje || '', respuesta.status);
    }
    return resultado;
  }

  return { solicitar };
}

export const apiCliente = crearApiCliente();
