# Autenticação

## Status atual: API PÚBLICA (sem auth) ⚠️

A API do 21-dias-gratidao **não exige autenticação** hoje. Qualquer pessoa que conhecer a URL pode enviar perguntas.

### Por que isso é um problema?

Se você for **comercializar** o app (vender via Kiwify/Cakto), permitir acesso aberto significa que:
- Pessoas que **não compraram** podem usar o Professor IA;
- Não há como controlar rate-limit por usuário;
- Não há como monetizar o acesso à IA.

---

## Como adicionar autenticação (plano)

### Opção 1 — API Key simples (header)

**Mais barato, mais rápido, recomendado para MVP.**

```nginx
# No nginx, antes do proxy_pass:
if ($http_x_api_key != "SUA_CHAVE_SECRETA") {
    return 401 "Unauthorized";
}
```

Frontend envia:
```http
POST /chat HTTP/1.1
X-API-Key: vk_live_abc123xyz
Content-Type: application/json
```

**Prós:** simples, rápido, fácil de revogar.
**Contras:** key fica exposta no bundle JS (mitigável com proxy intermediário).

---

### Opção 2 — JWT com TTL curto

**Mais robusto, recomendado para app comercializado.**

```python
# Backend valida token antes de chamar LLM
import jwt

def verify_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise AuthError('token expired')
    except jwt.InvalidTokenError:
        raise AuthError('invalid token')
```

Frontend:
```typescript
const token = await getJWTSession() // obtido via login
fetch(url, { headers: { 'Authorization': `Bearer ${token}` } })
```

**Prós:** TTL curto, revogável, suporta claims customizados (user_id, plan, etc.).
**Contras:** exige backend de auth + refresh token flow.

---

### Opção 3 — Origem restrita no CORS

**Não substitui auth, mas complementa.**

```python
# Em gratidao_server.py:
ALLOWED_ORIGINS = ['https://gratidao.automacaojs.us', 'https://app.seu-dominio.com']

origin = self.headers.get('Origin', '')
if origin in ALLOWED_ORIGINS:
    cors_origin = origin
else:
    cors_origin = 'null'  # bloqueia requisições cross-origin
```

**Prós:** bloqueia CSRF/abuso de outros sites.
**Contras:** não protege app nativo (Electron, Capacitor, etc).

---

## Recomendação para o 21-dias-gratidao

**Opção 1 + Opção 3 combinadas:**

1. API Key no header (gerada por usuário após compra Kiwify/Cakto)
2. CORS restrito ao domínio do PWA
3. Rate limit por IP (nginx `limit_req`)
4. (Futuro) JWT quando tiver área de login

---

## Como a API é protegida HOJE

Nada. É `Access-Control-Allow-Origin: *` + sem auth.

**⚠️ NÃO USE A API EM PRODUÇÃO COMERCIAL SEM ANTES ADICIONAR AUTENTICAÇÃO.**
