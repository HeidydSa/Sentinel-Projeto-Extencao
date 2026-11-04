import fs from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/db.config.js';
const db = await pool.connect();
try {
  const sql = await fs.readFile(
    new URL('../migrations/20261104_equipes.sql', import.meta.url),
    'utf8'
  );
  await db.query('BEGIN');
  await db.query(sql.replace(/^BEGIN;\s*/, '').replace(/COMMIT;\s*$/, ''));
  const { rows } = await db.query(
    'SELECT id,senha FROM equipe WHERE senha IS NOT NULL FOR UPDATE'
  );
  for (const team of rows) {
    if (!/^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(team.senha)) {
      if (Buffer.byteLength(team.senha, 'utf8') > 72)
        throw new Error(
          'Senha legada excede 72 bytes; redefina antes de migrar.'
        );
      await db.query('UPDATE equipe SET senha=$1 WHERE id=$2', [
        await bcrypt.hash(team.senha, 12),
        team.id,
      ]);
    }
  }
  await db.query('COMMIT');
  console.log(
    'Migração de equipes concluída. Senhas existentes foram convertidas para hash.'
  );
} catch (error) {
  await db.query('ROLLBACK');
  console.error(
    'Migração cancelada. Nenhuma alteração foi aplicada:',
    error.message
  );
  process.exitCode = 1;
} finally {
  db.release();
  await pool.end();
}
