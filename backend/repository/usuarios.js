export function crearUsuarios(supabase) {
  return {
    async crearPerfil({ authUid, nombre, correo, rol }) {
      const { error } = await supabase.from('usuario').insert({
        auth_uid: authUid,
        nombre,
        correo_institucional: correo,
        rol
      });

      if (error) {
        throw error;
      }
    },

    async obtenerPorAuthUid(authUid) {
      const { data, error } = await supabase
        .from('usuario')
        .select('id,nombre,correo_institucional,carrera,rol')
        .eq('auth_uid', authUid)
        .single();

      if (error) {
        throw error;
      }
      return data;
    },

    async actualizarPerfilEstudiante(authUid, cambios) {
      const { data, error } = await supabase
        .from('usuario')
        .update({
          nombre: cambios.nombre,
          carrera: cambios.carrera
        })
        .eq('auth_uid', authUid)
        .eq('rol', 'ESTUDIANTE')
        .select('id,nombre,correo_institucional,carrera,rol')
        .single();

      if (error) {
        throw error;
      }
      return data;
    }
  };
}
