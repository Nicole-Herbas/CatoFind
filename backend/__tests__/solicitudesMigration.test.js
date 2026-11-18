import { readFileSync, readdirSync } from 'node:fs';

describe('migración de estado de solicitudes de recuperación HU-21', () => {
  it('persiste fecha, motivo de rechazo y estado entregada', () => {
    const archivo = readdirSync('supabase/migrations')
      .find(nombre => /hu21.*solicitudes/i.test(nombre));

    expect(archivo).toBeDefined();
    const sql = readFileSync(`supabase/migrations/${archivo}`, 'utf8');

    expect(sql).toMatch(/add value if not exists\s+'ENTREGADA'/i);
    expect(sql).toMatch(/add column if not exists\s+fecha_solicitud\s+timestamptz/i);
    expect(sql).toMatch(/add column if not exists\s+motivo_rechazo\s+text/i);
  });
});
