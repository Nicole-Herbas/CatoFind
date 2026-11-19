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

// Arma la app Express completa conectada a Supabase.
// La usan el servidor local (server.js) y la Netlify Function (netlify/functions/api.js).
export function crearAppConSupabase(entorno = process.env) {
  const supabase = crearClienteSupabase(entorno, createClient);
  const repositorioObjetos = crearRepositorioObjetos(supabase);
  const repositorioReportes = crearRepositorioReportes(supabase);
  const usuarios = crearUsuarios(supabase);
  const repositorioSolicitudes = crearRepositorioSolicitudes(supabase);
  const servicioSolicitudes = crearSolicitudesRecuperacion(supabase, repositorioSolicitudes);
  const servicioAutenticacion = crearServicioAutenticacion(
    supabase,
    usuarios,
    () => crearClienteSupabase(entorno, createClient)
  );
  const servicioObjetos = crearServicioObjetos(repositorioObjetos);
  const servicioReportes = crearServicioReportes(supabase, repositorioReportes, usuarios);

  return crearApp(
    servicioObjetos,
    servicioAutenticacion,
    servicioSolicitudes,
    servicioReportes
  );
}
