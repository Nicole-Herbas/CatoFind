const ESTADOS = {
  PENDIENTE: 'Pendiente',
  APROBADA: 'Aprobada',
  RECHAZADA: 'Rechazada',
  ENTREGADA: 'Entregada'
};

const INDICACIONES_APROBACION = 'Recoge el objeto en Bienestar Estudiantil';

function formatearFecha(fecha) {
  const fechaISO = String(fecha ?? '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaISO)) return 'Fecha no disponible';

  return `${fechaISO.slice(8, 10)}/${fechaISO.slice(5, 7)}/${fechaISO.slice(0, 4)}`;
}

export function presentarSolicitudes(solicitudes) {
  if (!Array.isArray(solicitudes)) {
    throw new TypeError('La lista de solicitudes no es válida.');
  }

  return solicitudes.map(solicitud => ({
    id: solicitud.id,
    nombreObjeto: solicitud.nombreObjeto || 'Objeto no disponible',
    fechaSolicitud: formatearFecha(solicitud.fechaSolicitud),
    estado: ESTADOS[solicitud.estado] || 'Estado no disponible',
    detalle: solicitud.estado === 'APROBADA'
      ? INDICACIONES_APROBACION
      : solicitud.estado === 'RECHAZADA'
        ? solicitud.motivoRechazo || 'Motivo no registrado.'
        : ''
  }));
}
