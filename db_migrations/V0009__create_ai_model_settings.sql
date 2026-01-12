CREATE TABLE IF NOT EXISTS t_p56134400_telegram_ai_bot_pdf.ai_model_settings (
    id SERIAL PRIMARY KEY,
    model VARCHAR(50) NOT NULL DEFAULT 'yandexgpt',
    temperature DECIMAL(3,2) NOT NULL DEFAULT 0.15,
    top_p DECIMAL(3,2) NOT NULL DEFAULT 1.0,
    frequency_penalty DECIMAL(3,2) NOT NULL DEFAULT 0,
    presence_penalty DECIMAL(3,2) NOT NULL DEFAULT 0,
    max_tokens INTEGER NOT NULL DEFAULT 600,
    system_priority VARCHAR(20) DEFAULT 'strict',
    creative_mode VARCHAR(20) DEFAULT 'off',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO t_p56134400_telegram_ai_bot_pdf.ai_model_settings 
(model, temperature, top_p, frequency_penalty, presence_penalty, max_tokens, system_priority, creative_mode)
VALUES ('yandexgpt', 0.15, 1.0, 0, 0, 600, 'strict', 'off')
ON CONFLICT (id) DO NOTHING;
