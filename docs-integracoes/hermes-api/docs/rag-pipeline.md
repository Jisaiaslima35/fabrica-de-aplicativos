# RAG (Retrieval-Augmented Generation)

Como o conteúdo do livro "21 Días para Desarrollar la Gratitud" é indexado, recuperado e usado para responder.

---

## Visão geral da cadeia

```
┌─────────────────┐
│ PDF original    │  doc_484cc22e06e5_21_días_para_desarrollar_la_gratitud.pdf
│ (68 páginas,    │  apps/21-dias-gratidao/source.pdf
│  espanhol)      │
└────────┬────────┘
         │ process_pdf.py
         ▼
┌─────────────────┐
│ Extração página │  PyMuPDF (fitz) extrai texto página por página
│ a página        │  Filtra páginas com <100 chars (29 descartadas)
└────────┬────────┘
         │ 39 páginas úteis
         ▼
┌─────────────────┐
│ Embeddings      │  BAAI/bge-small-en-v1.5 (384 dimensões, multilingual)
│                 │  via fastembed (rodando localmente, sem API key)
└────────┬────────┘
         │ vetor de 384 floats
         ▼
┌─────────────────┐
│ Supabase        │  Projeto: yfnzlowtgnlqizobnslh
│ (pgvector)      │  Tabela: ebook_pages
│                 │  RPC: match_ebook_pages(query_embedding, match_ebook_slug, match_count)
└────────┬────────┘
         │ top-5 chunks por similaridade cosseno
         ▼
┌─────────────────┐
│ Backend Python  │  Monta prompt: <livro> + <dia> + <texto> + <pergunta>
│ gratidao_server │  Adiciona persona "Professor IA" como system prompt
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Hermes Gateway  │  http://127.0.0.1:8642/v1/chat/completions
│ (perfil padrão) │  Modelo: hermes-agent
│                 │  MINIMAX_API_KEY (token-plan compartilhado)
└────────┬────────┘
         │ texto em PT-BR
         ▼
┌─────────────────┐
│ Resposta JSON   │  {answer, pages, chunks_count}
└─────────────────┘
```

---

## Componentes

### 1. PDF original

- **Arquivo:** `apps/21-dias-gratidao/source.pdf`
- **Páginas totais:** 68 (incluindo capa, sumário, exercício final)
- **Idioma:** espanhol
- **Páginas úteis indexadas:** 39 (filtro de <100 chars aplicado)
- **Detecção automática de dias:** regex `Día\s*(\d{1,2})\b` matching em todas as páginas

### 2. Extração de texto

- **Biblioteca:** PyMuPDF (fitz)
- **Como:** `apps/21-dias-gratidao/api/process_pdf.py`
- **Chunk-by-page:** cada página vir [... truncated]