# Integração com a API e o Supabase

O frontend consulta a API definida em `WEB/src/config/global.js`. Login, cadastro, perfil, projetos, tarefas e comentários passam pela API. O backend usa PostgreSQL no Supabase por meio do driver `pg`. O frontend não recebe credenciais do banco e não usa Firebase Authentication nem Firestore.

## Configuração do backend

1. Copie `api/.env.example` para `api/.env`.
2. Substitua `DATABASE_URL` pela conexão PostgreSQL do seu projeto Supabase (conexão direta ou pooler, conforme a conectividade do servidor).
3. Configure `JWT_SECRET` com um segredo próprio e `WHITELIST` com as origens reais do frontend.
4. Mantenha TLS habilitado e a validação do certificado. A conexão usa `POSTGRES_SSL=true`. Não coloque credenciais no frontend ou no Git.
5. Confirme que o banco possui as tabelas `funcao`, `usuario`, `equipe`, `membro_equipe`, `projeto`, `tarefa`, `andamento_tarefa` e `comentario`. O contrato SQL está em `api/src/create.sql`. Não execute esse arquivo sobre tabelas existentes sem uma migração revisada.
6. A tabela `funcao` precisa ter pelo menos uma função não administrativa para permitir cadastro. O formulário carrega essas opções de `GET /auth/roles`, sem IDs fixos.

Também continuam disponíveis as variáveis `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_DB`, `POSTGRES_USER` e `POSTGRES_PASSWORD`, como alternativa a `DATABASE_URL`.

Na pasta `api`, execute `npm ci` e `npm start`. O comando usa Node.js com suporte a `--env-file-if-exists` (o projeto foi testado com Node 24).

## Autenticação e dados

- `POST /auth/register`: recebe nome, sobrenome, e-mail, senha e ID da função. Grava a senha com bcrypt. O cadastro público não permite funções administrativas.
- `POST /auth/login`: valida a senha do usuário no SQL e devolve o JWT.
- `GET /auth/me`: recupera o perfil autenticado do banco.
- `PUT /auth/me`: altera nome e sobrenome preservando a senha e a função.
- `DELETE /auth/me`: exclui a própria conta.
- Leituras e gravações de projetos, tarefas e comentários enviam `Authorization: Bearer <token>`.
- A antiga chave compartilhada `AUTH_KEY` deixou de ser necessária para login/cadastro. Ela não deve ser embutida no JavaScript público.

Contas anteriormente criadas no Firebase não passam a existir no Supabase automaticamente. Será necessário cadastrar ou migrar esses usuários e definir senhas compatíveis com o backend.

## Estatísticas

Os cartões e gráficos são calculados a partir de `/projetos` e `/tarefas`. Não há valores de demonstração nem percentuais de crescimento inventados. O botão Atualizar dados consulta novamente a API.

O filtro trimestral usa o prazo das tarefas; os projetos considerados são os criados no período ou vinculados às tarefas selecionadas. O gráfico mensal usa os prazos das tarefas do ano escolhido. O esquema atual não informa a data efetiva de conclusão/recebimento, portanto esse gráfico não representa fluxo de caixa recebido.

## Publicação

Um push na branch `feat/backend` não publica automaticamente o frontend. A configuração de Firebase Hosting foi removida dessa branch e não há workflow de deploy.

O frontend pode continuar em `https://sentinel-5d699.web.app`, mas precisa ser publicado com `WEB/src` como diretório público. As páginas usam URLs como `/features/estatisticas/estatisticas.html`. Firebase Hosting é apenas hospedagem de arquivos; login e dados continuam na API/Supabase.

O backend e o frontend precisam ser publicados juntos nesta atualização: o frontend usa as novas rotas `/auth/me` e `/auth/roles`. O script `api/deploy.sh` pressupõe acesso SSH pelo alias `oracle_vm`, Bun e PM2 já configurados no servidor. Esse acesso não está configurado no ambiente desta revisão.

Na checagem de 27/10/2026, a API `https://sentinel-service.duckdns.org` respondeu HTTP 502. O responsável pelo servidor precisa verificar o processo da API, as variáveis de ambiente, a conexão com o Supabase e o proxy nginx.

## Verificação

Na pasta `api`:

```sh
npm ci
npm test
npm run lint
```

Os testes usam HTTP real, os controladores/serviços/repositórios da aplicação, os formulários HTML com jsdom e PostgreSQL em memória com pg-mem. Eles verificam cadastro, senha hash, login, perfil, CRUD, comentários, filtros e gráficos, sem tocar no Supabase de produção. A extensão pgcrypto e os triggers PL/pgSQL de updated_at não são executados pelo banco em memória.

Os testes não comprovam as credenciais, os certificados, o esquema ou a disponibilidade do Supabase real. Isso exige uma validação no ambiente configurado.

Na pasta `WEB`, execute `npm run lint`. Para abrir localmente, use um servidor HTTP, como Live Preview; não abra os HTMLs com `file://`.
