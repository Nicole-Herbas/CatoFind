export class SolicitudesApi {
  constructor(solicitar = globalThis.fetch, almacenamientoSesion = globalThis.sessionStorage) {
    this.solicitar = solicitar;
    this.almacenamientoSesion = almacenamientoSesion;
  }

  async crear(datos) {
    let sesion;
    try {
      sesion = JSON.parse(this.almacenamientoSesion.getItem('catofind_sesion') || 'null');
    } catch {
      sesion = null;
    }

    if (!sesion?.accessToken) {
      return { ok: false, mensaje: 'Inicia sesión para enviar una solicitud.' };
    }

    try {
      const respuesta = await this.solicitar('/api/solicitudes-recuperacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sesion.accessToken}`
        },
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
