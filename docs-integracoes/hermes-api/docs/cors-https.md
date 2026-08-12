# CORS e HTTPS

## CORS — Configuração atual

A API responde com headers permissivos:

| Header | Valor |
|---|---|
| `Access-Control-Allow-Origin` | `*` (qualquer origem) |
| `Access-Control-Allow-Methods` | `GET, POST, OPTIONS` |
| `Access-Control-Allow-Headers` | `Content-Type` |
| Cache-Control | `no-store` |

### Preflight (OPTIONS)

```http
OPTIONS /21-dias-gratidao/api/chat HTTP/1.1
Origin: https://studio.google.com
Access-Control-Request-Method: POST
```

**Resposta (HTTP 204):**
```
access-control-allow-headers: Content-Type
access-control-allow-methods: GET, POST, OPTIONS
access-control-allow-origin: *
```

**Conclusão:** qualquer frontend HTTPS funciona sem CORS blocker.

---

## ⚠️ Problema: `Access-Control-Allow-Origin: *` é inseguro

Significa que **qualquer site no mundo** pode chamar a API. Em produção comercial, isso permite:

- Sites maliciosos consumirem seus créditos de LLM
- Hot-linking (outros sites "sequestram" o Professor IA)
- CORS abuse para reconhecimento de domínios

### Recomendação para produção

```python
# TROCAR:
'Access-Control-Allow-Origin': '*'

# POR:
ALLOWED_ORIGINS = [
    'https://gratidao.automacaojs.us',
    'https://app-gratidao.vercel.app',
    'https://preview.automacaojs.us',
]

origin = self.headers.get('Origin', '')
cors_origin = origin if origin in ALLOWED_ORIGINS else 'null'
self.send_header('Access-Control-Allow-Origin', cors_origin)
```

---

## HTTPS

✅ **TODA a API está disponível via HTTPS.** Não há problemas de mixed content.

### Cadeia de TLS:

```
Cliente HTTPS → Cloudflare Edge (TLS 1.3) → Cloudflare Tunnel → nginx (HTTP local) → backend Python (HTTP local)
```

### Pontos de atenção:

| Item | Status |
|---|---|
| Certificado válido | ✅ Cloudflare gerencia automaticamente |
| Mixed content | ✅ Não — tudo HTTPS na borda |
| HSTS | ✅ Cloudflare habilita por padrão |
| `http://` fallback | ⚠️ Backend ainda escuta HTTP em 127.0.0.1:8645 (interno, OK) |
| Domínio dedicado | ❌ `gratidao.automacaojs.us` ainda não existe |

### Como o frontend deve chamar:

```typescript
// ✅ CORRETO
const API_BASE = 'https://preview.automacaojs.us/21-dias-gratidao/api'

// ❌ ERRADO (mixed content se frontend for HTTPS)
const API_BASE = 'http://preview.automacaojs.us/21-dias-gratidao/api'

// ❌ ERRADO (subdomínio não existe)
const API_BASE = 'https://gratidao.automacaojs.us/api'
```

---

## Limitação conhecida: HEAD request

A API responde apenas a `GET` e `POST`. `HEAD` (curl -I) retorna 501 porque nginx não tem handler explícito.

**Não é bug — é só curiosidade.** Frontend não faz HEAD em APIs REST normais.

---

## Resumo

- ✅ CORS liberado pra qualquer origem (precaução: restringir antes de lançar comercial)
- ✅ HTTPS válido ponta-a-ponta
- ✅ Sem mixed content
- ❌ Domínio dedicado `gratidao.automacaojs.us` ainda não provisionado
