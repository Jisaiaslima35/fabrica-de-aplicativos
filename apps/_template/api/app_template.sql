-- =============================================================
-- TEMPLATE — tabelas para novo app da Fábrica de Aplicativos
-- Copie este arquivo, renomeie pra app_<slug>.sql e ajuste.
-- =============================================================

CREATE TABLE IF NOT EXISTS public.<slug>_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id text NOT NULL,
    unit_number integer NOT NULL,                -- "dia", "capítulo", "módulo"
    completed boolean NOT NULL DEFAULT false,
    reflection_text text,
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (device_id, unit_number)
);

CREATE INDEX IF NOT EXISTS idx_<slug>_progress_device
    ON public.<slug>_progress (device_id);

ALTER TABLE public.<slug>_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS <slug>_progress_public ON public.<slug>_progress;
CREATE POLICY <slug>_progress_public ON public.<slug>_progress
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.<slug>_chat_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id text NOT NULL,
    unit_number integer NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    pages_cited integer[],
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_<slug>_chat_device_unit
    ON public.<slug>_chat_history (device_id, unit_number, created_at DESC);

ALTER TABLE public.<slug>_chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS <slug>_chat_public ON public.<slug>_chat_history;
CREATE POLICY <slug>_chat_public ON public.<slug>_chat_history
    FOR ALL
    USING (true)
    WITH CHECK (true);
