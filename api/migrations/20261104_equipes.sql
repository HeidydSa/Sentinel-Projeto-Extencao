BEGIN;
ALTER TABLE equipe ADD COLUMN IF NOT EXISTS sistema BOOLEAN NOT NULL DEFAULT FALSE;
CREATE UNIQUE INDEX IF NOT EXISTS equipe_sistema_unica ON equipe(sistema) WHERE sistema;
ALTER TABLE equipe ADD COLUMN IF NOT EXISTS senha TEXT;
ALTER TABLE equipe ALTER COLUMN senha TYPE TEXT;
ALTER TABLE tarefa ADD COLUMN IF NOT EXISTS id_equipe INTEGER REFERENCES equipe(id) ON DELETE CASCADE;
ALTER TABLE andamento_tarefa ADD COLUMN IF NOT EXISTS id_equipe INTEGER REFERENCES equipe(id) ON DELETE CASCADE;
CREATE TABLE IF NOT EXISTS equipe_migracao_historico (
 entidade TEXT NOT NULL, registro_id INTEGER NOT NULL, dados JSONB NOT NULL,
 captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), PRIMARY KEY(entidade,registro_id)
);
INSERT INTO equipe_migracao_historico(entidade,registro_id,dados)
SELECT 'tarefa',t.id,to_jsonb(t) FROM tarefa t ON CONFLICT DO NOTHING;
INSERT INTO equipe_migracao_historico(entidade,registro_id,dados)
SELECT 'andamento_tarefa',a.id,to_jsonb(a) FROM andamento_tarefa a ON CONFLICT DO NOTHING;
-- Resolve duplicate names/multiple memberships before applying this migration.
CREATE UNIQUE INDEX IF NOT EXISTS usuario_nome_completo_unico ON usuario
(lower(regexp_replace(trim(nome || ' ' || sobrenome), '\s+', ' ', 'g')));
CREATE UNIQUE INDEX IF NOT EXISTS usuario_email_normalizado_unico ON usuario(lower(trim(email)));
INSERT INTO membro_equipe(equipe_id, usuario_id)
SELECT id, id_lider FROM equipe WHERE id_lider IS NOT NULL
ON CONFLICT DO NOTHING;
CREATE UNIQUE INDEX IF NOT EXISTS membro_equipe_usuario_unico ON membro_equipe(usuario_id);
DO $$
BEGIN
 IF EXISTS(SELECT 1 FROM equipe e WHERE e.id_lider IS NOT NULL AND NOT EXISTS(
   SELECT 1 FROM membro_equipe m WHERE m.equipe_id=e.id AND m.usuario_id=e.id_lider)) THEN
   RAISE EXCEPTION 'Cada lider precisa pertencer a sua propria equipe. Revise os vinculos existentes.';
 END IF;
 IF EXISTS(SELECT 1 FROM membro_equipe m JOIN usuario u ON u.id=m.usuario_id JOIN funcao f ON f.id=u.funcao_id
   WHERE lower(f.tipo) NOT IN ('desenvolvedor','analista')) THEN
   RAISE EXCEPTION 'Remova vinculos de gestores ou funcoes administrativas antes de migrar.';
 END IF;
END;
$$;
UPDATE tarefa t SET id_equipe=p.id_equipe FROM projeto p
WHERE t.id_projeto=p.id AND t.id_equipe IS NULL;
UPDATE tarefa t SET id_equipe=m.equipe_id FROM membro_equipe m JOIN equipe e ON e.id=m.equipe_id
WHERE NOT e.sistema AND t.id_criador=m.usuario_id AND t.id_equipe IS NULL;
-- Copy legacy shared progress definitions for each team that uses them.
DO $$
DECLARE item RECORD; copied_id INTEGER;
BEGIN
  FOR item IN SELECT DISTINCT a.id,a.titulo,a.ordem,a.created_at,a.updated_at,t.id_equipe
    FROM andamento_tarefa a JOIN tarefa t ON t.id_andamento=a.id
    WHERE a.id_equipe IS NULL AND t.id_equipe IS NOT NULL
  LOOP
    INSERT INTO andamento_tarefa(titulo,ordem,created_at,updated_at,id_equipe)
      VALUES(item.titulo,item.ordem,item.created_at,item.updated_at,item.id_equipe) RETURNING id INTO copied_id;
    UPDATE tarefa SET id_andamento=copied_id WHERE id_andamento=item.id AND id_equipe=item.id_equipe;
  END LOOP;
END;
$$;
UPDATE tarefa t SET id_responsavel=NULL WHERE t.id_equipe IS NOT NULL AND t.id_responsavel IS NOT NULL
AND NOT EXISTS(SELECT 1 FROM membro_equipe m WHERE m.equipe_id=t.id_equipe AND m.usuario_id=t.id_responsavel);

-- Records with no reliable team remain hidden until explicitly assigned.
CREATE INDEX IF NOT EXISTS tarefa_equipe_idx ON tarefa(id_equipe);
CREATE INDEX IF NOT EXISTS projeto_equipe_idx ON projeto(id_equipe);
CREATE INDEX IF NOT EXISTS andamento_equipe_idx ON andamento_tarefa(id_equipe);
CREATE TABLE IF NOT EXISTS convite_equipe (
 id SERIAL PRIMARY KEY,
 equipe_id INTEGER NOT NULL REFERENCES equipe(id) ON DELETE CASCADE,
 usuario_id INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
 UNIQUE(equipe_id, usuario_id)
);
INSERT INTO equipe(nome,sistema) SELECT 'Aguardando equipe',TRUE WHERE NOT EXISTS(SELECT 1 FROM equipe WHERE sistema);
INSERT INTO membro_equipe(equipe_id,usuario_id)
SELECT e.id,u.id FROM equipe e CROSS JOIN usuario u JOIN funcao f ON f.id=u.funcao_id
WHERE e.sistema AND lower(f.tipo) IN ('desenvolvedor','analista')
AND NOT EXISTS(SELECT 1 FROM membro_equipe m WHERE m.usuario_id=u.id) ON CONFLICT DO NOTHING;
COMMIT;
