import { crearAppConSupabase } from './crearAppConSupabase.js';

const app = crearAppConSupabase(process.env);
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Backend CatoFind escuchando en puerto ${port}`);
});
