-- =============================================================
-- APP: 20 DIAS PARA CURAR A SUA VIDA — Bourbeau
-- Migration específica do app (cataloga isolado por prefixo)
-- =============================================================

CREATE TABLE IF NOT EXISTS public.curar_vida_progress (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id text NOT NULL,
    unit_number integer NOT NULL,                -- "dia" 1..21
    completed boolean NOT NULL DEFAULT false,
    reflection_text text,
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE (device_id, unit_number)
);

CREATE INDEX IF NOT EXISTS idx_curar_vida_progress_device
    ON public.curar_vida_progress (device_id);

ALTER TABLE public.curar_vida_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS curar_vida_progress_public ON public.curar_vida_progress;
CREATE POLICY curar_vida_progress_public ON public.curar_vida_progress
    FOR ALL
    USING (true)
    WITH CHECK (true);

CREATE TABLE IF NOT EXISTS public.curar_vida_chat_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id text NOT NULL,
    unit_number integer NOT NULL,
    role text NOT NULL CHECK (role IN ('user', 'assistant')),
    content text NOT NULL,
    pages_cited integer[],
    created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_curar_vida_chat_device_unit
    ON public.curar_vida_chat_history (device_id, unit_number, created_at DESC);

ALTER TABLE public.curar_vida_chat_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS curar_vida_chat_public ON public.curar_vida_chat_history;
CREATE POLICY curar_vida_chat_public ON public.curar_vida_chat_history
    FOR ALL
    USING (true)
    WITH CHECK (true);
