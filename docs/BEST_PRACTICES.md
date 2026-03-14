# Boas Práticas - ACHADOS

Guia de padrões e boas práticas para desenvolvimento no ACHADOS.

---

## 📋 Índice

- [Estrutura de Arquivos](#estrutura-de-arquivos)
- [Nomeação](#nomeação)
- [TypeScript](#typescript)
- [React & Components](#react--components)
- [Services & Business Logic](#services--business-logic)
- [Styling](#styling)
- [Performance](#performance)
- [Segurança](#segurança)
- [Testing](#testing)

---

## Estrutura de Arquivos

### Organização Recomendada

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Grouped layout para auth
│   │   ├── login/
│   │   └── register/
│   ├── (app)/             # Grouped layout para app
│   │   ├── dashboard/
│   │   ├── search/
│   │   └── claims/
│   ├── api/               # API Routes
│   │   ├── auth/
│   │   ├── items/
│   │   └── webhooks/
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Root page (landing)
│
├── components/            # React Components
│   ├── common/            # Reutilizáveis
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Button.tsx
│   ├── features/          # Feature-específicos
│   │   ├── ItemCard.tsx
│   │   └── ClaimForm.tsx
│   └── gamification/      # Gamification components
│       ├── XPProgressBar.tsx
│       ├── BadgeGrid.tsx
│       └── RankingBoard.tsx
│
├── hooks/                 # Custom Hooks
│   ├── useAuth.ts
│   ├── useAsync.ts
│   └── useFetch.ts
│
├── services/              # Business Logic
│   ├── user.service.ts
│   ├── item.service.ts
│   ├── claim.service.ts
│   ├── payment.service.ts
│   └── gamification.service.ts
│
├── types/                 # TypeScript Types
│   └── index.ts
│
├── utils/                 # Utilities
│   ├── helpers.ts
│   ├── validation.ts
│   └── formatting.ts
│
├── lib/                   # External Libraries Config
│   ├── supabase.ts
│   └── stripe.ts
│
├── styles/                # Global Styles
│   └── globals.css
│
├── middleware.ts          # Next.js Middleware
└── config.ts              # App Configuration
```

### Princípios

- ✅ Agrupe por funcionalidade, não por tipo de arquivo
- ✅ Use layouts groupados para organizar rotas
- ✅ Mantenha arquivos menores (menos 300 linhas)
- ✅ Um componente/serviço por arquivo

---

## Nomeação

### Arquivos

```typescript
// ✅ BOM
- UserService.ts
- ItemCard.tsx
- useAuth.ts
- generateReport.ts

// ❌ RUIM
- user_service.ts
- ItemCard.jsx
- use_auth.ts
- generate-report.ts
```

### Componentes

```typescript
// ✅ BOM - PascalCase, descritivo
export const UserProfileCard: React.FC<Props> = ({...}) => {...}
export const ItemDetailModal: React.FC<Props> = ({...}) => {...}

// ❌ RUIM
export const user_profile_card = ({...}) => {...}
export const Card = ({...}) => {...}
```

### Variáveis & Funções

```typescript
// ✅ BOM - camelCase, descritivo
const isUserAuthenticated = true;
const userCount = 50;
const handleItemSubmit = () => {...}

// ❌ RUIM
const isuser = true;
const count = 50;
const submit = () => {...}
```

### Constantes

```typescript
// ✅ BOM - UPPER_SNAKE_CASE
const MAX_RETRY_ATTEMPTS = 3;
const API_TIMEOUT_MS = 5000;
const PAYMENT_SPLIT_RATIO = 0.8;

// ❌ RUIM
const maxRetry = 3;
const timeout = 5000;
const RATIO = 0.8;
```

---

## TypeScript

### Tipos

```typescript
// ✅ BOM - tipos explícitos
interface UserProfile {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
}

// ❌ RUIM - any
interface User {
  id: any;
  name: any;
}
```

### Generics

```typescript
// ✅ BOM - reutilizável
interface ApiResponse<T> {
  data: T;
  error: string | null;
  status: "success" | "error";
}

const response: ApiResponse<User> = {...}

// ❌ RUIM - hardcoded
interface UserResponse {
  data: User;
  error: string | null;
}
```

### Enums vs Union Types

```typescript
// ✅ BOM - const assertion
const CLAIM_STATUS = {
  pending: "PENDING",
  accepted: "ACCEPTED",
  completed: "COMPLETED",
} as const;

type ClaimStatus = typeof CLAIM_STATUS[keyof typeof CLAIM_STATUS];

// ❌ RUIM - enum
enum ClaimStatus {
  PENDING = "PENDING",
  ACCEPTED = "ACCEPTED",
  COMPLETED = "COMPLETED",
}
```

### Type Guards

```typescript
// ✅ BOM - type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value
  );
}

if (isUser(data)) {
  console.log(data.id);
}

// ❌ RUIM - type cast
const user = data as User;
// Pode falhar em runtime
```

---

## React & Components

### Functional Components

```typescript
// ✅ BOM - typed props, default values
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`btn btn-${variant}`}
  >
    {label}
  </button>
);

// ❌ RUIM - untyped, não exportado
const button = (props) => {
  <button {...props} />;
};
```

### Hooks

```typescript
// ✅ BOM - limpeza, dependências corretas
export const useExample = () => {
  const [state, setState] = useState<string>("");

  useEffect(() => {
    const timer = setInterval(() => {
      setState(new Date().toISOString());
    }, 1000);

    return () => clearInterval(timer); // Cleanup
  }, []); // Dependências corretas

  return state;
};

// ❌ RUIM - sem cleanup, dependências faltando
export const useExample = () => {
  const [state, setState] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setState(Date.now());
    });
    // Sem cleanup
  }); // Sem dependências

  return state;
};
```

### Event Handlers

```typescript
// ✅ BOM - typed event
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  // handle form submission
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setInput(e.target.value);
};

