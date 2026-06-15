use Sentinel;

-- Exibe todas as tarefas de um projeto com o nome do responsável, andamento atual e projeto ao qual pertencem. Usada pelo gerente para acompanhar o progresso em tempo real.
SELECT
    p.titulo                            AS projeto,
    t.id                                AS tarefa_id,
    t.status,
    t.pontos_estimados,
    t.data_prevista,
    a.titulo                            AS andamento,
    u.nome                              AS responsavel_nome,
    u.sobrenome                         AS responsavel_sobrenome
FROM tarefa t
JOIN projeto p
    ON t.id_projeto = p.id
JOIN and_tarefa a
    ON t.id_and_tarefa = a.id
JOIN usuario u
    ON t.id_responsavel = u.id
ORDER BY p.titulo, a.ordem, t.data_prevista;



-- Painel de membros da equipe. Lista todos os usuários de uma equipe específica com seu nome, e-mail e função. Usada na página de gestão de equipes.

SELECT
    e.nome                              AS equipe,
    u.nome,
    u.sobrenome,
    u.email,
    f.tipo                              AS funcao
FROM membro_equipe me
JOIN usuario u
    ON me.id_usuario = u.id
JOIN equipe e
    ON me.id_equipe = e.id
JOIN funcao f
    ON u.funcao_id = f.id
WHERE e.nome = 'Backend'
ORDER BY u.nome;



-- Uso pretendido: Relatório gerencial de carga de trabalho. Identifica responsáveis sobrecarregados, exibindo apenas quem possui mais de 2 tarefas ativas (pendente ou em andamento). Auxilia o gestor a redistribuir tarefas.
 
SELECT
    u.nome,
    u.sobrenome,
    COUNT(t.id)                         AS tarefas_ativas,
    SUM(t.pontos_estimados)             AS pontos_totais
FROM tarefa t
JOIN usuario u
    ON t.id_responsavel = u.id
WHERE t.status IN ('pendente', 'em_andamento')
GROUP BY u.id, u.nome, u.sobrenome
HAVING COUNT(t.id) > 2
ORDER BY tarefas_ativas DESC;



-- Uso pretendido: Validação antes de encerrar um projeto. Retorna todos os projetos que ainda possuem tarefas não concluídas, impedindo o encerramento indevido. Usada internamente pela sp_concluir_projeto e em relatórios de auditoria.

SELECT
    p.id,
    p.titulo,
    p.data_fim,
    p.custo_estimado
FROM projeto p
WHERE EXISTS (
    SELECT 1
    FROM tarefa t
    WHERE t.id_projeto = p.id
      AND t.status <> 'concluida'
)
ORDER BY p.data_fim;



-- Uso pretendido: Indicador de desempenho por projeto no dashboard gerencial. Exibe para cada projeto o total de tarefas, quantas estão concluídas, o percentual de conclusão e a soma de pontos estimados, ordenando pelos mais próximos da conclusão.

SELECT
    p.titulo                                        AS projeto,
    e.nome                                          AS equipe,
    COUNT(t.id)                                     AS total_tarefas,
    SUM(CASE WHEN t.status = 'concluida' THEN 1 ELSE 0 END)
                                                    AS tarefas_concluidas,
    ROUND(
        SUM(CASE WHEN t.status = 'concluida' THEN 1 ELSE 0 END)
        * 100.0 / NULLIF(COUNT(t.id), 0), 1
    )                                               AS percentual_conclusao,
    SUM(t.pontos_estimados)                         AS total_pontos,
    MIN(t.data_prevista)                            AS proxima_entrega
FROM projeto p
JOIN equipe e
    ON p.id_equipe = e.id
LEFT JOIN tarefa t
    ON t.id_projeto = p.id
GROUP BY p.id, p.titulo, e.nome
ORDER BY percentual_conclusao DESC, proxima_entrega ASC;



-- Uso pretendido: Filtro financeiro e temporal no módulo de planejamento. Retorna projetos iniciados em 2024 cujo custo estimado está entre R$ 50.000 e R$ 100.000, ajudando o gestor a analisar projetos de médio porte em andamento.

SELECT
    p.titulo,
    e.nome                              AS equipe,
    p.data_inicio,
    p.data_fim,
    p.custo_estimado,
    DATEDIFF(p.data_fim, p.data_inicio) AS duracao_dias
FROM projeto p
JOIN equipe e
    ON p.id_equipe = e.id
WHERE p.data_inicio BETWEEN '2024-01-01' AND '2024-12-31'
  AND p.custo_estimado BETWEEN 50000.00 AND 100000.00
ORDER BY p.custo_estimado DESC;