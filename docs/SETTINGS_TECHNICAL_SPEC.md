# Especificação Técnica — Dashboard de Configurações
**Projeto:** Achados  
**Módulo:** Settings (Configurações)  
**Versão:** 1.0  
**Data:** 2026-03-31  
**Estado:** Implementado — pendente execução de migrations e configuração de variáveis

---

## 1. Resumo Executivo

Implementação completa das três abas do dashboard de configurações que estavam em estado de placeholder:

| Aba | Estado anterior | Estado actual |
|---|---|---|
| Notificações | Placeholder | Funcional — persistência Supabase |
| Privacidade & App | Placeholder | Funcional — persistência Supabase + exportação + exclusão de conta |
| Localizador PRO | Placeholder | Funcional — Stripe Checkout + gestão de assinatura |

---

## 2. Ficheiros Modificados

### 2.1 Ficheiro principal da página

| Ficheiro | Operação |
|---|---|
| `src/app/(app)/dashboard/settings/page.tsx` | Modificado |

Alterações:
- Importação dos hooks `useNotificationPreferences`, `usePrivacySettings`, `useSubscription`
- Importação do tipo `ItemsVisibility`
- Substituição de todo o estado local das três abas pelos respectivos hooks
- Leitura do query param `?tab=` no `useEffect` inicial para navegação directa (ex: redirect do Stripe)
- Limpeza do URL após redirect de sucesso do Stripe (`?success=1`)
- `handleDeleteAccount` agora chama a API real e faz `signOut` + redirect para `/auth/login`
- Aba Notificações: spinner de loading, toggles ligados ao hook, disabled durante save
- Aba Privacidade: spinner de loading, toggles e dropdown ligados ao hook, "Exportar meus dados" funcional, "Excluir minha conta" funcional
- Aba Localizador PRO: estado condicional free/PRO, botão de assinar redireciona para Stripe Checkout, data de renovação, botão de cancelar

---

## 3. Ficheiros Criados

### 3.1 Migrations de Base de Dados

| Ficheiro | Tabela criada |
|---|---|
| `migrations/002_notification_preferences.sql` | `user_notification_preferences` |
| `migrations/003_privacy_settings.sql` | `user_privacy_settings` |
| `migrations/004_subscriptions.sql` | `subscriptions` |

> **Acção obrigatória:** Executar as três migrations no Supabase SQL Editor, por esta ordem.

---

### 3.2 Tipos TypeScript

| Ficheiro | Operação |
|---|---|
| `src/types/index.ts` | Modificado |

Tipos adicionados:
- `ItemsVisibility` — `"everyone" | "friends" | "only_me"`
- `UserPrivacySettings` — interface completa
- `UserNotificationPreferences` — interface completa
- `SubscriptionPlan` — `"free" | "pro"`
- `SubscriptionStatus` — `"active" | "inactive" | "cancelled" | "past_due"`
- `Subscription` — interface completa

---

### 3.3 Hooks React (Client)

| Ficheiro | Responsabilidade |
|---|---|
| `src/hooks/useNotificationPreferences.ts` | Criado |
| `src/hooks/usePrivacySettings.ts` | Criado |
| `src/hooks/useSubscription.ts` | Criado |

Padrão comum a todos os hooks:
- Fetch inicial ao montar o componente
- Update optimista com rollback automático em caso de erro
- Estados `loading`, `saving`/`actionLoading`, `error` expostos

---

### 3.4 API Routes (Backend — Next.js App Router)

| Ficheiro | Operação |
|---|---|
| `src/app/api/settings/notifications/route.ts` | Criado |
| `src/app/api/settings/privacy/route.ts` | Criado |
| `src/app/api/settings/subscription/route.ts` | Criado |
| `src/app/api/settings/export/route.ts` | Criado |
| `src/app/api/webhooks/stripe/route.ts` | Modificado |

---

## 4. Endpoints de Backend

### 4.1 Notificações

```
GET  /api/settings/notifications
```
- Auth: sessão Supabase obrigatória
- Retorna preferências do utilizador ou defaults se não existirem ainda
- Resposta: `{ success: true, data: UserNotificationPreferences }`

```
PATCH /api/settings/notifications
```
- Auth: sessão Supabase obrigatória
- Body: campos parciais de `UserNotificationPreferences` (ex: `{ push_enabled: false }`)
- Faz upsert com `onConflict: "user_id"`
- Resposta: `{ success: true, data: UserNotificationPreferences }`

---

### 4.2 Privacidade

