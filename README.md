# PS2 Games Archive 🎮

Site público para exibição e catalogação do acervo de jogos de **PlayStation 2** (jogados, em andamento e backlog), com área administrativa protegida por senha para controle total de jogos e anotações.

## 🚀 Tecnologias Utilizadas

- **Frontend**: Next.js 14+ (App Router), React, TypeScript
- **Estilização**: Tailwind CSS v4 com paleta nostálgica PS2 (glassmorphism, luzes neon azul elétrico/ciano e cards retrô)
- **Banco de Dados & ORM**: PostgreSQL (compatível com Neon e Supabase) + Prisma ORM
- **Autenticação**: Senha única em variável de ambiente (`ADMIN_PASSWORD`), sessão criptografada via JWT (`jose`) em cookie `httpOnly` e proteção por middleware do Next.js
- **Metadados & Capas**: Endpoint de integração preparado para a RAWG API com fallback automático de catálogo clássico e suporte a URL manual

---

## 📁 Estrutura de Pastas

```text
ps2-games/
├── prisma/
│   ├── schema.prisma       # Model Game e enum Status (PLAYED, PLAYING, BACKLOG)
│   └── seed.ts             # Dados iniciais com clássicos do PS2
├── src/
│   ├── app/
│   │   ├── actions.ts      # Server Actions (CRUD de jogos e Auth)
│   │   ├── globals.css     # Estilização com tema e efeitos PS2
│   │   ├── layout.tsx      # Layout global com Header temático
│   │   ├── page.tsx        # Catálogo público (busca e filtros)
│   │   ├── jogo/[id]/      # Página com visão detalhada do jogo
│   │   ├── admin/
│   │   │   ├── page.tsx    # Painel administrativo
│   │   │   └── login/      # Tela de login do administrador
│   │   └── api/games/search# Busca de títulos e capas
│   ├── components/
│   │   ├── Header.tsx      # Barra de navegação PS2
│   │   └── GameCard.tsx    # Card retrô estilizado com indicador PS2
│   ├── lib/
│   │   ├── auth.ts         # Utilitários de sessão e cookie JWT
│   │   └── prisma.ts       # Singleton do cliente Prisma
│   └── middleware.ts       # Proteção de rotas /admin
├── .env.example            # Guia de variáveis de ambiente
└── package.json
```

---

## ⚙️ Configuração do Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```
2. Configure as seguintes variáveis no seu `.env`:
   - `DATABASE_URL`: String de conexão PostgreSQL (ex: do Neon ou Supabase).
   - `ADMIN_PASSWORD`: A senha que você usará para entrar no painel `/admin/login` (padrão local: `admin`).
   - `ADMIN_SECRET`: Chave para assinar os cookies de sessão.
   - `RAWG_API_KEY`: (Opcional) Chave da RAWG para busca dinâmica de capas.

---

## 🛠️ Comandos Úteis

### 1. Rodar as migrações no banco de dados
Quando conectar a sua URL do Neon ou Supabase, execute:
```bash
npx prisma migrate dev --name init
```

### 2. Popular o banco com dados de exemplo (Seed)
```bash
npx prisma db seed
```

### 3. Rodar em desenvolvimento
```bash
npm run dev
```
Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

### 4. Build de produção
```bash
npm run build
```

---

## 🔒 Acesso Administrativo
- Acesse `/admin` ou clique no botão **Admin** no topo da tela.
- Digite a senha definida em `ADMIN_PASSWORD` no `.env`.
- No painel, você pode adicionar novos jogos pesquisando pelo nome para carregar capas automaticamente, registrar notas de 0 a 10, datas de conclusão e anotações pessoais.
