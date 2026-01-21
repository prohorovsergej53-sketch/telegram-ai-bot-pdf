-- Увеличиваем RAG top_k для tenant_id=2, чтобы мартовские чанки попадали в контекст

UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET ai_settings = jsonb_set(
  COALESCE(ai_settings, '{}'::jsonb),
  '{rag_topk_default}',
  '18'
)
WHERE tenant_id = 2;
