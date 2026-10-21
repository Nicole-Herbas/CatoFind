import Approval from './reviewRecoveryRequest';

describe('Aprobar o rechazar solicitud de recuperacion', ()=>{
    it('Mostrar mensaje de aprobación de solicitud', ()=>{
        expect(Approval.approveMessage()).toBe('La solicitud ha sido aprobada con éxito');
    })

    it('Mostrar mensaje de rechazo de solicitud', ()=>{
        expect(Approval.denyMessage()).toBe('La solicitud ha sido rechazada con éxito');
    })
})