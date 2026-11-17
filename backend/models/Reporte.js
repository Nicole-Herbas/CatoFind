import { Objeto } from './Objeto.js';

export class Reporte {
  constructor({
    id,
    tipo,
    fecha,
    lugar,
    contacto,
    estado,
    motivoRechazo,
    fechaRevision,
    estudianteId,
    administrativoId,
    objeto
  }) {
    this.id = id;
    this.tipo = tipo;
    this.fecha = fecha;
    this.lugar = lugar;
    this.contacto = contacto;
    this.estado = estado;
    this.motivoRechazo = motivoRechazo;
    this.fechaRevision = fechaRevision;
    this.estudianteId = estudianteId;
    this.administrativoId = administrativoId;
    this.objeto = objeto instanceof Objeto ? objeto : new Objeto(objeto);
  }
}
