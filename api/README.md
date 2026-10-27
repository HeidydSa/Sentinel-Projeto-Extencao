## Informações gerais

- Endpoint da API: https://sentinel-service.duckdns.org

- **Formato:** JSON.
- **Porta padrão:** `3000`, definida por `process.env.PORT`.
- **Autenticação:** todas as rotas, exceto `/auth/login` e `/auth/register`, passam pelo middleware JWT.
- **Header JWT:**

```http
Authorization: Bearer <jwtToken>
```

- **API Key:** quando `AUTH_KEY` estiver configurada no ambiente, as rotas de autenticação também exigem:

```http
x-api-key: <AUTH_KEY>
```

---

# 1. Autenticação

As rotas de autenticação são públicas em relação ao JWT.

## POST `/auth/login`

Realiza o login do usuário.

### Headers

```http
Content-Type: application/json
x-api-key: <AUTH_KEY>
```

O header `x-api-key` só é obrigatório quando a variável `AUTH_KEY` estiver configurada.

### Corpo da requisição

```json
{
  "email": "usuario@email.com",
  "senha": "senha-do-usuario"
}
```

### Resposta de sucesso — `200 OK`

```json
{
  "jwtToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

O token possui validade de aproximadamente **2 horas**.

### Possíveis respostas

| Status | Descrição |
|---|---|
| `200` | Login realizado |
| `400` | Email ou senha inválidos no formato esperado |
| `403` | API Key ausente/incorreta ou credenciais inválidas |
| `500` | Erro interno do servidor |

Arquivo relacionado: [`api/src/routes/auth.routes.js`](https://github.com/HeidydSa/Sentinel-Projeto-Extencao/blob/736c003fa5265c9fea91bb624469fefed0bb7f96/api/src/routes/auth.routes.js)

---

## POST `/auth/register`

Cadastra um novo usuário.

### Headers

```http
Content-Type: application/json
x-api-key: <AUTH_KEY>
```

### Corpo da requisição

O cadastro utiliza os dados do usuário. Um exemplo baseado no frontend é:

```json
{
  "nome": "João",
  "sobrenome": "Silva",
  "email": "joao@email.com",
  "senha": "senha-com-8-caracteres",
  "funcaoId": 1
}
```

### Resposta de sucesso — `201 Created`

```json
{
  "id": 10
}
```

### Possíveis respostas

| Status | Descrição |
|---|---|
| `201` | Usuário criado |
| `400` | Dados inválidos |
| `403` | API Key ausente/incorreta |
| `500` | Erro interno do servidor |

A senha é armazenada utilizando hash com bcrypt.

---

# 2. Funções

Todas as rotas de funções exigem autenticação JWT.

## POST `/funcoes`

Cria uma função.

### Corpo esperado

```json
{
  "nome": "Administrador"
}
```

### Resposta — `201 Created`

Retorna a função criada.

---

## GET `/funcoes`

Lista todas as funções.

### Resposta — `200 OK`

```json
[
  {
    "id": 1,
    "nome": "Administrador"
  }
]
```

---

## GET `/funcoes/:id`

Busca uma função pelo identificador.

Exemplo:

```http
GET /funcoes/1
```

### Respostas

| Status | Descrição |
|---|---|
| `200` | Função encontrada |
| `400` | `id` inválido |
| `404` | Função não encontrada |
| `500` | Erro interno |

---

## PUT `/funcoes/:id`

Atualiza uma função.

### Corpo esperado

```json
{
  "nome": "Gerente"
}
```

### Respostas

| Status | Descrição |
|---|---|
| `200` | Função atualizada |
| `400` | Dados inválidos |
| `404` | Função não encontrada |
| `500` | Erro interno |

---

## DELETE `/funcoes/:id`

Remove uma função.

### Respostas

| Status | Descrição |
|---|---|
| `204` | Função removida |
| `400` | `id` inválido |
| `404` | Função não encontrada |
| `500` | Erro interno |

---

# 3. Usuários

## POST `/usuarios`

Cria um usuário diretamente pela API.

### Corpo esperado

```json
{
  "nome": "João",
  "sobrenome": "Silva",
  "email": "joao@email.com",
  "senha": "senha-hash-ou-senha",
  "funcaoId": 1
}
```

> Para cadastro público, recomenda-se utilizar `/auth/register`, pois essa rota realiza o tratamento da senha com bcrypt.

### Resposta — `201 Created`

Retorna o usuário criado.

---

## GET `/usuarios`

Lista todos os usuários.

### Resposta — `200 OK`

```json
[
  {
    "id": 1,
    "nome": "João",
    "sobrenome": "Silva",
    "email": "joao@email.com",
    "funcaoId": 1
  }
]
```

---

## GET `/usuarios/:id`

Busca um usuário pelo ID.

```http
GET /usuarios/1
```

### Respostas

| Status | Descrição |
|---|---|
| `200` | Usuário encontrado |
| `400` | `id` inválido |
| `404` | Usuário não encontrado |
| `500` | Erro interno |

---

## PUT `/usuarios/:id`

Atualiza os dados de um usuário.

### Corpo esperado

```json
{
  "nome": "João Pedro",
  "sobrenome": "Silva",
  "email": "joao.pedro@email.com",
  "funcaoId": 2
}
```

### Respostas

| Status | Descrição |
|---|---|
| `200` | Usuário atualizado |
| `400` | Dados inválidos |
| `404` | Usuário não encontrado |
| `500` | Erro interno |

---

## DELETE `/usuarios/:id`

Remove um usuário.

### Respostas

| Status | Descrição |
|---|---|
| `204` | Usuário removido |
| `400` | `id` inválido |
| `404` | Usuário não encontrado |
| `500` | Erro interno |

---

# 4. Equipes

## POST `/equipes`

Cria uma equipe.

### Corpo esperado

O formato exato depende do modelo de equipe. Um exemplo provável:

```json
{
  "nome": "Equipe de Desenvolvimento",
  "descricao": "Equipe responsável pelo sistema"
}
```

### Resposta — `201 Created`

Retorna a equipe criada.

---

## GET `/equipes`

Lista todas as equipes.

### Resposta — `200 OK`

```json
[
  {
    "id": 1,
    "nome": "Equipe de Desenvolvimento"
  }
]
```

---

## GET `/equipes/:id`

Busca uma equipe pelo ID.

---

## PUT `/equipes/:id`

Atualiza uma equipe.

---

## DELETE `/equipes/:id`

Remove uma equipe.

### Respostas comuns

| Status | Descrição |
|---|---|
| `200` | Consulta ou atualização realizada |
| `201` | Equipe criada |
| `204` | Equipe removida |
| `400` | ID ou dados inválidos |
| `404` | Equipe não encontrada |
| `500` | Erro interno |

---

# 5. Membros de equipes

Essas rotas representam o relacionamento entre uma equipe e um usuário.

## POST `/equipes/:equipeId/membros/:usuarioId`

Adiciona um usuário a uma equipe.

Exemplo:

```http
POST /equipes/1/membros/5
```

Não é necessário corpo na requisição, pois os IDs são enviados na URL.

### Resposta — `201 Created`

```json
{
  "equipeId": 1,
  "usuarioId": 5
}
```

---

## GET `/equipes/:equipeId/membros`

Lista todos os membros de uma equipe.

Exemplo:

```http
GET /equipes/1/membros
```

### Resposta — `200 OK`

```json
[
  {
    "equipeId": 1,
    "usuarioId": 5
  }
]
```

---

## GET `/equipes/:equipeId/membros/:usuarioId`

Busca um membro específico dentro de uma equipe.

Exemplo:

```http
GET /equipes/1/membros/5
```

### Possíveis respostas

| Status | Descrição |
|---|---|
| `200` | Membro encontrado |
| `400` | IDs inválidos |
| `404` | Membro não encontrado |
| `500` | Erro interno |

---

## DELETE `/equipes/:equipeId/membros/:usuarioId`

Remove um usuário da equipe.

Exemplo:

```http
DELETE /equipes/1/membros/5
```

### Respostas

| Status | Descrição |
|---|---|
| `204` | Membro removido |
| `400` | IDs inválidos |
| `404` | Membro não encontrado |
| `500` | Erro interno |

---

# 6. Projetos

## POST `/projetos`

Cria um projeto.

### Corpo esperado

O modelo define os campos obrigatórios. Um exemplo provável:

```json
{
  "titulo": "Sistema Sentinel",
  "descricao": "Projeto de extensão",
  "status": "EM_ANDAMENTO"
}
```

### Resposta — `201 Created`

Retorna o projeto criado.

---

## GET `/projetos`

Lista todos os projetos.

---

## GET `/projetos/:id`

Busca um projeto pelo ID.

---

## PUT `/projetos/:id`

Atualiza um projeto.

### Exemplo

```json
{
  "titulo": "Sistema Sentinel atualizado",
  "descricao": "Nova descrição",
  "status": "FINALIZADO"
}
```

---

## DELETE `/projetos/:id`

Remove um projeto.

### Respostas comuns

| Status | Descrição |
|---|---|
| `200` | Consulta ou atualização realizada |
| `201` | Projeto criado |
| `204` | Projeto removido |
| `400` | ID ou dados inválidos |
| `404` | Projeto não encontrado |
| `500` | Erro interno |

---

# 7. Andamentos de tarefas

## POST `/andamentos`

Cria um andamento de tarefa.

### Corpo esperado

O formato exato depende do modelo. Um exemplo possível:

```json
{
  "tarefaId": 1,
  "status": "EM_ANDAMENTO",
  "percentual": 50
}
```

---

## GET `/andamentos`

Lista todos os andamentos.

---

## GET `/andamentos/:id`

Busca um andamento pelo ID.

---

## PUT `/andamentos/:id`

Atualiza um andamento.

---

## DELETE `/andamentos/:id`

Remove um andamento.

### Respostas comuns

| Status | Descrição |
|---|---|
| `200` | Consulta ou atualização realizada |
| `201` | Andamento criado |
| `204` | Andamento removido |
| `400` | ID ou dados inválidos |
| `404` | Andamento não encontrado |
| `500` | Erro interno |

---

# 8. Tarefas

## POST `/tarefas`

Cria uma tarefa.

### Corpo esperado

O formato exato depende do modelo da tarefa. Um exemplo baseado no funcionamento do frontend:

```json
{
  "titulo": "Implementar autenticação",
  "descricao": "Criar login utilizando JWT",
  "idProjeto": 1,
  "status": "A_FAZER"
}
```

---

## GET `/tarefas`

Lista todas as tarefas.

### Resposta — `200 OK`

```json
[
  {
    "id": 1,
    "titulo": "Implementar autenticação",
    "descricao": "Criar login utilizando JWT",
    "idProjeto": 1,
    "status": "A_FAZER"
  }
]
```

---

## GET `/tarefas/:id`

Busca uma tarefa pelo ID.

---

## PUT `/tarefas/:id`

Atualiza uma tarefa.

---

## DELETE `/tarefas/:id`

Remove uma tarefa.

### Respostas comuns

| Status | Descrição |
|---|---|
| `200` | Consulta ou atualização realizada |
| `201` | Tarefa criada |
| `204` | Tarefa removida |
| `400` | ID ou dados inválidos |
| `404` | Tarefa não encontrada |
| `500` | Erro interno |

---

# 9. Comentários de tarefas

Os comentários são recursos vinculados a uma tarefa.

## POST `/tarefas/:tarefaId/comentarios`

Cria um comentário para uma tarefa.

Exemplo:

```http
POST /tarefas/1/comentarios
```

### Corpo esperado

```json
{
  "texto": "A tarefa foi iniciada."
}
```

Dependendo do modelo, o campo pode possuir outro nome, como `conteudo` ou `comentario`.

### Resposta — `201 Created`

Retorna o comentário criado.

---

## GET `/tarefas/:tarefaId/comentarios`

Lista os comentários de uma tarefa.

### Resposta — `200 OK`

```json
[
  {
    "id": 1,
    "tarefaId": 1,
    "texto": "A tarefa foi iniciada."
  }
]
```

---

## GET `/tarefas/:tarefaId/comentarios/:comentarioId`

Busca um comentário específico.

Exemplo:

```http
GET /tarefas/1/comentarios/3
```

### Respostas

| Status | Descrição |
|---|---|
| `200` | Comentário encontrado |
| `400` | IDs inválidos |
| `404` | Comentário não encontrado |
| `500` | Erro interno |

---

## DELETE `/tarefas/:tarefaId/comentarios/:comentarioId`

Remove um comentário.

### Respostas

| Status | Descrição |
|---|---|
| `204` | Comentário removido |
| `400` | IDs inválidos |
| `404` | Comentário não encontrado |
| `500` | Erro interno |

---

# Resumo das rotas

| Recurso | Rotas |
|---|---:|
| Autenticação | 2 |
| Funções | 5 |
| Usuários | 5 |
| Equipes | 5 |
| Membros de equipes | 4 |
| Projetos | 5 |
| Andamentos | 5 |
| Tarefas | 5 |
| Comentários | 4 |
| **Total** | **35** |

A ordem de registro das rotas pode ser conferida em [`api/src/routes/index.js`](https://github.com/HeidydSa/Sentinel-Projeto-Extencao/blob/736c003fa5265c9fea91bb624469fefed0bb7f96/api/src/routes/index.js). Os arquivos encontrados na busca podem estar limitados pela paginação da pesquisa do GitHub, mas o arquivo principal de rotas referencia todos os módulos listados acima.
