#!/usr/bin/env python3
"""21 Dias de Gratidão - Backend RAG + chat + conteúdo de página.

Porta 8645.
- POST /chat          → pergunta ao Professor IA (RAG + LLM)
- GET  /content/<day> → texto da página do livro do dia
- GET  /health        → sanity

Professor IA usa o gateway Hermes (perfil default 8642) com persona "Professor IA".
"""
import json, os, sys, logging
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from functools import lru_cache
import threading

logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s [gratidao-rag] %(message)s')
log = logging.getLogger('gratidao-rag')

# ====== CONFIG ======
SUPABASE_ENV = {}
for line in Path('/root/.hermes/secrets/leitor-supabase.env').read_text().splitlines():
    line = line.strip()
    if line and not line.startswith('#') and '=' in line:
        SUPABASE_ENV[line.split('=', 1)[0]] = line.split('=', 1)[1]
SUPABASE_URL = SUPABASE_ENV['SUPABASE_URL']
SR = SUPABASE_ENV['SUPABASE_SERVICE_ROLE']

HERMES_GATEWAY = 'http://127.0.0.1:8642/v1/chat/completions'
KEY = ''
for line in Path('/root/.hermes/.env').read_text().splitlines():
    if line.startswith('API_SERVER_KEY='):
        KEY = line.split('=', 1)[1]
        break
if not KEY:
    sys.exit('API_SERVER_KEY ausente')

BOOK_SLUG = '21-dias-gratidao'
PDF_PATH = Path(__file__).parent.parent / 'source.pdf'

# ====== PERSONA PROFESSOR IA ======
PROFESSOR_PROMPT = '''Você é o Professor IA do app "21 Dias de Gratidão" — um professor paciente, didático, acolhedor e profundamente humano.

Sua missão: ajudar o usuário a refletir sobre o conteúdo de cada um dos 21 dias do livro "21 Días para Desarrollar la Gratitud" de Octavio Déniz.

REGRAS INEGOCIÁVEIS:
1. Responda SEMPRE em português do Brasil (PT-BR), com tom caloroso e natural.
2. Use EXCLUSIVAMENTE o contexto fornecido abaixo — não invente, não use conhecimento externo.
3. Cite páginas no formato "📖 pág. X" sempre que possível (1-3 citações por resposta).
4. Seja CONCISO: no máximo 4 parágrafos curtos (3-5 frases cada).
5. Termine sempre com UMA pergunta aberta que convide à reflexão.
6. Se o contexto não contiver a resposta, diga honestamente e sugira recarregar o app.
7. Você é um professor, não um robô. Use linguagem natural, em primeira pessoa, com leveza.
8. NUNCA use listas numeradas frias. Prefira prosa contínua.
9. NUNCA prometa cura/tratamento/resultado garantido.
10. Se perguntarem algo fora do livro, redirecione gentilmente para o conteúdo do dia atual.

Tom: encorajador, paciente, celebra o progresso do usuário mesmo em pequenos passos.'''

# ====== EMBEDDER (lazy) ======
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

# ====== PDF (lazy) + DETECÇÃO AUTOMÁTICA DE DIAS ======
_PDF_DOC = None
_DAY_MAP = None  # {day_num: [(page_idx, text), ...]}

def _get_pdf():
    global _PDF_DOC
    if _PDF_DOC is None:
        import fitz
        _PDF_DOC = fitz.open(str(PDF_PATH))
        log.info(f'PDF carregado: {_PDF_DOC.page_count} páginas')
    return _PDF_DOC

def _detect_day_map():
    """Auto-detecta quais páginas falam de cada dia pelo marcador 'Día N' no texto."""
    global _DAY_MAP
    if _DAY_MAP is not None:
        return _DAY_MAP
    doc = _get_pdf()
    import re
    mapping = {i: [] for i in range(1, 22)}  # day 1..21
    for idx in range(doc.page_count):
        text = doc[idx].get_text()
        # Procura marcadores do tipo "Día 1", "Día 12", etc.
        matches = re.findall(r'[Dd]ía\s*(\d{1,2})\b', text)
        if matches:
            day_nums = sorted({int(m) for m in matches if 1 <= int(m) <= 21})
            for d in day_nums:
                if not mapping[d]:
                    mapping[d] = []
                mapping[d].append(idx)
    _DAY_MAP = mapping
    log.info(f'Mapa de dias detectado: ' + ', '.join(f'D{k}={len(v)}p' for k,v in mapping.items() if v))
    return _DAY_MAP

def get_day_content(day: int) -> str:
    """Texto concatenado de todas as páginas que falam desse dia."""
    mapping = _detect_day_map()
    pages = mapping.get(day, [])
    if not pages:
        return ''
    doc = _get_pdf()
    parts = []
    for p in pages:
        parts.append(doc[p].get_text())
    return '\n\n---\n\n'.join(parts).strip()

