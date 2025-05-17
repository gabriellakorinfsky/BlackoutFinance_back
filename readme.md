# Finance Back - API de Finanças Pessoais

Este projeto é a API backend de um sistema de finanças pessoais, que permite gerenciar entradas (receitas) e despesas de usuários de forma segura e eficiente.

## Funcionalidades Principais

- Cadastro e login de usuários com autenticação via JWT.
- Controle completo das entradas (receitas) e despesas.
- Validação para garantir que as despesas não ultrapassem o saldo disponível.
- Cálculo dinâmico do saldo atual, total de entradas e total de despesas.
- Atualização e exclusão de entradas e despesas com validações financeiras.
- Middleware de autenticação para proteger as rotas do sistema.

## Tecnologias Utilizadas

- Node.js com Express para o servidor e rotas.
- Sequelize para interação com banco PostgreSQL.
- Banco de dados hospedado no Supabase, garantindo escalabilidade e disponibilidade.
- JWT para autenticação segura dos usuários.

## Sobre o Banco de Dados

Os dados financeiros são armazenados de forma relacional, vinculando as entradas e despesas ao usuário autenticado, assegurando que cada usuário manipule apenas seus dados.

## Uso

A API é pensada para ser integrada a um frontend, para permitir o gerenciamento financeiro pessoal de forma intuitiva e segura.

## Como usar

1. Clone o repositório

2. Configure seu `.env` com as variáveis do banco Supabase

3. Rode `npm install`

4. Rode `node server.js`