// ❌ RUIM - untyped
const handleSubmit = (e) => {
  e.preventDefault();
};
```

### Conditional Rendering

```typescript
// ✅ BOM - ternário simples
{isLoading ? <Spinner /> : <Content />}

// ✅ BOM - guarda
{!error && <Content />}

// ✅ BOM - && para mostrar/esconder
{isVisible && <Component />}

// ❌ RUIM - lógica complexa no JSX
{isLoading ? (
  <div className="spinner">
    <div className="inner">
      <span>Loading...</span>
    </div>
  </div>
) : error ? (
  <div>Error</div>
) : (
  <div>Content</div>
)}
```

---

## Services & Business Logic

### Padrão Service

```typescript
// ✅ BOM - métodos estáticos, sem dependências
export class UserService {
  static async getUser(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  static async addXp(userId: string, amount: number): Promise<void> {
    const user = await this.getUser(userId);
    await supabase
      .from("users")
      .update({ xp: user.xp + amount })
      .eq("id", userId);
  }
}

// Uso
const user = await UserService.getUser(userId);
```

### Error Handling

```typescript
// ✅ BOM - erros específicos
export class ItemService {
  static async getItem(id: string): Promise<FoundItem> {
    try {
      const { data, error } = await supabase
        .from("found_items")
        .select("*")
        .eq("id", id)
        .single();

      if (error?.code === "PGRST116") {
        throw new Error("Item not found");
      }
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Failed to get item:", error);
      throw error;
    }
  }
}

// ❌ RUIM - erro genérico
const getItem = async (id) => {
  const data = await db.items.get(id);
  return data;
};
```

---

## Styling

### Tailwind Classes

```typescript
// ✅ BOM - ordem lógica
<div className="flex items-center justify-between gap-4 p-4 rounded-lg bg-white shadow-md hover:shadow-lg transition-shadow">
  {/* Flex layout → Alignment → Spacing → Sizing → Styling → Effects → Hover/Transitions */}
</div>

// ✅ BOM - classes em variáveis para reutilização
const buttonBaseClasses = "px-4 py-2 rounded-lg font-semibold transition-colors";
const buttonPrimaryClasses = `${buttonBaseClasses} bg-blue-600 text-white hover:bg-blue-700`;

// ❌ RUIM - estilos inline
<div style={{ display: "flex", gap: "10px", backgroundColor: "white" }}>
```

### Dark Mode

```typescript
// ✅ BOM - suporte a dark mode
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Conteúdo
</div>

// ❌ RUIM - sem dark mode
<div className="bg-white text-gray-900">
  Conteúdo
</div>
```

### Responsividade

```typescript
// ✅ BOM - mobile-first
<div className="flex flex-col md:flex-row gap-4">
  <div className="w-full md:w-1/3">Coluna 1</div>
  <div className="w-full md:w-2/3">Coluna 2</div>
</div>

// ❌ RUIM - desktop-first
<div className="flex flex-row md:flex-col">
```

---

## Performance

### Code Splitting

```typescript
// ✅ BOM - lazy load heavy components
import dynamic from "next/dynamic";

const PaymentForm = dynamic(() => import("@/components/PaymentForm"), {
  loading: () => <Spinner />,
  ssr: false, // Somente no cliente
});

// ❌ RUIM - carrega tudo
import PaymentForm from "@/components/PaymentForm";
```

### Memoization

```typescript
// ✅ BOM - memo para componentes puros
export const ItemCard = React.memo<ItemCardProps>(({ item, onSelect }) => {
  return (
    <div onClick={() => onSelect(item)}>
      <p>{item.title}</p>
    </div>
  );
});

// ❌ RUIM - sem memo, re-renderiza sempre
export const ItemCard = ({ item, onSelect }) => {
  return <div onClick={() => onSelect(item)} />;
};
```

### Queries & API Calls

```typescript
// ✅ BOM - caching, deduplicação
export const useFetch = <T,>(url: string) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) setData(data);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false; // Cleanup
    };
  }, [url]);

  return { data, loading };
};

