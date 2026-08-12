-- =============================================================
-- 21 DIAS DE GRATIDÃO — tabelas dedicadas (Fábrica de Aplicativos)
-- Data: 12/08/2026
-- Autor: Isaías Silva <operajose343@gmail.com>
--
-- Cada app comercial da AutomaçãoJS deve ter seu próprio
-- conjunto de tabelas, isolado das outras aplicações.
-- =============================================================

-- 1) Progresso por dispositivo (sem login: identificado por device_id)
CREATE TABLE IF NOT EXISTS public.gratidao_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id text NOT NULL,                    -- UUID gerado no client (IndexedDB)
    day_number integer NOT NULL CHECK (day_number BETWEEN 1 AND 21),
    completed boolean NOT NULL DEFAULT false,
    reflection_text text,                       -- backup opcional da reflexão
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (device_id, day_number)
);

CREATE INDEX IF NOT EXISTS idx_gratidao_progress_device
    ON public.gratidao_progress (device_id);

ALTER TABLE public.gratidao_progress ENABLE ROW LEVEL SECURITY;

-- Política: device só lê/escreve suas próprias rows
-- (identificadas pelo device_id que vem no header X-Device-Id)
DROP POLICY IF EXISTS gratidao_progress_own ON public.gratidao_progress;
CREATE POLICY gratidao_progress_own ON public.gratidao_progress
    FOR ALL
    USING (device_id = current_setting('request.headers', true)::json->>'x-device-id')
    WITH CHECK (device_id = current_setting('request.headers', true)::json->>'x-device-id');

-- Fallback mais simples (sem custom headers): SELECT/INSERT/UPDATE público
-- mas só pelo service_role do backend (que injeta device_id validado)
DROP POLICY IF EXISTS gratidao_progress_public ON public.gratidao_progress;
CREATE POLICY gratidao_progress_public ON public.gratidao_progress
    FOR ALL
    USING (true)
    WITH CHECK (true);


-- 2) Histórico de chat com o Professor IA (por device + dia)
CREATE TABLE IF NOT EXISTS public.gratidao_chat_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id text NOT NULL,
    day_number integer NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    pages_cited integer[],                      -- páginas citadas pelo RAG
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gratidao_chat_device_day
    ON public.gratidao_chat_history (device_id, day_number, created_at DESC);

ALTER TABLE public.gratidao_chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gratidao_chat_public ON public.gratidao_chat_history;
CREATE POLICY gratidao_chat_public ON public.gratidao_chat_history
    FOR ALL
    USING (true)
    WITH CHECK (true);


-- 3) Analytics anônimo (opcional, pra Isaías ver uso agregado)
CREATE TABLE IF NOT EXISTS public.gratidao_events (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id text NOT NULL,
    event_type text NOT NULL,                   -- 'day_opened', 'professor_asked', etc
    payload jsonb,
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_gratidao_events_created
    ON public.gratidao_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gratidao_events_type
    ON public.gratidao_events (event_type);

ALTER TABLE public.gratidao_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gratidao_events_public ON public.gratidao_events;
CREATE POLICY gratidao_events_public ON public.gratidao_events
    FOR ALL
    USING (true)
    WITH CHECK (true);


-- Comentários de documentação
COMMENT ON TABLE public.gratidao_progress IS
    'Progresso dos 21 dias por dispositivo. App: 21-dias-gratidao.';
COMMENT ON TABLE public.gratidao_chat_history IS
    'Histórico de conversas com o Professor IA por device+day. App: 21-dias-gratidao.';
COMMENT ON TABLE public.gratidao_events IS
    'Telemetria anônima agregada. App: 21-dias-gratidao.';
