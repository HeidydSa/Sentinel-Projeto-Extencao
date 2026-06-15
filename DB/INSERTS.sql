
use Sentinel;

INSERT INTO funcao (tipo, data_criacao) VALUES
('Administrador',    '2024-01-10 08:00:00'),
('Gerente',          '2024-01-10 08:01:00'),
('Desenvolvedor',    '2024-01-10 08:02:00'),
('Designer',         '2024-01-10 08:03:00'),
('Analista de QA',   '2024-01-10 08:04:00');
 
INSERT INTO usuario (email, senha, nome, sobrenome, funcao_id, data_criacao) VALUES
('ana.souza@sentinel.com',       'hash_001', 'Ana',      'Souza',      1, '2024-01-15 09:00:00'),
('carlos.lima@sentinel.com',     'hash_002', 'Carlos',   'Lima',       2, '2024-01-15 09:05:00'),
('marina.costa@sentinel.com',    'hash_003', 'Marina',   'Costa',      3, '2024-01-15 09:10:00'),
('pedro.alves@sentinel.com',     'hash_004', 'Pedro',    'Alves',      3, '2024-01-15 09:15:00'),
('julia.mendes@sentinel.com',    'hash_005', 'Julia',    'Mendes',     4, '2024-01-15 09:20:00'),
('rafael.santos@sentinel.com',   'hash_006', 'Rafael',   'Santos',     3, '2024-01-15 09:25:00'),
('camila.rocha@sentinel.com',    'hash_007', 'Camila',   'Rocha',      5, '2024-01-15 09:30:00'),
('lucas.ferreira@sentinel.com',  'hash_008', 'Lucas',    'Ferreira',   3, '2024-01-15 09:35:00'),
('beatriz.nunes@sentinel.com',   'hash_009', 'Beatriz',  'Nunes',      4, '2024-01-15 09:40:00'),
('thiago.melo@sentinel.com',     'hash_010', 'Thiago',   'Melo',       2, '2024-01-15 09:45:00'),
('larissa.dias@sentinel.com',    'hash_011', 'Larissa',  'Dias',       3, '2024-01-16 08:00:00'),
('bruno.carvalho@sentinel.com',  'hash_012', 'Bruno',    'Carvalho',   5, '2024-01-16 08:05:00'),
('fernanda.silva@sentinel.com',  'hash_013', 'Fernanda', 'Silva',      3, '2024-01-16 08:10:00'),
('diego.moraes@sentinel.com',    'hash_014', 'Diego',    'Moraes',     4, '2024-01-16 08:15:00'),
('patricia.vieira@sentinel.com', 'hash_015', 'Patricia', 'Vieira',     5, '2024-01-16 08:20:00'),
('rodrigo.pereira@sentinel.com', 'hash_016', 'Rodrigo',  'Pereira',    3, '2024-01-16 08:25:00'),
('amanda.freitas@sentinel.com',  'hash_017', 'Amanda',   'Freitas',    3, '2024-01-16 08:30:00'),
('henrique.gomes@sentinel.com',  'hash_018', 'Henrique', 'Gomes',      2, '2024-01-16 08:35:00'),
('isabela.martins@sentinel.com', 'hash_019', 'Isabela',  'Martins',    4, '2024-01-16 08:40:00'),
('victor.barbosa@sentinel.com',  'hash_020', 'Victor',   'Barbosa',    3, '2024-01-16 08:45:00');
 

INSERT INTO equipe (nome, id_lider, data_criacao) VALUES
('Frontend',         2,  '2024-01-20 10:00:00'),
('Backend',          10, '2024-01-20 10:05:00'),
('Design & UX',      2,  '2024-01-20 10:10:00'),
('Qualidade',        10, '2024-01-20 10:15:00'),
('DevOps',           18, '2024-01-20 10:20:00'),
('Produto',          18, '2024-01-20 10:25:00');
 
INSERT INTO membro_equipe (id_usuario, id_equipe, data_criacao) VALUES

(3,  1, '2024-01-21 08:00:00'),
(4,  1, '2024-01-21 08:00:00'),
(11, 1, '2024-01-21 08:00:00'),
(16, 1, '2024-01-21 08:00:00'),

(6,  2, '2024-01-21 08:05:00'),
(8,  2, '2024-01-21 08:05:00'),
(13, 2, '2024-01-21 08:05:00'),
(17, 2, '2024-01-21 08:05:00'),
(20, 2, '2024-01-21 08:05:00'),

