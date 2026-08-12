# Endpoints

Base URL: `https://preview.automacaojs.us/21-dias-gratidao/api`

⚠️ **Migração futura:** a API será movida para `https://gratidao.automacaojs.us/api` assim que o domínio dedicado for provisionado. Hoje ainda não existe (gera 503).

---

## 1. `GET /health`

Sanity check. Útil para o frontend piscar o "AO VIVO" e detectar offline.

**Resposta (HTTP 200):**
```json
{
  "ok": true,
  "service": "gratidao-rag"
}
```

**Latência típica:** 0.12s

**Uso recomendado:**
```typescript
async function checkHealth() {
  try {
    const r = await fetch(`${API_BASE}/health`)
    return r.ok
  } catch {
    return false
  }
}
```

---

## 2. `GET /content/<day>`

Retorna o texto bruto do PDF do livro correspondente ao dia (1-21).

**Parâmetros:**
| Nome | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `day` | int (1-21) | ✅ | Número do dia |

**Resposta (HTTP 200):**
```json
{
  "day": 5,
  "content": "Día 5. Tres ángeles de la Guarda\n\n[texto completo das páginas do livro que falam do dia 5, em espanhol]",
  "pages": [0, 25, 36]
}
```

| Campo | Tipo | Descrição |
|---|---|---|
| `day` | int | Eco do dia solicitado |
| `content` | string | Texto completo concatenado de todas as páginas que falam deste dia (espa [... truncated]