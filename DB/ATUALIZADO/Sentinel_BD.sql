create database sentinel;

use Sentinel;

create table funcao (
    id int auto_increment primary key,
    tipo varchar(100) not null unique,
    data_criacao datetime not null
);

create table usuario (
    id int auto_increment primary key,
    email varchar(100) not null unique,
    senha varchar(100) not null,
    nome varchar(100) not null,
    sobrenome varchar(100) not null,
    funcao_id int not null,
    data_criacao datetime not null,
    foreign key (funcao_id) references funcao(id)
);

create table equipe (
    id int auto_increment primary key,
    nome varchar(100) not null unique,
    id_lider int not null,
    data_criacao datetime not null,
    foreign key (id_lider) references usuario(id)
);

create table membro_equipe (
    id_usuario int not null,
    id_equipe int not null,
    data_criacao datetime not null,
    primary key (id_usuario, id_equipe),
    foreign key (id_usuario) references usuario(id),
    foreign key (id_equipe) references equipe(id)
);

create table projeto (
    id int auto_increment primary key,
    titulo varchar(100) not null,
    descricao text,
    id_equipe int not null,
    data_inicio date not null,
    data_fim date,
    custo_estimado decimal(12,2),
    data_criacao datetime not null,
    foreign key (id_equipe) references equipe(id)
);

create table and_tarefa (
    id int auto_increment primary key,
    titulo varchar(100) not null,
    ordem int not null,
    data_criacao datetime not null
);

create table tarefa (
    id int auto_increment primary key,
    id_projeto int not null,
    id_criador int not null,
    id_responsavel int not null,
    id_and_tarefa int not null,
    status varchar(20) not null,
    pontos_estimados int not null,
    data_prevista date not null,
    data_criacao datetime not null,
    foreign key (id_projeto) references projeto(id),
    foreign key (id_criador) references usuario(id),
    foreign key (id_responsavel) references usuario(id),
    foreign key (id_and_tarefa) references and_tarefa(id),
    check (status in ('pendente','em_andamento','concluida'))
);

create table log_tarefa (
    id int auto_increment primary key,
    tarefa_id int not null,
    status_antigo varchar(20),
    status_novo varchar(20),
    data_log datetime not null
);

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
group by p.id, p.titulo;

delimiter $$

create function fn_percentual_conclusao_projeto(
    p_projeto int
)
returns decimal(5,2)
deterministic
begin
    declare total int;
    declare concluidas int;

    select count(*)
    into total
    from tarefa
    where id_projeto = p_projeto;

    select count(*)
    into concluidas
    from tarefa
    where id_projeto = p_projeto
    and status = 'concluida';

    if total = 0 then
        return 0;
    end if;

    return (concluidas * 100.0) / total;
end$$

create procedure sp_criar_projeto(
    in p_titulo varchar(100),
    in p_descricao text,
    in p_equipe int,
    in p_inicio date,
    in p_fim date,
    in p_custo decimal(12,2)
)
begin
    start transaction;

    insert into projeto (
        titulo,
        descricao,
        id_equipe,
        data_inicio,
        data_fim,
        custo_estimado,
        data_criacao
    )
    values (
        p_titulo,
        p_descricao,
        p_equipe,
        p_inicio,
        p_fim,
        p_custo,
        now()
    );

    commit;
end$$

create procedure sp_relatorio_projetos()
begin
    select
        p.titulo,
        count(t.id) as total_tarefas
    from projeto p
    left join tarefa t
        on p.id = t.id_projeto
    group by p.id, p.titulo;
end$$

create procedure sp_concluir_projeto(
    in p_projeto int
)
begin
    if exists (
        select 1
        from tarefa
        where id_projeto = p_projeto
        and status <> 'concluida'
    ) then
        signal sqlstate '45000'
        set message_text = 'existem tarefas pendentes';
    end if;
end$$

create procedure sp_validar_equipe(
    in p_equipe int
)
begin
    if not exists (
        select 1
        from equipe
        where id = p_equipe
    ) then
        signal sqlstate '45000'
        set message_text = 'equipe inexistente';
    end if;
