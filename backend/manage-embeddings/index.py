import json
import os
import psycopg2
from auth_middleware import get_tenant_id_from_request

def handler(event: dict, context) -> dict:
    """Управление настройками эмбеддингов для суперадмина"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Authorization'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        tenant_id, auth_error = get_tenant_id_from_request(event)
        if auth_error:
            return auth_error

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()

        cur.execute(f"""
            SELECT is_super_admin 
            FROM t_p56134400_telegram_ai_bot_pdf.tenants 
            WHERE id = {tenant_id}
        """)
        result = cur.fetchone()
        
        if not result or not result[0]:
            cur.close()
            conn.close()
            return {
                'statusCode': 403,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Access denied. Super admin only'}),
                'isBase64Encoded': False
            }

        if method == 'GET':
            query_params = event.get('queryStringParameters') or {}
            target_tenant_id = query_params.get('tenant_id')

            if target_tenant_id:
                cur.execute(f"""
                    SELECT 
                        ts.embedding_provider,
                        ts.embedding_doc_model,
                        ts.embedding_query_model,
                        t.fz152_enabled
                    FROM t_p56134400_telegram_ai_bot_pdf.tenant_settings ts
                    JOIN t_p56134400_telegram_ai_bot_pdf.tenants t ON t.id = ts.tenant_id
                    WHERE ts.tenant_id = {target_tenant_id}
                """)
                row = cur.fetchone()
                
                if not row:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Tenant not found'}),
                        'isBase64Encoded': False
                    }

                result = {
                    'embedding_provider': row[0] or 'yandex',
                    'embedding_doc_model': row[1] or 'text-search-doc',
                    'embedding_query_model': row[2] or 'text-search-query',
                    'fz152_enabled': row[3] if row[3] is not None else False
                }

                cur.close()
                conn.close()

                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'tenants': [result]}),
                    'isBase64Encoded': False
                }
            else:
                cur.execute("""
                    SELECT 
                        t.id,
                        t.name,
                        t.fz152_enabled,
                        ts.embedding_provider,
                        ts.embedding_doc_model,
                        ts.embedding_query_model
                    FROM t_p56134400_telegram_ai_bot_pdf.tenants t
                    LEFT JOIN t_p56134400_telegram_ai_bot_pdf.tenant_settings ts ON t.id = ts.tenant_id
                    WHERE t.is_super_admin = false
                    ORDER BY t.name
                """)
                rows = cur.fetchall()
                
                tenants = []
                for row in rows:
                    tenants.append({
                        'id': row[0],
                        'name': row[1],
                        'fz152_enabled': row[2] if row[2] is not None else False,
                        'embedding_provider': row[3] or 'yandex',
                        'embedding_doc_model': row[4] or 'text-search-doc',
                        'embedding_query_model': row[5] or 'text-search-query'
                    })

                cur.close()
                conn.close()

                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'tenants': tenants}),
                    'isBase64Encoded': False
                }

        elif method == 'PUT':
            body = json.loads(event.get('body', '{}'))
            target_tenant_id = body.get('tenant_id')
            embedding_provider = body.get('embedding_provider')
            embedding_doc_model = body.get('embedding_doc_model')
            embedding_query_model = body.get('embedding_query_model')

            if not target_tenant_id:
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'tenant_id required'}),
                    'isBase64Encoded': False
                }

            cur.execute(f"""
                SELECT fz152_enabled 
                FROM t_p56134400_telegram_ai_bot_pdf.tenants 
                WHERE id = {target_tenant_id}
            """)
            tenant_row = cur.fetchone()
            
            if not tenant_row:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Tenant not found'}),
                    'isBase64Encoded': False
                }

            fz152_enabled = tenant_row[0]
            if fz152_enabled and embedding_provider != 'yandex':
                cur.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Cannot change embedding provider for tenants with 152-ФЗ enabled'}),
                    'isBase64Encoded': False
                }

            cur.execute(f"""
                UPDATE t_p56134400_telegram_ai_bot_pdf.tenant_settings
                SET 
                    embedding_provider = '{embedding_provider}',
                    embedding_doc_model = '{embedding_doc_model}',
                    embedding_query_model = '{embedding_query_model}',
                    updated_at = CURRENT_TIMESTAMP
                WHERE tenant_id = {target_tenant_id}
            """)

            conn.commit()
            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }

        else:
            cur.close()
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }

    except Exception as e:
        print(f"ERROR in manage-embeddings: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }