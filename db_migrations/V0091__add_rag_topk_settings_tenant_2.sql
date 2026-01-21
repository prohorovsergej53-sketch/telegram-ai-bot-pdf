-- Добавляем RAG top_k настройки для тенанта ID-2 (Династия Крым)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
SET ai_settings = jsonb_set(
  jsonb_set(
    COALESCE(ai_settings, '{}'::jsonb), 
    '{rag_topk_default}', 
    '12'::jsonb
  ), 
  '{rag_topk_fallback}', 
  '15'::jsonb
)
WHERE tenant_id = 2;