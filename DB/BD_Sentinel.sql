create database Sentinel;

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
    data_log datetime not null,
    foreign key (tarefa_id) references tarefa(id)
);



