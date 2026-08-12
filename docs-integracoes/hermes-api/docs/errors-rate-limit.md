# Erros e Rate Limit

## Tabela de erros

| Status | Quando | Body |
|---|---|---|
| `200` | Sucesso | `{answer, pages, chunks_count}` |
| `204` | Preflight CORS | (vazio) |
| `400` | JSON inválido | `{"error": "bad json: <motivo>"}` |
| `400` | `question` vazio | `{"error": "question required"}` |
| `400` | day inválido | `{"error": "invalid day"}` |
| `404` | Endpoint não existe | `{"error": "not found"}` |
| `500` | RAG falhou (Supabase down/timeout) | `{"error": "RAG failed: <motivo>"}` |
| `500` | LLM falhou | `{"error": "LLM failed: <motivo>"}` |
| `502` | LLM gateway HTTP error | `{"error": "LLM gateway <código>"}` |
| `502` | LLM inalcançável | `{"error": "LLM unreachable: <motivo>"}` |

---

## Identificação de erro pelo frontend

```typescript
const res = await fetch(url, opts)
if (!res.ok) {
  const err = await res.json()
  console.error(`${res.status}: ${err.error}`)
}
```

---

## Tratamento recomendado (padrão Rádio Tempo de Milagres)

**NUNCA exibir erro técnico pro usuário final.**

```typescript
async function askProfessor(question, day, dayTitle) {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, day, day_title: dayTitle }),
      signal: AbortSignal.timeout(60000)
    })

    if (!res.ok) {
      const err = await res.json()
      console.error(`API error ${res.status}: ${err.error}`)
      return {
        answer: '🤖 Tô com uma dificuldade técnica. Já volto! 🙏',
        pages: [],
        chunks_count: 0
      }
    }

    return await res.json()
  } catch (e: any) {
    if (e.name === 'AbortError') {
      return {
        answer: '⏱️ O Professor demorou demais. Tenta de novo?',
        pages: [],
        chunks_count: 0
      }
    }
    return {
      answer: '🤖 Tô com uma dificuldade técnica. Já volto! 🙏',
      pages: [],
      chunks_count: 0
    }
  }
}
```

---

## Rate Limit

### Status atual: ❌ NÃO EXISTE

Não há nenhum rate limit configurado. Um único cliente pode fazer milhares de requests/segundo e esgotar créditos da LLM.

### Como adicionar antes do lançamento

#### nginx (recomendado, mais barato)

```nginx
# No block http {} ou server {}:
limit_req_zone $binary_remote_addr zone=gratidao:10m rate=10r/s;

# No location /21-dias-gratidao/api/:
location /21-dias-gratidao/api/ {
    limit_req zone=gratidao burst=20 nodelay;
    limit_req_status 429;
    proxy_pass http://127.0.0.1:8645/;
    ...
}
```

**Resultado:**
- Limite base: 10 req/s por IP
- Burst: 20 (picos curtos)
- Acima disso: HTTP 429 Too Many Requests

#### Python (por usuário autenticado)

```python
# Por API key, 100 req/min:
RATE_LIMITS = {}  # {api_key: [timestamps]}

def check_rate_limit(api_key: str, max_per_min: int = 100) -> bool:
    now = time.time()
    if api_key not in RATE_LIMITS:
        RATE_LIMITS[api_key] = []
    RATE_LIMITS[api_key] = [t for t in RATE_LIMITS[api_key] if now - t < 60]
    if len(RATE_LIMITS[api_key]) >= max_per_min:
        return False
    RATE_LIMITS[api_key].append(now)
    return True
```

#### Sugestão de limites para o 21-dias-gratidao

| Plano | Limite | Preço sugerido |
|---|---|---|
| Free (preview/demo) | 10 req/hora | R$ 0 |
| Premium mensal | 1000 req/dia | R$ 29,90 |
| Premium anual | ilimitado | R$ 297 |

---

## Códigos de status HTTP comuns

| Código | Significado | Quando o frontend vê |
|---|---|---|
| 200 | OK | Sucesso |
| 204 | No Content | Preflight CORS |
| 400 | Bad Request | JSON malformado, campos faltando |
| 401 | Unauthorized | (futuro) API key inválida |
| 404 | Not Found | Endpoint errado |
| 429 | Too Many Requests | (futuro) rate limit excedido |
| 500 | Internal Server Error | RAG/LLM falhou |
| 502 | Bad Gateway | LLM gateway inalcançável |
| 503 | Service Unavailable | Domínio errado / Cloudflare down |
