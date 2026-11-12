function crearError(mensaje, codigo) {
  const error = new Error(mensaje);
  error.codigo = codigo;
  return error;
}

export function crearServicioAutenticacion(supabase, usuarios, crearClienteSesion = () => supabase) {
  return {
    async registrarEstudiante({ nombre, correo, contrasena }) {
      const nombreLimpio = String(nombre ?? '').trim();
      const correoLimpio = String(correo ?? '').trim().toLowerCase();

      if (!nombreLimpio || !/^[^\s@]+@ucb\.edu\.bo$/.test(correoLimpio) || !contrasena) {
        throw crearError('Completa los datos con un correo institucional UCB.', 'VALIDACION');
      }

      const { data, error } = await supabase.auth.admin.createUser({
        email: correoLimpio,
        password: contrasena,
        email_confirm: true
      });

      if (error || !data?.user) {
        throw crearError('No se pudo crear la cuenta.', 'AUTENTICACION');
      }

      try {
        await usuarios.crearPerfil({
          authUid: data.user.id,
          nombre: nombreLimpio,
          correo: correoLimpio,
          rol: 'ESTUDIANTE'
        });
      } catch {
        try {
          await supabase.auth.admin.deleteUser(data.user.id);
        } catch {}
        throw crearError('No se pudo guardar el perfil.', 'PERSISTENCIA');
      }

      return { nombre: nombreLimpio, correo: correoLimpio, rol: 'ESTUDIANTE' };
    },

    async iniciarSesion({ correo, contrasena }) {
      const correoNormalizado = String(correo ?? '').trim().toLowerCase();
      if (!/^[^\s@]+@ucb\.edu\.bo$/.test(correoNormalizado)) {
        throw crearError('Ingresa un correo institucional UCB.', 'VALIDACION');
      }

      const { data, error } = await crearClienteSesion().auth.signInWithPassword({
        email: correoNormalizado,
        password: String(contrasena ?? '')
      });

      if (error || !data?.user || !data?.session) {
        throw crearError('Correo o contraseña incorrectos.', 'CREDENCIALES');
      }

      const perfil = await usuarios.obtenerPorAuthUid(data.user.id);
      if (!perfil) {
        throw crearError('La cuenta no tiene un perfil registrado.', 'PERFIL');
      }

      return {
        accessToken: data.session.access_token,
        usuario: {
          nombre: perfil.nombre,
          correo: perfil.correo_institucional,
          rol: perfil.rol === 'ADMINISTRATIVO' ? 'ADMIN' : 'ESTUDIANTE'
        }
      };
    }
  };
}
