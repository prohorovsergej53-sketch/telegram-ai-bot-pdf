import json
import os
import psycopg2
import requests
from typing import Optional

def handler(event: dict, context) -> dict:
    """Управление настройками автоматизации и cron-заданиями"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()

        if method == 'GET':
            settings = get_automation_settings(cur)
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(settings),
                'isBase64Encoded': False
            }

        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')

            if action == 'save_api_key':
                api_key = body.get('api_key', '').strip()
                if not api_key:
                    raise ValueError('API ключ не может быть пустым')
                
                save_cronjob_api_key(cur, api_key)
                conn.commit()
                
                result = {'ok': True, 'message': 'API ключ сохранён'}

            elif action == 'enable_subscription_check':
                api_key = get_cronjob_api_key(cur)
                if not api_key:
                    raise ValueError('Сначала сохраните API ключ Cron-job.org')
                
                job_id = create_or_update_cronjob(api_key, enabled=True)
                save_cronjob_id(cur, 'check_subscriptions', job_id)
                conn.commit()
                
                result = {'ok': True, 'message': 'Автопроверка включена', 'job_id': job_id}

            elif action == 'disable_subscription_check':
                api_key = get_cronjob_api_key(cur)
                if not api_key:
                    raise ValueError('API ключ не настроен')
                
                job_id = get_cronjob_id(cur, 'check_subscriptions')
                if job_id:
                    disable_cronjob(api_key, job_id)
                
                result = {'ok': True, 'message': 'Автопроверка отключена'}

            elif action == 'test_subscription_check':
                check_url = 'https://functions.poehali.dev/d4cc01d8-b97c-4f4c-894f-ccafc67a58b9'
                response = requests.get(check_url, timeout=30)
                response.raise_for_status()
                test_result = response.json()
                
                result = {
                    'ok': True,
                    'message': 'Проверка выполнена',
                    'expired_count': test_result.get('expired_count', 0),
                    'notifications_sent': test_result.get('notifications_sent', 0)
                }

            else:
                raise ValueError(f'Неизвестное действие: {action}')

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(result),
                'isBase64Encoded': False
            }

    except Exception as e:
        print(f'Error in automation settings: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }


def get_automation_settings(cur) -> dict:
    """Получить текущие настройки автоматизации"""
    api_key = get_cronjob_api_key(cur)
    
    settings = {
        'cronjob_api_key': api_key[:8] + '...' if api_key else '',
        'cronjob_enabled': bool(api_key)
    }
    
    if api_key:
        job_id = get_cronjob_id(cur, 'check_subscriptions')
        if job_id:
            job_info = get_cronjob_info(api_key, job_id)
            if job_info:
                settings['check_subscriptions_job'] = job_info
    
    return settings


def get_cronjob_api_key(cur) -> Optional[str]:
    """Получить API ключ cron-job.org из БД"""
    cur.execute("""
        SELECT setting_value 
        FROM t_p56134400_telegram_ai_bot_pdf.default_settings 
        WHERE setting_key = 'cronjob_api_key'
    """)
    row = cur.fetchone()
    return row[0] if row else None


def save_cronjob_api_key(cur, api_key: str):
    """Сохранить API ключ cron-job.org в БД"""
    cur.execute("""
        INSERT INTO t_p56134400_telegram_ai_bot_pdf.default_settings (setting_key, setting_value)
        VALUES ('cronjob_api_key', %s)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = EXCLUDED.setting_value
    """, (api_key,))


def get_cronjob_id(cur, job_name: str) -> Optional[int]:
    """Получить ID cron-задания из БД"""
    cur.execute("""
        SELECT setting_value 
        FROM t_p56134400_telegram_ai_bot_pdf.default_settings 
        WHERE setting_key = %s
    """, (f'cronjob_id_{job_name}',))
    row = cur.fetchone()
    return int(row[0]) if row else None


def save_cronjob_id(cur, job_name: str, job_id: int):
    """Сохранить ID cron-задания в БД"""
    cur.execute("""
        INSERT INTO t_p56134400_telegram_ai_bot_pdf.default_settings (setting_key, setting_value)
        VALUES (%s, %s)
        ON CONFLICT (setting_key) 
        DO UPDATE SET setting_value = EXCLUDED.setting_value
    """, (f'cronjob_id_{job_name}', str(job_id)))


def create_or_update_cronjob(api_key: str, enabled: bool = True) -> int:
    """Создать или обновить cron-задание для проверки подписок"""
    check_url = 'https://functions.poehali.dev/d4cc01d8-b97c-4f4c-894f-ccafc67a58b9'
    
    job_data = {
        'job': {
            'enabled': enabled,
            'title': 'Проверка подписок тенантов AI-консьержа',
            'url': check_url,
            'schedule': {
                'timezone': 'Europe/Moscow',
                'hours': [9],
                'mdays': [-1],
                'minutes': [0],
                'months': [-1],
                'wdays': [-1]
            },
            'requestMethod': 1
        }
    }
    
    response = requests.put(
        'https://api.cron-job.org/jobs',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        json=job_data,
        timeout=10
    )
    
    response.raise_for_status()
    result = response.json()
    return result['jobId']


def disable_cronjob(api_key: str, job_id: int):
    """Отключить cron-задание"""
    response = requests.patch(
        f'https://api.cron-job.org/jobs/{job_id}',
        headers={
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        },
        json={'job': {'enabled': False}},
        timeout=10
    )
    response.raise_for_status()


def get_cronjob_info(api_key: str, job_id: int) -> Optional[dict]:
    """Получить информацию о cron-задании"""
    try:
        response = requests.get(
            f'https://api.cron-job.org/jobs/{job_id}',
            headers={'Authorization': f'Bearer {api_key}'},
            timeout=10
        )
        response.raise_for_status()
        job = response.json()['jobDetails']
        
        return {
            'jobId': job['jobId'],
            'enabled': job['enabled'],
            'title': job['title'],
            'url': job['url'],
            'schedule': job['schedule'],
            'lastExecution': job.get('lastExecution'),
            'nextExecution': job.get('nextExecution')
        }
    except Exception as e:
        print(f'Error getting cronjob info: {str(e)}')
        return None
