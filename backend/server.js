import { createClient } from '@supabase/supabase-js';
import { crearApp } from './app.js';
import { crearClienteSupabase } from './config/supabase.js';
import { crearRepositorioObjetos } from './repository/objetos.js';
import { crearRepositorioReportes } from './repository/reportes.js';
import { crearSolicitudesRecuperacion as crearRepositorioSolicitudes } from './repository/solicitudesRecuperacion.js';
import { crearUsuarios } from './repository/usuarios.js';
import { crearServicioAutenticacion } from './services/autenticacion.js';
import { crearServicioObjetos } from './services/objetos.js';
import { crearServicioReportes } from './services/reportes.js';
import { crearSolicitudesRecuperacion } from './services/solicitudesRecuperacion.js';

const supabase = crearClienteSupabase(process.env, createClient);
const repositorioObjetos = crearRepositorioObjetos(supabase);
const repositorioReportes = crearRepositorioReportes(supabase);
const usuarios = crearUsuarios(supabase);
const repositorioSolicitudes = crearRepositorioSolicitudes(supabase);
const servicioSolicitudes = crearSolicitudesRecuperacion(supabase, repositorioSolicitudes);
const servicioAutenticacion = crearServicioAutenticacion(
  supabase,
  usuarios,
  () => crearClienteSupabase(process.env, createClient)
);
const servicioObjetos = crearServicioObjetos(repositorioObjetos);
const servicioReportes = crearServicioReportes(supabase, repositorioReportes, usuarios);
const app = crearApp(
  servicioObjetos,
  servicioAutenticacion,
  servicioSolicitudes,
  servicioReportes
);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Backend CatoFind escuchando en puerto ${port}`);
});
