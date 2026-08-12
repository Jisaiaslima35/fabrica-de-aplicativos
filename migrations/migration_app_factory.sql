-- =============================================================
-- FÁBRICA DE APLICATIVOS — tabela central (AutomaçãoJS)
-- Data: 12/08/2026
-- Autor: Isaías Silva <operajose343@gmail.com>
--
-- Cada app comercial da fábrica tem:
--   1) UMA row nesta tabela (catálogo + metadata)
--   2) Suas próprias tabelas específicas prefixadas com <slug>_
--
-- Hoje: 21-dias-gratidao
-- Amanhã: qualquer e-book vira 1 row aqui + tabelas específicas
-- =============================================================

CREATE TABLE IF NOT EXISTS public.app_factory (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identificação
    slug text UNIQUE NOT NULL,                  -- ex: '21-dias-gratidao'
    title text NOT NULL,                        -- ex: '21 Dias de Gratidão'
    subtitle text,                              -- ex: 'Uma jornada de 21 dias...'
    description text,
    author text,                                -- autor do material base

    -- Capa e mídia
    cover_url text,                             -- capa principal (PWA + loja)
    icon_url text,                              -- ícone PWA 192x192
    banner_url text,                            -- banner horizontal (marketing)

    -- Metadados do livro / conteúdo
    book_slug text,                             -- FK lógica pra ebooks.slug (quando aplicável)
    category text,                              -- ex: 'desenvolvimento-pessoal', 'espiritualidade'
    language text DEFAULT 'pt-BR',
    total_units integer DEFAULT 21,             -- "dias", "capítulos", "módulos"

    -- Professor IA (cérebro compartilhado)
    professor_persona text,                     -- trecho do SOUL.md específico deste app
    rag_book_slug text,                         -- qual slug indexar no RAG (pode == book_slug)
    rag_match_count integer DEFAULT 5,          -- quantos chunks retornar por pergunta

    -- Status comercial
    is_published boolean DEFAULT false,         -- aparece no app?
    is_free boolean DEFAULT true,               -- tem paywall?
    price_cents integer DEFAULT 0,              -- preço em centavos (Cakto/Kiwify)
    kiwify_product_id text,                     -- ID do produto na Kiwify
    cakto_product_id text,                      -- ID do produto na Cakto

    -- Endpoints
    api_base_url text,                          -- ex: 'https://gratidao.automacaojs.us/api'
    pwa_url text,                               -- ex: 'https://gratidao.automacaojs.us/'
    repo_url text,                              -- ex: 'https://github.com/Jisaiaslima35/21-dias-gratidao'

    -- Controle
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    created_by text DEFAULT 'isaias',           -- quem criou
    notes text                                  -- anotações livres do Isaías
);

CREATE INDEX IF NOT EXISTS idx_app_factory_published
    ON public.app_factory (is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_app_factory_slug
    ON public.app_factory (slug);

ALTER TABLE public.app_factory ENABLE ROW LEVEL SECURITY;

-- Política pública de leitura (a loja precisa listar sem auth)
DROP POLICY IF EXISTS app_factory_read ON public.app_factory;
CREATE POLICY app_factory_read ON public.app_factory
    FOR SELECT
    USING (true);

-- Apenas service_role pode escrever (via backend Python)
DROP POLICY IF EXISTS app_factory_admin ON public.app_factory;
CREATE POLICY app_factory_admin ON public.app_factory
    FOR ALL
    USING (current_setting('role', true) = 'service_role');

-- Trigger pra atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS app_factory_touch ON public.app_factory;
CREATE TRIGGER app_factory_touch
    BEFORE UPDATE ON public.app_factory
    FOR EACH ROW
    EXECUTE FUNCTION public.touch_updated_at();

-- View útil: lista de apps publicados com campos essenciais
CREATE OR REPLACE VIEW public.app_factory_public AS
SELECT
    slug, title, subtitle, description, author,
    cover_url, icon_url, banner_url,
    category, language, total_units,
    is_free, price_cents,
    pwa_url, repo_url,
    created_at, updated_at
FROM public.app_factory
WHERE is_published = true
ORDER BY created_at DESC;

COMMENT ON TABLE public.app_factory IS
    'Catálogo central de todos os apps da Fábrica de Aplicativos (AutomaçãoJS). Cada app = 1 row aqui + tabelas específicas prefixadas com <slug>_.';
COMMENT ON VIEW public.app_factory_public IS
    'View pública: apenas apps publicados, com campos amigáveis pra UI.';
