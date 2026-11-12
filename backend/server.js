import { createClient } from '@supabase/supabase-js';
import { crearApp } from './app.js';
import { crearClienteSupabase } from './config/supabase.js';
import { crearRepositorioObjetos } from './repository/objetos.js';
import { crearServicioObjetos } from './services/objetos.js';

const supabase = crearClienteSupabase(process.env, createClient);
const repositorio = crearRepositorioObjetos(supabase);
const servicio = crearServicioObjetos(repositorio);
const app = crearApp(servicio);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Backend CatoFind escuchando en puerto ${port}`);
});