end$$

create trigger trg_log_status_tarefa
after update on tarefa
for each row
begin
    if old.status <> new.status then
        insert into log_tarefa (
            tarefa_id,
            status_antigo,
            status_novo,
            data_log
        )
        values (
            new.id,
            old.status,
            new.status,
            now()
        );
    end if;
end$$

create trigger trg_bloqueia_exclusao_projeto
before delete on projeto
for each row
begin
    if exists (
        select 1
        from tarefa
        where id_projeto = old.id
    ) then
        signal sqlstate '45000'
        set message_text = 'projeto possui tarefas vinculadas';
    end if;
end$$
delimiter ;

insert into funcao (tipo, data_criacao) values
('Administrador', NOW()),
('Gerente', NOW()),
('Desenvolvedor', NOW()),
('Analista QA', NOW()),
('Product Owner', NOW());

insert into usuario (
email, senha, nome, sobrenome, funcao_id, data_criacao
) values
('admin@sentinel.com','123','Carlos','Silva',1,NOW()),
('gerente1@sentinel.com','123','Marina','Souza',2,NOW()),
('gerente2@sentinel.com','123','Ricardo','Lima',2,NOW()),
('dev1@sentinel.com','123','Joao','Pereira',3,NOW()),
('dev2@sentinel.com','123','Ana','Costa',3,NOW()),
('dev3@sentinel.com','123','Pedro','Oliveira',3,NOW()),
('dev4@sentinel.com','123','Julia','Santos',3,NOW()),
('dev5@sentinel.com','123','Bruno','Ferreira',3,NOW()),
('dev6@sentinel.com','123','Lucas','Almeida',3,NOW()),
('dev7@sentinel.com','123','Bianca','Rocha',3,NOW()),
('qa1@sentinel.com','123','Paula','Mendes',4,NOW()),
('qa2@sentinel.com','123','Gabriel','Dias',4,NOW()),
('qa3@sentinel.com','123','Camila','Araujo',4,NOW()),
('po1@sentinel.com','123','Fernanda','Barbosa',5,NOW()),
('po2@sentinel.com','123','Rafael','Cardoso',5,NOW()),
('user16@sentinel.com','123','Mateus','Nunes',3,NOW()),
('user17@sentinel.com','123','Aline','Machado',3,NOW()),
('user18@sentinel.com','123','Felipe','Teixeira',3,NOW()),
('user19@sentinel.com','123','Larissa','Gomes',4,NOW()),
('user20@sentinel.com','123','Daniel','Martins',3,NOW());

insert into equipe (
nome, id_lider, data_criacao
) values
('Equipe Alpha',2,NOW()),
('Equipe Beta',3,NOW()),
('Equipe Gamma',14,NOW()),
('Equipe Delta',15,NOW()),
('Equipe Omega',1,NOW());

insert into membro_equipe values
(2,1,NOW()),
(4,1,NOW()),
(5,1,NOW()),
(6,1,NOW()),

(3,2,NOW()),
(7,2,NOW()),
(8,2,NOW()),
(9,2,NOW()),

(14,3,NOW()),
(10,3,NOW()),
(11,3,NOW()),
(12,3,NOW()),

(15,4,NOW()),
(13,4,NOW()),
(16,4,NOW()),
(17,4,NOW()),

(1,5,NOW()),
(18,5,NOW()),
(19,5,NOW()),
(20,5,NOW());

insert into and_tarefa (
titulo, ordem, data_criacao
) values
('Backlog',1,NOW()),
('A Fazer',2,NOW()),
('Em Desenvolvimento',3,NOW()),
('Em Teste',4,NOW()),
('Concluida',5,NOW());

