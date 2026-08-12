# App: <slug> — <título>

App da Fábrica de Aplicativos (AutomaçãoJS).

## Setup

```bash
# 1. Aplicar migrations específicas deste app
psql "$SUPABASE_DB_URL" -f ../../migrations/app_template.sql

# 2. Processar PDF do livro (quando aplicável)
python3 api/process_pdf.py

# 3. Instalar deps
npm install

# 4. Build
npm run build
```

## Deploy

- PWA em `https://preview.automacaojs.us/<slug>/`
- API em `https://preview.automacaojs.us/<slug>/api/`

## Estrutura

```
apps/<slug>/
├── api/           # Backend Python (RAG + chat)
├── src/           # Frontend React/Vite
├── public/        # Ícones PWA
└── dist/          # Build output
```
