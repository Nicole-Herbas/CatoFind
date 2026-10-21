export default class Approval {
    constructor(documento = null){
        this.documento = documento;
    }

    static approveMessage(){
        return 'La solicitud ha sido aprobada con éxito';
    }
}