insert into projeto (
titulo,
descricao,
id_equipe,
data_inicio,
data_fim,
custo_estimado,
data_criacao
) values
('Sistema RH','Gestao RH',1,'2025-01-01','2025-06-30',50000,NOW()),
('Sistema ERP','ERP Corporativo',2,'2025-02-01','2025-10-30',120000,NOW()),
('Portal Cliente','Portal Web',3,'2025-03-01','2025-08-30',45000,NOW()),
('Aplicativo Mobile','App Android',4,'2025-04-01','2025-09-30',80000,NOW()),
('Dashboard BI','Business Intelligence',5,'2025-05-01','2025-12-30',60000,NOW()),
('Projeto Fenix','Modernizacao',1,'2025-06-01',null,70000,NOW()),
('Projeto Atlas','Controle Interno',2,'2025-07-01',null,40000,NOW()),
('Projeto Orion','Automacao',3,'2025-08-01',null,55000,NOW()),
('Projeto Polaris','Monitoramento',4,'2025-09-01',null,90000,NOW()),
('Projeto Apollo','IA Corporativa',5,'2025-10-01',null,150000,NOW());

insert into tarefa (
id_projeto,
id_criador,
id_responsavel,
id_and_tarefa,
status,
pontos_estimados,
data_prevista,
data_criacao
) values

(1,2,4,1,'pendente',5,'2025-02-01',NOW()),
(1,2,5,2,'em_andamento',8,'2025-02-05',NOW()),
(1,2,6,5,'concluida',3,'2025-02-10',NOW()),
(2,3,7,1,'pendente',13,'2025-03-01',NOW()),
(2,3,8,3,'em_andamento',8,'2025-03-05',NOW()),

(2,3,9,5,'concluida',5,'2025-03-10',NOW()),
(3,14,10,1,'pendente',5,'2025-04-01',NOW()),
(3,14,11,2,'em_andamento',8,'2025-04-05',NOW()),
(3,14,12,5,'concluida',13,'2025-04-10',NOW()),
(4,15,13,1,'pendente',5,'2025-05-01',NOW()),

(4,15,16,3,'em_andamento',8,'2025-05-05',NOW()),
(4,15,17,5,'concluida',3,'2025-05-10',NOW()),
(5,1,18,1,'pendente',5,'2025-06-01',NOW()),
(5,1,19,2,'em_andamento',8,'2025-06-05',NOW()),
(5,1,20,5,'concluida',5,'2025-06-10',NOW()),

(6,2,4,1,'pendente',8,'2025-07-01',NOW()),
(6,2,5,3,'em_andamento',13,'2025-07-05',NOW()),
(6,2,6,5,'concluida',5,'2025-07-10',NOW()),
(7,3,7,1,'pendente',3,'2025-08-01',NOW()),
(7,3,8,3,'em_andamento',5,'2025-08-05',NOW()),

(7,3,9,5,'concluida',8,'2025-08-10',NOW()),
(8,14,10,1,'pendente',13,'2025-09-01',NOW()),
(8,14,11,2,'em_andamento',5,'2025-09-05',NOW()),
(8,14,12,5,'concluida',3,'2025-09-10',NOW()),
(9,15,13,1,'pendente',8,'2025-10-01',NOW()),

(9,15,16,3,'em_andamento',5,'2025-10-05',NOW()),
(9,15,17,5,'concluida',13,'2025-10-10',NOW()),
(10,1,18,1,'pendente',8,'2025-11-01',NOW()),
(10,1,19,3,'em_andamento',5,'2025-11-05',NOW()),
(10,1,20,5,'concluida',21,'2025-11-10',NOW());


insert into log_tarefa (
tarefa_id,
status_antigo,
status_novo,
data_log
) values
(1,'pendente','em_andamento',NOW()),
(2,'em_andamento','concluida',NOW()),
(4,'pendente','em_andamento',NOW()),
(5,'em_andamento','concluida',NOW()),
(7,'pendente','em_andamento',NOW()),

(8,'em_andamento','concluida',NOW()),
(10,'pendente','em_andamento',NOW()),
(11,'em_andamento','concluida',NOW()),
(13,'pendente','em_andamento',NOW()),
(14,'em_andamento','concluida',NOW());


