# ACHADOS - Documentação Completa

## 📋 Visão Geral

**ACHADOS** é uma plataforma digital inovadora que conecta pessoas que encontraram documentos e objetos perdidos com seus verdadeiros proprietários. A plataforma utiliza um modelo de negócio baseado em recompensas financeiras, gamificação e segurança.

### Dados do Projeto
- **Autor**: Fernando Júnior Grão Paim Quipiaca
- **Versão**: 1.0
- **Status**: MVP em desenvolvimento
- **Classificação**: Confidencial

---

## 🎯 Objetivos

1. Resolver o problema cotidiano da perda de documentos
2. Incentivar devoluções de forma segura e eficiente
3. Criar ecossistema econômico sustentável
4. Construir comunidade engajada via gamificação
5. Garantir compliance com LGPD e segurança de dados

---

## 🏗️ Arquitetura do Sistema

### Camadas (Clean Architecture)

```
┌─────────────────────────────────────────┐
│   Presentation Layer (React/Next.js)    │ - UI Components
│                                         │ - Pages
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Application Layer                     │ - Services
│   (Domain Logic & Orchestration)        │ - Hooks
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Domain Layer                          │ - Entities
│   (Business Rules)                      │ - Use Cases
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│   Infrastructure Layer                  │ - Database
│   (External Services)                   │ - APIs
│                                         │ - Storage
└─────────────────────────────────────────┘
```

### Stack Tecnológico

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- TailwindCSS
- Framer Motion (Animações)
- Shadcn UI (Componentes)

**Backend:**
- Next.js API Routes
- Supabase (BaaS)
- PostgreSQL
- Edge Functions

**Autenticação & Segurança:**
- Supabase Auth
- JWT
- Row Level Security (RLS)
- Criptografia AES-256

**Pagamentos:**
- Stripe
- Custodia de fundos

**Storage:**
- Supabase Storage
- Uploads de imagens

**Realtime:**
- Supabase Realtime (WebSockets)

**Mapas:**
- Mapbox / Google Maps

---

## 📊 Banco de Dados

### Schema Principal

```sql
-- Usuários
USERS
├── id (UUID)
├── email (UNIQUE)
├── name
├── phone
├── avatar_url
├── xp (Integer)
├── level (Enum)
├── rating (Decimal)
├── rank_position
├── kyc_status (Enum)
├── kyc_data (JSONB)
└── timestamps

-- Items Encontrados
FOUND_ITEMS
├── id (UUID)
├── title
├── category (Enum)
├── description
├── photo_urls (Array)
├── location (lat/lng)
├── finder_id (FK -> Users)
├── status (Enum)
├── reward_value
└── timestamps

-- Reivindicações
CLAIMS
├── id (UUID)
├── item_id (FK -> Found Items)
├── owner_id (FK -> Users)
├── finder_id (FK -> Users)
├── status (Enum)
├── payment_status (Enum)
└── timestamps

-- Pagamentos
PAYMENTS
├── id (UUID)
├── claim_id (FK -> Claims)
├── total_amount (Decimal)
├── finder_amount (80%)
├── platform_fee (20%)
├── status (Enum)
├── provider (Stripe)
├── transaction_id
└── timestamps

-- Atividades (Auditoria e Histórico)
ACTIVITIES
├── id (UUID)
├── user_id (FK -> Users)
├── type (Enum)
├── description
├── value
└── created_at

-- Badges (Gamificação)
BADGES
├── id (UUID)
├── name
├── icon
├── description
├── xp_required
└── created_at

-- User Badges (Junction Table)
USER_BADGES
├── id (UUID)
├── user_id (FK -> Users)
├── badge_id (FK -> Badges)
└── earned_at

-- Notificações
NOTIFICATIONS
├── id (UUID)
├── user_id (FK -> Users)
├── type (Enum)
├── title
├── message
├── read (Boolean)
├── link
└── timestamps
```

---

## 🔐 Segurança & Compliance

### LGPD (Lei Geral de Proteção de Dados)

1. **Consentimento Explícito**: Usuários consentem na coleta
2. **Dados Mínimos**: Coleta apenas dados necessários
3. **Transparência**: Política clara sobre uso
4. **Direito de Exclusão**: Delete account funcionalidade
5. **Portabilidade**: Export de dados do usuário
6. **Criptografia**: AES-256 para dados sensíveis

### KYC (Know Your Customer)

- Verificação de identidade obrigatória para receber pagamentos
- Validação de documento (RG, CPF, Passaporte)
- Prova de endereço
- Selfie para verificação de rosto
- Status: pending → approved / rejected

### Proteção contra Fraude

1. **Falso Proprietário**
   - Perguntas de verificação antes de liberar contato
   - Validação de identidade

2. **Localizador Fraudulento**
   - Análise de padrões de comportamento
   - Limite de items por período
   - Sistema de reputação

