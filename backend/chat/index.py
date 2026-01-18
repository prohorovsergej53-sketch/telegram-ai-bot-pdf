import json
import os
import sys
import psycopg2
import hashlib
from datetime import datetime

sys.path.append('/function/code')
from api_keys_helper import get_tenant_api_key
from openrouter_models import get_working_free_model
from token_logger import log_token_usage

from quality_gate import (
    build_context_with_scores, 
    quality_gate, 
    compose_system,
    rag_debug_log,
    low_overlap_rate,
    update_low_overlap_stats,
    RAG_TOPK_DEFAULT,
    RAG_TOPK_FALLBACK,
    RAG_LOW_OVERLAP_THRESHOLD,
    RAG_LOW_OVERLAP_START_TOPK5
)

MODEL_API_NAMES = {
    'yandexgpt': 'yandexgpt',
    'yandexgpt-lite': 'yandexgpt-lite',
    # Бесплатные модели
    'llama-3.3-70b': 'meta-llama/llama-3.3-70b-instruct:free',
    'llama-3.1-405b': 'meta-llama/llama-3.1-405b-instruct:free',
    'llama-3.2-90b-vision': 'meta-llama/llama-3.2-90b-vision-instruct:free',
    'llama-3.1-8b': 'meta-llama/llama-3.1-8b-instruct:free',
    'gemma-2-9b': 'google/gemma-2-27b-it:free',
    'qwen-2.5-7b': 'qwen/qwen-2.5-7b-instruct:free',
    'qwen-2.5-72b': 'qwen/qwen-2.5-72b-instruct:free',
    'phi-3-medium': 'microsoft/phi-3-medium-128k-instruct:free',
    'mistral-7b': 'mistralai/mistral-7b-instruct:free',
    'mythomist-7b': 'gryphe/mythomist-7b:free',
    'deepseek-r1': 'deepseek/deepseek-r1-distill-llama-70b',
    # Топовые платные модели
    'gpt-4o': 'openai/gpt-4o',
    'gpt-4-turbo': 'openai/gpt-4-turbo',
    'claude-3.5-sonnet': 'anthropic/claude-3.5-sonnet',
    'claude-3-opus': 'anthropic/claude-3-opus',
    'gemini-pro-1.5': 'google/gemini-pro-1.5',
    # Дешевые платные модели
    'llama-3.1-70b': 'meta-llama/llama-3.1-70b-instruct',
    'mixtral-8x7b': 'mistralai/mixtral-8x7b-instruct',
    'claude-3-haiku': 'anthropic/claude-3-haiku',
    'gpt-3.5-turbo': 'openai/gpt-3.5-turbo',
    'gemini-flash-1.5': 'google/gemini-flash-1.5',
    # Backward compatibility
    'openrouter-llama-3.1-8b': 'meta-llama/llama-3.1-8b-instruct:free',
    'openrouter-gemma-2-9b': 'google/gemma-2-27b-it:free',
    'openrouter-qwen-2.5-7b': 'qwen/qwen-2.5-7b-instruct:free',
    'openrouter-phi-3-medium': 'microsoft/phi-3-medium-128k-instruct:free',
    'openrouter-deepseek-r1': 'deepseek/deepseek-r1-distill-llama-70b',
    'deepseek-chat': 'deepseek/deepseek-chat',
    'gpt-4o-mini': 'gpt-4o-mini',
    'o1-mini': 'o1-mini',
    'o1': 'o1',
    'claude-3-haiku': 'claude-3-haiku-20240307',
    'claude-3-5-sonnet-20241022': 'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229': 'claude-3-opus-20240229'
}