(5,  3, '2024-01-21 08:10:00'),
(9,  3, '2024-01-21 08:10:00'),
(14, 3, '2024-01-21 08:10:00'),
(19, 3, '2024-01-21 08:10:00'),

(7,  4, '2024-01-21 08:15:00'),
(12, 4, '2024-01-21 08:15:00'),
(15, 4, '2024-01-21 08:15:00'),

(6,  5, '2024-01-21 08:20:00'),
(8,  5, '2024-01-21 08:20:00'),
(20, 5, '2024-01-21 08:20:00'),

(3,  6, '2024-01-21 08:25:00'),
(5,  6, '2024-01-21 08:25:00'),
(11, 6, '2024-01-21 08:25:00'),
(13, 6, '2024-01-21 08:25:00'),
(17, 6, '2024-01-21 08:25:00');
 

INSERT INTO and_tarefa (titulo, ordem, data_criacao) VALUES
('Backlog',      1, '2024-01-10 08:00:00'),
('A fazer',      2, '2024-01-10 08:00:00'),
('Em progresso', 3, '2024-01-10 08:00:00'),
('Em revisão',   4, '2024-01-10 08:00:00'),
('Concluído',    5, '2024-01-10 08:00:00');
 

INSERT INTO projeto (titulo, descricao, id_equipe, data_inicio, data_fim, custo_estimado, data_criacao) VALUES
('Portal do Cliente',       'Desenvolvimento do portal de autoatendimento para clientes.',           1, '2024-02-01', '2024-06-30', 120000.00, '2024-01-25 10:00:00'),
('API de Pagamentos',       'Integração com gateways de pagamento via REST API.',                   2, '2024-02-15', '2024-07-31', 95000.00,  '2024-01-25 10:05:00'),
('Redesign do App',         'Reformulação visual completa do aplicativo mobile.',                   3, '2024-03-01', '2024-08-31', 80000.00,  '2024-01-25 10:10:00'),
('Suite de Testes E2E',     'Criação de testes automatizados end-to-end para todos os módulos.',    4, '2024-02-01', '2024-05-31', 45000.00,  '2024-01-25 10:15:00'),
('Pipeline CI/CD',          'Configuração de pipeline de integração e entrega contínua.',           5, '2024-02-01', '2024-04-30', 30000.00,  '2024-01-25 10:20:00'),
('Dashboard Gerencial',     'Painel de indicadores em tempo real para gestores.',                   1, '2024-04-01', '2024-09-30', 70000.00,  '2024-02-01 09:00:00'),
('Módulo de Relatórios',    'Geração automatizada de relatórios em PDF e Excel.',                   2, '2024-04-15', '2024-10-15', 55000.00,  '2024-02-01 09:05:00'),
('Design System',           'Criação e documentação do design system corporativo.',                 3, '2024-03-15', '2024-07-15', 40000.00,  '2024-02-01 09:10:00'),
('Monitoramento de Infra',  'Implementação de alertas e monitoramento de infraestrutura.',          5, '2024-03-01', '2024-06-30', 35000.00,  '2024-02-01 09:15:00'),
('App de Onboarding',       'Aplicativo para guiar novos clientes nos primeiros acessos.',          6, '2024-05-01', '2024-11-30', 90000.00,  '2024-02-01 09:20:00');
 

INSERT INTO tarefa (id_projeto, id_criador, id_responsavel, id_and_tarefa, status, pontos_estimados, data_prevista, data_criacao) VALUES

(1,  2,  3,  2, 'concluida',    5, '2024-03-15', '2024-02-05 09:00:00'),
(1,  2,  4,  3, 'em_andamento', 8, '2024-04-30', '2024-02-05 09:05:00'),
(1,  2,  11, 3, 'em_andamento', 5, '2024-04-30', '2024-02-05 09:10:00'),
(1,  2,  16, 4, 'em_andamento', 3, '2024-05-15', '2024-02-05 09:15:00'),
(1,  2,  3,  1, 'pendente',     8, '2024-06-15', '2024-02-05 09:20:00'),

(2,  10, 6,  5, 'concluida',    8, '2024-03-31', '2024-02-15 10:00:00'),
(2,  10, 8,  5, 'concluida',    5, '2024-03-31', '2024-02-15 10:05:00'),
(2,  10, 13, 3, 'em_andamento', 13,'2024-05-15', '2024-02-15 10:10:00'),
(2,  10, 17, 2, 'pendente',     8, '2024-06-30', '2024-02-15 10:15:00'),
(2,  10, 20, 1, 'pendente',     5, '2024-07-15', '2024-02-15 10:20:00'),

