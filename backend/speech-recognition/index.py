"""
API для распознавания голосовых сообщений через разные провайдеры.
Поддерживает Yandex SpeechKit, OpenAI Whisper, Google Speech-to-Text.
"""
import json
import os
import base64
import psycopg2
from typing import Dict, Any, Optional
import requests


def get_db_connection():
    """Создает подключение к БД"""
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        raise ValueError('DATABASE_URL not configured')
    return psycopg2.connect(dsn)


def get_tenant_settings(tenant_id: int) -> Dict[str, Any]:
    """Получает настройки распознавания речи для тенанта"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    speech_recognition_enabled,
                    speech_recognition_provider,
                    consent_enabled
                FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings
                WHERE tenant_id = %s
            """, (tenant_id,))
            row = cur.fetchone()
            
            if not row:
                return {
                    'enabled': False,
                    'provider': 'yandex',
                    'fz152_enabled': False
                }
            
            return {
                'enabled': row[0] or False,
                'provider': row[1] or 'yandex',
                'fz152_enabled': row[2] or False
            }
    finally:
        conn.close()


def get_api_key(tenant_id: int, provider: str, key_name: str) -> Optional[str]:
    """Получает API-ключ тенанта из tenant_api_keys"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT key_value
                FROM t_p56134400_telegram_ai_bot_pdf.tenant_api_keys
                WHERE tenant_id = %s 
                  AND provider = %s 
                  AND key_name = %s
                  AND is_active = true
            """, (tenant_id, provider, key_name))
            row = cur.fetchone()
            return row[0] if row else None
    finally:
        conn.close()


def transcribe_yandex(audio_base64: str, api_key: str, folder_id: str) -> str:
    """Распознавание через Yandex SpeechKit"""
    audio_bytes = base64.b64decode(audio_base64)
    
    url = 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize'
    headers = {
        'Authorization': f'Api-Key {api_key}'
    }
    params = {
        'folderId': folder_id,
        'lang': 'ru-RU'
    }
    
    response = requests.post(url, headers=headers, params=params, data=audio_bytes)
    response.raise_for_status()
    
    result = response.json()
    return result.get('result', '')


def transcribe_openai_whisper(audio_base64: str, api_key: str) -> str:
    """Распознавание через OpenAI Whisper"""
    audio_bytes = base64.b64decode(audio_base64)
    
    url = 'https://api.openai.com/v1/audio/transcriptions'
    headers = {
        'Authorization': f'Bearer {api_key}'
    }
    files = {
        'file': ('audio.ogg', audio_bytes, 'audio/ogg'),
        'model': (None, 'whisper-1'),
        'language': (None, 'ru')
    }
    
    response = requests.post(url, headers=headers, files=files)
    response.raise_for_status()
    
    result = response.json()
    return result.get('text', '')


def transcribe_google(audio_base64: str, api_key: str) -> str:
    """Распознавание через Google Speech-to-Text"""
    url = f'https://speech.googleapis.com/v1/speech:recognize?key={api_key}'
    
    payload = {
        'config': {
            'encoding': 'OGG_OPUS',
            'sampleRateHertz': 48000,
            'languageCode': 'ru-RU'
        },
        'audio': {
            'content': audio_base64
        }
    }
    
    response = requests.post(url, json=payload)
    response.raise_for_status()
    
    result = response.json()
    if 'results' in result and len(result['results']) > 0:
        return result['results'][0]['alternatives'][0]['transcript']
    return ''


def handler(event: dict, context) -> dict:
    """
    Распознает голосовое сообщение через выбранный провайдер.
    Автоматически использует Яндекс при включенном ФЗ-152.
    """
    method = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Tenant-Id'
            },
            'body': ''
        }
    
    if method == 'GET':
        tenant_id = event.get('headers', {}).get('X-Tenant-Id')
        if not tenant_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'X-Tenant-Id header required'})
            }
        
        tenant_id = int(tenant_id)
        settings = get_tenant_settings(tenant_id)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'enabled': settings['enabled'],
                'provider': settings['provider']
            })
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    try:
        tenant_id = event.get('headers', {}).get('X-Tenant-Id')
        if not tenant_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'X-Tenant-Id header required'})
            }
        
        tenant_id = int(tenant_id)
        
        body = json.loads(event.get('body', '{}'))
        
        if 'enabled' in body:
            conn = get_db_connection()
            try:
                with conn.cursor() as cur:
                    provider = body.get('provider', 'yandex')
                    
                    cur.execute("""
                        SELECT consent_enabled 
                        FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings 
                        WHERE tenant_id = %s
                    """, (tenant_id,))
                    fz152_row = cur.fetchone()
                    fz152_enabled = fz152_row[0] if fz152_row else False
                    
                    if fz152_enabled and provider != 'yandex':
                        provider = 'yandex'
                    
                    cur.execute("""
                        UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings 
                        SET speech_recognition_enabled = %s,
                            speech_recognition_provider = %s
                        WHERE tenant_id = %s
                    """, (body['enabled'], provider, tenant_id))
                    conn.commit()
            finally:
                conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True})
            }
        
        settings = get_tenant_settings(tenant_id)
        
        if not settings['enabled']:
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'enabled': False,
                    'message': 'Извините, я понимаю только текстовые сообщения.'
                })
            }
        
        body = json.loads(event.get('body', '{}'))
        audio_base64 = body.get('audio')
        
        if not audio_base64:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'audio field required (base64)'})
            }
        
        provider = settings['provider']
        if settings['fz152_enabled']:
            provider = 'yandex'
        
        text = ''
        
        if provider == 'yandex':
            api_key = get_api_key(tenant_id, 'yandex', 'YANDEX_SPEECHKIT_API_KEY')
            folder_id = get_api_key(tenant_id, 'yandex', 'YANDEX_FOLDER_ID')
            
            if not api_key or not folder_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': 'Yandex SpeechKit API key or Folder ID not configured'
                    })
                }
            
            text = transcribe_yandex(audio_base64, api_key, folder_id)
        
        elif provider == 'openai_whisper':
            api_key = get_api_key(tenant_id, 'openai', 'OPENAI_API_KEY')
            
            if not api_key:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': 'OpenAI API key not configured'
                    })
                }
            
            text = transcribe_openai_whisper(audio_base64, api_key)
        
        elif provider == 'google':
            api_key = get_api_key(tenant_id, 'google', 'GOOGLE_SPEECH_API_KEY')
            
            if not api_key:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': 'Google Speech API key not configured'
                    })
                }
            
            text = transcribe_google(audio_base64, api_key)
        
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Unknown provider: {provider}'})
            }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'text': text,
                'provider': provider
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)})
        }