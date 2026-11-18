export default class Approval {
    constructor(documento = null){
        this.documento = documento;
    }

    static approveMessage(){
        return 'La solicitud ha sido aprobada con éxito';
    }

    static denyMessage(){
        return 'La solicitud ha sido rechazada con éxito';
    }
}

export function obtenerObjetoSeleccionado(almacenamiento) {
    const datos = almacenamiento.getItem('catofind_objeto_seleccionado');
    if (!datos) {
        throw new Error('No hay un objeto seleccionado.');
    }

    const objeto = JSON.parse(datos);
    if (
        !objeto ||
        typeof objeto !== 'object' ||
        !Number.isFinite(Number(objeto.id)) ||
        typeof objeto.titulo !== 'string' ||
        typeof objeto.categoria !== 'string' ||
        typeof objeto.lugar !== 'string' ||
        typeof objeto.fecha !== 'string'
    ) {
        throw new Error('La información del objeto seleccionado no es válida.');
    }

    return objeto;
}

export function formatearFecha(fecha) {
    const fechaObjeto = new Date(`${fecha}T00:00:00`);
    if (Number.isNaN(fechaObjeto.getTime())) {
        return fecha;
    }

    return fechaObjeto.toLocaleDateString('es-BO', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}