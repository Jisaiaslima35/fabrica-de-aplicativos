-- =============================================================
-- PUSH NOTIFICATIONS - subscriptions + log
-- Tabela central para gerenciar web push em TODOS os apps
-- da Fábrica de Aplicativos (multi-app futuro).
-- Data: 12/08/2026 - Autor: Isaías Silva <operajose343@gmail.com>
-- =============================================================

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  app_slug TEXT NOT NULL,
  device_id TEXT NOT NULL,
  endpoint TEXT NOT NULL UNIQUE,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  locale TEXT DEFAULT 'pt-BR',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_sent_at TIMESTAMPTZ,
  UNIQUE(app_slug, device_id)
);

CREATE INDEX IF NOT EXISTS idx_push_subs_app_active
  ON push_subscriptions(app_slug, is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint
  ON push_subscriptions(endpoint);

-- Log de envios (auditoria)
CREATE TABLE IF NOT EXISTS push_send_log (
  id BIGSERIAL PRIMARY KEY,
  app_slug TEXT NOT NULL,
  subscription_id BIGINT REFERENCES push_subscriptions(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  url TEXT,
  status_code INT,
  success BOOLEAN,
  error TEXT,
  sent_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_push_log_app_sent
  ON push_send_log(app_slug, sent_at DESC);

-- RLS
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_send_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role only push_subs"
  ON push_subscriptions FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "service role only push_log"
  ON push_send_log FOR ALL TO service_role USING (true) WITH CHECK (true);

-- Trigger touch updated_at
CREATE OR REPLACE FUNCTION touch_updated_at_push()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_push_subs_touch ON push_subscriptions;
CREATE TRIGGER trg_push_subs_touch
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at_push();