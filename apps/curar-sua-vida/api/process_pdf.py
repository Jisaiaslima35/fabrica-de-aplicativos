#!/usr/bin/env python3
"""Processa o PDF do '20 Dias para Curar a Sua Vida' (Lise Bourbeau) e indexa no Supabase.

Gera:
- 1 row em `ebooks` com slug=curar-sua-vida
- N rows em `ebook_pages` com texto + embedding BGE-small-en
- capa extraída (PyMuPDF) e salva no Storage
"""
import json, sys, os, hashlib
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
import urllib.parse

# Carrega credenciais Supabase
SECRETS = {}
for line in Path('/root/.hermes/secrets/leitor-supabase.env').read_text().splitlines():
    line = line.strip()
    if line and not line.startswith('#') and '=' in line:
        SECRETS[line.split('=', 1)[0]] = line.split('=', 1)[1]

SUPABASE_URL = SECRETS['SUPABASE_URL']
SR = SECRETS['SUPABASE_SERVICE_ROLE']

BOOK_SLUG = 'curar-sua-vida'
BOOK_TITLE = '20 dias para curar a sua vida — Aprenda a se amar trabalhando com o espelho'
BOOK_AUTHOR = 'Lise Bourbeau'

PDF_PATH = Path('source.pdf')

def supabase(method, path, body=None, headers=None):
    h = {
        'apikey': SR,
        'Authorization': f'Bearer {SR}',
        'Content-Type': 'application/json',
    }
    if headers:
        h.update(headers)
    req = Request(f'{SUPABASE_URL}{path}', method=method, headers=h)
    if body is not None:
        body_bytes = json.dumps(body).encode()
    else:
        body_bytes = None
    try:
        with urlopen(req, data=body_bytes, timeout=60) as r:
            txt = r.read().decode()
            return json.loads(txt) if txt else {}
    except HTTPError as e:
        body = e.read().decode() if e.fp else ''
        print(f'[HTTP {e.code}] {method} {path}: {body[:300]}', file=sys.stderr)
        raise

def main():
    import fitz  # PyMuPDF
    print(f'[1/5] abrindo {PDF_PATH}...', flush=True)
    doc = fitz.open(PDF_PATH)
    total_pages = doc.page_count
    print(f'[1/5] {total_pages} páginas detectadas', flush=True)

    # 2) criar ebook row
    print(f'[2/5] criando ebook row slug={BOOK_SLUG}...', flush=True)
    existing = supabase('GET', f'/rest/v1/ebooks?select=id&slug=eq.{BOOK_SLUG}')
    if existing:
        ebook_id = existing[0]['id']
        print(f'[2/5] já existe: {ebook_id}', flush=True)
    else:
        rows = supabase('POST', '/rest/v1/ebooks', body={
            'slug': BOOK_SLUG,
            'title': BOOK_TITLE,
            'author': BOOK_AUTHOR,
            'total_pages': total_pages,
            'description': 'Jornada de 21 dias para aprender a se amar na prática, trabalhando com o espelho como ferramenta de autoconhecimento.',
            'pdf_storage_path': f'{BOOK_SLUG}/source.pdf',
            'is_published': True,
        }, headers={'Prefer': 'return=representation'})
        ebook_id = rows[0]['id']
        print(f'[2/5] criado: {ebook_id}', flush=True)

    # 3) extrair texto por página
    print(f'[3/5] extraindo texto + gerando embeddings...', flush=True)
    from fastembed import TextEmbedding
    embedder = TextEmbedding(model_name='BAAI/bge-small-en-v1.5')
    pages_data = []
    for i in range(total_pages):
        page_obj = doc[i]
        text = page_obj.get_text().strip()
        if not text or len(text) < 20:
            continue
        # truncar pra embedding (limite ~512 tokens)
        embed_input = text[:1500]
        vec = next(embedder.embed([embed_input])).tolist()
        pages_data.append({
            'ebook_id': ebook_id,
            'page_number': i + 1,
            'page_text': text[:8000],  # limite do schema
            'embedding': vec,
        })
        if (i + 1) % 20 == 0:
            print(f'  processadas {i+1}/{total_pages}', flush=True)
    print(f'[3/5] {len(pages_data)} páginas com texto extraído', flush=True)

    # 4) inserir em ebook_pages (em batch pra evitar timeout)
    print(f'[4/5] inserindo {len(pages_data)} rows em ebook_pages...', flush=True)
    # Limpa páginas existentes deste ebook
    supabase('DELETE', f'/rest/v1/ebook_pages?ebook_id=eq.{ebook_id}')

    BATCH = 20
    for i in range(0, len(pages_data), BATCH):
        batch = pages_data[i:i+BATCH]
        try:
            supabase('POST', '/rest/v1/ebook_pages', body=batch)
            print(f'  batch {i//BATCH + 1}: {len(batch)} rows OK', flush=True)
        except Exception as e:
            print(f'  batch {i//BATCH + 1} FALHOU: {e}', file=sys.stderr)
            # tenta 1 a 1
            for row in batch:
                try:
                    supabase('POST', '/rest/v1/ebook_pages', body=[row])
                except Exception as e2:
                    print(f'    p{row["page_number"]}: {e2}', file=sys.stderr)
    print(f'[4/5] OK', flush=True)

    # 5) capa automática (PyMuPDF heurística)
    print(f'[5/5] extraindo capa...', flush=True)
    cover_path = '/tmp/curar-vida-cover.jpg'
    try:
        import sys
        sys.path.insert(0, '/root/projetos/leitor-inteligente/api')
        from cover_extractor import extract_cover
        url = extract_cover(str(PDF_PATH), cover_path)
        print(f'[5/5] capa extraída p.{url}', flush=True)
    except Exception as e:
        print(f'[5/5] capa falhou: {e} (continuando sem capa)', file=sys.stderr)

    print(f'\nDONE. ebook_id={ebook_id}, {len(pages_data)} páginas indexadas.')

if __name__ == '__main__':
    main()
