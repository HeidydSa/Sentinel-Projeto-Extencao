# Sentinel

> Na branch `feat/backend`, login e dados usam a API e PostgreSQL no Supabase. Consulte [Integração com o backend](INTEGRACAO_BACKEND.md) para configuração, testes e publicação. O endereço hospedado pode estar com uma versão anterior; um push não faz deploy automático.

## Equipe de Desenvolvimento

- ADOLFO JULIO GOMES
- HEIDY GABRIELE DE SÁ
- JOSE ALISSON TAVARES DE OLIVEIRA

## Hospedagem

A aplicação está disponível em:

https://sentinel-5d699.web.app

## Para iniciar o projeto localmente

Acesse a pasta `WEB/`:

```bash
cd WEB/
npm install
```

Depois, navegue até o arquivo:
**WEB/src/index.html**

E utilize a extensão Live Preview da Microsoft:
https://marketplace.visualstudio.com/items?itemName=ms-vscode.live-server

**Importante**: abrir o index.html no navegador diretamente quebra os imports, utilize uma extensão

## Sobre o Projeto

O Sentinel é uma aplicação web desenvolvida para auxiliar no gerenciamento de projetos e tarefas por equipes. O sistema utiliza o método Kanban para organização das atividades, permitindo acompanhar o andamento das tarefas de forma visual e intuitiva.

## Funcionalidades

- Cadastro e login de usuários
- Recuperação de senha
- Controle de acesso por perfil de usuário
- Criação e gerenciamento de projetos
- Criação, edição e exclusão de tarefas
- Organização das tarefas em quadro Kanban
- Busca e filtros dinâmicos
- Persistência de dados utilizando PostgreSQL no Supabase, por meio da API
- Hospedagem em Firebase Hosting

## Tecnologias Utilizadas

### Front-end

- HTML5
- CSS3
- JavaScript (ES6)

### Back-end

- Node.js, Express e autenticação JWT
- PostgreSQL no Supabase
- Firebase Hosting para hospedagem estática do frontend

## Estrutura do Projeto

```text
src/
├── assets/
├── config/
├── features/
├── firestore/
├── models/
├── services/
├── utils/
├── index.html
├── style.css
└── state.js
```

## Objetivo Acadêmico

Projeto desenvolvido para a disciplina de Desenvolvimento Web (DWE-1), com frontend em HTML/CSS/JavaScript e API para autenticação e persistência de dados no Supabase.
