const lugaresValidos = ["biblioteca", "cafeteria", "bloqueA", "bloqueB", "auditorio", "estacionamiento", "patio", "laboratorio", "administracion"];

export default class Validador{
    constructor(documento = null){
        this.documento = documento;
    }

    static validarLugar(documento = globalThis.document){
        const campoLugar = documento?.getElementById('locations');

        if(!campoLugar || !lugaresValidos.find(campoLugar)){
            return false;
        }

        return true;
    }

    static Message(error) {
        switch(error){
            case 'Lugar_invalido':
                return 'El lugar seleccionado es inexistente';
        }
    }

    Message(error){
        return Validador.Message(error);
    }
}