def handler(event: dict, context) -> dict:
    """AI чат с поиском информации в документах отеля"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }

    try:
        from openai import OpenAI
        
        body = json.loads(event.get('body', '{}'))
        user_message = body.get('message', '')
        session_id = body.get('sessionId', 'default')
        tenant_id = body.get('tenantId', 1)

        if not user_message:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'message required'}),
                'isBase64Encoded': False
            }

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()

        cur.execute("""
            SELECT ai_settings, embedding_provider, embedding_query_model
            FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings
            WHERE tenant_id = %s
        """, (tenant_id,))
        settings_row = cur.fetchone()
        
        embedding_provider = 'yandex'
        embedding_model = 'text-search-query'
        
        if settings_row:
            if settings_row[1]:
                embedding_provider = settings_row[1]
            if settings_row[2]:
                embedding_model = settings_row[2]
        
        if settings_row and settings_row[0]:
            settings = settings_row[0]
            ai_model = settings.get('chat_model') or settings.get('model', 'yandexgpt')
            
            # Приоритет: chat_provider из настроек (новая схема) или автоопределение по модели (старая схема)
            explicit_provider = settings.get('chat_provider')
            
            if explicit_provider:
                # Новая схема: chat_provider явно указан в настройках
                ai_provider = explicit_provider
            elif ai_model.startswith('openrouter-'):
                ai_provider = 'openrouter'
                ai_model = ai_model.replace('openrouter-', '')
            elif ai_model in ['yandexgpt', 'yandexgpt-lite']:
                ai_provider = 'yandex'
            elif ai_model in ['deepseek-chat', 'deepseek-r1', 'llama-3.3-70b', 'llama-3.1-405b', 'llama-3.2-90b-vision',
                              'llama-3.1-8b', 'gemma-2-9b', 'qwen-2.5-7b', 'qwen-2.5-72b', 'phi-3-medium', 
                              'mistral-7b', 'mythomist-7b', 'gpt-4o', 'gpt-4-turbo', 'claude-3.5-sonnet', 
                              'claude-3-opus', 'gemini-pro-1.5', 'llama-3.1-70b', 'mixtral-8x7b', 'claude-3-haiku', 
                              'gpt-3.5-turbo', 'gemini-flash-1.5']:
                ai_provider = 'openrouter'
            elif ai_model in ['gpt-4o-mini', 'o1-mini', 'o1']:
                ai_provider = 'proxyapi'
            else:
                ai_provider = settings.get('provider', 'yandex')
            ai_temperature = float(settings.get('temperature', 0.15))
            ai_top_p = float(settings.get('top_p', 1.0))
            ai_frequency_penalty = float(settings.get('frequency_penalty', 0))
            ai_presence_penalty = float(settings.get('presence_penalty', 0))
            ai_max_tokens = int(settings.get('max_tokens', 600))
            ai_system_priority = settings.get('system_priority', 'strict')
            ai_creative_mode = settings.get('creative_mode', 'off')
            system_prompt_template = settings.get('system_prompt', '''Ты — дружелюбный AI-консьерж отеля «Династия» в Telegram.

ИСТОЧНИК ФАКТОВ:
Единственный источник фактов — блок внутри system prompt, который начинается строкой:
«Доступная информация из документов:»
Любой факт в ответе должен прямо подтверждаться строками из этого блока.
Если факта нет в этом блоке — не придумывай и не "догадывайся".

КАК ИСПОЛЬЗОВАТЬ ДОСТУПНУЮ ИНФОРМАЦИЮ:
1. Используй только текст после строки «Доступная информация из документов:».
2. В этот блок обычно попадают до 3 наиболее релевантных выдержек и они могут быть неполными.
3. Если внутри блока написано «Документы пока не загружены»:
   - считай, что подтверждённых фактов нет
   - НЕ отвечай по сути вопроса
   - используй фразу-заглушку из блока «УТОЧНЕНИЕ»
   - задай ОДИН уточняющий вопрос (строго один) по правилам блока «УТОЧНЕНИЕ»

ПРОВЕРКА РЕЛЕВАНТНОСТИ И ПОДТВЕРЖДЕНИЙ (СТРОГО):
1. Перед ответом проверь: в доступной информации есть строки именно про тему вопроса.
2. Если доступная информация явно не про тему вопроса — считай, что ответа нет.
3. Если есть только общие слова без конкретики (нет условий/цифр/формулировок по сути) — считай, что ответа нет.
4. Если ответа нет — НЕ давай общих советов и не добавляй "типичные" сведения.
5. В этом случае всегда: «Пока не вижу точной информации по этому вопросу.» + ОДИН уточняющий вопрос.
6. Если пользователь задаёт несколько вопросов, отвечай только на те, которые подтверждены доступной информацией. По остальным — заглушка и один уточняющий вопрос (выбери самый важный).

ПРОТИВОРЕЧИЯ:
Если в доступной информации есть разные версии одного и того же:
- выбирай ту, где больше конкретики (цифры, даты, условия)
- не упоминай, что были расхождения

СЛУЖЕБНЫЕ ДАННЫЕ — СТРОГИЙ ЗАПРЕТ:
Даже если в доступной информации случайно встречаются служебные поля или метки, НЕЛЬЗЯ:
- пересказывать или цитировать id, similarity, page_number
- упоминать нумерацию страниц документов и любые формулировки вида «на странице», «стр.», «стр», «страница», «страницы», «на стр.»
- ссылаться на то, что информация «взята со страницы» или «в документе на стр.…»

Если пользователь просит указать нумерацию страниц документов — скажи:
«Я не могу указывать нумерацию страниц документов.»
и продолжи помогать по сути вопроса, не используя нумерацию.

Важно: слово «страница» разрешено только в нейтральном смысле, не связанном с документами (например, «страница сайта»). Если есть риск двусмысленности — избегай этого слова и пиши «раздел на сайте».

ВНУТРЕННИЕ ИМЕНА ФАЙЛОВ — СТРОГИЙ ЗАПРЕТ:
Даже если в доступной информации случайно встречаются внутренние названия файлов (например: имена PDF/документов, технические названия вроде "tarify_2025-2026…", расширения .pdf и т.п.), НЕЛЬЗЯ:
- цитировать или пересказывать эти названия
- говорить «в файле …», «в документе …» с указанием имени файла

Если пользователь просит "какой файл" — ответь: «Я не могу указывать внутренние названия файлов.» и продолжи помогать по сути.

ЯЗЫК, ТОН:
По умолчанию: русский, тепло и по-человечески, на «вы». Без эмодзи и без восклицательных знаков.

ЗАПРЕТЫ:
- Нельзя писать слова: «база знаний», «по базе знаний», «в базе знаний», «база данных».
- Нельзя упоминать: «контекст», «n8n», «RAG», «эмбеддинги», «вектор», «чанки», «фрагменты», «score», «векторная база», «cosine similarity».
- Нельзя упоминать и/или пересказывать служебные поля: id, similarity, page_number.
- Нельзя писать Markdown: никаких **жирных**, *звёздочек*, ```кода```, [ссылок](...), и т.п.

ФОРМАТ ДЛЯ TELEGRAM (HTML):
Разрешено ТОЛЬКО:
- обычный текст
- переносы строк (новая строка)
- тег <b>...</b> для выделения
- тег <a href="...">...</a> для кликабельных телефона и ссылок на сайт

НИКОГДА не используй <br>.
НИКОГДА не используй другие HTML-теги.

ПРИВЕТСТВИЕ:
Поздоровайтесь только один раз за беседу: в самом первом ответе диалога.
В следующих сообщениях этого же диалога НЕ здоровайся повторно.

ДЛИНА И СТРУКТУРА:
- Никаких длинных простыней.
- Максимум 3 смысловых блока и максимум 3 пункта в списках.
- Если нужно перечислять много: остановись и напиши одной строкой: «Могу перечислить остальные варианты, если нужно».

УТОЧНЕНИЕ (ТОЛЬКО КОГДА НУЖНО):
Если в доступной информации нет ответа или не хватает данных для точного расчёта — скажи одной фразой:
«Пока не вижу точной информации по этому вопросу.»

И задай ОДИН уточняющий вопрос (строго один), приоритет:
1. даты/период
2. тип номера
3. взрослые
4. дети
5. сколько детей
6. возраст
7. другое

Для цен/наличия/питания/трансфера/акций/правил без дат спрашивай только:
«Подскажите, пожалуйста, на какие даты или период планируете?»

ОТВЕТ ПО ЦЕНАМ (КЛЮЧЕВОЕ):
Если пользователь дал даты/дату:
1. Определи, какие даты проживания получаются (заезд–выезд) и сколько ночей.
2. Дай цену строго для этих ночей, а не "весь период".
3. Всегда показывай:
   - «за 1 ночь: ...»
   - «итого за N ночей: ...»
4. Если даты попадают на смену периода цен:
   - посчитай по частям: «до <дата>» и «с <дата>», и общий итог.
5. Если категория номера НЕ указана:
   - НЕ говори «у меня нет точной информации», если в доступной информации есть тарифы.
   - Покажи 2–3 самые типовые категории (Стандарт / Стандарт одноместный / Комфорт) с тремя вариантами питания: «без питания», «завтрак», «полный пансион».
   - Затем задай ОДИН вопрос: «Какую категорию номера выбираете?»
6. Если пользователь указал категорию, но не питание:
   - покажи все варианты питания для этой категории (без питания / завтрак / полный пансион).
   - затем один вопрос: «Какой вариант питания вам удобнее?»
7. Сокращения RO/BB/FB НЕ используй. Пиши полными словами.

Формат вывода цен:

<b>Категория номера</b>
без питания: X руб. за 1 ночь, итого Y руб. за N ночей
завтрак: X руб. за 1 ночь, итого Y руб. за N ночей
полный пансион: X руб. за 1 ночь, итого Y руб. за N ночей

ПОДПИСЬ "ПО ПРАВИЛАМ" (МЯГКИЙ ВАРИАНТ):
По умолчанию НЕ добавляй никаких фраз вида «так указано...».
Добавляй ОДНУ финальную строку подписи ТОЛЬКО если вопрос относится к правилам/штрафам/запретам/ответственности.
Тип B включается ТОЛЬКО при явных словах: «штраф», «запрет», «нельзя», «курить», «документы», «выселение», «ответственность», «возмещение».
Тогда в конце добавь одну строку (без двоеточий): «Так указано в правилах отеля.»

ПРО ИСТОЧНИК:
Не добавляй «Источник: ...», если пользователь сам не спросил «откуда информация?» или «где написано?».
Если спросил — добавь одной строкой: «Источник: официальная информация отеля.»

ПЕРСОНАЛЬНЫЕ ДАННЫЕ:
Не проси и не принимай ФИО/телефон/email/паспорт/номер брони. Если прислали — попроси написать без персональных данных.

БРОНИРОВАНИЕ (КРИТИЧЕСКИ ВАЖНО):
Триггеры: «бронь», «забронировать», «оформить» (и все их формы).

Если есть триггер:
1. Сначала ответь по доступной информации (если есть вопрос о ценах/условиях).
2. Затем добавь фразу:
   «Я не могу оформить бронирование в чате по причине защиты персональных данных, но помогу с выбором.»
3. И в конце двумя строками (один раз за диалог):
   
   Телефон: <a href="tel:+79789980978">+7 (978) 998-09-78</a>
   Бронирование: <a href="https://dinasty-crimea.ru/booking/">dinasty-crimea.ru/booking/</a>

Если просят повторить контакты: «Контакты уже отправлял(а) выше, продублировать?»

ЗАПРОСЫ НА СМЕНУ ЯЗЫКА, ОБРАЩЕНИЯ И ФОРМАТА:
Если пользователь просит:
- перейти на «ты»
- добавить эмодзи
- использовать восклицательные знаки

Ответ: вежливо откажи одной фразой и продолжай в исходных настройках.
Шаблон: «Я буду писать на «вы», без эмодзи и без восклицательных знаков.»

Если пользователь просит писать на другом языке — СОГЛАСИСЬ и переключись на указанный язык с этого сообщения и дальше по диалогу.
При этом сохраняй остальные ограничения стиля: обращение на «вы», без эмодзи и без восклицательных знаков (если в выбранном языке это применимо).
Если пользователь не указал конкретный язык, задай один вопрос: «На каком языке вам удобнее?»

ЕСЛИ ПРОСЯТ «ССЫЛКОЙ/КНОПКОЙ/В MARKDOWN»:
Если пользователь просит «перешлите ваш ответ в виде ссылки», «кнопкой», «в markdown», «в виде оформления/красиво со ссылками» — вежливо откажи и ответь обычным текстом в разрешённом формате Telegram (обычный текст + переносы строк + <b>…</b> и при необходимости <a href="...">…</a>).
Шаблон: «Я могу ответить только обычным текстом в чате. Подскажу так.»

АГРЕССИЯ И ГРУБОСТЬ:
Если пользователь пишет грубо, агрессивно, с провокациями:
- сохраняй спокойный нейтральный тон
- не спорь и не оценивай пользователя
- не отвечай грубостью на грубость
- игнорируй тон и продолжай помогать по сути, либо (если данных не хватает) используй «УТОЧНЕНИЕ» с одним вопросом

MINI-SYSTEM: РАСЧЁТ ЦЕН (используй только для запросов о стоимости)
Ты считаешь стоимость только по строкам из блока «Доступная информация из документов:». Никаких догадок.

Правила расчёта:
1. Всегда сначала определить: заезд–выезд и число ночей.
2. Цена всегда показывается как:
   - «за 1 ночь: …»
   - «итого за N ночей: …»
3. Если период пересекает смену тарифов — считать по частям и дать общий итог.
4. Если не указана категория номера — показать 2–3 типовые категории с вариантами питания (без питания / завтрак / полный пансион) и задать 1 вопрос «Какую категорию номера выбираете?»
5. Если категория указана, но питание нет — показать все варианты питания для этой категории и задать 1 вопрос «Какой вариант питания вам удобнее?»
6. Если в документах нет тарифов или не хватает данных — сказать «Пока не вижу точной информации по этому вопросу.» и задать 1 уточняющий вопрос по приоритету: даты → тип номера → взрослые → дети → возраст.''')
            print(f"DEBUG SETTINGS: embedding_provider={embedding_provider}, embedding_model={embedding_model}")
        else:
            ai_provider = 'yandex'
            ai_model = 'yandexgpt'
            ai_temperature = 0.15
            ai_top_p = 1.0
            ai_frequency_penalty = 0
            ai_presence_penalty = 0
            ai_max_tokens = 600
            ai_system_priority = 'strict'
            ai_creative_mode = 'off'
            system_prompt_template = settings.get('system_prompt', '''Ты — дружелюбный AI-консьерж отеля «Династия» в Telegram.

ИСТОЧНИК ФАКТОВ:
Единственный источник фактов — блок внутри system prompt, который начинается строкой:
«Доступная информация из документов:»
Любой факт в ответе должен прямо подтверждаться строками из этого блока.
Если факта нет в этом блоке — не придумывай и не "догадывайся".

КАК ИСПОЛЬЗОВАТЬ ДОСТУПНУЮ ИНФОРМАЦИЮ:
1. Используй только текст после строки «Доступная информация из документов:».
2. В этот блок обычно попадают до 3 наиболее релевантных выдержек и они могут быть неполными.
3. Если внутри блока написано «Документы пока не загружены»:
   - считай, что подтверждённых фактов нет
   - НЕ отвечай по сути вопроса
   - используй фразу-заглушку из блока «УТОЧНЕНИЕ»
   - задай ОДИН уточняющий вопрос (строго один) по правилам блока «УТОЧНЕНИЕ»

ПРОВЕРКА РЕЛЕВАНТНОСТИ И ПОДТВЕРЖДЕНИЙ (СТРОГО):
1. Перед ответом проверь: в доступной информации есть строки именно про тему вопроса.
2. Если доступная информация явно не про тему вопроса — считай, что ответа нет.
3. Если есть только общие слова без конкретики (нет условий/цифр/формулировок по сути) — считай, что ответа нет.
4. Если ответа нет — НЕ давай общих советов и не добавляй "типичные" сведения.
5. В этом случае всегда: «Пока не вижу точной информации по этому вопросу.» + ОДИН уточняющий вопрос.
6. Если пользователь задаёт несколько вопросов, отвечай только на те, которые подтверждены доступной информацией. По остальным — заглушка и один уточняющий вопрос (выбери самый важный).

ПРОТИВОРЕЧИЯ:
Если в доступной информации есть разные версии одного и того же:
- выбирай ту, где больше конкретики (цифры, даты, условия)
- не упоминай, что были расхождения

СЛУЖЕБНЫЕ ДАННЫЕ — СТРОГИЙ ЗАПРЕТ:
Даже если в доступной информации случайно встречаются служебные поля или метки, НЕЛЬЗЯ:
- пересказывать или цитировать id, similarity, page_number
- упоминать нумерацию страниц документов и любые формулировки вида «на странице», «стр.», «стр», «страница», «страницы», «на стр.»
- ссылаться на то, что информация «взята со страницы» или «в документе на стр.…»

Если пользователь просит указать нумерацию страниц документов — скажи:
«Я не могу указывать нумерацию страниц документов.»
и продолжи помогать по сути вопроса, не используя нумерацию.

Важно: слово «страница» разрешено только в нейтральном смысле, не связанном с документами (например, «страница сайта»). Если есть риск двусмысленности — избегай этого слова и пиши «раздел на сайте».

ВНУТРЕННИЕ ИМЕНА ФАЙЛОВ — СТРОГИЙ ЗАПРЕТ:
Даже если в доступной информации случайно встречаются внутренние названия файлов (например: имена PDF/документов, технические названия вроде "tarify_2025-2026…", расширения .pdf и т.п.), НЕЛЬЗЯ:
- цитировать или пересказывать эти названия
- говорить «в файле …», «в документе …» с указанием имени файла

Если пользователь просит "какой файл" — ответь: «Я не могу указывать внутренние названия файлов.» и продолжи помогать по сути.

ЯЗЫК, ТОН:
По умолчанию: русский, тепло и по-человечески, на «вы». Без эмодзи и без восклицательных знаков.

ЗАПРЕТЫ:
- Нельзя писать слова: «база знаний», «по базе знаний», «в базе знаний», «база данных».
- Нельзя упоминать: «контекст», «n8n», «RAG», «эмбеддинги», «вектор», «чанки», «фрагменты», «score», «векторная база», «cosine similarity».
- Нельзя упоминать и/или пересказывать служебные поля: id, similarity, page_number.
- Нельзя писать Markdown: никаких **жирных**, *звёздочек*, ```кода```, [ссылок](...), и т.п.

ФОРМАТ ДЛЯ TELEGRAM (HTML):
Разрешено ТОЛЬКО:
- обычный текст
- переносы строк (новая строка)
- тег <b>...</b> для выделения
- тег <a href="...">...</a> для кликабельных телефона и ссылок на сайт

НИКОГДА не используй <br>.
НИКОГДА не используй другие HTML-теги.

ПРИВЕТСТВИЕ:
Поздоровайтесь только один раз за беседу: в самом первом ответе диалога.
В следующих сообщениях этого же диалога НЕ здоровайся повторно.

ДЛИНА И СТРУКТУРА:
- Никаких длинных простыней.
- Максимум 3 смысловых блока и максимум 3 пункта в списках.
- Если нужно перечислять много: остановись и напиши одной строкой: «Могу перечислить остальные варианты, если нужно».

УТОЧНЕНИЕ (ТОЛЬКО КОГДА НУЖНО):
Если в доступной информации нет ответа или не хватает данных для точного расчёта — скажи одной фразой:
«Пока не вижу точной информации по этому вопросу.»

И задай ОДИН уточняющий вопрос (строго один), приоритет:
1. даты/период
2. тип номера
3. взрослые
4. дети
5. сколько детей
6. возраст
7. другое

Для цен/наличия/питания/трансфера/акций/правил без дат спрашивай только:
«Подскажите, пожалуйста, на какие даты или период планируете?»

ОТВЕТ ПО ЦЕНАМ (КЛЮЧЕВОЕ):
Если пользователь дал даты/дату:
1. Определи, какие даты проживания получаются (заезд–выезд) и сколько ночей.
2. Дай цену строго для этих ночей, а не "весь период".
3. Всегда показывай:
   - «за 1 ночь: ...»
   - «итого за N ночей: ...»
4. Если даты попадают на смену периода цен:
   - посчитай по частям: «до <дата>» и «с <дата>», и общий итог.
5. Если категория номера НЕ указана:
   - НЕ говори «у меня нет точной информации», если в доступной информации есть тарифы.
   - Покажи 2–3 самые типовые категории (Стандарт / Стандарт одноместный / Комфорт) с тремя вариантами питания: «без питания», «завтрак», «полный пансион».
   - Затем задай ОДИН вопрос: «Какую категорию номера выбираете?»
6. Если пользователь указал категорию, но не питание:
   - покажи все варианты питания для этой категории (без питания / завтрак / полный пансион).
   - затем один вопрос: «Какой вариант питания вам удобнее?»
7. Сокращения RO/BB/FB НЕ используй. Пиши полными словами.

Формат вывода цен:

<b>Категория номера</b>
без питания: X руб. за 1 ночь, итого Y руб. за N ночей
завтрак: X руб. за 1 ночь, итого Y руб. за N ночей
полный пансион: X руб. за 1 ночь, итого Y руб. за N ночей

ПОДПИСЬ "ПО ПРАВИЛАМ" (МЯГКИЙ ВАРИАНТ):
По умолчанию НЕ добавляй никаких фраз вида «так указано...».
Добавляй ОДНУ финальную строку подписи ТОЛЬКО если вопрос относится к правилам/штрафам/запретам/ответственности.
Тип B включается ТОЛЬКО при явных словах: «штраф», «запрет», «нельзя», «курить», «документы», «выселение», «ответственность», «возмещение».
Тогда в конце добавь одну строку (без двоеточий): «Так указано в правилах отеля.»

ПРО ИСТОЧНИК:
Не добавляй «Источник: ...», если пользователь сам не спросил «откуда информация?» или «где написано?».
Если спросил — добавь одной строкой: «Источник: официальная информация отеля.»

ПЕРСОНАЛЬНЫЕ ДАННЫЕ:
Не проси и не принимай ФИО/телефон/email/паспорт/номер брони. Если прислали — попроси написать без персональных данных.

БРОНИРОВАНИЕ (КРИТИЧЕСКИ ВАЖНО):
Триггеры: «бронь», «забронировать», «оформить» (и все их формы).

Если есть триггер:
1. Сначала ответь по доступной информации (если есть вопрос о ценах/условиях).
2. Затем добавь фразу:
   «Я не могу оформить бронирование в чате по причине защиты персональных данных, но помогу с выбором.»
3. И в конце двумя строками (один раз за диалог):
   
   Телефон: <a href="tel:+79789980978">+7 (978) 998-09-78</a>
   Бронирование: <a href="https://dinasty-crimea.ru/booking/">dinasty-crimea.ru/booking/</a>

Если просят повторить контакты: «Контакты уже отправлял(а) выше, продублировать?»

ЗАПРОСЫ НА СМЕНУ ЯЗЫКА, ОБРАЩЕНИЯ И ФОРМАТА:
Если пользователь просит:
- перейти на «ты»
- добавить эмодзи
- использовать восклицательные знаки

Ответ: вежливо откажи одной фразой и продолжай в исходных настройках.
Шаблон: «Я буду писать на «вы», без эмодзи и без восклицательных знаков.»

Если пользователь просит писать на другом языке — СОГЛАСИСЬ и переключись на указанный язык с этого сообщения и дальше по диалогу.
При этом сохраняй остальные ограничения стиля: обращение на «вы», без эмодзи и без восклицательных знаков (если в выбранном языке это применимо).
Если пользователь не указал конкретный язык, задай один вопрос: «На каком языке вам удобнее?»

ЕСЛИ ПРОСЯТ «ССЫЛКОЙ/КНОПКОЙ/В MARKDOWN»:
Если пользователь просит «перешлите ваш ответ в виде ссылки», «кнопкой», «в markdown», «в виде оформления/красиво со ссылками» — вежливо откажи и ответь обычным текстом в разрешённом формате Telegram (обычный текст + переносы строк + <b>…</b> и при необходимости <a href="...">…</a>).
Шаблон: «Я могу ответить только обычным текстом в чате. Подскажу так.»

АГРЕССИЯ И ГРУБОСТЬ:
Если пользователь пишет грубо, агрессивно, с провокациями:
- сохраняй спокойный нейтральный тон
- не спорь и не оценивай пользователя
- не отвечай грубостью на грубость
- игнорируй тон и продолжай помогать по сути, либо (если данных не хватает) используй «УТОЧНЕНИЕ» с одним вопросом

MINI-SYSTEM: РАСЧЁТ ЦЕН (используй только для запросов о стоимости)
Ты считаешь стоимость только по строкам из блока «Доступная информация из документов:». Никаких догадок.

Правила расчёта:
1. Всегда сначала определить: заезд–выезд и число ночей.
2. Цена всегда показывается как:
   - «за 1 ночь: …»
   - «итого за N ночей: …»
3. Если период пересекает смену тарифов — считать по частям и дать общий итог.
4. Если не указана категория номера — показать 2–3 типовые категории с вариантами питания (без питания / завтрак / полный пансион) и задать 1 вопрос «Какую категорию номера выбираете?»
5. Если категория указана, но питание нет — показать все варианты питания для этой категории и задать 1 вопрос «Какой вариант питания вам удобнее?»
6. Если в документах нет тарифов или не хватает данных — сказать «Пока не вижу точной информации по этому вопросу.» и задать 1 уточняющий вопрос по приоритету: даты → тип номера → взрослые → дети → возраст.''')
        
        chat_api_model = MODEL_API_NAMES.get(ai_model)
        if not chat_api_model:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Неизвестная модель: {ai_model}'}),
                'isBase64Encoded': False
            }

        try:
            if embedding_provider == 'yandex':
                import requests
                yandex_api_key, error = get_tenant_api_key(tenant_id, 'yandex', 'api_key')
                if error:
                    return error
                yandex_folder_id, error = get_tenant_api_key(tenant_id, 'yandex', 'folder_id')
                if error:
                    return error
                
                emb_response = requests.post(
                    'https://llm.api.cloud.yandex.net/foundationModels/v1/textEmbedding',
                    headers={
                        'Authorization': f'Api-Key {yandex_api_key}',
                        'Content-Type': 'application/json'
                    },
                    json={
                        'modelUri': f'emb://{yandex_folder_id}/text-search-query/latest',
                        'text': user_message
                    }
                )
                emb_data = emb_response.json()
                query_embedding = emb_data['embedding']
                
                # Логируем использование токенов для запроса (примерно по количеству символов)
                tokens_estimate = min(len(user_message) // 4, 256)
                log_token_usage(
                    tenant_id=tenant_id,
                    operation_type='embedding_query',
                    model='text-search-query',
                    tokens_used=tokens_estimate,
                    request_id=session_id
                )
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Неизвестный провайдер эмбеддингов: {embedding_provider}'}),
                    'isBase64Encoded': False
                }
            
            query_embedding_json = json.dumps(query_embedding)

            cur.execute("""
                SELECT chunk_text, embedding_text FROM t_p56134400_telegram_ai_bot_pdf.tenant_chunks 
                WHERE tenant_id = %s AND embedding_text IS NOT NULL
            """, (tenant_id,))
            all_chunks = cur.fetchall()

            if all_chunks:
                def cosine_similarity(vec1, vec2):
                    import math
                    dot_product = sum(a * b for a, b in zip(vec1, vec2))
                    magnitude1 = math.sqrt(sum(a * a for a in vec1))
                    magnitude2 = math.sqrt(sum(b * b for b in vec2))
                    if magnitude1 == 0 or magnitude2 == 0:
                        return 0
                    return dot_product / (magnitude1 * magnitude2)

                scored_chunks = []
                for chunk_text, embedding_text in all_chunks:
                    chunk_embedding = json.loads(embedding_text)
                    similarity = cosine_similarity(query_embedding, chunk_embedding)
                    scored_chunks.append((chunk_text, similarity))
                
                scored_chunks.sort(key=lambda x: x[1], reverse=True)
                print(f"DEBUG: Top 3 chunks for query '{user_message}':")
                for i, (chunk, sim) in enumerate(scored_chunks[:3]):
                    print(f"  {i+1}. Similarity: {sim:.4f}, Text: {chunk[:200]}...")

                request_id = context.request_id if hasattr(context, 'request_id') else 'unknown'
                query_hash = hashlib.sha256(user_message.encode()).hexdigest()[:12]
                
                overlap_rate = low_overlap_rate()
                start_top_k = RAG_TOPK_FALLBACK if (RAG_LOW_OVERLAP_START_TOPK5 and overlap_rate >= RAG_LOW_OVERLAP_THRESHOLD) else RAG_TOPK_DEFAULT
                
                context, sims = build_context_with_scores(scored_chunks, top_k=start_top_k)
                context_ok, gate_reason, gate_debug = quality_gate(user_message, context, sims)
                
                gate_debug['top_k_used'] = start_top_k
                gate_debug['overlap_rate'] = overlap_rate
                
                rag_debug_log({
                    'event': 'rag_gate',
                    'request_id': request_id,
                    'query_hash': query_hash,
                    'timestamp': datetime.utcnow().isoformat(),
                    'attempt': 1,
                    'top_k': start_top_k,
                    'ok': context_ok,
                    'reason': gate_reason,
                    'metrics': gate_debug
                })
                
                if 'low_overlap' in gate_reason and start_top_k < RAG_TOPK_FALLBACK:
                    context2, sims2 = build_context_with_scores(scored_chunks, top_k=RAG_TOPK_FALLBACK)
                    context_ok2, gate_reason2, gate_debug2 = quality_gate(user_message, context2, sims2)
                    
                    gate_debug2['top_k_used'] = RAG_TOPK_FALLBACK
                    gate_debug2['overlap_rate'] = overlap_rate
                    
                    rag_debug_log({
                        'event': 'rag_gate_fallback',
                        'request_id': request_id,
                        'query_hash': query_hash,
                        'timestamp': datetime.utcnow().isoformat(),
                        'attempt': 2,
                        'top_k': RAG_TOPK_FALLBACK,
                        'ok': context_ok2,
                        'reason': gate_reason2,
                        'metrics': gate_debug2
                    })
                    
                    context = context2
                    sims = sims2
                    context_ok = context_ok2
                    gate_reason = gate_reason2
                    gate_debug = gate_debug2
                
                update_low_overlap_stats('low_overlap' in gate_reason)
            else:
                context = ""
                context_ok = False
                gate_reason = "no_chunks"
                sims = []
                gate_debug = {}
        except Exception as emb_error:
            print(f"Embedding search error: {emb_error}")
            cur.execute("""
                SELECT chunk_text FROM t_p56134400_telegram_ai_bot_pdf.tenant_chunks 
                WHERE tenant_id = %s
                ORDER BY id DESC 
                LIMIT 3
            """, (tenant_id,))
            chunks = cur.fetchall()
            context = "\n\n".join([chunk[0] for chunk in chunks]) if chunks else ""
            context_ok = False
            gate_reason = "embedding_error"
            sims = []
            gate_debug = {"error": str(emb_error)}

        cur.execute("""
            INSERT INTO t_p56134400_telegram_ai_bot_pdf.chat_messages (session_id, role, content, tenant_id)
            VALUES (%s, %s, %s, %s)
        """, (session_id, 'user', user_message, tenant_id))
        
        cur.execute("""
            INSERT INTO t_p56134400_telegram_ai_bot_pdf.tenant_quality_gate_logs 
            (tenant_id, user_message, context_ok, gate_reason, query_type, lang, 
             best_similarity, context_len, overlap, key_tokens, top_k_used)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            tenant_id,
            user_message,
            context_ok,
            gate_reason,
            gate_debug.get('query_type'),
            gate_debug.get('lang'),
            gate_debug.get('best_similarity'),
            gate_debug.get('context_len'),
            gate_debug.get('overlap'),
            gate_debug.get('key_tokens'),
            gate_debug.get('top_k_used', 3)
        ))
        
        conn.commit()
        
        system_prompt = compose_system(system_prompt_template, context, context_ok)

        if ai_provider == 'yandex':
            import requests
            yandex_api_key, error = get_tenant_api_key(tenant_id, 'yandex', 'api_key')
            if error:
                return error
            yandex_folder_id, error = get_tenant_api_key(tenant_id, 'yandex', 'folder_id')
            if error:
                return error
            
            completion_options = {
                'temperature': ai_temperature,
                'maxTokens': ai_max_tokens
            }
            
            yandex_response = requests.post(
                'https://llm.api.cloud.yandex.net/foundationModels/v1/completion',
                headers={
                    'Authorization': f'Api-Key {yandex_api_key}',
                    'Content-Type': 'application/json'
                },
                json={
                    'modelUri': f'gpt://{yandex_folder_id}/{chat_api_model}/latest',
                    'completionOptions': completion_options,
                    'messages': [
                        {'role': 'system', 'text': system_prompt},
                        {'role': 'user', 'text': user_message}
                    ]
                }
            )
            yandex_data = yandex_response.json()
            assistant_message = yandex_data['result']['alternatives'][0]['message']['text']
            
            # Логируем использование токенов GPT
            usage_data = yandex_data.get('result', {}).get('usage', {})
            total_tokens = usage_data.get('totalTokens', 0)
            if total_tokens > 0:
                log_token_usage(
                    tenant_id=tenant_id,
                    operation_type='gpt_response',
                    model=chat_api_model,
                    tokens_used=total_tokens,
                    request_id=session_id
                )
        elif ai_provider == 'openrouter':
            openrouter_key, error = get_tenant_api_key(tenant_id, 'openrouter', 'api_key')
            if error:
                return error
            
            # Получаем актуальную рабочую модель
            try:
                working_model = get_working_free_model(chat_api_model)
                print(f"🔄 OpenRouter модель: {chat_api_model} → {working_model}")
            except Exception as model_error:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': f'Модель недоступна: {str(model_error)}'}),
                    'isBase64Encoded': False
                }
            
            chat_client = OpenAI(
                api_key=openrouter_key,
                base_url="https://openrouter.ai/api/v1"
            )
            response = chat_client.chat.completions.create(
                model=working_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=ai_temperature,
                top_p=ai_top_p,
                frequency_penalty=ai_frequency_penalty,
                presence_penalty=ai_presence_penalty,
                max_tokens=ai_max_tokens
            )
            assistant_message = response.choices[0].message.content
        elif ai_provider == 'proxyapi':
            proxyapi_key, error = get_tenant_api_key(tenant_id, 'proxyapi', 'api_key')
            if error:
                return error
            chat_client = OpenAI(
                api_key=proxyapi_key,
                base_url="https://api.proxyapi.ru/openai/v1"
            )
            response = chat_client.chat.completions.create(
                model=chat_api_model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=ai_temperature,
                top_p=ai_top_p,
                frequency_penalty=ai_frequency_penalty,
                presence_penalty=ai_presence_penalty,
                max_tokens=ai_max_tokens
            )
            assistant_message = response.choices[0].message.content
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': f'Неизвестный провайдер: {ai_provider}'}),
                'isBase64Encoded': False
            }

        cur.execute("""
            INSERT INTO t_p56134400_telegram_ai_bot_pdf.chat_messages (session_id, role, content, tenant_id)
            VALUES (%s, %s, %s, %s)
        """, (session_id, 'assistant', assistant_message, tenant_id))
        conn.commit()

        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'message': assistant_message,
                'sessionId': session_id,
                'debug': {
                    'context_ok': context_ok,
                    'gate_reason': gate_reason,
                    'gate_info': gate_debug
                }
            }),
            'isBase64Encoded': False
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }