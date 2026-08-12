# Quickstart

## TL;DR

```typescript
const API_BASE = 'https://preview.automacaojs.us/21-dias-gratidao/api'

// 1. Perguntar
const res = await fetch(`${API_BASE}/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'Qual o exercício do Dia 5?',
    day: 5,
    day_title: 'Primeiro anjo da guarda',
  }),
})
const data = await res.json()
console.log(data.answer) // resposta em PT-BR
console.log(data.pages)  // [30, 59]
```

---

## Passo a passo

### 1. Carregar conteúdo do dia (mostrar ANTES do chat)

```typescript
const content = await fetch(`${API_BASE}/content/5`).then(r => r.json())
// → { day: 5, content: "...", pages: [...] }
```

Exibe o texto do livro primeiro, AÍ embaixo o chat do Professor.

### 2. Enviar pergunta (síncrono, 6-15s)

```json
POST /chat HTTP/1.1
Content-Type: application/json

{
  "question": "Qual o exercício do Dia 5?",
  "day": 5,
  "day_title": "Primeiro anjo da guarda"
}
```

### 3. Receber resposta

```json
{
  "answer": "O Dia 5 propõe um exercício especial...",
  "pages": [30, 59],
  "chunks_count": 2
}
```

Renderiza `answer` + mostra `pages` como "📖 Pág. 30, 59".

---

## Boas práticas

| ✅ Faça | ❌ Não faça |
|---|---|
| Mostre "Tô pensando..." durante request | Fique sem feedback durante 6-15s |
| Trate erros com mensagem amigável | Exiba stack trace pro usuário |
| Use timeout de 60s | Bloqueie UI sem timeout |
| Cache perguntas similares (opcional) | Faça request a cada caractere digitado |
| Mostre páginas citadas | Mostre JSON cru |

---

## Próximos passos

- [Endpoints completos](endpoints.md)
- [Autenticação](authentication.md)
- [CORS e HTTPS](cors-https.md)
- [RAG pipeline](rag-pipeline.md)
- [Perfis Hermes](profiles-hermes.md)
- [Erros e rate limit](errors-rate-limit.md)
- [Exemplos](../examples/)
