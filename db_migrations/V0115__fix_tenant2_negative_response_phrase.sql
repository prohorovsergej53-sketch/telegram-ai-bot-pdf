-- Заменяем негативную фразу "Пока не вижу точной информации" на нейтральную
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
SET ai_settings = jsonb_set(
    ai_settings, 
    '{system_prompt}', 
    to_jsonb(replace(
        ai_settings->>'system_prompt', 
        'Пока не вижу точной информации по этому вопросу.', 
        'К сожалению, у меня нет информации по этому вопросу.'
    ))
) 
WHERE tenant_id = 2;