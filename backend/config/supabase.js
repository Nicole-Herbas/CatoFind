export function obtenerConfiguracionSupabase(entorno) {
  const url = entorno.SUPABASE_URL;
  const claveSecreta = entorno.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error('Falta configurar SUPABASE_URL');
  }

  if (!claveSecreta) {
    throw new Error('Falta configurar SUPABASE_SECRET_KEY');
    
  }

  return { url, claveSecreta };
}

export function crearClienteSupabase(entorno, crearCliente) {
  const { url, claveSecreta } = obtenerConfiguracionSupabase(entorno);

  return crearCliente(url, claveSecreta, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}
