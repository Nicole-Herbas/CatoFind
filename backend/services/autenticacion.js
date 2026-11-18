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
    },

    async obtenerSesion(token) {
      if (!token) {
        throw crearError('Debes iniciar sesión.', 'NO_AUTORIZADO');
      }
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        throw crearError('Debes iniciar sesión.', 'NO_AUTORIZADO');
      }
      const perfil = await usuarios.obtenerPorAuthUid(data.user.id);
      if (!perfil) {
        throw crearError('La cuenta no tiene un perfil registrado.', 'PERFIL');
      }
      return { usuario: {
        nombre: perfil.nombre,
        correo: perfil.correo_institucional,
        rol: perfil.rol === 'ADMINISTRATIVO' ? 'ADMIN' : 'ESTUDIANTE'
      } };
    },

    async obtenerPerfilEstudiante(token) {
      if (!token) {
        throw crearError('Debes iniciar sesión.', 'NO_AUTORIZADO');
      }
      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        throw crearError('Debes iniciar sesión.', 'NO_AUTORIZADO');
      }

      const perfil = await usuarios.obtenerPorAuthUid(data.user.id);
      if (!perfil) {
        throw crearError('La cuenta no tiene un perfil registrado.', 'PERFIL');
      }
      if (perfil.rol !== 'ESTUDIANTE') {
        throw crearError('El perfil solicitado es solo para estudiantes.', 'SIN_PERMISOS');
      }

      return {
        nombre: perfil.nombre,
        correo: perfil.correo_institucional,
        carrera: perfil.carrera || ''
      };
    },

    async actualizarPerfilEstudiante(token, datos = {}) {
      if (!token) {
        throw crearError('Debes iniciar sesión.', 'NO_AUTORIZADO');
      }
      const nombre = String(datos.nombre ?? '').trim();
      const carrera = String(datos.carrera ?? '').trim();

      if (!nombre || !carrera) {
        throw crearError('El nombre y la carrera son obligatorios.', 'VALIDACION');
      }

      const { data, error } = await supabase.auth.getUser(token);
      if (error || !data?.user) {
        throw crearError('Debes iniciar sesión.', 'NO_AUTORIZADO');
      }

      const perfil = await usuarios.obtenerPorAuthUid(data.user.id);
      if (!perfil) {
        throw crearError('La cuenta no tiene un perfil registrado.', 'PERFIL');
      }
      if (perfil.rol !== 'ESTUDIANTE') {
        throw crearError('El perfil solicitado es solo para estudiantes.', 'SIN_PERMISOS');
      }

      const actualizado = await usuarios.actualizarPerfilEstudiante(data.user.id, {
        nombre,
        carrera
      });

      return {
        nombre: actualizado.nombre,
        correo: actualizado.correo_institucional,
        carrera: actualizado.carrera || ''
      };
    },

    async obtenerSesionAdministrador(token) {
      const sesion = await this.obtenerSesion(token);
      if (sesion.usuario.rol !== 'ADMIN') {
        throw crearError('No tienes permisos para acceder al panel administrativo.', 'SIN_PERMISOS');
      }
      return sesion;
    }
  };
}
