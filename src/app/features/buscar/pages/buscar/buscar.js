import { BuscadorService } from '../../services/BuscadorService.js';
import { OBJETOS_INICIALES } from '../../../../core/data/datosIniciales.js';
import { iniciarBuscador } from './buscarVista.js';

iniciarBuscador(document, new BuscadorService(OBJETOS_INICIALES));