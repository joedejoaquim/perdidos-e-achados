# Guia de Contribuição - ACHADOS

Obrigado por considerar contribuir para ACHADOS! Este documento fornece diretrizes e instruções para contribuir.

---

## 📋 Índice

- [Código de Conduta](#código-de-conduta)
- [Como Contribuir](#como-contribuir)
- [Convenções de Código](#convenções-de-código)
- [Processo de Pull Request](#processo-de-pull-request)
- [Guia de Estilo](#guia-de-estilo)

---

## Código de Conduta

### Nosso Compromisso

No interesse de promover um ambiente aberto e acolhedor, nós, como contribuidores e mantedores, nos comprometemos a tornar a participação em nosso projeto e nossa comunidade uma experiência livre de assédio para todos.

### Nossos Padrões

Exemplos de comportamento que contribuem para criar um ambiente positivo incluem:

- Usar linguagem acolhedora e inclusiva
- Ser respeitoso com pontos de vista e experiências diferentes
- Aceitar crítica construtiva graciosamente
- Focar no que é melhor para a comunidade
- Mostrar empatia com outros membros da comunidade

---

## Como Contribuir

### 1. Reportar Bugs

Bugs são documentados usando Issues no GitHub. Crie uma nova issue e forneça as seguintes informações:

- **Descrição Clara**: O quê aconteceu?
- **Passos para Reproduzir**: Como reproduzir o problema?
- **Comportamento Esperado**: O que deveria acontecer?
- **Comportamento Atual**: O que está acontecendo?
- **Ambiente**: OS, navegador, versão do Node.js, etc.

**Template:**

```markdown
## Descrição do Bug

[Descrição clara e concisa do bug]

## Passos para Reproduzir

1. [Primeiro passo]
2. [Segundo passo]
3. ...

## Comportamento Esperado

[O que deveria acontecer]

## Comportamento Atual

[O que está acontecendo]

## Ambiente

- OS: [e.g., Windows 11]
- Navegador: [e.g., Chrome 120]
- Node.js: [e.g., v20.0.0]
- npm: [e.g., v10.0.0]

## Screenshots

[Se aplicável, adicione screenshots]
```

### 2. Sugerir Enhancements

Enhancements (melhorias) são também documentadas usando Issues. Inclua:

- **Descrição da Melhoria**: Como você imagina a funcionalidade?
- **Solução Proposta**: Descrição detalhada
- **Contexto**: Por que isso seria útil?
- **Exemplos**: Referências ou exemplos da comunidade

### 3. Submeter Pull Requests

1. **Fork o Repositório**
   ```bash
   git clone https://github.com/SEU_USERNAME/perdidos-e-achados.git
   cd perdidos-e-achados
   ```

2. **Crie uma Branch**
   ```bash
   git checkout -b feature/sua-feature
   # ou
   git checkout -b fix/seu-bug
   ```

3. **Instale Dependências**
   ```bash
   npm install
   ```

4. **Faça suas Mudanças**
   - Siga as [Convenções de Código](#convenções-de-código)
   - Escreva testes para novas funcionalidades
   - Atualize documentação se necessário

5. **Teste Localmente**
   ```bash
   npm run dev
   npm run lint
   npm test
   ```

6. **Commit suas Mudanças**
   ```bash
   git add .
   git commit -m "feat: adicionar nova funcionalidade"
   ```

7. **Push para sua Branch**
   ```bash
   git push origin feature/sua-feature
   ```

8. **Abra um Pull Request**
   - Forneça descrição clara
   - Referencie issues relacionadas
   - Inclua screenshots/videos se relevante

---

## Convenções de Código

### Commits

Usamos Conventional Commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: Nova funcionalidade
- `fix`: Correção de bug
- `docs`: Mudanças em documentação
- `style`: Formatação, falta de ponto-e-vírgula, etc. (não afeta código)
- `refactor`: Refatoração de código
- `perf`: Melhoria de performance
- `test`: Adição de testes
- `chore`: Tarefas de manutenção

**Exemplos:**
```
feat(gamification): adicionar sistema de badges

fix(auth): corrigir login com email

docs(setup): atualizar instruções de instalação

style(components): alinhar espaçamento

refactor(services): melhorar estrutura de payment service
```

### TypeScript

```typescript
// ✅ BOM
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

export const getUserProfile = async (
  userId: string
): Promise<UserProfile> => {
  // implementation
};

// ❌ RUIM
export interface user {
  id: any;
  name: any;
}

export const getUser = async (userId) => {
  // implementation
};
```

### React/TSX

```typescript
// ✅ BOM
interface Props {
  title: string;
  onClick: () => void;
  isLoading?: boolean;
}

export const Button: React.FC<Props> = ({
  title,
  onClick,
  isLoading = false,
}) => (
  <button onClick={onClick} disabled={isLoading}>
    {isLoading ? "Carregando..." : title}
  </button>
);

// ❌ RUIM
export const button = (props) => {
  return <button onClick={props.click}>{props.title}</button>;
};
```

### Estilo CSS/Tailwind

```typescript
// ✅ BOM
<div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
  <h1 className="text-lg font-semibold text-gray-900">Título</h1>
  <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
    Ação
  </button>
</div>

// ❌ RUIM
<div style={{ display: "flex", gap: "10px", background: "white" }}>
  <h1 style={{ fontSize: "18px" }}>Título</h1>
  <button style={{ background: "blue", color: "white" }}>Ação</button>
</div>
```

---

## Processo de Pull Request

### Checklist para PR

Antes de submeter, verifique:

- [ ] Seu código segue as convenções de estilo (TypeScript, React, CSS)
- [ ] Você rodou `npm run lint` e resolveu warnings
- [ ] Você rodou `npm run format` para formatação
- [ ] Você adicionou testes para novas funcionalidades
- [ ] Todos os testes passam (`npm test`)
- [ ] Você atualizou documentação se necessário
- [ ] Commits seguem Conventional Commits
- [ ] Não há console.log() deixados para trás
- [ ] Não há dependências sem uso adicionadas

### Revisão de Código

- Toda PR será revisada por pelo menos um maintainer
- Feedback será fornecido dentro de 3-5 dias úteis
- Ajustes podem ser solicitados
- Uma vez aprovada, sua PR será mesclada

### Merge

- PRs podem ser mergeadas por maintainers
- Squash merge é preferível para manter histórico limpo
- Sua branch será deletada após merge

---

## Guia de Estilo

### Nomes de Variáveis

```typescript
// ✅ BOM - camelCase, descritivo
const isUserAuthenticated = true;
const userProjectCount = 5;
const maxRetryAttempts = 3;

// ❌ RUIM
const is_user_authenticated = true;
const count = 5;
const x = 3;
```

### Funcionalidade

```typescript
// ✅ BOM - nomes claros, responsabilidade única
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

// ❌ RUIM - muito genérico, faz múltiplas coisas
export const format = (x) => {
  // múltiplas lógicas
};
```

### Comentários

```typescript
// ✅ BOM - explica por quê, não o quê
// Usamos uma timeout para permitir que a descrição seja processada
// antes de fazer fetch dos dados relacionados
const processDescription = async (description: string) => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return fetchRelatedData(description);
};

// ❌ RUIM - comenta o óbvio
// Incrementar contador
count++;
```

---

## Perguntas?


- @joedejoaquim
- @THPL28
- 💬 Issues: Use a aba Issues no GitHub
- 📚 Documentação: Ver docs/ pasta

---

**Obrigado por contribuir para ACHADOS! 🚀**