3. **Confirmação Falsa**
   - Monitoramento de atividades suspeitas
   - Timeout para confirmação (72h)
   - Mediação manual se necessário

### Row Level Security (RLS)

```sql
-- Users só podem ver seu próprio perfil
CREATE POLICY "Users can view their own"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Items encontrados são públicos
CREATE POLICY "Anyone can view found items"
  ON found_items FOR SELECT
  USING (true);

-- Claims são privados para envolvidos
CREATE POLICY "Users can only see their claims"
  ON claims FOR SELECT
  USING (auth.uid() IN (owner_id, finder_id));
```

---

## 🎮 Sistema de Gamificação

### Experiência (XP)

```javascript
const XP_REWARDS = {
  REGISTER_ITEM: 20,           // Registrar um item
  DELIVERY_COMPLETED: 100,     // Completar entrega
  POSITIVE_RATING: 10,         // Avaliação 1-4 estrelas
  5_STAR_RATING: 25,           // Avaliação 5 estrelas
  FIRST_ITEM: 50,              // Primeiro item
};
```

### Níveis

| Nível | XP Mínimo | Emoji | Descrição |
|-------|-----------|-------|-----------|
| Bronze | 0 | 🥉 | Iniciante |
| Silver | 500 | ⭐ | Colaborador |
| Gold | 1500 | 🥇 | Experiente |
| Platinum | 3000 | 💎 | Elite |
| Legend | 5000 | 👑 | Lenda |

### Badges

- 🎯 **Primeiro Item**: Registrou primeiro item
- ❤️ **Bom Samaritano**: 5 devoluções completadas
- 🔍 **Super Localizador**: 25 devoluções completadas
- ⭐ **Herói do Dia**: 5 avaliações 5-estrelas
- ⚡ **Rápido e Furioso**: Devolução < 24h
- 👑 **Lenda Urbana**: Atingiu rank Platinum

### Ranking Global

- Ordenado por XP (decrescente)
- Mostra posição, nome, XP, nível
- Atualizado em tempo real
- Filtros por nível e cidade

---

## 💰 Modelo de Monetização

### Taxa de Resgate

Quando um proprietário reclama um item:

```
Taxa Total: R$ 100,00
├── Localizador: R$ 80,00 (80%)
└── Plataforma: R$ 20,00 (20%)
```

### Fluxo de Pagamento

1. **Proprietário paga**: Taxa retida pela plataforma
2. **Status**: `pending` → `processing` → `completed`
3. **Liberação**: Automática após confirmação de entrega
4. **Timeout**: 72h para confirmação
5. **Mediação**: Suporte intervém em casos de disputa

### Prevenção de Pagamento sem Serviço

```javascript
// Fluxo garantido
1. Proprietário paga
2. Plataforma retém valor
3. Localizador acessa contato
4. Entrega do item
5. Proprietário confirma
6. Pagamento liberado ao localizador
```

---

## 📱 Estrutura de Pastas

```
src/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard principal
│   ├── search/
│   │   └── page.tsx               # Busca de items
│   ├── profile/
│   │   └── page.tsx               # Perfil do usuário
│   ├── item/
│   │   └── [id]/
│   │       └── page.tsx           # Detalhe do item
│   ├── claim/
│   │   └── [id]/
│   │       └── page.tsx           # Detalhe da reivindicação
│   └── api/
│       ├── auth/
│       │   └── user/
│       │       └── route.ts       # GET/PATCH user
│       ├── items/
│       │   └── route.ts           # CRUD items
│       ├── claims/
│       │   └── route.ts           # CRUD claims
│       ├── payments/
│       │   └── route.ts           # Payment intents
│       └── webhooks/
│           └── stripe/
│               └── route.ts       # Stripe webhook
│
├── components/
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ItemCard.tsx
│   ├── Gamification.tsx           # XP Bar, Badges, Ranking
│   ├── SearchFilters.tsx
│   ├── PaymentForm.tsx
│   └── ...
│
├── hooks/
│   ├── useAuth.ts                 # Autenticação
│   ├── useAsync.ts                # Async estado
│   ├── useFetch.ts                # Fetch data
│   └── ...
│
├── services/
│   ├── user.service.ts            # User operations
│   ├── item.service.ts            # Item operations
│   ├── claim.service.ts           # Claim operations
│   ├── payment.service.ts         # Payment operations
│   ├── gamification.service.ts    # XP, Badges, Ranking
│   └── ...
│
├── lib/
│   ├── supabase.ts                # Supabase client
│   ├── stripe.ts                  # Stripe client
│   └── ...
│
├── types/
│   └── index.ts                   # TypeScript types
│
├── utils/
│   ├── helpers.ts                 # Utility functions
│   ├── format.ts                  # Formatting
│   └── validation.ts              # Validations
│
├── styles/
│   └── globals.css                # Global styles
│
└── middleware.ts                  # Next.js middleware (auth)
```