```
GET  /api/settings/privacy
```
- Auth: sessão Supabase obrigatória
- Retorna configurações de privacidade ou defaults
- Resposta: `{ success: true, data: UserPrivacySettings }`

```
PATCH /api/settings/privacy
```
- Auth: sessão Supabase obrigatória
- Body: campos parciais de `UserPrivacySettings`
- Faz upsert com `onConflict: "user_id"`
- Resposta: `{ success: true, data: UserPrivacySettings }`

```
DELETE /api/settings/privacy
```
- Auth: sessão Supabase obrigatória
- Apaga: `user_notification_preferences`, `user_privacy_settings`, `users` (cascade trata o resto)
- Apaga conta de auth via `supabase.auth.admin.deleteUser()` — requer `SUPABASE_SERVICE_ROLE_KEY`
- Resposta: `{ success: true }`

---

### 4.3 Exportação de Dados

```
GET  /api/settings/export
```
- Auth: sessão Supabase obrigatória
- Agrega: perfil do utilizador, `found_items`, `claims`, `activities`
- Resposta: ficheiro JSON com `Content-Disposition: attachment`
- Nome do ficheiro: `achados-dados-{userId}.json`

---

### 4.4 Assinatura PRO

```
GET  /api/settings/subscription
```
- Auth: sessão Supabase obrigatória
- Retorna estado actual da assinatura ou `{ plan: "free", status: "inactive" }` se não existir
- Resposta: `{ success: true, data: Subscription }`

```
POST /api/settings/subscription
```
- Auth: sessão Supabase obrigatória
- Cria ou reutiliza Stripe Customer para o utilizador
- Cria Stripe Checkout Session em modo `subscription`
- Resposta: `{ success: true, url: string }` — o frontend redireciona para `url`
- URLs de retorno:
  - Sucesso: `{NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=assinatura&success=1`
  - Cancelamento: `{NEXT_PUBLIC_APP_URL}/dashboard/settings?tab=assinatura`

```
DELETE /api/settings/subscription
```
- Auth: sessão Supabase obrigatória
- Chama `stripe.subscriptions.update({ cancel_at_period_end: true })`
- Actualiza `subscriptions.cancel_at_period_end = true` na BD
- Acesso PRO mantém-se até ao fim do período
- Resposta: `{ success: true }`

---

### 4.5 Webhook Stripe (modificado)

```
POST /api/webhooks/stripe
```
Eventos tratados (adicionados):

| Evento Stripe | Acção na BD |
|---|---|
| `customer.subscription.created` | Upsert em `subscriptions` com `plan: "pro"`, datas do período |
| `customer.subscription.updated` | Actualiza estado, datas, `cancel_at_period_end` |
| `customer.subscription.deleted` | Define `plan: "free"`, `status: "cancelled"`, limpa `stripe_subscription_id` |

Eventos já existentes (mantidos):

| Evento Stripe | Acção |
|---|---|
| `payment_intent.succeeded` | Actualiza `payments`, `claims`, chama `GamificationService.rewardDelivery` |

---

## 5. Schema de Base de Dados

### 5.1 `user_notification_preferences`

| Coluna | Tipo | Default |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `user_id` | UUID FK → users | — |
| `push_enabled` | BOOLEAN | `TRUE` |
| `email_enabled` | BOOLEAN | `TRUE` |
| `nearby_enabled` | BOOLEAN | `TRUE` |
| `weekly_summary` | BOOLEAN | `FALSE` |
| `sound_enabled` | BOOLEAN | `TRUE` |
| `vibration_enabled` | BOOLEAN | `TRUE` |
| `created_at` | TIMESTAMP | `now()` |
| `updated_at` | TIMESTAMP | `now()` |

RLS: não configurado nesta migration — acesso controlado via sessão na API route.

---

### 5.2 `user_privacy_settings`

| Coluna | Tipo | Default |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `user_id` | UUID FK → users | — |
| `public_profile` | BOOLEAN | `TRUE` |
| `allow_contact` | BOOLEAN | `FALSE` |
| `items_visibility` | TEXT CHECK | `'friends'` |
| `created_at` | TIMESTAMP | `now()` |
| `updated_at` | TIMESTAMP | `now()` |

RLS: `FOR ALL USING (auth.uid()::uuid = user_id)`

---

### 5.3 `subscriptions`

