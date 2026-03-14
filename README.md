# ACHADOS - Plataforma Digital de Localização de Documentos Perdidos

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase)](https://supabase.com)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=flat-square)](#)

**Conectando pessoas aos seus objetos perdidos de forma rápida, segura e incentivada.**

---

## 📌 Visão Geral

**ACHADOS** é uma plataforma inovadora que resolve um problema cotidiano: a perda de documentos pessoais. Criada por **Fernando Júnior Grão Paim Quipiaca**, a plataforma atua como intermediária segura entre pessoas que encontraram documentos e seus verdadeiros proprietários.

### 🎯 Objetivo

Criar um ecossistema digital que incentive devoluções responsáveis de documentos através de:
- 💰 **Recompensas Financeiras**: Até 80% da taxa para o localizador
- 🏆 **Gamificação**: Ranking, badges, XP e níveis
- 🔒 **Segurança**: LGPD compliance, KYC, criptografia
- ⚡ **Eficiência**: Processo simples de 4 passos

---

## 🚀 Quick Start

### Requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase
- Conta Stripe

### Instalação (5 minutos)

```bash
# 1. Clonar repositório
git clone https://github.com/joedejoaquim/perdidos-e-achados.git
cd perdidos-e-achados

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.local.example .env.local
# Editar .env.local com suas credenciais

# 4. Executar localmente
npm run dev

# 5. Abrir no navegador
open http://localhost:3000
```

Para mais detalhes, veja [SETUP.md](./docs/SETUP.md).

---

## 🏗️ Arquitetura

### Stack Tecnológico

```
Frontend          Backend           Database       Infra
─────────         ───────           ────────       ─────
Next.js      -->  API Routes   -->  PostgreSQL --> Supabase
React.js         Supabase          Realtime       Auth
TypeScript       Edge Funcs                       Storage
TailwindCSS      Stripe                           Webhooks
Framer Motion
```

### Componentes Principais

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API Routes + Supabase
- **Database**: PostgreSQL (Supabase managed)
- **Auth**: Supabase Auth + JWT
- **Payments**: Stripe + Custódia de fundos
- **Storage**: Supabase Storage (AWS S3)
- **Realtime**: Supabase Realtime (WebSockets)
- **Maps**: Mapbox / Google Maps

Para arquitetura detalhada, veja [ARCHITECTURE.md](./docs/ARCHITECTURE.md).

---

## 📊 Projeto em Números

| Métrica | Valor |
|---------|-------|
| Linhas de Código | ~8000+ |
| Componentes React | 25+ |
| Serviços | 6 |
| Endpoints API | 15+ |
| Tabelas DB | 8 |
| Testes | 50+ |

---

## 🎮 Features

### ✅ Implementadas (MVP)

- [x] Autenticação com Supabase
- [x] Registro de documentos encontrados
- [x] Busca e filtros de documentos
- [x] Sistema de reivindicação
- [x] Pagamentos via Stripe
- [x] Sistema de XP e níveis
- [x] Badges e achievements
- [x] Ranking global
- [x] Notificações
- [x] Dashboard para localizadores
- [x] Dashboard para proprietários
- [x] Proteção de dados (LGPD)
- [x] KYC para recebimento
- [x] Upload de imagens
- [x] Responsivo (mobile-first)

### 🔜 Roadmap (Próximas Fases)

- [ ] IA para matching automático
- [ ] Reconhecimento de imagem
- [ ] Chat integrado
- [ ] Avaliações e reviews
- [ ] Categorias extras (chaves, eletrônicos)
- [ ] Parcerias institucionais
- [ ] App mobile (React Native)
- [ ] Expansão geográfica
- [ ] API Pública

---

## 🔐 Segurança & Compliance

### LGPD
- ✅ Consentimento explícito
- ✅ Dados mínimos necessários
- ✅ Direito de deleção
- ✅ Transparência total
- ✅ Criptografia AES-256

### KYC (Know Your Customer)
- ✅ Verificação de identidade
- ✅ Validação de documento
- ✅ Prova de endereço
- ✅ Selfie para rosto

### Proteção contra Fraude
- ✅ Validação em 3 camadas
- ✅ Análise comportamental
- ✅ Mediação manual
- ✅ Row Level Security (RLS)

---

## 📱 Telas Principais

### Autenticação
- Login
- Registro
- Recuperação de senha
- Verificação 2FA (opcional)

### Usuário - Localizador
- Dashboard (Stats, XP, Ranking)
- Registrar item encontrado
- Gerenciar items
- Ver reivindicações
- Receber pagamentos

### Usuário - Proprietário
- Buscar documentos
- Filtros avançados
- Fazer reivindicação
- Confirmar entrega
- Avaliar localizador

### Comuns
- Perfil de usuário
- Histórico de atividades
- Badges e achievements
- Ranking global
- Configurações

---

## 💰 Modelo de Negócio

### Taxa de Resgate

```
Proprietário paga: R$ 100
├── Localizador recebe: R$ 80 (80%)
└── Plataforma: R$ 20 (20%)
```

### Fluxo de Pagamento

```
1. Proprietário paga
   ↓
2. Plataforma retém R$ 100
   ↓
3. Localizador acessa contato
   ↓
4. Entrega do item
   ↓
5. Proprietário confirma
   ↓
6. Plataforma libera R$ 80 ao localizador
```

---

## 🎮 Gamificação

### Experiência (XP)

| Ação | XP | 
|------|-----|
| Registrar item | 20 |
| Devolução completada | 100 |
| Avaliação 5⭐ | 25 |
| Avaliação 1-4⭐ | 10 |
| Primeiro item | 50 |

### Níveis

| Nível | XP | Emoji |
|-------|-----|-------|
| Bronze | 0 | 🥉 |
| Silver | 500 | ⭐ |
| Gold | 1500 | 🥇 |
| Platinum | 3000 | 💎 |
| Legend | 5000 | 👑 |

### Badges

- 🎯 Primeiro Item
- ❤️ Bom Samaritano (5 devoluções)
- 🔍 Super Localizador (25 devoluções)
- ⭐ Herói do Dia (5 reviews 5⭐)
- ⚡ Rápido e Furioso (< 24h)
- 👑 Lenda Urbana (Platinum)

---

## 📡 API Reference

### Autenticação

```bash
POST /api/auth/signup
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/user
```

### Items

```bash
GET    /api/items                  # Listar todos
GET    /api/items/:id              # Detalhe
POST   /api/items                  # Criar (requer auth)
PATCH  /api/items/:id              # Atualizar
DELETE /api/items/:id              # Deletar
```

### Claims (Reivindicações)

```bash
GET    /api/claims                 # Listar minhas
POST   /api/claims                 # Criar
PATCH  /api/claims/:id/confirm     # Confirmar entrega
PATCH  /api/claims/:id/dispute     # Contestar
```

### Pagamentos

```bash
POST   /api/payments/intent        # Criar intenção
POST   /api/payments/confirm       # Confirmar
POST   /webhooks/stripe            # Webhook (automático)
```

Para documentação completa, veja [API.md](./docs/API.md).

---

## 🗂️ Estrutura do Projeto

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/
│   ├── dashboard/
│   ├── search/
│   ├── profile/
│   └── api/
├── components/             # React Components
│   ├── Navbar.tsx
│   ├── ItemCard.tsx
│   ├── Gamification.tsx
│   └── ...
├── hooks/                  # Custom Hooks
│   ├── useAuth.ts
│   ├── useAsync.ts
│   └── ...
├── services/              # Business Logic
│   ├── user.service.ts
│   ├── item.service.ts
│   ├── claim.service.ts
│   ├── payment.service.ts
│   └── gamification.service.ts
├── lib/                   # Clients
│   ├── supabase.ts
│   ├── stripe.ts
│   └── ...
├── types/                 # TypeScript Types
│   └── index.ts
├── utils/                 # Utilities
│   ├── helpers.ts
│   ├── format.ts
│   └── validation.ts
└── styles/               # CSS
    └── globals.css
```

---

## 🧪 Testes

```bash
# Unit Tests
npm test

# Integration Tests
npm run test:integration

# E2E Tests
npm run test:e2e

# Coverage
npm run test:coverage
```

---

## 📦 Deploy

### Vercel

```bash
# Conectar repo
vercel link

# Deploy
vercel --prod
```

### Docker

```bash
docker build -t achados .
docker run -p 3000:3000 achados
```

Veja [SETUP.md](./docs/SETUP.md) para detalhes.

---

## 🤝 Contribuindo

Este é um projeto confidencial. Para contribuir:

1. Fork o repositório
2. Crie uma branch (`git checkout -b feature/amazing-feature`)
3. Commit suas mudanças (`git commit -m 'Add amazing feature'`)
4. Push para a branch (`git push origin feature/amazing-feature`)
5. Abra um Pull Request

---

## 📞 Suporte

- 📧 Email: suporte@achados.com.br
- 🐛 Issues: [GitHub Issues](https://github.com/joedejoaquim/perdidos-e-achados/issues)
- 💬 Discord: [Comunidade](https://discord.gg/achados)
- 🐦 Twitter: [@achados_br](https://twitter.com/achados_br)

---

## 📄 Licença

Todos os direitos reservados © 2025 ACHADOS

Autor: **Fernando Júnior Grão Paim Quipiaca**  
Versão: **1.0**  
Classificação: **Confidencial**

---

## 📚 Documentação Adicional

- [ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitetura completa
- [SETUP.md](./docs/SETUP.md) - Guia de instalação
- [API.md](./docs/API.md) - Referência de API
- [SECURITY.md](./docs/SECURITY.md) - Segurança e compliance

---

## 🙏 Agradecimentos

Agradecimentos especiais a:
- Supabase by Vercel
- Stripe
- Next.js team
- React community

---

**Última atualização**: 12 de Março de 2026
