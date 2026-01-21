-- Настройка демо-данных для тенанта ID 1 (шаблон)
UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
SET page_settings = jsonb_set(
    jsonb_set(
        jsonb_set(
            jsonb_set(
                jsonb_set(
                    jsonb_set(
                        jsonb_set(
                            jsonb_set(
                                jsonb_set(
                                    jsonb_set(
                                        jsonb_set(
                                            jsonb_set(
                                                jsonb_set(
                                                    COALESCE(page_settings, '{}'::jsonb),
                                                    '{header_icon}', 
                                                    '"Hotel"'::jsonb
                                                ),
                                                '{header_title}',
                                                '"Демо Отель"'::jsonb
                                            ),
                                            '{header_subtitle}',
                                            '"AI Консьерж Отеля"'::jsonb
                                        ),
                                        '{page_title}',
                                        '"Здравствуйте!"'::jsonb
                                    ),
                                    '{page_subtitle}',
                                    '"Спросите о номерах, услугах, ценах и инфраструктуре отеля"'::jsonb
                                ),
                                '{quick_questions_title}',
                                '"Популярные вопросы"'::jsonb
                            ),
                            '{contacts_title}',
                            '"Наши контакты"'::jsonb
                        ),
                        '{contact_phone_label}',
                        '"Ресепшн"'::jsonb
                    ),
                    '{contact_phone_value}',
                    '"+7 (495) 123-45-67"'::jsonb
                ),
                '{contact_email_label}',
                '"Email"'::jsonb
            ),
            '{contact_email_value}',
            '"info@demo-hotel.ru"'::jsonb
        ),
        '{contact_address_label}',
        '"Адрес"'::jsonb
    ),
    '{contact_address_value}',
    '"Москва, Кутузовский проспект, 32"'::jsonb
)
WHERE tenant_id = 1;
