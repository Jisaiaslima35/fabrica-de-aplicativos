# Perfis Hermes

Hermes Agent suporta **múltiplos perfis isolados** (cada um com persona, skills, memória e rate limits próprios).

---

## Perfil dedicado: `fabrica`

Para o app 21-dias-gratidao, existe um perfil específico:

| Atributo | Valor |
|---|---|
| Nome | `fabrica` |
| Caminho na VPS | `/root/.hermes/profiles/fabrica/` |
| Persona (SOUL.md) | "Professor IA — cérebro pedagógico compartilhado" |
| Função | Atende TODOS os apps comerciais da Fábrica de Aplicativos |
| Status | ✅ Ativo |

### Como o perfil é ativado?

O **backend do app** (não o frontend) injeta o `system_prompt` específico do Professor IA em **toda** chamada ao gateway Hermes. O frontend não precisa conhecer o nome do perfil.

### Outros perfis disponíveis na VPS

```
/root/.hermes/profiles/
├── default/              ← perfil Hermes geral (este agente)
├── fabrica/              ← Professor IA, cérebro compartilhado
├── chat-radio-locutor/   ← locutor das rádios
├── dr-matheus-dore/      ← agente do Dr. Matheus Dore
├── dr-pedro-dermato/     ← dermatologia
├── dra-ana-odonto/       ← odontologia
├── google-studio-radio/  ← integração com Google Studio
├── leitor-inteligente/   ← Leitor de PDF
├── radio-libertacao/     ← Rádio Libertação
└── radio-louvor-gratidao/ ← Rádio Louvor & Gratidão
```

---

## Como separar/grudar perfis no backend atual

O backend `gratidao_server.py` **NÃO** aceita um campo `profile` no JSON. A persona do Professor IA tá hardcoded no `PROFESSOR_PROMPT` (linhas 49-63 do arquivo).

### Recomendação para multi-perfil

**Adicionar campo `profile` no payload:**

```json
{
  "question": "Qual o exercício do Dia 5?",
  "day": 5,
  "day_title": "Primeiro anjo da guarda",
  "profile": "fabrica"  // ← NOVO
}
```

**Backend switchar system prompt:**

```python
# No if do_POST('/chat'):
profile = payload.get('profile', 'fabrica')
system_prompt = load_profile_prompt(profile)

messages = [
    {'role': 'system', 'content': system_prompt},
    {'role': 'user', 'content': user_msg},
]
```

**Prós:** flexível, suporta múltiplos apps sem mudar backend.
**Contras:** adiciona 1 parâmetro no contrato.

---

## bookSlug (interno)

| Atributo | Valor |
|---|---|
| `book_slug` | `21-dias-gratidao` |
| Tabela central | `app_factory` no Supabase (`rag_book_slug = '21-dias-gratidao'`) |

**Não é necessário o frontend enviar `book_slug` no request.** O backend usa o slug fixo.

### Tornar multi-livro no futuro

```json
{
  "question": "Qual o exercício do Dia 5?",
  "day": 5,
  "book_slug": "21-dias-gratidao"  // ← NOVO, substitui o hardcoded
}
```

```python
# No backend:
BOOK_SLUG = payload.get('book_slug', '21-dias-gratidao')
chunks = rag_search(question, BOOK_SLUG, 5)
```

A tabela `app_factory` no Supabase já tem um campo `rag_book_slug` que mapeia cada app pro seu livro. Quando criar novo app, só inserir 1 row lá.