---

## 🚀 Fluxo de Usuário

### Localizador (Finder)

```
1. Registra na plataforma [20 XP]
2. Registra item encontrado [20 XP]
3. Aguarda reivindicação
4. Recebe notificação de reivindicação
5. Combina entrega com proprietário
6. Entrega item
7. Proprietário confirma
8. Recebe R$ (80% da taxa) [100 XP]
9. Sobe ranking/badges
```

### Proprietário (Owner)

```
1. Registra na plataforma
2. Busca item na base
3. Encontra item similar
4. Paga taxa de resgate (R$)
5. Acessa contato do localizador
6. Combina encontro
7. Recebe item
8. Confirma no sistema
9. Pagamento liberado ao localizador
```

---

## 📡 APIs REST

### Autenticação

```
POST /api/auth/signup
  Body: { email, password, name, phone }

POST /api/auth/login
  Body: { email, password }

POST /api/auth/logout

GET /api/auth/user
  Headers: { Authorization: Bearer <token> }
```

### Items

```
GET /api/items?category=document&city=SP
  Response: { items: [...] }

GET /api/items/:id
  Response: { item: {...} }

POST /api/items
  Headers: { Authorization: Bearer <token> }
  Body: { title, category, description, photo_url, city, state, reward_value, lat, lng }

PATCH /api/items/:id
  Headers: { Authorization: Bearer <token> }
  Body: { ...updates }

DELETE /api/items/:id
  Headers: { Authorization: Bearer <token> }
```

### Claims

```
GET /api/claims
  Headers: { Authorization: Bearer <token> }

POST /api/claims
  Headers: { Authorization: Bearer <token> }
  Body: { item_id, owner_id }

PATCH /api/claims/:id/confirm
  Headers: { Authorization: Bearer <token> }

PATCH /api/claims/:id/dispute
  Headers: { Authorization: Bearer <token> }
```

### Payments

```
POST /api/payments/intent
  Headers: { Authorization: Bearer <token> }
  Body: { claim_id, amount }

POST /api/payments/confirm
  Headers: { Authorization: Bearer <token> }
  Body: { payment_intent_id }

POST /webhooks/stripe
  Body: Stripe Event (Automatico)
```

---

## 🧪 Testes

### Testes Unitários

```bash
npm run test -- services/user.service.test.ts
```

### Testes de Integração

```bash
npm run test:integration
```

### Testes E2E

```bash
npm run test:e2e
```

---

## 📦 Deploy

### Preparação

```bash
# Build
npm run build

# Test
npm run test

# Type check
npm run type-check
```

### Deploy (Vercel)

```bash
# Conectar repo GitHub
vercel link

# Deploy production
vercel --prod
```

### Variáveis de Ambiente

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_MAPBOX_TOKEN=
```

---

## 📖 Guias Rápidos

### Adicionar Nova Feature

1. Crear type em `src/types/index.ts`
2. Criar service em `src/services/`
3. Criar hook se necessário
4. Criar componentes em `src/components/`
5. Implementar página / rota API
6. Adicionar testes

### Criar Componente

```typescript
// src/components/MyComponent.tsx
"use client";

import React from "react";
import { motion } from "framer-motion";

interface MyComponentProps {
  title: string;
  onAction?: () => void;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-card border border-border rounded-lg p-4"
    >
      <h2 className="font-semibold">{title}</h2>
      {onAction && (
        <button onClick={onAction}>
          Action
        </button>
      )}
    </motion.div>
  );
};
```

---

## 🔄 Roadmap (Fases)

### Fase 1: MVP
- ✅ Autenticação
- ✅ Registro de items
- ✅ Busca
- ✅ Claims básicos
- ✅ Pagamentos (Stripe)
- ✅ Gamificação básica

### Fase 2: Melhorias
- 📋 IA para matching automático
- 📋 Reconhecimento de imagem
- 📋 Notificações push
- 📋 Chat integrado
- 📋 Avaliações e reviews

### Fase 3: Expansão
- 📋 Categorias extras (chaves, eletrônicos, pets)
- 📋 Parcerias (órgãos públicos, bancos)
- 📋 API Pública
- 📋 App mobile (React Native)
- 📋 Expansion geográfica (LATAM)

---

## 📞 Suporte & Contato

- Email: suporte@achados.com.br
- Issues: GitHub Issues
- Discord: [Comunidade]
- Twitter: @achados_br

---

## 📄 Licença

Todos os direitos reservados © 2025 ACHADOS - Fernando Júnior Grão Paim Quipiaca

---

**Última atualização**: 12 de Março de 2026
**Versão do documento**: 1.0
