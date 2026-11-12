import Approval, { formatearFecha, obtenerObjetoSeleccionado } from './reviewRecoveryRequest';

describe('Aprobar o rechazar solicitud de recuperacion', ()=>{
    it('Mostrar mensaje de aprobación de solicitud', ()=>{
        expect(Approval.approveMessage()).toBe('La solicitud ha sido aprobada con éxito');
    })

    it('Mostrar mensaje de rechazo de solicitud', ()=>{
        expect(Approval.denyMessage()).toBe('La solicitud ha sido rechazada con éxito');
    })

    it('recupera del almacenamiento la información completa del objeto seleccionado', () => {
        const objeto = {
            id: 1,
            titulo: 'Mochila negra',
            categoria: 'Accesorios',
            lugar: 'Biblioteca',
            fecha: '2026-10-08',
            imagen: 'https://example.test/mochila.jpg',
            estado: 'Publicado',
        };
        const almacenamiento = {
            getItem: jest.fn(() => JSON.stringify(objeto)),
        };

        expect(obtenerObjetoSeleccionado(almacenamiento)).toEqual(objeto);
        expect(almacenamiento.getItem).toHaveBeenCalledWith('catofind_objeto_seleccionado');
    });

    it('indica cuando no hay un objeto seleccionado en memoria', () => {
        expect(() => obtenerObjetoSeleccionado({ getItem: () => null }))
            .toThrow('No hay un objeto seleccionado.');
    });

    it('formatea la fecha del objeto en español', () => {
        expect(formatearFecha('2026-10-08')).toBe('8 de octubre de 2026');
    });
})