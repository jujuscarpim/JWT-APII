Sistema de Gestão de Biblioteca — API

API REST do trabalho de Gestão de Biblioteca, desenvolvida com **Node.js, Express 5, Sequelize, SQLite e JWT**. Responsável pela autenticação, pelos cadastros, pelas regras de empréstimo/devolução e pelos relatórios.

Tecnologias

- Node.js 20 ou superior e npm
- Express 5
- Sequelize 6 e SQLite 3
- JSON Web Token (JWT) e bcryptjs
- CORS e dotenv

Instalação e execução

1. Abra um terminal na pasta `jwt-api`.
2. Instale as dependências e crie o arquivo de configuração:

   ```powershell
   npm install
   Copy-Item .envex .env
   ```

3. Abra o `.env` e substitua os valores de `JWT_SECRET` e `JWT_REFRESH_SECRET` por **duas chaves fortes e diferentes**. Defina também uma senha própria para `ADMIN_PASSWORD`.
4. Inicie a API:

   ```powershell
   npm start
   ```

O endereço padrão é **http://localhost:3001**. Para desenvolvimento com reinicialização automática, use `npm run dev`.

> Não publique o `.env`, o `database.sqlite` nem as pastas `node_modules`. O repositório contém o arquivo de exemplo `.envex`.

## Variáveis de ambiente

| Variável | Uso | Valor de exemplo |
| --- | --- | --- |
| `PORT` | Porta da API | `3001` |
| `JWT_SECRET` | Assinatura do access token | Definir chave aleatória forte |
| `JWT_REFRESH_SECRET` | Assinatura do refresh token | Outra chave aleatória forte |
| `ACCESS_TTL_SECONDS` | Validade do access token, em segundos | `900` (15 min) |
| `ADMIN_EMAIL` | E-mail do administrador inicial | `admin@biblioteca.com` |
| `ADMIN_PASSWORD` | Senha para criação do primeiro administrador | `123456` apenas em ambiente local |
| `FRONT_ORIGIN` | Origem liberada pelo CORS | `http://localhost:3000` |

Administrador inicial (seed)

Na inicialização, se **não existir nenhum administrador**, a API cria ou promove um usuário administrador a partir das variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD`. No banco novo e com os valores de exemplo, o login é:

- **E-mail:** `admin@biblioteca.com`
- **Senha:** `123456`

**Altere a senha padrão antes de apresentar ou publicar o projeto.** Se já houver um administrador no banco, a inicialização não redefine sua senha. O seed não é um mecanismo de recuperação de senha.

 Entidades e relacionamentos

- **User**: administradores e atendentes, com indicação de perfil e situação ativa/inativa.
- **Category**: categorias de livros; uma categoria possui vários livros (**1:N**).
- **Author**: autores; um autor pode participar de vários livros e um livro pode ter vários autores (**N:N**, tabela `BookAuthor`).
- **Book**: ISBN, título, ano, categoria, autores e quantidade de exemplares.
- **Reader**: leitores e histórico de empréstimos.
- **Loan**: empréstimos relacionados a livro, leitor e atendente.
- **RefreshToken**: registros de renovação de sessão e revogação.

Os arquivos seguem a organização `router → controller → service → model`, com associações centralizadas em `models/index.js`.

Rotas principais

Todas as rotas exigem access token, com exceção de `POST /v1/auth/login` e `POST /v1/auth/refresh`. O token deve ser enviado em `Authorization: Bearer <accessToken>`.

| Método | Endpoint | Finalidade |
| --- | --- | --- |
| POST | `/v1/auth/login` | Login e emissão de dois tokens |
| POST | `/v1/auth/refresh` | Renovação e rotação do par de tokens |
| POST | `/v1/auth/logout` | Revogação do refresh token |
| GET | `/v1/auth/me` | Dados do usuário autenticado |
| GET, POST | `/v1/user` | Listagem e cadastro de atendentes (admin) |
| PUT | `/v1/user/:id` | Edição de atendente (admin) |
| PATCH | `/v1/user/:id/active` | Ativar/desativar atendente (admin) |
| GET, POST, PUT, DELETE | `/v1/categories` | Gestão de categorias; alterações para admin |
| GET, POST, PUT, DELETE | `/v1/authors` | Gestão de autores; alterações para admin |
| GET, POST, PUT, DELETE | `/v1/books` | Gestão de livros; alterações para admin |
| GET, POST, PUT | `/v1/readers` | Gestão de leitores |
| GET | `/v1/readers/:id/loans` | Histórico de empréstimos do leitor |
| GET, POST | `/v1/loans` | Listagem e registro de empréstimos |
| PATCH | `/v1/loans/:id/return` | Registro da devolução |
| GET | `/v1/reports/dashboard` | Relatório administrativo |

Filtros de livros:** `GET /v1/books?title=&categoryId=&authorId=&available=true`. **Filtro de empréstimos:** `GET /v1/loans?status=ATIVO` (também `ATRASADO` e `DEVOLVIDO`).

 Regras de negócio

1. Só é permitido emprestar livros com `availableCopies > 0`; o estoque diminui no empréstimo e aumenta na devolução.
2. O prazo padrão de devolução é **7 dias corridos**.
3. Cada leitor pode ter no máximo **3 empréstimos abertos**; novos empréstimos são bloqueados quando existe atraso.
4. Uma devolução atrasada gera **multa de R$ 1,00 por dia**.
5. Os estados são **ATIVO**, **ATRASADO** e **DEVOLVIDO**; atraso é calculado com base na data de vencimento quando ainda não houve devolução.
6. Exclusões que violam vínculos com livros ou empréstimos retornam **409 Conflict**.
7. Empréstimo e devolução usam **transações do Sequelize** para manter o estoque consistente.
8. Usuários inativos não podem efetuar login; rotas administrativas são protegidas por perfil.

Autenticação e segurança

- **Access token:** JWT com dados do usuário e duração padrão de 15 minutos.
- **Refresh token:** JWT de 7 dias, com registro do hash SHA-256 no banco.
- **Rotação:** o refresh antigo é revogado ao renovar; a reutilização de um refresh revogado dispara revogação dos tokens daquele usuário.
- **Logout:** revoga o refresh informado. Por ser stateless, um access token já emitido ainda pode permanecer válido até a própria expiração.
- **Respostas HTTP:** 401 para sessão não autenticada, 403 para ausência de permissão, 409 para conflitos de dados.

O front-end usa cookies `httpOnly` para os tokens e executa a renovação automática. Para demonstrar o refresh no vídeo, defina temporariamente `ACCESS_TTL_SECONDS=30` e reinicie a API. Volte a `900` depois da demonstração.

