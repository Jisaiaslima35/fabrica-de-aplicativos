# 📚 Docs de Integração Externa

Documentação técnica para integração de apps externos (Lovable, Google AI Studio,
v0, Cursor, qualquer IA) com os backends da fábrica de aplicativos.

## Apps documentados

| App | Slug | Documentação |
|---|---|---|
| 21 Dias de Gratidão | `21-dias-gratidao` | [hermes-api/](hermes-api/README.md) |

## Adicionando novo app

1. Criar pasta `docs-integracoes/<slug>/`
2. Estrutura sugerida:
   ```
   docs-integracoes/<slug>/
   ├── README.md          # visão geral + spec resumida
   ├── CHANGELOG.md
   ├── openapi.yaml       # OpenAPI 3.0 (Postman/Insomnia)
   ├── docs/              # docs detalhadas (endpoints, auth, RAG, etc.)
   └── examples/          # TS/HTML/JS de exemplo
   ```
3. Atualizar este README adicionando linha na tabela.
