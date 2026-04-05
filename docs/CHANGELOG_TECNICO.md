# Documentação Técnica — Alterações ao Projecto ACHADOS

**Período:** Abril de 2026  
**Branch:** `main`  
**Commits cobertos:** `2ce99b0` → `ca87727`

---

## Índice

1. [Modal Comparar Planos](#1-modal-comparar-planos)
2. [Sistema de Notificações por Email](#2-sistema-de-notificações-por-email)
3. [Aba Notificações — Settings](#3-aba-notificações--settings)
4. [Aba Privacidade & App — Settings](#4-aba-privacidade--app--settings)
5. [Modal Política de Privacidade](#5-modal-política-de-privacidade)
6. [Correcções de Build e SSR](#6-correcções-de-build-e-ssr)
7. [Ficheiros Criados](#7-ficheiros-criados)
8. [Ficheiros Modificados](#8-ficheiros-modificados)
9. [Variáveis de Ambiente Adicionadas](#9-variáveis-de-ambiente-adicionadas)
10. [Dependências Adicionadas](#10-dependências-adicionadas)

---

## 1. Modal Comparar Planos

### Ficheiros
- `src/components/dashboard/ComparePlansModal.tsx` *(criado)*
- `src/hooks/useComparePlansModal.ts` *(criado)*
- `src/hooks/useToast.ts` *(criado)*
- `src/components/ui/Toast.tsx` *(criado)*
- `src/app/(app)/dashboard/settings/page.tsx` *(modificado)*

### Descrição

Implementação completa do modal de comparação de planos acessível a partir do botão "Comparar planos →" na aba **Localizador PRO** das Configurações.

### Arquitectura

```
settings/page.tsx
  └── useComparePlansModal (hook de URL sync + body lock)
  └── ComparePlansModal (portal via createPortal)
        ├── DowngradeConfirmModal (modal secundário)
        └── useSubscription (estado de assinatura)
  └── ToastContainer
        └── useToast
```

### Funcionalidades implementadas

**`useComparePlansModal`**
- Sincronização bidirecional com URL: abre com `?modal=comparar-planos`, fecha limpando o parâmetro
- `window.history.pushState` ao abrir (permite botão voltar do browser)
- `popstate` event listener para fechar com botão voltar
- `document.body.style.overflow = 'hidden'` ao abrir, restaurado ao fechar
- Devolução de foco ao elemento trigger após fecho (`triggerRef`)
- Abertura automática se URL já contém o parâmetro (deep link)

**`ComparePlansModal`**
- Renderizado via `createPortal(…, document.body)` — evita problemas de z-index e overflow
- SSR-safe: usa `useState(false)` + `useEffect` para `mounted` antes de chamar `createPortal`
- 4 estados de renderização:
  - `loading` — skeleton loaders com animação shimmer
  - `upsell` — card Grátis + card PRO com botão "Assinar agora"
  - `subscribed` — badge "Ativo", botão "Gerir assinatura", data de renovação
  - `error` — mensagem inline com botão "Tentar novamente"
- Animações staggered: card Grátis aparece com `delay: 0.05s`, card PRO com `delay: 0.13s` e `scale: 0.97 → 1`
- Focus trap: Tab/Shift+Tab circulam apenas dentro do modal
- Foco automático no botão fechar ao abrir
- Fecho com tecla Escape
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-label` em todos os botões
- Modal de confirmação de downgrade secundário (`DowngradeConfirmModal`)
- Analytics: `track()` helper fire-and-forget para todos os eventos do fluxo
- Botão "Falar com consultor" com detecção de canal via `window.__SUPPORT_CHANNEL__`

**`Toast` / `useToast`**
- `ToastContainer` fixo no canto inferior direito (`z-[100]`)
- Auto-dismiss após 4 segundos
- 3 tipos: `success`, `error`, `info`
- Animações de entrada/saída via `AnimatePresence`
- `role="alert"` e `aria-live="polite"` para acessibilidade

### Lógica de estados do modal

```typescript
// Só mostra erro se for falha de rede real
const isNetworkError = !!subError
  && subError !== 'Unauthorized'
  && subError !== 'Internal server error';

const modalState = subLoading ? 'loading'
  : isNetworkError ? 'error'
  : isPro ? 'subscribed'
  : 'upsell';
```

---

## 2. Sistema de Notificações por Email

### Ficheiros
- `src/lib/email.ts` *(criado)*
- `src/services/email.service.ts` *(criado)*
- `src/app/api/claims/route.ts` *(modificado)*
- `src/app/api/webhooks/stripe/route.ts` *(modificado)*
- `.env.local.example` *(modificado)*

### Descrição

Integração com **Resend** (3.000 emails/mês gratuitos) para envio de notificações transaccionais.

### Arquitectura

```
email.ts (cliente Resend + helper sendEmail)
  └── email.service.ts (templates HTML por evento)
        ├── sendClaimReceivedEmail   → /api/claims POST
        ├── sendClaimAcceptedEmail   → (disponível para uso futuro)
        ├── sendPaymentReleasedEmail → /api/webhooks/stripe POST
        ├── sendNewMatchEmail        → (disponível para uso futuro)
        └── sendWeeklySummaryEmail   → (disponível para uso futuro)
```

### `src/lib/email.ts`

```typescript
// Fallback silencioso se RESEND_API_KEY não estiver configurada
if (!process.env.RESEND_API_KEY) {
  console.warn('[email] RESEND_API_KEY não configurada — email não enviado.');
  return;
}
```

- Nunca lança excepção — erros são logados e o fluxo principal continua
- `FROM` configurável via `EMAIL_FROM` env var

### `src/services/email.service.ts`

Todos os templates usam HTML inline responsivo com:
- Layout em tabela (compatibilidade máxima com clientes de email)
- Cor primária `#F4400A` no header
- Link para gerir preferências no rodapé
- Função `layout()` reutilizável para consistência visual

### Triggers implementados

| Evento | Trigger | Verificação |
|--------|---------|-------------|
| Claim criada | `POST /api/claims` | `email_enabled !== false` do localizador |
| Pagamento confirmado | Webhook Stripe `payment_intent.succeeded` | `email_enabled !== false` do localizador |

### Padrão de integração (fire-and-forget)

```typescript
// Nunca bloqueia o fluxo principal
try {
  await sendClaimReceivedEmail({ ... });
} catch (emailErr) {
  console.error("Error sending email:", emailErr);
}
```

---

## 3. Aba Notificações — Settings

### Ficheiros
- `src/hooks/useNotificationPreferences.ts` *(modificado)*
- `src/app/api/settings/notifications/route.ts` *(modificado)*
- `src/app/(app)/dashboard/settings/page.tsx` *(modificado)*

### Problemas corrigidos

**Hook `useNotificationPreferences`**

1. **Closure stale nos callbacks** — o `toggle` tinha `prefs` como dependência do `useCallback`, causando re-criações em cascata. Os toggles executavam com o valor antigo do estado, fazendo o toggle "piscar" e voltar.

   **Solução:** `useRef` para manter referência ao estado mais recente sem re-criar callbacks:
   ```typescript
   const prefsRef = useRef<UserNotificationPreferences | null>(null);
   prefsRef.current = prefs; // actualizado em cada render

   const toggle = useCallback(async (key: PrefsKey) => {
     const current = prefsRef.current; // sempre o valor mais recente
     // ...
   }, []); // sem dependências
   ```

2. **Erro de API bloqueia UI** — quando a API retorna erro (tabela inexistente, sem sessão), o hook mostrava estado de erro em vez de defaults.

   **Solução:** Qualquer resposta de erro carrega os defaults silenciosamente. O erro só é exposto ao utilizador se ocorrer durante um save.

3. **Modo local-only** — quando `user_id` está vazio (utilizador não autenticado ou tabela inexistente), os toggles actualizam o estado local sem tentar persistir na API.

4. **`refetch`** — adicionado para permitir retry manual.

5. **Tipo `PrefsKey` exportado** — evita o cast frágil `keyof typeof prefs` na UI.

**API `PATCH /api/settings/notifications`**

- Whitelist de campos permitidos: apenas os 6 campos booleanos válidos
- Validação de tipo: só aceita `boolean`
- Protege contra injecção de campos arbitrários

**UI**

- Indicador "A guardar..." durante saves
- Erro inline quando save falha (não bloqueia a UI)
- `aria-pressed` nos toggles
- Tipo `PrefsKey` usado directamente em vez de cast

---

## 4. Aba Privacidade & App — Settings

### Ficheiros
- `src/hooks/usePrivacySettings.ts` *(modificado)*
- `src/app/api/settings/privacy/route.ts` *(modificado)*
- `src/app/(app)/dashboard/settings/page.tsx` *(modificado)*

### Problemas corrigidos

**Hook `usePrivacySettings`**

Mesmo problema de closure stale que o hook de notificações. Solução idêntica com `useRef`:

```typescript
const settingsRef = useRef<UserPrivacySettings | null>(null);
settingsRef.current = settings;

const patch = useCallback(async (updates) => {
  const current = settingsRef.current; // sempre actualizado
  setSettings(prev => prev ? { ...prev, ...updates } : prev); // optimistic imediato
  if (!current?.user_id) return; // modo local-only
  // persiste na API...
}, []); // sem dependências
```

Os `togglePublicProfile` e `toggleAllowContact` lêem `settingsRef.current` directamente:
```typescript
const togglePublicProfile = useCallback(() => {
  patch({ public_profile: !settingsRef.current?.public_profile });
}, [patch]);
```

**API `PATCH /api/settings/privacy`**

- Validação explícita de cada campo:
  - `public_profile` e `allow_contact`: apenas `boolean`
  - `items_visibility`: apenas `"everyone" | "friends" | "only_me"`
- Admin client (`getAdminClient()`) movido para fora do handler DELETE — evita import dinâmico dentro de request handler

**UI**

- Indicador "A guardar..." e erro inline
- `aria-pressed` nos toggles
- `aria-haspopup="listbox"` e `aria-expanded` no dropdown de visibilidade
- Overlay invisível (`fixed inset-0 z-10`) para fechar dropdown ao clicar fora
- `role="listbox"` / `role="option"` / `aria-selected` no dropdown
- Checkmark visual no item seleccionado
- Descrições adicionadas a cada opção de toggle
- Secção "Dados & Permissões": removidas opções "Em breve" não funcionais, mantida apenas "Exportar meus dados" (funcional via `/api/settings/export`)

---

## 5. Modal Política de Privacidade

### Ficheiros
- `src/components/dashboard/PrivacyPolicyModal.tsx` *(criado)*
- `src/app/(app)/dashboard/settings/page.tsx` *(modificado)*

### Descrição

Modal com a política de privacidade completa da plataforma, acessível via botão "Ver Política →" na aba Privacidade & App.

### Conteúdo (10 secções)

1. Quem somos — identificação do responsável pelo tratamento
2. Dados recolhidos — identificação, KYC, actividade, técnicos
3. Como utilizamos os dados — 7 finalidades explícitas
4. Base legal LGPD — execução de contrato, consentimento, obrigação legal, legítimo interesse
5. Partilha de dados — Stripe, Supabase, Resend, autoridades
6. Segurança — AES-256, TLS, RLS, KYC, RBAC, monitorização
7. Direitos do titular — 7 direitos LGPD com instrução de exercício
8. Retenção de dados — prazos por categoria
9. Cookies — apenas cookies estritamente necessários
10. Contacto e reclamações — email e ANPD

### Implementação técnica

- `createPortal(…, document.body)` para z-index correcto
- SSR-safe: `useState(false)` + `useEffect` para `mounted`
- `document.body.style.overflow = 'hidden'` ao abrir
- Fecho com Escape, botão X e botão "Fechar" no rodapé
- Header e rodapé fixos, conteúdo com scroll independente (`overflow-y-auto`)
- `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

---

## 6. Correcções de Build e SSR

### Problemas resolvidos

| Commit | Problema | Solução |
|--------|---------|---------|
| `ebfab5e` | `_req` não usado em `POST /api/settings/subscription` | Removido parâmetro e import `NextRequest` |
| `ebfab5e` | `<img>` em `auth/register/page.tsx` | Substituído por `<Image fill />` do Next.js |
| `030c625` | `let sub` nunca reatribuído em `subscription/route.ts` | Alterado para `const` |
| `243d17c` | `<img>` em `ProfileCard.tsx` | Substituído por `<Image width={80} height={80} />` |
| `243d17c` | Warning de font custom no `layout.tsx` | Adicionado `eslint-disable` (Material Symbols não suportado por `next/font`) |
| `ca87727` | `typeof window === 'undefined'` em `PrivacyPolicyModal` causa hydration mismatch | Substituído por `useState(false)` + `useEffect` |

---

## 7. Ficheiros Criados

| Ficheiro | Descrição |
|---------|-----------|
| `src/components/dashboard/ComparePlansModal.tsx` | Modal de comparação de planos com 4 estados |
| `src/components/dashboard/PrivacyPolicyModal.tsx` | Modal com política de privacidade LGPD |
| `src/components/ui/Toast.tsx` | Sistema de notificações toast |
| `src/hooks/useComparePlansModal.ts` | Hook de gestão de estado + URL sync do modal |
| `src/hooks/useToast.ts` | Hook para gerir toasts |
| `src/lib/email.ts` | Cliente Resend com fallback silencioso |
| `src/services/email.service.ts` | Templates HTML de email por evento |

---

## 8. Ficheiros Modificados

| Ficheiro | Alterações principais |
|---------|----------------------|
| `src/app/(app)/dashboard/settings/page.tsx` | Integração de todos os modais, hooks e estados novos |
| `src/app/api/claims/route.ts` | Trigger de email ao criar claim |
| `src/app/api/settings/notifications/route.ts` | Whitelist de campos no PATCH |
| `src/app/api/settings/privacy/route.ts` | Validação de campos, admin client fora do handler |
| `src/app/api/settings/subscription/route.ts` | Remoção de parâmetro não usado, prefer-const |
| `src/app/api/webhooks/stripe/route.ts` | Trigger de email no pagamento confirmado |
| `src/app/auth/register/page.tsx` | `<img>` → `<Image>` |
| `src/app/layout.tsx` | eslint-disable para font Material Symbols |
| `src/components/dashboard/ProfileCard.tsx` | `<img>` → `<Image>` |
| `src/hooks/useComparePlansModal.ts` | Criado (ver secção 1) |
| `src/hooks/useNotificationPreferences.ts` | useRef pattern, modo local-only, refetch |
| `src/hooks/usePrivacySettings.ts` | useRef pattern, modo local-only, refetch |
| `src/hooks/useSubscription.ts` | Tratamento de Unauthorized como sem-subscrição, refetch, remoção de confirm() nativo |
| `.env.local.example` | Adicionadas variáveis Resend, removida SendGrid |
| `package.json` | Adicionada dependência `resend ^6.10.0` |

---

## 9. Variáveis de Ambiente Adicionadas

| Variável | Obrigatória | Descrição |
|---------|-------------|-----------|
| `RESEND_API_KEY` | Sim (para email) | API key do Resend — gratuito em resend.com |
| `EMAIL_FROM` | Não | Remetente dos emails. Default: `Achados <noreply@achados.app>` |

Variável removida: `SENDGRID_API_KEY` (substituída por Resend).

---

## 10. Dependências Adicionadas

| Pacote | Versão | Motivo |
|--------|--------|--------|
| `resend` | `^6.10.0` | Envio de emails transaccionais (3.000/mês gratuitos) |

---

## Padrões Estabelecidos

### useRef para callbacks estáveis

Sempre que um `useCallback` precisa de aceder ao estado mais recente sem o ter como dependência:

```typescript
const stateRef = useRef(state);
stateRef.current = state; // actualizado em cada render

const handler = useCallback(() => {
  const current = stateRef.current; // sempre actualizado
  // ...
}, []); // sem dependências de estado
```

### Defaults silenciosos em hooks de settings

Quando a API de settings falha (tabela inexistente, sem sessão, erro de servidor), os hooks carregam valores default em vez de mostrar estado de erro — o utilizador vê a UI funcional e pode interagir localmente. O erro só é exposto se ocorrer durante um save.

### Portal SSR-safe

```typescript
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
if (!mounted) return null;
return createPortal(<Component />, document.body);
```

### Email fire-and-forget

Todos os envios de email são envolvidos em `try/catch` e nunca bloqueiam o fluxo principal da API.
