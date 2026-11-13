/** @jest-environment jsdom */
import Validador from './recoveryRequest.js';
import { readFileSync } from 'node:fs';

const htmlFormulario = readFileSync(
    'src/app/features/recoveryRequest/pages/recoveryRequest.html', 'utf8'
);

async function abrirFormulario(query) {
    document.body.innerHTML = htmlFormulario;
    window.history.replaceState({}, '', `/recoveryRequest.html${query}`);
    global.fetch = jest.fn(async () => ({ ok: true, json: async () => ({}) }));
    jest.resetModules();
    await import('./presenter.js');
    document.getElementById('locations').value = 'biblioteca';
    document.getElementById('dateLost').value = '2026-11-10';
    document.getElementById('extraDescriptionObject').value = 'Marca en la parte de atrás';
}

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

describe('solicitud de recuperación', () => {
    it('informa que se debe elegir un objeto y no envía sin reporteId', async () => {
        await abrirFormulario('');
        document.querySelector('.recoveryForm').dispatchEvent(new Event('submit', {
            bubbles: true, cancelable: true
        }));
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(document.getElementById('elegir-objeto').hidden).toBe(false);
        expect(document.getElementById('elegir-objeto').textContent).toContain('Primero');
        expect(document.getElementById('sendRequest').disabled).toBe(true);
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('envía la solicitud con el reporteId seleccionado', async () => {
        await abrirFormulario('?reporteId=84');
        document.querySelector('.recoveryForm').dispatchEvent(new Event('submit', {
            bubbles: true, cancelable: true
        }));
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(JSON.parse(global.fetch.mock.calls[0][1].body).reporteId).toBe('84');
    });
});
