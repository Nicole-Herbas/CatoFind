import Validador from './recoveryRequest.js';

describe('Validar campos del formulario', ()=>{
    it('rechaza un lugar que no corresponde', ()=>{
        const documento = {
            getElementById: () => ({ value: 'lugar-invalido' })
        };

        expect(Validador.validarLugar(documento)).toBe(false);
        expect(Validador.Message('Lugar_invalido')).toBe('El lugar seleccionado es inexistente');
    });

    it('rechaza el área de texto vacía y devuelve su mensaje de error', ()=>{
        const documento = {
            getElementById: () => ({ value: '   ' })
        };

        expect(Validador.validarAreaTexto(documento)).toBe(false);
        expect(Validador.Message('Area_Vacia')).toBe('Es obligatorio describir caracteristicas del objeto');
    });

    it('acepta el área de texto cuando contiene una característica', ()=>{
        const documento = {
            getElementById: () => ({ value: 'Tiene una costura en la manga' })
        };

        expect(Validador.validarAreaTexto(documento)).toBe(true);
    });
});