| Coluna | Tipo | Default |
|---|---|---|
| `id` | UUID PK | `gen_random_uuid()` |
| `user_id` | UUID FK → users UNIQUE | — |
| `stripe_customer_id` | TEXT UNIQUE | — |
| `stripe_subscription_id` | TEXT UNIQUE | — |
| `plan` | TEXT CHECK | `'free'` |
| `status` | TEXT CHECK | `'inactive'` |
| `current_period_start` | TIMESTAMP | — |
| `current_period_end` | TIMESTAMP | — |
| `cancel_at_period_end` | BOOLEAN | `FALSE` |
| `created_at` | TIMESTAMP | `now()` |
| `updated_at` | TIMESTAMP | `now()` |

RLS: `FOR SELECT USING (auth.uid()::uuid = user_id)`

---

## 6. Variáveis de Ambiente

### 6.1 Já existentes (verificar se estão configuradas)

| Variável | Utilização |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente Supabase (browser + server) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente Supabase (browser + server) |
| `STRIPE_SECRET_KEY` | Stripe SDK no servidor |
| `STRIPE_WEBHOOK_SECRET` | Validação de assinatura dos webhooks Stripe |

### 6.2 Novas — obrigatórias

| Variável | Descrição | Onde obter |
|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Chave de service role para `auth.admin.deleteUser()` | Supabase Dashboard → Settings → API → service_role |
| `STRIPE_PRO_PRICE_ID` | ID do Price do plano PRO no Stripe (ex: `price_xxx`) | Stripe Dashboard → Products → PRO → Price ID |
| `NEXT_PUBLIC_APP_URL` | URL base da aplicação sem trailing slash | Ex: `https://achados.app` |

> Adicionar ao `.env.local` para desenvolvimento e às variáveis de ambiente da plataforma de deploy (Vercel, etc.) para produção.

---

## 7. Configuração Stripe

### 7.1 Produto e Price

1. Aceder ao Stripe Dashboard → Products
2. Criar produto "Localizador PRO"
3. Adicionar price recorrente: R$ 14,90 / mês (BRL)
4. Copiar o Price ID (formato `price_xxx`) para `STRIPE_PRO_PRICE_ID`

### 7.2 Webhook

Registar o endpoint no Stripe Dashboard → Developers → Webhooks:

- URL: `https://{dominio}/api/webhooks/stripe`
- Eventos a subscrever:
  - `payment_intent.succeeded` (já existia)
  - `customer.subscription.created` (novo)
  - `customer.subscription.updated` (novo)
  - `customer.subscription.deleted` (novo)
- Copiar o Signing Secret para `STRIPE_WEBHOOK_SECRET`

---

## 8. Checklist de Execução

```
[ ] 1. Executar migrations/002_notification_preferences.sql no Supabase SQL Editor
[ ] 2. Executar migrations/003_privacy_settings.sql no Supabase SQL Editor
[ ] 3. Executar migrations/004_subscriptions.sql no Supabase SQL Editor
[ ] 4. Adicionar SUPABASE_SERVICE_ROLE_KEY às variáveis de ambiente
[ ] 5. Criar produto PRO no Stripe e obter STRIPE_PRO_PRICE_ID
[ ] 6. Adicionar STRIPE_PRO_PRICE_ID às variáveis de ambiente
[ ] 7. Adicionar NEXT_PUBLIC_APP_URL às variáveis de ambiente
[ ] 8. Registar webhook Stripe com os 4 eventos listados na secção 7.2
[ ] 9. Actualizar STRIPE_WEBHOOK_SECRET com o novo signing secret
[ ] 10. Fazer deploy e verificar os logs das API routes
```

---

## 9. Dependências de Serviços Externos

| Serviço | Utilização | SDK |
|---|---|---|
| Supabase | Base de dados, autenticação, RLS | `@supabase/supabase-js`, `@supabase/ssr` |
| Stripe | Checkout, gestão de assinaturas, webhooks | `stripe` (já instalado) |

Sem novas dependências npm a instalar.

---

## 10. Notas de Segurança

- A exclusão de conta usa `SUPABASE_SERVICE_ROLE_KEY` apenas no servidor (API route), nunca exposta ao cliente
- O webhook Stripe valida a assinatura via `stripe.webhooks.constructEvent` antes de processar qualquer evento
- Todas as API routes verificam sessão activa antes de qualquer operação
- RLS activo nas tabelas `user_privacy_settings` e `subscriptions`
- A tabela `user_notification_preferences` não tem RLS configurado — o acesso é controlado exclusivamente pela validação de sessão nas API routes (aceitável para este caso de uso)
