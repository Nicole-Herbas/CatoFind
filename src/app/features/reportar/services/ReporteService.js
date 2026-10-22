
const CLAVE_REPORTES = 'catofind_reportes';

export class ReporteService {

  constructor(almacenamiento) {
    this.almacenamiento = almacenamiento;
  }

  obtenerReportes() {
    try {
      const datos = this.almacenamiento.getItem(CLAVE_REPORTES);
      const reportes = JSON.parse(datos || '[]');

      return Array.isArray(reportes) ? reportes : [];
    } catch {
      return [];
    }
  }

  obtenerPendientes() {
    return this.obtenerReportes().filter(
      reporte => reporte.estado === 'Pendiente'
    );
  }

  guardarReporte(datos) {
    const reportes = this.obtenerReportes();

    const siguienteId = reportes.reduce(
      (maximo, reporte) =>
        Math.max(maximo, Number(reporte.id) || 0),
      0
    ) + 1;

    const nuevoReporte = {
      ...datos,
      id: siguienteId,
      estado: 'Pendiente'
    };

    reportes.push(nuevoReporte);

    this.almacenamiento.setItem(
      CLAVE_REPORTES,
      JSON.stringify(reportes)
    );

    return nuevoReporte;
  }

    obtenerPublicados() {
    return this.obtenerReportes().filter(
      reporte => reporte.estado === 'Publicado'
    );
  }

  actualizarEstado(id, nuevoEstado) {
    if (!['Publicado', 'Rechazado'].includes(nuevoEstado)) {
      return null;
    }

    const reportes = this.obtenerReportes();

    const indice = reportes.findIndex(
      reporte => String(reporte.id) === String(id)
    );

    if (
      indice === -1 ||
      reportes[indice].estado !== 'Pendiente'
    ) {
      return null;
    }

    const actualizado = {
      ...reportes[indice],
      estado: nuevoEstado
    };

    reportes[indice] = actualizado;

    this.almacenamiento.setItem(
      'catofind_reportes',
      JSON.stringify(reportes)
    );

    return actualizado;
  }

}
