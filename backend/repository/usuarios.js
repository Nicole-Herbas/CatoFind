export function crearUsuarios(supabase) {
  return {
    async crearPerfil({ authUid, nombre, correo, rol }) {
      const { error } = await supabase.from('usuario').insert({
        auth_uid: authUid,
        nombre,
        correo_institucional: correo,
        rol
      });

      if (error) throw error;
    },

    async obtenerPorAuthUid(authUid) {
      const { data, error } = await supabase
        .from('usuario')
        .select('nombre,correo_institucional,rol')
        .eq('auth_uid', authUid)
        .single();

      if (error) throw error;
      return data;
    }
  };
}
