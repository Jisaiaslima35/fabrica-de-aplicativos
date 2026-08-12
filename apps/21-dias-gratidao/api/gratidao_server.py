#!/usr/bin/env python3
"""21 Dias de Gratidão - Backend RAG + chat.

Porta 8645. Recebe pergunta do app PWA, busca RAG no Supabase,
chama LLM (Hermes gateway 8642 com persona Professor IA) e responde.
"""
import json, os, sys
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError
from functools import lru_cache
import urllib.parse
import threading

# --- Config ---
SUPABASE_ENV = {}
for line in Path('/root/.hermes/secrets/leitor-supabase.env').read_text().splitlines():
    line = line.strip()
    if line and not line.startswith('#') and '=' in line:
        SUPABASE_ENV[line.split('=', 1)[0]] = line.split('=', 1)[1]

SUPABASE_URL = SUPABASE_ENV['SUPABASE_URL']
SR = SUPABASE_ENV['SUPABASE_SERVICE_ROLE']

# LLM gateway (Hermes perfil default)
HERMES_GATEWAY = 'http://127.0.0.1:8642/v1/chat/completions'
KEY = ''
for line in Path('/root/.hermes/.env').read_text().splitlines():
    if line.startswith('API_SERVER_KEY='):
        KEY = line.split('=', 1)[1]
        break
if not KEY:
    sys.exit('API_SERVER_KEY ausente')

# Embedder
_EMBEDDER = None
_EMBED_LOCK = threading.Lock()

def embedder():
    global _EMBEDDER
    if _EMBEDDER is None:
        with _EMBED_LOCK:
            if _EMBEDDER is None:
                from fastembed import TextEmbedding
                _EMBEDDER = TextEmbedding(model_name='BAAI/bge-small-en-v1.5')
    return _EMBEDDER

# System prompt do Professor IA (persona compartilhada)
PROFESSOR_PROMPT = '''Você é o Professor IA — um professor paciente, didático e acolhedor.
Sua missão: ajudar o usuário a refletir sobre o conteúdo do livro "21 Días para Desarrollar la Gratitud" de Octavio Déniz.

REGRAS:
1. Use EXCLUSIVAMENTE o contexto fornecido nos trechos abaixo (cada um vem de uma página específica do PDF).
2. Não invente, não use conhecimento externo.
3. Se o contexto não contiver a resposta, diga: "Não encontrei esse ponto no material disponível."
4. SEMPRE cite páginas no formato: 📖 pág. X
5. Responda em português do Brasil (a menos que o usuário pergunte em outro idioma).
6. Seja conciso (máx 4 parágrafos curtos).
7. Tom: encorajador, paciente, celebra o progresso.
8. NUNCA prometa cura/tratamento/resultado garantido.
9. Se perguntarem algo fora do livro, redirecione gentilmente para o conteúdo.

Trechos do livro (use APENAS estes como base):'''

# --- RAG ---
@lru_cache(maxsize=128)
def rag_search(question: str, slug: str, k: int = 5):
    """Busca k chunks mais similares via match_ebook_pages."""
    vec = next(embedder().embed([question])).tolist()
    vec_str = '[' + ','.join(str(x) for x in vec) + ']'
    body = json.dumps({
        'query_embedding': vec_str,
        'match_ebook_slug': slug,
        'match_count': k,
    }).encode()
    req = Request(
        f'{SUPABASE_URL}/rest/v1/rpc/match_ebook_pages',
        method='POST',
        headers={'apikey': SR, 'Authorization': f'Bearer {SR}', 'Content-Type': 'application/json'},
        data=body,
    )
    with urlopen(req, timeout=30) as r:
        return json.loads(r.read())

# --- LLM ---
def call_llm(messages):
    body = json.dumps({'model': 'hermes-agent', 'messages': messages, 'temperature': 0.7, 'max_tokens': 800}).encode()
    req = Request(
        HERMES_GATEWAY,
        method='POST',
        headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'},
        data=body,
    )
    with urlopen(req, timeout=60) as r:
        return json.loads(r.read())

# --- HTTP ---
class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args, **kwargs):
        pass  # silencia log padrão

    def _send(self, code, body):
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send(204, b'')

    def do_GET(self):
        if self.path.startswith('/health'):
            self._send(200, json.dumps({'ok': True, 'service': 'gratidao-rag'}).encode())
            return
        self._send(404, json.dumps({'error': 'not found'}).encode())

    def do_POST(self):
        if self.path == '/chat':
            length = int(self.headers.get('Content-Length', 0))
            payload = json.loads(self.rfile.read(length))
            question = payload.get('question', '').strip()
            if not question:
                self._send(400, json.dumps({'error': 'question required'}).encode())
                return
            day = payload.get('day', 0)
            day_title = payload.get('day_title', '')

            # RAG
            try:
                chunks = rag_search(question, '21-dias-gratidao', 5)
            except Exception as e:
                self._send(500, json.dumps({'error': f'RAG failed: {e}'}).encode())
                return

            # monta contexto
            ctx_lines = []
            pages_cited = []
            for c in chunks:
                ctx_lines.append(f'[pág. {c["page_number"]}]\n{c["page_text"][:1200]}')
                pages_cited.append(c['page_number'])

            user_msg_parts = []
            if day:
                user_msg_parts.append(f'[CONTEXTO: usuário está no Dia {day} — "{day_title}".]')
            user_msg_parts.append(f'[TRECHOS DO LIVRO RECUPERADOS VIA RAG]:\n\n' + '\n\n---\n\n'.join(ctx_lines))
            user_msg_parts.append(f'\n[PERGUNTA DO USUÁRIO]: {question}')

            messages = [
                {'role': 'system', 'content': PROFESSOR_PROMPT},
                {'role': 'user', 'content': '\n\n'.join(user_msg_parts)},
            ]

            # LLM
            try:
                llm_resp = call_llm(messages)
                answer = llm_resp['choices'][0]['message']['content']
            except HTTPError as e:
                self._send(502, json.dumps({'error': f'LLM gateway error: {e.code}'}).encode())
                return
            except Exception as e:
                self._send(500, json.dumps({'error': f'LLM failed: {e}'}).encode())
                return

            self._send(200, json.dumps({
                'answer': answer,
                'pages': sorted(set(pages_cited)),
                'chunks_count': len(chunks),
            }, ensure_ascii=False).encode())
            return

        self._send(404, json.dumps({'error': 'not found'}).encode())


if __name__ == '__main__':
    PORT = int(os.environ.get('GRATIDAO_PORT', '8645'))
    print(f'[gratidao-rag] porta {PORT}', flush=True)
    srv = ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    srv.serve_forever()
