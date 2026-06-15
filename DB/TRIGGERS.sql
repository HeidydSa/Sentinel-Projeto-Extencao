
use Sentinel;

delimiter $$

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