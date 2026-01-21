-- Устанавливаем кастомные пороги Quality Gate для Tenant ID: 2
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET quality_gate_settings = '{
  "tariffs": {
    "min_len": 250,
    "min_sim": 0.30,
    "min_overlap_ru": 0.06,
    "min_overlap_en": 0.06
  },
  "rules": {
    "min_len": 500,
    "min_sim": 0.32,
    "min_overlap_ru": 0.15,
    "min_overlap_en": 0.12
  },
  "services": {
    "min_len": 450,
    "min_sim": 0.28,
    "min_overlap_ru": 0.15,
    "min_overlap_en": 0.12
  },
  "default": {
    "min_len": 500,
    "min_sim": 0.32,
    "min_overlap_ru": 0.15,
    "min_overlap_en": 0.12
  }
}'::jsonb
WHERE tenant_id = 2;
