# Biblioteca — API Express + Sequelize + SQLite

Projeto organizado por `router -> controller -> service -> model`.

## Iniciar (Windows PowerShell)

```powershell
npm install
Copy-Item .envex .env
# Abra .env e coloque duas chaves aleatórias LONGAS e DIFERENTES
npm start
```

API em `http://localhost:3001`. Com banco novo, `admin@biblioteca.com` / `123456` é criado automaticamente quando não existe administrador. **Altere a senha inicial e as chaves antes de compartilhar.** Se já existir um administrador, o seed não redefine a senha. Nunca coloque `.env` ou `database.sqlite` em repositórios públicos.

## Variáveis de ambiente

`PORT=3001`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `ACCESS_TTL_SECONDS=900`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONT_ORIGIN=http://localhost:3000`.

Os tokens de acesso usam JWT com 15 minutos (configurável) e os refresh tokens duram 7 dias. O refresh é guardado no SQLite como SHA-256 do token JWT; o token antigo é revogado na rotação. Reutilizar refresh revogado revoga os demais tokens daquele usuário. O login de usuário desativado é bloqueado. Respostas 401 (não autenticado), 403 (sem permissão) e 409 (conflito) são separadas.

O logout revoga o refresh token e apaga os cookies no Next.js. Access tokens anteriores podem ser usados até expirar (máximo 15 minutos), decisão coerente com JWT stateless. Para demonstração de expiração automática, use `ACCESS_TTL_SECONDS=30` temporariamente.

## Endpoints

- `POST /v1/auth/login`, `POST /v1/auth/refresh`, `POST /v1/auth/logout`, `GET /v1/auth/me`.
- `GET /v1/user`, `POST /v1/user`, `PUT /v1/user/:id`, `PATCH /v1/user/:id/active` (admin).
- `GET/POST/PUT/DELETE /v1/categories`, `/v1/authors`, `/v1/books` (escrita admin).
- `GET/POST/PUT /v1/readers`, `GET /v1/readers/:id/loans` (atendente/admin).
- `POST /v1/loans`, `GET /v1/loans?status=ATIVO`, `PATCH /v1/loans/:id/return`.
- `GET /v1/reports/dashboard` (admin).

Filtros de livros: `title`, `categoryId`, `authorId`, `available=true`.

## Regras

- Somente exemplares disponíveis podem ser emprestados; transações garantem a atualização do estoque.
- Prazo de 7 dias corridos, máximo de 3 empréstimos abertos por leitor, bloqueio se algum estiver atrasado.
- Devolução atualiza o estoque e multa de R$ 1 por dia após vencimento.
- Categorias/autores com livros e livros com histórico não podem ser removidos.
- Livro ↔ autor N:N via `BookAuthor`; categoria → livro 1:N; empréstimo pertence a livro, leitor e atendente.

## Dados preexistentes

Se houver banco antigo, faça backup antes de copiar para este projeto. O projeto faz `db.sync()` e pode acrescentar a coluna `Users.active`, mas não executa migração completa de bancos antigos modificados. Nunca use `sync({force:true})` com dados reais.

## Testes/entrega

`npm test` testa cálculo de multas. Faça testes de API adicionais via `postman-biblioteca.json`. Para entregar o trabalho são necessários commits nos dois repositórios, collection exportada e vídeo curto. **O pacote não foi executado fim a fim neste ambiente**, por indisponibilidade da instalação de dependências; execute testes no seu computador.