// ❌ RUIM - sem cleanup, re-fetches múltiplas vezes
```

---

## Segurança

### Input Validation

```typescript
// ✅ BOM - validação stricta
import { z } from "zod";

const createItemSchema = z.object({
  title: z.string().min(3).max(100),
  category: z.enum(["document", "phone", "wallet"]),
  location: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
});

const validateItem = (data: unknown) => {
  return createItemSchema.parse(data);
};

// ❌ RUIM - sem validação
const createItem = (data: any) => {
  db.items.create(data); // Pode injetar dados maliciosos
};
```

### Authenticated Requests

```typescript
// ✅ BOM - token incluído
const response = await fetch("/api/protected", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Backend valida token em middleware
```

### Environment Variables

```typescript
// ✅ BOM - chaves secretas nunca no cliente
// .env.local (servidor)
STRIPE_SECRET_KEY=sk_test_...

// Server action ou API route
const payment = await stripe.paymentIntents.create({
  amount: 1000,
  currency: "brl",
});

// ❌ RUIM - chave secreta no cliente
// Nunca faça isso!
const STRIPE_SECRET_KEY = "sk_test_..."; // Exposto!
```

---

## Testing

### Unit Tests

```typescript
// ✅ BOM - testa comportamento
describe("formatCurrency", () => {
  it("deve formatar valor em BRL", () => {
    expect(formatCurrency(100)).toBe("R$ 100,00");
    expect(formatCurrency(1234.5)).toBe("R$ 1.234,50");
  });

  it("deve lançar erro para valores inválidos", () => {
    expect(() => formatCurrency(-100)).toThrow();
    expect(() => formatCurrency(NaN)).toThrow();
  });
});

// ❌ RUIM - testa implementação
describe("formatCurrency", () => {
  it("chama Intl.NumberFormat", () => {
    const spy = jest.spyOn(Intl, "NumberFormat");
    formatCurrency(100);
    expect(spy).toHaveBeenCalled();
  });
});
```

### Component Tests

```typescript
// ✅ BOM - testa user interactions
describe("<Button />", () => {
  it("deve chamar onClick quando clicado", () => {
    const handleClick = jest.fn();
    const { getByRole } = render(
      <Button onClick={handleClick} label="Click me" />
    );

    fireEvent.click(getByRole("button"));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

---

## Checklist Pré-Commit

- [ ] Código compila sem erros TS
- [ ] Rodei `npm run lint` sem warnings
- [ ] Rodei `npm run format`
- [ ] Adicionei testes para nova funcionalidade
- [ ] Nenhum `console.log()` deixado para trás
- [ ] Removi imports não usados
- [ ] Commitei com Conventional Commits

---

**Última atualização:** 12 de Março de 2026
