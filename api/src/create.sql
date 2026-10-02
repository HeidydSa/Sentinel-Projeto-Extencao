-- =========================================================
-- EXTENSÃO (para gen_random_uuid, se usar UUID)
-- =========================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =========================================================
-- FUNÇÃO GENÉRICA PARA ATUALIZAR updated_at
-- =========================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =========================================================
-- FUNCAO
-- =========================================================
CREATE TABLE funcao (
  id           SERIAL PRIMARY KEY,
  tipo         VARCHAR(100) NOT NULL UNIQUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_funcao_updated_at
BEFORE UPDATE ON funcao
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- USUARIO
-- =========================================================
CREATE TABLE usuario (
  id           SERIAL PRIMARY KEY,
  nome         VARCHAR(100) NOT NULL,
  sobrenome    VARCHAR(100) NOT NULL,
  email        VARCHAR(255) NOT NULL UNIQUE,
  senha        VARCHAR(255) NOT NULL,
  funcao_id    INTEGER NOT NULL REFERENCES funcao(id) ON DELETE RESTRICT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_usuario_updated_at
BEFORE UPDATE ON usuario
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- EQUIPE
-- =========================================================
CREATE TABLE equipe (
  id           SERIAL PRIMARY KEY,
  nome         VARCHAR(150) NOT NULL,
  id_lider     INTEGER REFERENCES usuario(id) ON DELETE SET NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_equipe_updated_at
BEFORE UPDATE ON equipe
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- MEMBRO_EQUIPE (associação N:N)
-- =========================================================
CREATE TABLE membro_equipe (
  equipe_id    INTEGER NOT NULL REFERENCES equipe(id)  ON DELETE CASCADE,
  usuario_id   INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (equipe_id, usuario_id)
);

CREATE TRIGGER trg_membro_equipe_updated_at
BEFORE UPDATE ON membro_equipe
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- PROJETO
-- =========================================================
CREATE TABLE projeto (
  id           SERIAL PRIMARY KEY,
  titulo       VARCHAR(200) NOT NULL,
  descricao    TEXT,
  id_equipe    INTEGER REFERENCES equipe(id) ON DELETE SET NULL,
  status       VARCHAR(50) NOT NULL DEFAULT 'ativo',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_projeto_updated_at
BEFORE UPDATE ON projeto
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- ANDAMENTO_TAREFA
-- =========================================================
CREATE TABLE andamento_tarefa (
  id           SERIAL PRIMARY KEY,
  titulo       VARCHAR(100) NOT NULL,
  ordem        INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_andamento_tarefa_updated_at
BEFORE UPDATE ON andamento_tarefa
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- TAREFA
-- =========================================================
CREATE TABLE tarefa (
  id                SERIAL PRIMARY KEY,
  titulo            VARCHAR(200) NOT NULL,
  data              DATE,
  economia          NUMERIC(12, 2),
  descricao         TEXT,
  status            VARCHAR(50) NOT NULL DEFAULT 'pendente',
  id_projeto        INTEGER REFERENCES projeto(id)           ON DELETE CASCADE,
  id_criador        INTEGER REFERENCES usuario(id)           ON DELETE SET NULL,
  id_responsavel    INTEGER REFERENCES usuario(id)           ON DELETE SET NULL,
  id_andamento      INTEGER REFERENCES andamento_tarefa(id)  ON DELETE SET NULL,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_tarefa_updated_at
BEFORE UPDATE ON tarefa
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- =========================================================
-- COMENTARIO
-- =========================================================
CREATE TABLE comentario (
  id           SERIAL PRIMARY KEY,
  id_tarefa    INTEGER NOT NULL REFERENCES tarefa(id)  ON DELETE CASCADE,
  id_usuario   INTEGER NOT NULL REFERENCES usuario(id) ON DELETE CASCADE,
  detalhe      TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_comentario_updated_at
BEFORE UPDATE ON comentario
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();