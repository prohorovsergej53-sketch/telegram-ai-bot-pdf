-- Обновление промпта tenant 2: добавление правил из нового промпта (непротиворечащие)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET ai_settings = jsonb_set(
    ai_settings,
    '{system_prompt}',
    to_jsonb(REPLACE(
        ai_settings->>'system_prompt',
        'Ты — дружелюбный AI-помощник.',
        'Ты — дружелюбный AI-консьерж отеля «Династия» в Telegram.'
    ))
)
WHERE tenant_id = 2;