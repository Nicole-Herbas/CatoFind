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