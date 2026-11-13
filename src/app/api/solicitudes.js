export class SolicitudesApi {
  constructor(solicitar = globalThis.fetch.bind(globalThis)) {
    this.solicitar = solicitar;
  }

  async crear(datos) {
    try {
      const respuesta = await this.solicitar('/api/solicitudes-recuperacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
        body: JSON.stringify(datos)
      });
      const resultado = await respuesta.json();

      return respuesta.ok
        ? { ok: true, mensaje: 'Solicitud enviada.' }
        : { ok: false, mensaje: resultado.mensaje || 'No se pudo enviar la solicitud.' };
    } catch {
      return { ok: false, mensaje: 'No se pudo conectar con el servidor.' };
    }
  }
}
