/* CONSULTAS */

select count(*) from funcao;
select count(*) from usuario;
select count(*) from equipe;
select count(*) from membro_equipe;
select count(*) from projeto;
select count(*) from and_tarefa;
select count(*) from tarefa;
select count(*) from log_tarefa;


/*-----------------------------------------------------------------------------
	consulta 1
uso pretendido:
permitir que gestores visualizem quem e o responsavel por cada tarefa.*/

select
    t.id,
    t.status,
    t.pontos_estimados,
    u.nome,
    u.sobrenome
from tarefa t
inner join usuario u
    on t.id_responsavel = u.id;

/*-----------------------------------------------------------------------------
	Consulta 2
Uso pretendido:
Exibir tarefas, projetos e seus responsáveis. */

select
    p.titulo as projeto,
    t.id as tarefa,
    t.status,
    u.nome,
    u.sobrenome
from projeto p
inner join tarefa t
    on p.id = t.id_projeto
inner join usuario u
    on t.id_responsavel = u.id;
    
/*-----------------------------------------------------------------------------
	consulta 3
uso pretendido:
identificar projetos com maior volume de tarefas.*/

select
    p.titulo,
    count(t.id) as total_tarefas
from projeto p
left join tarefa t
    on p.id = t.id_projeto
group by p.id, p.titulo;

/*-----------------------------------------------------------------------------
	consulta 4
uso pretendido:
localizar projetos com quantidade significativa de trabalho.*/

select
    p.titulo,
    count(t.id) as total_tarefas
from projeto p
inner join tarefa t
    on p.id = t.id_projeto
group by p.id, p.titulo
having count(t.id) > 2;

/*-----------------------------------------------------------------------------
consulta 5
uso pretendido:
verificar quais equipes estao participando de projetos.*/

select
    e.nome
from equipe e
where exists (
    select 1
    from projeto p
    where p.id_equipe = e.id
);

/*-----------------------------------------------------------------------------
	consulta 6
uso pretendido:
identificar colaboradores com maior carga de trabalho.*/

select
    u.nome,
    u.sobrenome,
    count(t.id) as total_tarefas
from usuario u
left join tarefa t
    on u.id = t.id_responsavel
group by u.id, u.nome, u.sobrenome
order by total_tarefas desc;

/*-------------------------------------------------------------------------------
	consulta 7
uso pretendido:
listar projetos iniciados durante o ano de 2025.*/

select
    titulo,
    data_inicio,
    data_fim
from projeto
where data_inicio between '2025-01-01' and '2025-12-31';

/*--------------------------------------------------------------------------------
	consulta 8
uso pretendido:
acompanhar o percentual de conclusao de cada projeto utilizando a function criada.*/

select
    titulo,
    fn_percentual_conclusao_projeto(id) as percentual_conclusao
from projeto;