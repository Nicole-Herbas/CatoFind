import { BuscadorService } from '../../services/BuscadorService.js';
import { OBJETOS_INICIALES } from '../../../../core/data/datosIniciales.js';
import { iniciarBuscador } from './buscarVista.js';

iniciarBuscador(document, new BuscadorService(OBJETOS_INICIALES));

if (typeof window !== 'undefined' && window.location) {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q) {
    const input = document.querySelector('#buscador');
    if (input) {
      input.value = q;
      input.dispatchEvent(new Event('input'));
    }
  }
}