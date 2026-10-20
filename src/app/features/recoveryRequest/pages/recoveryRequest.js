const lugaresValidos = ["biblioteca", "cafeteria", "bloqueA", "bloqueB", "auditorio", "estacionamiento", "patio", "laboratorio", "administracion"];


export default class Validador{
    constructor(documento = null){
        this.documento = documento;
    }

    static validarLugar(documento = globalThis.document){
        const campoLugar = documento?.getElementById('locations');

        if(!campoLugar || !lugaresValidos.includes(campoLugar.value)){
            return false;
        }

        return true;
    }

    static validarAreaTexto(documento = globalThis.document){
        const campoDescription = documento?.getElementById('extraDescriptionObject');
        if(!campoDescription || String(campoDescription.value).trim() === ''){
            return false;
        }

        return true;
    }

    static validarCampos(documento = globalThis.document){
        const fechaPerdida = documento?.getElementById('dateLost');

        return this.validarLugar(documento)
            && Boolean(fechaPerdida && String(fechaPerdida.value).trim())
            && this.validarAreaTexto(documento);
    }

    static Message(error) {
        switch(error){
            case 'Lugar_invalido':
                return 'El lugar seleccionado es inexistente';
            case 'Area_Vacia':
                return 'Es obligatorio describir caracteristicas del objeto';
            case 'Campos_Vacios':
                return 'Todos los campos deben de estar llenados';
        }
    }

    Message(error){
        return Validador.Message(error);
    }
}