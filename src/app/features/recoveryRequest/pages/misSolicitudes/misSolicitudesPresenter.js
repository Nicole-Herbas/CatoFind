import { SolicitudesApi } from '../../../../api/solicitudes.js';
import { presentarSolicitudes } from './misSolicitudes.js';

function crearTarjeta(documento, solicitud) {
  const tarjeta = documento.createElement('li');
  tarjeta.className = 'mis-solicitudes__tarjeta';

  const objeto = documento.createElement('h2');
  objeto.textContent = solicitud.nombreObjeto;

  const fecha = documento.createElement('p');
  fecha.textContent = `Solicitada el ${solicitud.fechaSolicitud}`;

  const estado = documento.createElement('p');
  estado.className = 'mis-solicitudes__estado';
  estado.textContent = solicitud.estado;

  tarjeta.append(objeto, fecha, estado);
  if (solicitud.detalle) {
    const detalle = documento.createElement('p');
    detalle.className = 'mis-solicitudes__detalle';
    detalle.textContent = solicitud.detalle;
    tarjeta.appendChild(detalle);
  }

  return tarjeta;
}

export async function iniciarMisSolicitudes(
  documento = globalThis.document,
  apiSolicitudes = new SolicitudesApi()
) {
  const estado = documento.getElementById('estado-solicitudes');
  const lista = documento.getElementById('lista-solicitudes');

  try {
    const solicitudes = presentarSolicitudes(await apiSolicitudes.listarMisSolicitudes());
    if (solicitudes.length === 0) {
      estado.dataset.tipo = 'vacio';
      estado.textContent = 'No tienes solicitudes de recuperación.';
      return;
    }

    lista.replaceChildren(...solicitudes.map(solicitud => crearTarjeta(documento, solicitud)));
    lista.hidden = false;
    estado.hidden = true;
  } catch {
    lista.replaceChildren();
    lista.hidden = true;
    estado.dataset.tipo = 'error';
    estado.textContent = 'No se pudieron cargar tus solicitudes. Intenta nuevamente.';
    estado.hidden = false;
  }
}

if (typeof document !== 'undefined' && document.getElementById('lista-solicitudes')) {
  iniciarMisSolicitudes(document);
}
