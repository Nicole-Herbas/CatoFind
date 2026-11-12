import {
  crearClienteSupabase,
  obtenerConfiguracionSupabase
} from '../supabase.js';

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

  it('crea un cliente de servidor sin persistencia ni refresco de sesión', () => {
    const crearCliente = jest.fn(() => 'cliente');
    const entorno = {
      SUPABASE_URL: 'https://proyecto.supabase.co',
      SUPABASE_SECRET_KEY: 'sb_secret_de_prueba'
    };

    expect(crearClienteSupabase(entorno, crearCliente)).toBe('cliente');
    expect(crearCliente).toHaveBeenCalledWith(
      'https://proyecto.supabase.co',
      'sb_secret_de_prueba',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  });
});
