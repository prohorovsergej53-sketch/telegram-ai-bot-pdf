import json
import urllib.request
import urllib.error
from urllib.parse import urlencode, quote

def handler(event: dict, context) -> dict:
    '''Уведомляет поисковики через IndexNow API и XML-RPC ping сервисы о новых или обновлённых страницах'''
    
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
    
    # XML-RPC Ping сервисы (Ping-O-Matic и другие)
    site_url = f"https://{host}"
    site_name = "AI-консультант на векторной базе данных"
    sitemap_url = f"https://{host}/sitemap.xml"
    
    ping_services = [
        {
            'name': 'Ping-O-Matic',
            'url': 'http://rpc.pingomatic.com/',
            'type': 'xmlrpc'
        },
        {
            'name': 'Google Ping',
            'url': f'https://www.google.com/ping?sitemap={quote(sitemap_url)}',
            'type': 'get'
        },
        {
            'name': 'Bing Ping',
            'url': f'https://www.bing.com/ping?sitemap={quote(sitemap_url)}',
            'type': 'get'
        }
    ]
    
    for service in ping_services:
        try:
            if service['type'] == 'xmlrpc':
                # XML-RPC запрос для Ping-O-Matic
                xml_body = f'''<?xml version="1.0" encoding="UTF-8"?>
<methodCall>
  <methodName>weblogUpdates.ping</methodName>
  <params>
    <param><value><string>{site_name}</string></value></param>
    <param><value><string>{site_url}</string></value></param>
  </params>
</methodCall>'''
                
                req = urllib.request.Request(
                    service['url'],
                    data=xml_body.encode('utf-8'),
                    headers={'Content-Type': 'text/xml; charset=utf-8'}
                )
                
                with urllib.request.urlopen(req, timeout=10) as response:
                    status = response.getcode()
                    response_text = response.read().decode('utf-8')
                    # Проверяем успешность в ответе XML
                    success = status == 200 and 'flerror' in response_text and '>0<' in response_text
                    results.append({
                        'endpoint': service['name'],
                        'status': status,
                        'success': success
                    })
                    
            elif service['type'] == 'get':
                # GET запрос для Google/Bing ping
                req = urllib.request.Request(service['url'])
                with urllib.request.urlopen(req, timeout=10) as response:
                    status = response.getcode()
                    results.append({
                        'endpoint': service['name'],
                        'status': status,
                        'success': status == 200
                    })
                    
        except urllib.error.HTTPError as e:
            results.append({
                'endpoint': service['name'],
                'status': e.code,
                'success': False,
                'error': str(e.reason)
            })
        except Exception as e:
            results.append({
                'endpoint': service['name'],
                'status': 0,
                'success': False,
                'error': str(e)
            })
    
    # Проверяем, был ли хоть один успешный ответ
    any_success = any(r['success'] for r in results)
    success_count = sum(1 for r in results if r['success'])
    
    return {
        'statusCode': 200 if any_success else 500,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': any_success,
            'message': f'Уведомлено {success_count} из {len(results)} сервисов' if any_success else 'Ошибка уведомления',
            'results': results,
            'urls_submitted': len(urls),
            'services_notified': success_count
        }, ensure_ascii=False)
    }