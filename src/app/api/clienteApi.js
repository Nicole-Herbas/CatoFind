export function crearClienteApi({
  baseUrl = '/api',
  solicitar = globalThis.fetch.bind(globalThis)
} = {}) {
  async function solicitarJson(ruta, opciones = {}) {
    const urlBase = baseUrl.replace(/\/+$/, '');
    const rutaApi = ruta.replace(/^\/+/, '');
    const respuesta = await solicitar(`${urlBase}/${rutaApi}`, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {},
      ...opciones
    });
    const resultado = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(resultado.mensaje || 'No se pudo completar la solicitud.');
    }

    return resultado;
  }

  return {
    get(ruta) {
      return solicitarJson(ruta);
    }
  };
}
