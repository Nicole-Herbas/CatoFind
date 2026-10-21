import Approval from './reviewRecoveryRequest.js';

const botonAprobar = document.getElementById('btn-approve');
const botonRechazar = document.getElementById('btn-deny');

if (!botonAprobar || !botonRechazar) {
    throw new Error('No se encontraron los botones para aprobar o rechazar la solicitud.');
}

botonAprobar.addEventListener('click', () => {
    window.alert(Approval.approveMessage());
});

botonRechazar.addEventListener('click', () => {
    window.alert(Approval.denyMessage());
});
