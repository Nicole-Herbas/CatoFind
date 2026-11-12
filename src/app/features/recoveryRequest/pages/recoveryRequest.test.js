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

    it('si por lo menos un campo no esta llenado, devuelve un mensaje de error', ()=>{

        const valoresValidos = {
            locations: { value: 'biblioteca' },
            dateLost: { value: '2026-10-20' },
            extraDescriptionObject: { value: 'Tiene una costura en la manga' }
        };

        Object.keys(valoresValidos).forEach((campoVacio) => {
            const campos = {
                locations: { ...valoresValidos.locations },
                dateLost: { ...valoresValidos.dateLost },
                extraDescriptionObject: { ...valoresValidos.extraDescriptionObject }
            };
            campos[campoVacio].value = '';
            const documento = {
                getElementById: (id) => campos[id]
            };

            expect(Validador.validarCampos(documento)).toBe(false);
        });

        expect(Validador.Message('Campos_Vacios')).toBe('Todos los campos deben de estar llenados');
    });
});