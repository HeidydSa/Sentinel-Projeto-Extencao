use Sentinel;

delimiter $$

CREATE OR REPLACE VIEW vw_tarefas_detalhadas AS
SELECT
    t.id                                AS tarefa_id,
    t.id_projeto,
    p.titulo                            AS projeto,
    t.id_responsavel,
    u_resp.nome                         AS responsavel_nome,
    u_resp.sobrenome                    AS responsavel_sobrenome,
    t.id_criador,
    u_cria.nome                         AS criador_nome,
    t.id_and_tarefa,
    a.titulo                            AS andamento,
    a.ordem                             AS andamento_ordem,
    t.status,
    t.pontos_estimados,
    t.data_prevista,
    t.data_criacao
FROM tarefa t
JOIN projeto p
    ON t.id_projeto = p.id
JOIN usuario u_resp
    ON t.id_responsavel = u_resp.id
JOIN usuario u_cria
    ON t.id_criador = u_cria.id
JOIN and_tarefa a
    ON t.id_and_tarefa = a.id;

create view vw_usuario_publico as
select
    id,
    email,
    nome,
    sobrenome,
    funcao_id,
    data_criacao
from usuario;

create view vw_tarefas_com_responsavel as
select
    t.id,
    t.status,
    t.pontos_estimados,
    u.nome,
    u.sobrenome
from tarefa t
join usuario u
    on t.id_responsavel = u.id;

create view vw_projetos_completos as
select
    p.id,
    p.titulo,
    p.descricao,
    e.nome as equipe
from projeto p
join equipe e
    on p.id_equipe = e.id;

create view vw_projetos_qtd_tarefas as
select
    p.id,
    p.titulo,
    count(t.id) as total_tarefas
from projeto p
left join tarefa t
    on p.id = t.id_projeto
group by p.id, p.titulo$$

delimiter ;