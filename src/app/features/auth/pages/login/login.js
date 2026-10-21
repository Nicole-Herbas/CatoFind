export function esCorreoInstitucional(correo) {
  return /^[^\s@]+@ucb\.edu\.bo$/i.test(correo.trim());
}

if (typeof document !== 'undefined') {
  const formulario = document.getElementById('login-form');

  if (formulario) {
    formulario.addEventListener('submit', function(evento) {
      evento.preventDefault();

      const correo = document.getElementById('correo').value;
      const mensaje = document.getElementById('mensaje-error');

      if (!esCorreoInstitucional(correo)) {
        mensaje.textContent = 'Ingresa con tu cuenta académica @ucb.edu.bo.';
      } else {
        mensaje.textContent = 'Correo válido. Falta verificar las credenciales.';
      }
    });
  }
}