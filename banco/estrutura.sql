DROP TABLE IF EXISTS sessao;
DROP TABLE IF EXISTS acao;
DROP TABLE IF EXISTS resultado;
DROP TABLE IF EXISTS oferta;
DROP TABLE IF EXISTS usuario;

CREATE TABLE usuario (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nome        TEXT NOT NULL,
    login       TEXT NOT NULL UNIQUE,
    senha_hash  TEXT NOT NULL,
    criado_em   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE sessao (
    token       TEXT PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES usuario (id) ON DELETE CASCADE,
    expira_em   TEXT NOT NULL
);

CREATE TABLE oferta (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo          TEXT NOT NULL UNIQUE,
    curso           TEXT NOT NULL,
    grau_academico  TEXT NOT NULL CHECK (grau_academico IN ('Bacharelado', 'Licenciatura', 'Tecnológico')),
    modalidade      TEXT NOT NULL CHECK (modalidade IN ('Educação Presencial', 'Educação a Distância')),
    UNIQUE (curso, grau_academico, modalidade)
);

CREATE TABLE resultado (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    oferta_id         INTEGER NOT NULL REFERENCES oferta (id) ON DELETE RESTRICT,
    edicao            INTEGER NOT NULL CHECK (edicao BETWEEN 2014 AND 2025),
    inscritos         INTEGER NOT NULL CHECK (inscritos > 0),
    participantes     INTEGER NOT NULL CHECK (participantes >= 0),
    participacao_pct  REAL GENERATED ALWAYS AS (ROUND(participantes * 100.0 / inscritos, 2)) STORED,
    nota_fg           REAL NOT NULL CHECK (nota_fg BETWEEN 0 AND 100),
    nota_ce           REAL NOT NULL CHECK (nota_ce BETWEEN 0 AND 100),
    conceito_continuo REAL CHECK (conceito_continuo BETWEEN 0 AND 5),
    conceito_faixa    TEXT NOT NULL CHECK (conceito_faixa IN ('1', '2', '3', '4', '5', 'SC')),
    ponto_forte       TEXT NOT NULL,
    ponto_atencao     TEXT NOT NULL,
    origem_dado       TEXT NOT NULL DEFAULT 'OFICIAL_INEP' CHECK (origem_dado IN ('OFICIAL_INEP', 'SIMULADO_DIDATICO')),
    fonte_url         TEXT NOT NULL,
    CHECK (participantes <= inscritos),
    CHECK (conceito_faixa = 'SC' OR conceito_continuo IS NOT NULL),
    UNIQUE (oferta_id, edicao)
);

CREATE TABLE acao (
    id                   INTEGER PRIMARY KEY AUTOINCREMENT,
    oferta_id            INTEGER NOT NULL REFERENCES oferta (id) ON DELETE RESTRICT,
    titulo               TEXT NOT NULL CHECK (length(trim(titulo)) > 0),
    descricao            TEXT NOT NULL CHECK (length(trim(descricao)) > 0),
    situacao             TEXT NOT NULL CHECK (situacao IN ('Em planejamento', 'Em andamento', 'Concluída')),
    responsavel          TEXT NOT NULL CHECK (length(trim(responsavel)) > 0),
    prazo                TEXT NOT NULL,
    nome_original_anexo  TEXT,
    caminho_anexo        TEXT UNIQUE,
    criado_em            TEXT NOT NULL DEFAULT (datetime('now')),
    atualizado_em        TEXT NOT NULL DEFAULT (datetime('now')),
    CHECK ((nome_original_anexo IS NULL) = (caminho_anexo IS NULL))
);

CREATE INDEX ix_resultado_oferta ON resultado (oferta_id, edicao);
CREATE INDEX ix_acao_oferta ON acao (oferta_id);
