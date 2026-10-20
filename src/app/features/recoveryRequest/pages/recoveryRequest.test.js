import Validador from './recoveryRequest.js'

describe('Validar campos del formulario', ()=>{
    it('Si el usuario elige un lugar que no corresponde, muestra un mensaje de error', ()=>{
        if(!Validador.validarLugar()){
            expect(Validador.Message("Lugar_invalido")).toBe("El lugar seleccionado es inexistente")
        }
    })
})