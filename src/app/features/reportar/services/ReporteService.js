
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

}
