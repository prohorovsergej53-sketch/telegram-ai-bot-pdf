import json
import urllib.request
import urllib.error

def handler(event: dict, context) -> dict:
    '''Уведомляет поисковики через IndexNow API о новых или обновлённых страницах'''
    
    method = event.get('httpMethod', 'GET')
    
    # CORS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    # Параметры для IndexNow
    host = "ai-ru.ru"
    key = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
    key_location = f"https://{host}/indexnow-key.txt"
    
    # URL-ы для уведомления
    urls = [
        f"https://{host}",
        f"https://{host}#features",
        f"https://{host}#vector-tech",
        f"https://{host}#how-it-works",
        f"https://{host}#pricing",
        f"https://{host}#faq",
        f"https://{host}#order-form"
    ]
    
    # Подготовка данных
    data = {
        "host": host,
        "key": key,
        "keyLocation": key_location,
        "urlList": urls
    }
    
    results = []
    
    # Отправка в разные поисковики через IndexNow
    indexnow_endpoints = [
        "https://api.indexnow.org/indexnow",  # Общий endpoint
        "https://www.bing.com/indexnow",       # Bing
        "https://yandex.com/indexnow"          # Yandex
    ]
    
    for endpoint in indexnow_endpoints:
        try:
            req = urllib.request.Request(
                endpoint,
                data=json.dumps(data).encode('utf-8'),
                headers={'Content-Type': 'application/json; charset=utf-8'}
            )
            
            with urllib.request.urlopen(req, timeout=10) as response:
                status = response.getcode()
                results.append({
                    'endpoint': endpoint,
                    'status': status,
                    'success': status in [200, 202]
                })
        except urllib.error.HTTPError as e:
            results.append({
                'endpoint': endpoint,
                'status': e.code,
                'success': e.code == 202,  # 202 = успешно принято
                'error': str(e.reason)
            })
        except Exception as e:
            results.append({
                'endpoint': endpoint,
                'status': 0,
                'success': False,
                'error': str(e)
            })
    
    # Проверяем, был ли хоть один успешный ответ
    any_success = any(r['success'] for r in results)
    
    return {
        'statusCode': 200 if any_success else 500,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': any_success,
            'message': 'Поисковики уведомлены об обновлении сайта' if any_success else 'Ошибка уведомления',
            'results': results,
            'urls_submitted': len(urls)
        }, ensure_ascii=False)
    }
