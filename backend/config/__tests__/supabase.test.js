import { obtenerConfiguracionSupabase } from '../supabase.js';

describe('configuración de Supabase del servidor', () => {
  it('lee la URL y la clave secreta del entorno del servidor', () => {
    expect(obtenerConfiguracionSupabase({
      SUPABASE_URL: 'https://proyecto.supabase.co',
      SUPABASE_SECRET_KEY: 'sb_secret_de_prueba'
    })).toEqual({
      url: 'https://proyecto.supabase.co',
      claveSecreta: 'sb_secret_de_prueba'
    });
  });

  it('indica qué variable falta sin incluir la clave en el error', () => {
    expect(() => obtenerConfiguracionSupabase({
      SUPABASE_URL: 'https://proyecto.supabase.co'
    })).toThrow('Falta configurar SUPABASE_SECRET_KEY');
  });
});
