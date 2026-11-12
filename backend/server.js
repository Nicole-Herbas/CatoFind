import { createClient } from '@supabase/supabase-js';
import { crearApp } from './app.js';
import { crearClienteSupabase } from './config/supabase.js';
import { crearRepositorioObjetos } from './repository/objetos.js';
import { crearSolicitudesRecuperacion as crearRepositorioSolicitudes } from './repository/solicitudesRecuperacion.js';
import { crearUsuarios } from './repository/usuarios.js';
import { crearServicioAutenticacion } from './services/autenticacion.js';
import { crearServicioObjetos } from './services/objetos.js';
import { crearSolicitudesRecuperacion } from './services/solicitudesRecuperacion.js';

const supabase = crearClienteSupabase(process.env, createClient);
const repositorio = crearRepositorioObjetos(supabase);
const usuarios = crearUsuarios(supabase);
const repositorioSolicitudes = crearRepositorioSolicitudes(supabase);
const servicioSolicitudes = crearSolicitudesRecuperacion(supabase, repositorioSolicitudes);
const servicioAutenticacion = crearServicioAutenticacion(supabase, usuarios);
const servicio = crearServicioObjetos(repositorio);
const app = crearApp(servicio, servicioAutenticacion, servicioSolicitudes);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Backend CatoFind escuchando en puerto ${port}`);
});