(3,  2,  5,  5, 'concluida',    5, '2024-04-15', '2024-03-01 09:00:00'),
(3,  2,  9,  5, 'concluida',    8, '2024-04-30', '2024-03-01 09:05:00'),
(3,  2,  14, 3, 'em_andamento', 8, '2024-06-15', '2024-03-01 09:10:00'),
(3,  2,  19, 3, 'em_andamento', 5, '2024-07-01', '2024-03-01 09:15:00'),
(3,  2,  5,  2, 'pendente',     13,'2024-08-15', '2024-03-01 09:20:00'),

(4,  10, 7,  5, 'concluida',    5, '2024-03-01', '2024-02-01 08:00:00'),
(4,  10, 12, 5, 'concluida',    8, '2024-03-15', '2024-02-01 08:05:00'),
(4,  10, 15, 5, 'concluida',    5, '2024-03-31', '2024-02-01 08:10:00'),
(4,  10, 7,  4, 'em_andamento', 8, '2024-04-30', '2024-02-01 08:15:00'),
(4,  10, 12, 3, 'em_andamento', 5, '2024-05-15', '2024-02-01 08:20:00'),

(5,  18, 6,  5, 'concluida',    13,'2024-03-01', '2024-02-01 08:00:00'),
(5,  18, 8,  5, 'concluida',    8, '2024-03-15', '2024-02-01 08:05:00'),
(5,  18, 20, 5, 'concluida',    8, '2024-03-31', '2024-02-01 08:10:00'),
(5,  18, 6,  5, 'concluida',    5, '2024-04-15', '2024-02-01 08:15:00'),
(5,  18, 8,  5, 'concluida',    3, '2024-04-30', '2024-02-01 08:20:00'),

(6,  2,  3,  2, 'pendente',     8, '2024-06-30', '2024-04-01 09:00:00'),
(6,  2,  4,  2, 'pendente',     5, '2024-07-15', '2024-04-01 09:05:00'),
(6,  2,  11, 1, 'pendente',     13,'2024-08-01', '2024-04-01 09:10:00'),
(6,  2,  16, 1, 'pendente',     8, '2024-08-31', '2024-04-01 09:15:00'),
(6,  2,  3,  1, 'pendente',     5, '2024-09-15', '2024-04-01 09:20:00'),

(7,  10, 6,  3, 'em_andamento', 8, '2024-06-30', '2024-04-15 09:00:00'),
(7,  10, 13, 3, 'em_andamento', 13,'2024-07-31', '2024-04-15 09:05:00'),
(7,  10, 17, 2, 'pendente',     8, '2024-08-31', '2024-04-15 09:10:00'),
(7,  10, 20, 1, 'pendente',     5, '2024-09-30', '2024-04-15 09:15:00'),
(7,  10, 8,  1, 'pendente',     8, '2024-10-15', '2024-04-15 09:20:00'),

(8,  2,  5,  5, 'concluida',    5, '2024-04-30', '2024-03-15 09:00:00'),
(8,  2,  9,  4, 'em_andamento', 8, '2024-05-31', '2024-03-15 09:05:00'),
(8,  2,  14, 3, 'em_andamento', 5, '2024-06-15', '2024-03-15 09:10:00'),
(8,  2,  19, 2, 'pendente',     8, '2024-07-01', '2024-03-15 09:15:00'),
(8,  2,  5,  1, 'pendente',     13,'2024-07-15', '2024-03-15 09:20:00'),

(9,  18, 6,  5, 'concluida',    8, '2024-04-01', '2024-03-01 09:00:00'),
(9,  18, 8,  5, 'concluida',    5, '2024-04-15', '2024-03-01 09:05:00'),
(9,  18, 20, 3, 'em_andamento', 8, '2024-05-31', '2024-03-01 09:10:00'),
(9,  18, 6,  2, 'pendente',     5, '2024-06-15', '2024-03-01 09:15:00'),
(9,  18, 8,  1, 'pendente',     8, '2024-06-30', '2024-03-01 09:20:00'),

(10, 18, 3,  2, 'pendente',     13,'2024-07-31', '2024-05-01 09:00:00'),
(10, 18, 5,  2, 'pendente',     8, '2024-08-31', '2024-05-01 09:05:00'),
(10, 18, 11, 1, 'pendente',     5, '2024-09-30', '2024-05-01 09:10:00'),
(10, 18, 13, 1, 'pendente',     8, '2024-10-31', '2024-05-01 09:15:00'),
(10, 18, 17, 1, 'pendente',     13,'2024-11-15', '2024-05-01 09:20:00');