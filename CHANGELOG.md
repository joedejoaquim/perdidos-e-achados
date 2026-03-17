# Changelog - ACHADOS

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt_BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt_BR/).

---

## [1.0.0] - 2026-03-12

### ✨ Added (Adicionado)

#### Arquitetura
- [x] Setup inicial do Next.js 15 + React 19 + TypeScript
- [x] Configuração de Tailwind CSS + Shadcn UI
- [x] Estrutura de pastas (Clean Architecture)
- [x] Middleware de autenticação

#### Autenticação & Segurança
- [x] Supabase Auth integrado
- [x] Signup e Login
- [x] Row Level Security (RLS)
- [x] JWT tokens
- [x] Proteção de rotas

#### Database
- [x] Schema SQL completo (8 tabelas)
- [x] Migrations iniciais
- [x] Índices otimizados
- [x] Realtime policies

#### Features - Items
- [x] Registrar documentos encontrados
- [x] Upload de múltiplas fotos
- [x] Busca avançada com filtros
- [x] Listagem com paginação
- [x] Detalhes do item

#### Features - Claims (Reivindicações)
- [x] Criar reivindicação
- [x] Confirmar recebimento
- [x] Histórico de reivindicações
- [x] Mediação de disputas

#### Features - Pagamentos
- [x] Integração Stripe
- [x] Payment intents
- [x] Custodia de fundos
- [x] Webhooks
- [x] Histórico de transações

#### Features - Gamificação
- [x] Sistema de XP
- [x] 5 níveis (Bronze → Legend)
- [x] 6 badges
- [x] XP Progress Bar
- [x] Ranking global

#### Features - Dashboard
- [x] Dashboard para localizador
- [x] Dashboard para proprietário
- [x] Statisticas
- [x] Histórico de atividades

#### Features - Usuário
- [x] Perfil do usuário
- [x] Edição de perfil
- [x] KYC (Know Your Customer)
- [x] Reputação e rating

#### Components
- [x] Navbar
- [x] Footer
- [x] ItemCard
- [x] ItemList
- [x] XPProgressBar
- [x] BadgeGrid
- [x] RankingBoard
- [x] SearchFilters

#### Hooks
- [x] useAuth
- [x] useAsync
- [x] useFetch

#### Services
- [x] UserService
- [x] ItemService
- [x] ClaimService
- [x] PaymentService
- [x] GamificationService

#### APIs
- [x] GET/PATCH /api/auth/user
- [x] GET/POST /api/items
- [x] GET/POST /api/claims
- [x] POST /api/payments
- [x] POST /api/webhooks/stripe

#### Utilities
- [x] Formatação de moeda
- [x] Validação de email/telefone/CPF
- [x] Cálculo de distância (Haversine)
- [x] Formatação de datas
- [x] Storage local

#### Documentação
- [x] README.md atualizado
- [x] ARCHITECTURE.md
- [x] SETUP.md
- [x] API.md
- [x] CHANGELOG.md

---

## [1.1.0] - (Roadmap)

### 🔜 Planejado

#### IA & Machine Learning
- [ ] Matching automático de items
- [ ] Reconhecimento de imagem
- [ ] OCR para documentos

#### Comunicação
- [ ] Chat integrado
- [ ] Notificações push
- [ ] Email notifications

#### Social
- [ ] Avaliações e reviews
- [ ] Comentários
- [ ] Sistema de denuncia

#### Parcerias
- [ ] Integração com órgãos públicos
- [ ] Integração com bancos
- [ ] Integração com seguradoras

#### Expansão
- [ ] App mobile (React Native)
- [ ] Categorias extras
- [ ] Expansão geográfica (LATAM)
- [ ] API Pública

---

## [1.0.0-beta.1] - 2026-03-01

### Testes Beta
- Verificação de fluxo de usuário (Finder)
- Verificação de fluxo de usuário (Owner)
- Testes de segurança
- Testes de performance

---

## Notas de Desenvolvimento

### Convenções de Commits

```
feat:      Nova funcionalidade
fix:       Correção de bug
docs:      Documentação
style:     Formatação de código
refactor:  Refatoração de código
test:      Adição de testes
chore:     Tarefas de manutenção
```

Exemplo: `feat: adicionar sistema de gamificação`

### Versionamento

ACHADOS usa [Semantic Versioning](https://semver.org/lang/pt_BR/):
- MAJOR: Mudanças incompatíveis
- MINOR: Novas funcionalidades (compatível)
- PATCH: Correções de bugs

---

## 📞 Contato

- Autor: Fernando Júnior Grão Paim Quipiaca
- Email: fernando@achados.com.br
- Repositório: https://github.com/joedejoaquim/perdidos-e-achados

---

**Última atualização**: 12 de Março de 2026
