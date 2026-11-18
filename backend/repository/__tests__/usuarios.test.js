import { jest } from '@jest/globals';
import { crearUsuarios } from '../usuarios.js';

describe('repositorio de usuarios', () => {
  it('actualiza nombre y carrera únicamente por el auth uid y devuelve el perfil', async () => {
    const resultado = {
      id: 8,
      nombre: 'Ana Torres',
      correo_institucional: 'ana@ucb.edu.bo',
      carrera: 'Ingeniería de Software',
      rol: 'ESTUDIANTE'
    };
    const consulta = {
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: resultado, error: null })
    };
    const supabase = { from: jest.fn(() => consulta) };

    await expect(crearUsuarios(supabase).actualizarPerfilEstudiante('auth-1', {
      nombre: 'Ana Torres',
      carrera: 'Ingeniería de Software'
    })).resolves.toEqual(resultado);

    expect(supabase.from).toHaveBeenCalledWith('usuario');
    expect(consulta.update).toHaveBeenCalledWith({
      nombre: 'Ana Torres',
      carrera: 'Ingeniería de Software'
    });
    expect(consulta.eq).toHaveBeenCalledWith('auth_uid', 'auth-1');
    expect(consulta.select).toHaveBeenCalledWith(
      'id,nombre,correo_institucional,carrera,rol'
    );
  });
});
