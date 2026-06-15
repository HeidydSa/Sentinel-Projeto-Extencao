
use Sentinel;

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

-- TRANSACTIONS --

DELIMITER $$

CREATE PROCEDURE sp_criar_projeto_com_tarefas(IN p_equipe_id INT)
BEGIN
    DECLARE v_equipe_existe INT DEFAULT 0;
    DECLARE v_projeto_id INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;

    SELECT COUNT(*) INTO v_equipe_existe
    FROM equipe
    WHERE id = p_equipe_id;

    IF v_equipe_existe = 0 THEN
        ROLLBACK;
    ELSE

        INSERT INTO projeto (
            titulo, descricao, id_equipe,
            data_inicio, data_fim, custo_estimado, data_criacao
        ) VALUES (
            'Autenticação SSO',
            'Implementação de login único via OAuth 2.0 e SAML.',
            p_equipe_id,
            '2024-06-01', '2024-10-31', 62000.00,
            NOW()
        );

        SET v_projeto_id = LAST_INSERT_ID();

        INSERT INTO tarefa (
            id_projeto, id_criador, id_responsavel, id_and_tarefa,
            status, pontos_estimados, data_prevista, data_criacao
        ) VALUES
        (v_projeto_id, 10, 6, 2, 'pendente', 8, '2024-07-15', NOW()),
        (v_projeto_id, 10, 13, 1, 'pendente', 5, '2024-08-31', NOW());

        COMMIT;

    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE sp_projeto_fantasma()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;

    INSERT INTO projeto (
        titulo, descricao, id_equipe,
        data_inicio, data_fim, custo_estimado, data_criacao
    ) VALUES (
        'Projeto Fantasma',
        'Este projeto não deve ser persistido.',
        99,
        '2024-07-01', '2024-12-31', 10000.00,
        NOW()
    );

    INSERT INTO tarefa (
        id_projeto, id_criador, id_responsavel, id_and_tarefa,
        status, pontos_estimados, data_prevista, data_criacao
    ) VALUES (
        LAST_INSERT_ID(), 10, 6, 1,
        'pendente', 3, '2024-08-01', NOW()
    );

    ROLLBACK;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE sp_projeto_temporario()
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
    END;

    START TRANSACTION;

    INSERT INTO projeto (
        titulo, descricao, id_equipe,
        data_inicio, data_fim, custo_estimado, data_criacao
    ) VALUES (
        'Projeto Temporário',
        'Será desfeito pela validação abaixo.',
        1,
        '2024-07-01', '2024-12-31', 20000.00,
        NOW()
    );

    CALL sp_validar_equipe(99);

    COMMIT;
END$$

DELIMITER ;