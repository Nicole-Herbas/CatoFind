import { createClient } from '@supabase/supabase-js';
import { crearApp } from './app.js';
import { crearClienteSupabase } from './config/supabase.js';
import { crearRepositorioObjetos } from './repository/objetos.js';
import { crearUsuarios } from './repository/usuarios.js';
import { crearServicioAutenticacion } from './services/autenticacion.js';
import { crearServicioObjetos } from './services/objetos.js';

const supabase = crearClienteSupabase(process.env, createClient);
const repositorio = crearRepositorioObjetos(supabase);
const usuarios = crearUsuarios(supabase);
const servicioAutenticacion = crearServicioAutenticacion(supabase, usuarios);
const servicio = crearServicioObjetos(repositorio);
const app = crearApp(servicio, servicioAutenticacion);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Backend CatoFind escuchando en puerto ${port}`);
});
