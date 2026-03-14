# Guia de Setup - ACHADOS

## Pré-requisitos

- Node.js 18+ (recomendado 20)
- npm ou yarn
- Git
- Conta Suabase (https://supabase.com)
- Conta Stripe (https://stripe.com)
- Conta Mapbox (https://mapbox.com)

---

## Instalação Local

### 1. Clonar Repositório

```bash
git clone https://github.com/joedejoaquim/perdidos-e-achados.git
cd perdidos-e-achados
```

### 2. Instalar Dependências

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Copie `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

Editar `.env.local` com suas credenciais:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Setup Supabase

#### 4.1 Criar Projeto Supabase

1. Ir para https://app.supabase.com
2. Criar novo projeto
3. Copiar URL e chaves para `.env.local`

#### 4.2 Executar Migrations

1. Abrir SQL Editor no Supabase
2. Copiar código de `migrations/001_initial_schema.sql`
3. Executar no SQL Editor
4. Confirmar criação das tabelas

#### 4.3 Configurar RLS (Row Level Security)

As políticas já estão no script SQL. Verificar:
- Dashboard → Authentication → Policies
- Confirmar que as políticas foram criadas

#### 4.4 Habilitar Providers (Opcional)

Para autenticação social (Google, GitHub):
- Ir para Authentication → Providers
- Ativar Google ou GitHub
- Adicionar credentials

### 5. Setup Stripe

1. Ir para https://dashboard.stripe.com
2. Copiar chaves para `.env.local`
3. Criar webhook em Settings → Webhooks:
   - URL: `https://seu-site.com/api/webhooks/stripe`
   - Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`

### 6. Executar Localmente

```bash
npm run dev
```

Acessar: http://localhost:3000

---

## Estrutura de Pastas

```
.
├── migrations/           # Scripts SQL do banco
├── docs/                # Documentação
├── src/
│   ├── app/             # Next.js App Router
│   ├── components/      # React components
│   ├── hooks/          # Custom hooks
│   ├── services/       # Business logic
│   ├── lib/            # Clients (Supabase, Stripe)
│   ├── types/          # TypeScript types
│   ├── utils/          # Utilities
│   └── styles/         # CSS global
├── public/             # Assets estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev                 # Inicia dev server

# Build & Deploy
npm run build              # Build para produção
npm start                  # Inicia servidor produção

# Linting & Type Checking
npm run lint              # ESLint
npm run type-check        # TypeScript check

# Formatação
npm run format            # Prettier

# Banco de Dados
npm run db:push          # Push schema para Supabase (se usar Prisma)
npm run db:studio        # Abre Prisma Studio

# Testes (configurar depois)
npm test                 # Executar testes
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

---

## Variáveis de Ambiente Explicadas

| Variável | Descrição | Obrigatorio |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave anônima Supabase | Sim |
| `SUPABASE_SERVICE_ROLE_KEY` | Chave privada Supabase | Sim |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Chave pública Stripe | Sim |
| `STRIPE_SECRET_KEY` | Chave privada Stripe | Sim |
| `STRIPE_WEBHOOK_SECRET` | Secret do webhook Stripe | Sim |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Token Mapbox | Não |
| `NEXT_PUBLIC_APP_URL` | URL da aplicação | Sim |
| `NODE_ENV` | Ambiente (dev/prod) | Sim |

---

## Common Issues

### 1. Erro: "Missing NEXT_PUBLIC_SUPABASE_URL"

**Solução**: Verificar se `.env.local` está correto e contém as variáveis.

```bash
cat .env.local | grep SUPABASE_URL
```

### 2. Erro de Autenticação Supabase

**Solução**: 
- Verificar que RLS policies estão habilitadas
- Testar com anon key primeiro
- Confirmar que credentials estão corretos

### 3. Erro: "Cannot find module"

**Solução**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### 4. Página em branco ao acessar

**Solução**:
- Abrir DevTools (F12)
- Verificar console para erros
- Verificar Network aba para falhas de requisição

---

## Testing

### Setup Jest

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

### Exemplo de Teste

```typescript
// src\services\user.service.test.ts
import { UserService } from './user.service';

describe('UserService', () => {
  it('should create user', async () => {
    const user = await UserService.createUser({
      email: 'test@example.com',
      name: 'Test User',
    });

    expect(user).toHaveProperty('id');
    expect(user.email).toBe('test@example.com');
  });
});
```

---

## Deploy

### Vercel

1. Conectar repositório GitHub para Vercel
2. Adicionar environment variables
3. Deploy
4. Configure webhook Stripe URL para produção

### Docker (Alternativa)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```bash
docker build -t achados .
docker run -p 3000:3000 achados
```

---

## Monitoring & Logging

### Supabase Logs

```bash
# Via Supabase Dashboard
Dashboard → Logs → Query Performance
Dashboard → Logs → Function Logs
```

### Stripe Logs

```bash
# Via Stripe Dashboard
Dashboard → Logs
```

### Application Logs

Configure com Sentry ou LogRocket:

```bash
npm install @sentry/nextjs
```

---

## Performance

### Otimizações Já Implementadas

- ✅ Code splitting automático
- ✅ Image optimization
- ✅ CSS-in-JS (Tailwind)
- ✅ Lazy loading de componentes
- ✅ Service Workers (PWA)

### Monitoring

```bash
npm run build
# Análise do bundle em: .next/analyze
```

---

## Segurança

### Checklist

- [ ] Variáveis sensíveis em `.env.local` (nunca em repo)
- [ ] HTTPS habilitado
- [ ] CORS configurado
- [ ] Rate limiting ativo
- [ ] Input validation em todas as forms
- [ ] SQL injection prevention (via ORM)
- [ ] XSS protection (React escapa HTML)

---

## Documentação Adicional

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

---

**Última atualização**: 12 de Março de 2026
