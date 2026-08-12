# 🏭 Fábrica de Aplicativos (AutomaçãoJS)

Monorepo central de todos os apps comerciais criados por Isaías Silva.

## Apps atuais

| Slug | Título | Categoria | URL | Repo local |
|---|---|---|---|---|
| `21-dias-gratidao` | 21 Dias de Gratidão | desenvolvimento-pessoal | https://preview.automacaojs.us/21-dias-gratidao/ | `apps/21-dias-gratidao/` |

## Como adicionar um novo app

### 1. Criar pasta em `apps/<slug>/`

```bash
cp -r apps/_template apps/<slug>
cd apps/<slug>
# editar package.json, vite.config.ts, src/, etc
```

### 2. Aplicar migrations específicas

```bash
cp apps/_template/api/app_template.sql migrations/app_<slug>.sql
# editar para o seu slug
psql "$SUPABASE_DB_URL" -f migrations/app_<slug>.sql
```

### 3. Cadastrar no catálogo central

```sql
INSERT INTO public.app_factory (slug, title, book_slug, ...)
VALUES ('<slug>', '<título>', '<slug>', ...);
```

### 4. Backend Python (porta única por app)

```bash
GRATIDAO_PORT=8645 python3 api/<slug>_server.py   # se for outro app, porta diferente
```

### 5. Nginx — adicionar location

Em `/etc/nginx/preview-only.conf`, dentro do server block do `preview.automacaojs.us`:

```nginx
location /<slug>/api/ {
    proxy_pass http://127.0.0.1:<PORTA>/;
    # ...
}
location /<slug>/ {
    alias /var/www/preview/<slug>/;
    try_files $uri $uri/ /index.html;
}
```

### 6. Systemd service

```bash
sudo cp infra/systemd/app-template.service /etc/systemd/system/<slug>-api.service
# editar ExecStart pra apontar pro novo backend
sudo systemctl daemon-reload
sudo systemctl enable --now <slug>-api.service
```

## Infraestrutura compartilhada

- **Supabase:** `yfnzlowtgnlqizobnslh.supabase.co` (mesmo projeto, tabelas isoladas por prefixo)
- **LLM gateway:** perfil `fabrica` do Hermes (`http://127.0.0.1:8642/v1/chat/completions`)
- **RAG:** `match_ebook_pages` RPC no Supabase (mesma function)
- **Embeddings:** BGE-small-en-v1.5 (mesmo modelo do Leitor)
- **Deploy:** `preview.automacaojs.us/<slug>/` + Cloudflare Tunnel

## Migrations centralizadas

- `migrations/migration_app_factory.sql` — tabela central `app_factory` (executar 1x)
- `migrations/app_<slug>.sql` — tabelas específicas de cada app

## Cérebro compartilhado (Professor IA)

Todos os apps usam o mesmo gateway LLM (perfil `fabrica`) com prompts específicos por app injetados via `system_prompt` no payload.
