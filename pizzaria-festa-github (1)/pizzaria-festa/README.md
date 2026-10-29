# Pizzaria & Festa

Site minimalista para uma pizzaria e espaço de comemorações, desenvolvido com Node.js, Express e autenticação OAuth pelo GitHub.

## Requisitos

- Node.js 18 ou superior
- Uma conta GitHub para criar o OAuth App

## Como executar localmente

1. Extraia o ZIP.
2. Abra a pasta no Visual Studio Code.
3. No terminal, execute `npm install`.
4. Copie `.env.example` para `.env`.
5. Configure as variáveis do GitHub e uma `SESSION_SECRET` forte.
6. Execute `npm start`.
7. Acesse `http://localhost:3000`.

## Configurar o login pelo GitHub

1. Acesse https://github.com/settings/developers.
2. Entre em **OAuth Apps** e clique em **New OAuth App**.
3. Preencha:
   - **Application name:** Pizzaria & Festa
   - **Homepage URL:** `http://localhost:3000`
   - **Authorization callback URL:** `http://localhost:3000/auth/github/callback`
4. Crie o aplicativo e copie o **Client ID**.
5. Gere um **Client secret** e copie-o.
6. Cole os dois valores no `.env`:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
7. Reinicie o servidor.

Não compartilhe o Client Secret e não envie o arquivo `.env` ao GitHub. O `.gitignore` já está configurado para ignorá-lo.

## Publicar em hospedagem

Configure as mesmas variáveis no painel da hospedagem:

- `NODE_ENV=production`
- `SESSION_SECRET` (uma chave aleatória com pelo menos 32 caracteres)
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GITHUB_CALLBACK_URL=https://SEU-DOMINIO/auth/github/callback`

No OAuth App do GitHub, atualize também a **Homepage URL** e a **Authorization callback URL** para o domínio publicado. O comando de inicialização é `npm start`.

## Rotas principais

- `/` — página inicial
- `/auth/github` — inicia o login pelo GitHub
- `/auth/github/callback` — retorno do GitHub após autorização
- `/painel` — área protegida, disponível após login
- `/api/usuario` — dados básicos do usuário autenticado
- `/logout` — encerra a sessão
- `/health` — verificação simples do servidor

## Observações

- O login é feito por OAuth do GitHub. Não existe cadastro ou armazenamento de senhas neste projeto.
- O painel atual é uma base inicial. Pedidos, reservas e gerenciamento de produtos podem ser adicionados posteriormente.
- Para produção com múltiplas instâncias, substitua o armazenamento de sessão padrão em memória por um armazenamento persistente.
