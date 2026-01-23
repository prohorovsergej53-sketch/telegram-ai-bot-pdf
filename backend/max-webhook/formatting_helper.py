"""Утилита для загрузки настроек форматирования из БД"""
import os
import json
import psycopg2
import re

def get_formatting_settings(tenant_id: int, messenger: str) -> dict:
    """Получить настройки форматирования для тенанта и мессенджера"""
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("""
            SELECT use_emoji, use_markdown, use_lists_formatting,
                   custom_emoji_map, list_bullet_char, numbered_list_char
            FROM t_p56134400_telegram_ai_bot_pdf.messenger_formatting_settings
            WHERE tenant_id = %s AND messenger = %s
        """, (tenant_id, messenger))
        
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if not row:
            # Дефолтные настройки
            return {
                'use_emoji': True,
                'use_markdown': messenger == 'telegram',
                'use_lists_formatting': True,
                'custom_emoji_map': {},
                'list_bullet_char': '•',
                'numbered_list_char': '▫️'
            }
        
        return {
            'use_emoji': row[0],
            'use_markdown': row[1],
            'use_lists_formatting': row[2],
            'custom_emoji_map': row[3] if row[3] else {},
            'list_bullet_char': row[4],
            'numbered_list_char': row[5]
        }
    except Exception as e:
        print(f'Error loading formatting settings: {e}')
        return {
            'use_emoji': True,
            'use_markdown': messenger == 'telegram',
            'use_lists_formatting': True,
            'custom_emoji_map': {},
            'list_bullet_char': '•',
            'numbered_list_char': '▫️'
        }

def format_with_settings(text: str, settings: dict, messenger: str) -> str:
    """Форматирование текста согласно настройкам"""
    
    # Убираем HTML-теги для мессенджеров, не поддерживающих HTML
    if messenger in ['max', 'vk']:
        text = re.sub(r'<b>(.+?)</b>', r'\1', text, flags=re.IGNORECASE)
        text = re.sub(r'<i>(.+?)</i>', r'\1', text, flags=re.IGNORECASE)
        text = re.sub(r'<[^>]+>', '', text)
    
    # Форматируем списки
    if settings.get('use_lists_formatting'):
        bullet = settings.get('list_bullet_char', '•')
        numbered = settings.get('numbered_list_char', '▫️')
        text = re.sub(r'^- (.+)$', rf'{bullet} \1', text, flags=re.MULTILINE)
        text = re.sub(r'^\d+\. (.+)$', rf'{numbered} \1', text, flags=re.MULTILINE)
    
    # Markdown для Telegram
    if messenger == 'telegram' and settings.get('use_markdown'):
        text = re.sub(r'^([А-ЯЁA-Z][^:]+):$', r'*\1:*', text, flags=re.MULTILINE)
    
    # Добавляем эмодзи
    if settings.get('use_emoji'):
        emoji_map = settings.get('custom_emoji_map', {})
        for word, emoji in emoji_map.items():
            pattern = rf'\b{re.escape(word)}\b'
            if re.search(pattern, text, flags=re.IGNORECASE):
                # Добавляем эмодзи перед первым вхождением слова
                text = re.sub(
                    rf'^(.*?\b{re.escape(word)}\b.*)$',
                    rf'{emoji} \1',
                    text,
                    flags=re.IGNORECASE | re.MULTILINE,
                    count=1
                )
    
    return text
