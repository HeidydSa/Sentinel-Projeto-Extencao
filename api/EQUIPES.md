# Equipes: atualização da VM

Esta mudança altera a API e o frontend. Publicar somente um deles não é suficiente.

1. Faça backup do PostgreSQL e mantenha uma cópia da versão anterior.
2. Faça pull da branch que contém estas alterações.
3. Na pasta api, execute npm ci e npm run migrate:teams usando o .env da VM.
4. Somente após a migração concluir, recompile/reinicie a API conforme o processo da VM.
   O deploy atual usa Bun para gerar dist/app.js e PM2; apenas reiniciar um bundle antigo não aplica o código novo.
5. Publique WEB/src no Firebase e valide com usuários de duas equipes e um gestor.

## Migração e dados existentes

O comando de migração é transacional e pode ser executado novamente.
A coluna equipe.senha é TEXT e contém exclusivamente hash bcrypt.
O runner converte senhas antigas em texto para hash; não execute somente o SQL se já existem senhas em texto.
Equipes sem senha precisam de uma nova senha definida pelo líder pelo modal.
Não rode create.sql em um banco existente: ele é o schema inicial.

A migração pode parar por nomes completos duplicados ou usuários em múltiplas equipes.
Resolva esses conflitos manualmente antes de repetir. Não excluímos pessoas nem escolhemos vínculos automaticamente.
Nome completo é nome + sobrenome, ignorando caixa e espaços repetidos; acentos são preservados.

Projetos preservam seu id_equipe. Tarefas herdam a equipe do projeto ou, na ausência dela, do criador.
Registros legados sem equipe confiável ficam ocultos para membros; um responsável deve revisar e atribuí-los.
Andamentos antigos sem equipe também precisam ser revisados. Nunca atribua um registro compartilhado a duas equipes.
Gestores podem visualizar esses registros legados no filtro Todas as equipes.

O criador vira líder. Desenvolvedor e analista têm um único vínculo.
Gestor/Gerente e Adm são perfis de consulta global e só podem ser provisionados por administração fora do cadastro público.
A concessão desses perfis não é oferecida por nenhuma rota pública.

## Permissões

O banco é consultado a cada requisição: trocar o equipeId no navegador não concede acesso.
As rotas antigas de CRUD não ficam montadas em paralelo com as novas rotas com autorização.
O cliente recebe respostas de permissão sem perder sua sessão em cada 403.
A lista pública de equipes expõe somente id e nome. A lista de candidatos expõe nome e função para líderes.
Convites exigem aceite; o vínculo e a criação de equipe são transacionais.
O líder deve transferir a liderança antes de sair. O último membro confirma explicitamente a exclusão permanente.
Saída ou remoção preserva autoria histórica e desatribui tarefas; exclusão da última equipe remove seus dados.
Alterações de perfil não permitem trocar função ou equipe.

## Testes

npm test usa PostgreSQL em memória (PGlite) e não acessa o banco da VM.
A limitação de tentativas de entrada é por IP, em memória do processo: se houver múltiplos workers,
configure também o limite compartilhado no proxy da VM.

Andamentos antigos usados por tarefas são copiados por equipe na migração. Atribuições de responsáveis de outra equipe são removidas. Vínculos de gestores devem ser removidos antes da migração.

Se houver proxy reverso, configure também o limite de tentativas por IP no proxy.

## Usuarios sem equipe

Usuarios sem equipe nao possuem vinculo em membro_equipe. A sessao retorna equipe=null e aguardandoEquipe=true. Projetos e tarefas ficam vazios e alteracoes sao bloqueadas ate entrar em uma equipe. Podem editar o perfil, criar equipe, entrar com senha ou aceitar convite. Ao sair ou ser removido, permanecem sem equipe. Gestores mantem consulta global.

## Publicacao com possibilidade de recuperacao

O trabalho esta na branch feat/equipes-isoladas. A base anterior a estas alteracoes e:
f22659f3e3eb8dbd5170bb6048544ad955e9e70c

A branch separa as mudancas de codigo; ela NAO copia nem restaura PostgreSQL.

Antes de producao:

1. Faca commit e push da branch e revise o diff.
2. Na VM, registre a revisao atualmente implantada e guarde o bundle dist/app.js, os manifests
   de dependencias e a configuracao de inicializacao. A revisao da VM pode ser diferente da base local acima.
3. Crie um dump completo do PostgreSQL (pg_dump -Fc) com as credenciais da VM em um local protegido.
   Confirme a restauracao desse dump em um banco separado antes da migracao.
4. Teste esta branch contra essa copia e confira totais de usuarios, equipes, projetos, tarefas e comentarios.
5. Pause gravacoes durante a janela de atualizacao. Faca um novo dump antes de migrar a producao.
6. Execute npm ci e npm run migrate:teams com o .env da VM. Se falhar, nao publique.
7. Recompile a API e reinicie o processo. Verifique /sessao com um token valido.
8. Publique o frontend correspondente e valide dois membros de equipes diferentes, um usuario em espera e um gestor.
9. Libere o uso somente apos a validacao.

A migracao preserva as tarefas e os andamentos originais em equipe_migracao_historico antes de
ajustar seus vinculos. Esse historico ajuda a auditar atribuicoes; ele nao substitui o dump completo.

Recuperacao:

- Antes de liberar gravacoes, pode-se restaurar o dump testado e o bundle/frontend anteriores como um conjunto.
- Depois de novas gravacoes, restaurar um dump antigo DESCARTA as mudancas posteriores ao backup.
  Pause a aplicacao, preserve tambem um dump atual e planeje reconciliar os dados ou corrigir a versao nova.
- Nao volte apenas a API antiga mantendo os novos dados em uso: ela nao aplica o isolamento de equipes.
- Nao use git reset --hard nem apague tabelas para desfazer a atualizacao.
- O frontend e a API precisam corresponder a mesma versao. O comando de migracao pode ser repetido,
  mas nao existe uma migracao inversa automatica que garanta preservar novas gravacoes.