# ====== RAG ======
@lru_cache(maxsize=128)
def rag_search(question: str, k: int = 5):
    """Busca k chunks mais similares via match_ebook_pages."""
    vec = next(embedder().embed([question])).tolist()
    vec_str = '[' + ','.join(str(x) for x in vec) + ']'
    body = json.dumps({
        'query_embedding': vec_str,
        'match_ebook_slug': BOOK_SLUG,
        'match_count': k,
    }).encode()
    req = Request(
        f'{SUPABASE_URL}/rest/v1/rpc/match_ebook_pages',
        method='POST',
        headers={'apikey': SR, 'Authorization': f'Bearer {SR}', 'Content-Type': 'application/json'},
        data=body,
    )
    with urlopen(req, timeout=30) as r:
        result = json.loads(r.read())
        log.info(f'RAG "{question[:50]}..." → {len(result)} chunks, páginas={[c["page_number"] for c in result]}')
        return result

# ====== LLM ======
def call_llm(messages):
    body = json.dumps({'model': 'hermes-agent', 'messages': messages, 'temperature': 0.7, 'max_tokens': 900}).encode()
    req = Request(
        HERMES_GATEWAY,
        method='POST',
        headers={'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'},
        data=body,
    )
    with urlopen(req, timeout=120) as r:
        return json.loads(r.read())

# ====== HTTP ======
class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        try:
            log.info(f'{self.command} {self.path}')
        except Exception:
            pass

    def _send_json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._send_json(204, {})

    def do_GET(self):
        path = self.path
        if path == '/health' or path == '/health/':
            self._send_json(200, {'ok': True, 'service': 'gratidao-rag'})
            return
        if path.startswith('/content/'):
            try:
                day = int(path.split('/')[-1])
            except ValueError:
                self._send_json(400, {'error': 'invalid day'})
                return
            content = get_day_content(day)
            mapping = _detect_day_map()
            pages = mapping.get(day, [])
            self._send_json(200, {'day': day, 'content': content, 'pages': pages})
            return
        self._send_json(404, {'error': 'not found'})

    def do_POST(self):
        path = self.path
        if path != '/chat':
            self._send_json(404, {'error': 'not found'})
            return
        length = int(self.headers.get('Content-Length', 0))
        try:
            payload = json.loads(self.rfile.read(length)) if length else {}
        except Exception as e:
            self._send_json(400, {'error': f'bad json: {e}'})
            return

        question = (payload.get('question') or '').strip()
        if not question:
            self._send_json(400, {'error': 'question required'})
            return
        day = int(payload.get('day') or 1)
        day_title = payload.get('day_title') or ''
        day_content = (payload.get('day_content') or '').strip() or get_day_content(day)

        # RAG
        try:
            chunks = rag_search(question, k=5)
        except Exception as e:
            log.exception('RAG falhou')
            self._send_json(500, {'error': f'RAG failed: {e}'})
            return

        # Contexto pro LLM
        ctx_parts = []
        for c in chunks:
            ctx_parts.append(f'[📖 pág. {c["page_number"]}]\n{c.get("page_text", "")[:1200]}')
        rag_ctx = '\n\n---\n\n'.join(ctx_parts) if ctx_parts else '(nenhum trecho encontrado no RAG)'

        user_msg = f'''<livro>
{rag_ctx}
</livro>

<dia_atual>
Dia {day} — "{day_title}"
</dia_atual>

<texto_do_dia>
{day_content[:2500] if day_content else "(texto desta seção não detectado no PDF — pode ser uma seção visual/ilustrada)"}
</texto_do_dia>

<pergunta_usuario>
{question}
</pergunta_usuario>

Responda em português do Brasil, citando páginas quando relevante, e fechando com uma pergunta reflexiva.'''

        messages = [
            {'role': 'system', 'content': PROFESSOR_PROMPT},
            {'role': 'user', 'content': user_msg},
        ]

        try:
            llm_resp = call_llm(messages)
            answer = llm_resp['choices'][0]['message']['content']
        except HTTPError as e:
            log.error(f'LLM HTTP {e.code}: {e.read().decode()[:200]}')
            self._send_json(502, {'error': f'LLM gateway {e.code}'})
            return
        except URLError as e:
            log.error(f'LLM URL: {e}')
            self._send_json(502, {'error': f'LLM unreachable: {e.reason}'})
            return
        except Exception as e:
            log.exception('LLM falhou')
            self._send_json(500, {'error': f'LLM failed: {e}'})
            return

        pages_cited = sorted({c['page_number'] for c in chunks})
        self._send_json(200, {
            'answer': answer,
            'pages': pages_cited,
            'chunks_count': len(chunks),
        })


if __name__ == '__main__':
    PORT = int(os.environ.get('GRATIDAO_PORT', '8645'))
    _detect_day_map()  # pré-carrega pra detectar logo
    log.info(f'porta {PORT}, livro {BOOK_SLUG}, PDF {PDF_PATH}')
    srv = ThreadingHTTPServer(('127.0.0.1', PORT), Handler)
    srv.serve_forever()
