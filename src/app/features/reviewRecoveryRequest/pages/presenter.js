import Approval from './reviewRecoveryRequest.js';

const botonAprobar = document.getElementById('btn-approve');

if (!botonAprobar) {
    throw new Error('No se encontró el botón para aprobar la solicitud.');
}

botonAprobar.addEventListener('click', () => {
    window.alert(Approval.approveMessage());
});
