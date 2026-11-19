export class ApiError extends Error {
  constructor(mensaje, status, codigo = null) {
    super(mensaje);
    this.name = 'ApiError';
    this.status = status;
    this.codigo = codigo;
  }
}

export function crearClienteApi({
  baseUrl = '/api',
  solicitar = globalThis.fetch.bind(globalThis)
} = {}) {
  async function solicitarJson(ruta, opciones = {}) {
    const urlBase = baseUrl.replace(/\/+$/, '');
    const rutaApi = ruta.replace(/^\/+/, '');
    let respuesta;
    try {
      respuesta = await solicitar(`${urlBase}/${rutaApi}`, {
        method: 'GET',
        credentials: 'same-origin',
        headers: {},
        ...opciones
      });
    } catch (error) {
      const errorApi = new ApiError('No se pudo conectar con el servidor.', 0);
      errorApi.cause = error;
      throw errorApi;
    }
    const resultado = respuesta.status === 204 ? null : await respuesta.json();

    if (!respuesta.ok) {
      throw new ApiError(
        resultado?.mensaje || 'No se pudo completar la solicitud.',
        respuesta.status,
        resultado?.codigo
      );
    }

    return resultado;
  }

  return {
    get(ruta) {
      return solicitarJson(ruta);
    },

    post(ruta, datos) {
      return solicitarJson(ruta, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
    },

    patch(ruta, datos) {
      return solicitarJson(ruta, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
    }
  };
}
