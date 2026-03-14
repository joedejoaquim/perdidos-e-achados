# Configurações - ACHADOS

Documentação de todas as configurações do projeto.

---

## 📋 Índice

- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Configuração Next.js](#configuração-nextjs)
- [Configuração Tailwind](#configuração-tailwind)
- [Configuração TypeScript](#configuração-typescript)
- [Configuração Supabase](#configuração-supabase)
- [Configuração Stripe](#configuração-stripe)
- [Scripts NPM](#scripts-npm)

---

## Variáveis de Ambiente

### Arquivo `.env.local`

Copie o template e preencha com seus valores:

```bash
cp .env.local.example .env.local
```

### Variáveis Necessárias

#### Supabase

```env
# ✅ OBRIGATÓRIO - Copie do dashboard Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJx...
SUPABASE_SERVICE_ROLE_KEY=eyJx...
```

#### Stripe

```env
# ✅ OBRIGATÓRIO - Copie do dashboard Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### Mapbox (Opcional)

```env
# 🔧 OPCIONAL - Para geolocalização avançada
NEXT_PUBLIC_MAPBOX_TOKEN=pk_test_...
```

#### Email Service (Opcional)

```env
# 🔧 OPCIONAL - Para notificações por email
SENDGRID_API_KEY=SG...
EMAIL_FROM=noreply@achados.com.br
```

### Banco de Dados

```env
# 🔧 OPCIONAL - Para desenvolvimento local (sem Supabase)
DATABASE_URL=postgresql://user:password@localhost:5432/achados
```

---

## Configuração Next.js

### File: `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Otimização de imagens
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
    ],
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/",
        destination: "/dashboard",
        permanent: false,
        has: [
          {
            type: "cookie",
            key: "auth-token",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Configurações Principais:**
- `images.remotePatterns`: Permitir imagens do Supabase
- `redirects()`: Redirecionar usuários autenticados

---

## Configuração Tailwind

### File: `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/app/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--color-primary))",
        secondary: "hsl(var(--color-secondary))",
        // ... mais cores
      },
      animation: {
        slideIn: "slideIn 0.3s ease-out",
        fadeIn: "fadeIn 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
```

**Variáveis CSS (em `globals.css`):**

```css
:root {
  --color-primary: 217 100% 50%;      /* Blue */
  --color-secondary: 142 71% 45%;     /* Green */
  --color-accent: 348 83% 47%;        /* Red */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-primary: 217 100% 60%;
    /* ... dark mode colors ... */
  }
}
```

---

## Configuração TypeScript

### File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "allowJs": true,
    "noEmit": true,
    "isolatedModules": true,
    "jsx": "react-jsx",

    "paths": {
      "@/*": ["./src/*"],
      "@/app/*": ["./src/app/*"],
      "@/components/*": ["./src/components/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/services/*": ["./src/services/*"],
      "@/types/*": ["./src/types/*"],
      "@/utils/*": ["./src/utils/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/styles/*": ["./src/styles/*"],
    },
  },
  "include": ["src"],
  "exclude": ["node_modules"],
}
```

**Path Aliases:**
- `@/*`: Raiz do source
- `@/components/*`: Componentes React
- `@/hooks/*`: React hooks customizados
- `@/services/*`: Lógica de negócio
- `@/types/*`: TypeScript types

---

## Configuração Supabase

### Conectar ao Projeto Supabase

1. Visite [supabase.com](https://supabase.com)
2. Crie novo projeto (PostgreSQL 15+)
3. Vá em Settings → API Keys
4. Copie `URL` e `anon key` para `.env.local`

### Ativar Autenticação

1. Vá em Authentication → Providers
2. Ative "Email" (padrão)
3. Configure SMTP (opcional)

### Configurar Storage

1. Vá em Storage → New bucket
2. Crie bucket `item-photos` (público)
3. Configure RLS policies

### Executar Migrations

1. Abra SQL Editor
2. Copie conteúdo de `migrations/001_initial_schema.sql`
3. Execute no SQL Editor
4. Verifique se tabelas foram criadas

---

## Configuração Stripe

### Conectar ao Stripe

1. Visite [stripe.com](https://stripe.com)
2. Crie conta (Modo Teste ou Produção)
3. Vá em Developers → API Keys
4. Copie chaves para `.env.local`

### Webhook Configuration

**Local (Desenvolvimento):**

```bash
# Instale Stripe CLI
# (Veja https://stripe.com/docs/stripe-cli)

stripe listen --forward-to localhost:3000/api/webhooks/stripe
# Copie webhook signing secret para STRIPE_WEBHOOK_SECRET
```

**Produção:**

1. Vá em Developers → Webhooks
2. Clique em "Add endpoint"
3. URL: `https://seu-dominio.com/api/webhooks/stripe`
4. Eventos: `payment_intent.succeeded`, `charge.refunded`
5. Copie signing secret

---

## Scripts NPM

### Desenvolvimento

```bash
# Inicia servidor de desenvolvimento (hot reload)
npm run dev

# Abre em http://localhost:3000
```

### Build & Produção

```bash
# Build para production
npm run build

# Inicia servidor production
npm start
```

### Qualidade de Código

```bash
# Linting (ESLint)
npm run lint

# Formatação (Prettier)
npm run format

# Verificação de tipos TypeScript
npm run type-check
```

### Testes

```bash
# Roda suite de testes (Jest)
npm test

# Modo watch (roda enquanto você edita)
npm test -- --watch

# Coverage
npm test -- --coverage
```

### Database

```bash
# Seed inicial (insere dados de exemplo)
npm run db:seed

# Reset (limpa e reinsere)
npm run db:reset
```

---

## Variáveis de Build

### Build Time

Variáveis compiladas em build time (requerem rebuild):

```bash
NEXT_PUBLIC_SITE_URL=https://achados.com.br
NEXT_PUBLIC_API_VERSION=v1
```

### Runtime

Variáveis lidas em runtime (sem rebuild):

```bash
STRIPE_SECRET_KEY=sk_...
SUPABASE_SERVICE_ROLE_KEY=...
```

**Regra:** Use `NEXT_PUBLIC_` apenas para valores que podem ser expostos ao cliente.

---

## Exemplo Completo de `.env.local`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefg.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51234567890ABCDEF...
STRIPE_SECRET_KEY=sk_test_51234567890ABCDEF...
STRIPE_WEBHOOK_SECRET=whsec_1234567890ABCDEF...

# Mapbox (opcional)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.test.1234567890ABCDEF...

# Email (opcional)
SENDGRID_API_KEY=SG.1234567890ABCDEF...
EMAIL_FROM=noreply@achados.com.br

# URLs
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Troubleshooting

### "Cannot find module '@/components'"

1. Verifique `tsconfig.json` paths
2. Reinicie VS Code
3. Rode: `npm run dev`

### "Supabase connection failed"

1. Verifique URLs no `.env.local`
2. Verifique se projeto Supabase está ativo
3. Teste conexão: `npm run test:supabase`

### "Stripe webhook not receiving events"

Local:
1. Verifique se Stripe CLI está rodando
2. Verifique webhook secret configurado

Produção:
1. Verifique endpoint URL
2. Verifique logs de webhook no Stripe dashboard

---

**Última atualização:** 12 de Março de 2026
