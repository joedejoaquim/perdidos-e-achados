# API Reference - ACHADOS

## 📡 Endpoints

### Base URL
```
Development:  http://localhost:3000/api
Production:   https://achados.com.br/api
```

---

## 🔐 Autenticação

### POST /auth/signup
Criar nova conta

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@example.com",
  "phone": "(11) 99999-9999",
  "password": "SecurePassword123"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "joao@example.com",
    "name": "João Silva",
    "phone": "(11) 99999-9999",
    "xp": 0,
    "level": "bronze",
    "rating": 0,
    "verified": false
  }
}
```

---

### POST /auth/login
Entrar na conta

**Request:**
```json
{
  "email": "joao@example.com",
  "password": "SecurePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

### GET /auth/user
Obter dados do usuário autenticado

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "joao@example.com",
    "name": "João Silva",
    "xp": 250,
    "level": "silver",
    "rating": 4.8,
    "rank_position": 15
  }
}
```

---

### PATCH /auth/user
Atualizar perfil

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "name": "João Silva Junior",
  "bio": "Localizador ativo e confiável"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {...}
}
```

---

## 📦 Items

### GET /items
Listar documentos encontrados

**Query Parameters:**
```
?category=document    # Filtrar por categoria
&city=São Paulo       # Filtrar por cidade
&state=SP             # Filtrar por estado
&status=available     # Filtrar por status
&limit=20             # Itens por página (default: 20)
&offset=0             # Paginação
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Carteira com RG",
      "category": "document",
      "description": "Carteira de couro preta com RG e CPF",
      "photo_url": "https://...",
      "city": "São Paulo",
      "state": "SP",
      "location_lat": -23.5505,
      "location_lng": -46.6333,
      "finder_id": "uuid",
      "status": "available",
      "reward_value": 100,
      "created_at": "2026-03-12T10:00:00Z"
    }
  ]
}
```

---

### GET /items/:id
Obter detalhes de um documento

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {...}
}
```

---

### POST /items
Registrar documento encontrado

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request:**
```json
{
  "title": "Carteira com RG",
  "category": "document",
  "description": "Carteira de couro preta encontrada na rua",
  "photo_url": "https://s3...",
  "city": "São Paulo",
  "state": "SP",
  "location_lat": -23.5505,
  "location_lng": -46.6333,
  "reward_value": 100
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {...}
}
```

---

### PATCH /items/:id
Atualizar documento

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "reward_value": 150,
  "status": "claimed"
}
```

**Response:** `200 OK`

---

### DELETE /items/:id
Deletar documento

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

---

## 🎯 Claims (Reivindicações)

### GET /claims
Listar minhas reivindicações

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?role=both     # "finder", "owner", or "both"
&status=pending # Filtrar por status
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "item_id": "uuid",
      "owner_id": "uuid",
      "finder_id": "uuid",
      "status": "pending",
      "payment_status": "pending",
      "created_at": "2026-03-12T10:00:00Z"
    }
  ]
}
```

---

### POST /claims
Criar reivindicação de item

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "item_id": "uuid",
  "amount": 100
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "claim": {...},
    "clientSecret": "pi_1234567890_secret_..."
  }
}
```

---

### PATCH /claims/:id/confirm
Confirmar recebimento do item

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "rating": 5,
  "review": "Excelente localizador!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "payment_status": "completed"
  }
}
```

---

### PATCH /claims/:id/dispute
Contestar reivindicação

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "reason": "Item não foi entregue",
  "description": "O localizador não compareceu no local combinado"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "disputed"
  }
}
```

---

## 💳 Pagamentos

### POST /payments/intent
Criar intenção de pagamento (Stripe)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "claim_id": "uuid",
  "amount": 100
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_1234567890_secret_...",
    "publishableKey": "pk_test_..."
  }
}
```

---

### POST /payments/confirm
Confirmar pagamento

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "paymentIntentId": "pi_1234567890"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "completed",
    "amount": 100,
    "transactionId": "ch_..."
  }
}
```

---

## 🎮 Gamificação

### GET /gamification/ranking
Obter ranking global

**Query Parameters:**
```
?limit=10      # Número de usuários (default: 10)
&level=silver  # Filtrar por nível (optional)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "rank_position": 1,
      "name": "João Silva",
      "xp": 5500,
      "level": "legend",
      "avatar_url": "https://...",
      "rating": 4.9
    }
  ]
}
```

---

### GET /gamification/badges
Obter badges do usuário

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Primeiro Item",
      "icon": "🎯",
      "description": "Registrou seu primeiro item encontrado",
      "earned_at": "2026-03-12T10:00:00Z"
    }
  ]
}
```

---

## 👤 Usuários

### GET /users/:id
Obter perfil públicо de usuário

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "João Silva",
    "avatar_url": "https://...",
    "level": "silver",
    "rating": 4.8,
    "rank_position": 15,
    "total_items_found": 23,
    "total_items_delivered": 22,
    "bio": "Localizador ativo"
  }
}
```

---

### PATCH /users/:id/kyc
Submeter dados KYC

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "full_name": "João da Silva Santos",
  "cpf": "123.456.789-00",
  "birth_date": "1990-01-15",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zip_code": "01310-100",
  "identity_document_url": "https://...",
  "proof_of_address_url": "https://...",
  "selfie_url": "https://..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "kyc_status": "pending"
  }
}
```

---

## 🔔 Notificações

### GET /notifications
Obter notificações

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
```
?read=false    # Apenas não lidas
&limit=20      # Limite (default: 20)
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "claim_received",
      "title": "Reivindicação recebida",
      "message": "João Silva reivindicou seu item",
      "read": false,
      "link": "/claim/uuid",
      "created_at": "2026-03-12T10:00:00Z"
    }
  ]
}
```

---

### PATCH /notifications/:id/read
Marcar notificação como lida

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`

---

## 🔗 Webhooks

### POST /webhooks/stripe
Webhook untuk Stripe events

**Eventos suportados:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `charge.refunded`

**Response:** `200 OK`
```json
{
  "received": true
}
```

---

## ❌ Tratamento de Erros

Todos os endpoints retornam erros no seguinte formato:

```json
{
  "success": false,
  "error": "Error description",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

| Código | Significado |
|--------|------------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

### Exemplos de Erro

**401 Unauthorized:**
```json
{
  "success": false,
  "error": "Missing or invalid authentication token",
  "code": "UNAUTHORIZED"
}
```

**400 Bad Request:**
```json
{
  "success": false,
  "error": "Missing required field: title",
  "code": "VALIDATION_ERROR"
}
```

---

## 🔄 Rate Limiting

- Limite: 100 requisições por minuto
- Headers de resposta:
  - `X-RateLimit-Limit: 100`
  - `X-RateLimit-Remaining: 95`
  - `X-RateLimit-Reset: 1234567890`

---

## 📝 Changelog

### v1.0 (2026-03-12)
- ✅ APIs iniciais
- ✅ Autenticação
- ✅ Items e Claims
- ✅ Pagamentos
- ✅ Gamificação

---

**Última atualização**: 12 de Março de 2026
