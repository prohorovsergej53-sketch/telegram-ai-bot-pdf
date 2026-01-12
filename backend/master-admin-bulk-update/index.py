import json
import os
import psycopg2
from datetime import datetime

def handler(event: dict, context) -> dict:
    """Массовое обновление тенантов до новой версии мастер-шаблона"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
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
        body = json.loads(event.get('body', '{}'))
        target_version = body.get('target_version')
        tenant_ids = body.get('tenant_ids', [])  # Пустой список = все тенанты с auto_update=true
        update_all = body.get('update_all', False)
        updated_by = body.get('updated_by', 'system')

        if not target_version:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'target_version required'}),
                'isBase64Encoded': False
            }

        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()

        # Проверяем существование целевой версии
        cur.execute("""
            SELECT version FROM t_p56134400_telegram_ai_bot_pdf.master_template
            WHERE version = %s
        """, (target_version,))
        if not cur.fetchone():
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Target version not found'}),
                'isBase64Encoded': False
            }

        # Определяем тенантов для обновления
        if update_all:
            cur.execute("""
                SELECT id, slug, template_version FROM t_p56134400_telegram_ai_bot_pdf.tenants
                WHERE status = 'active'
            """)
        elif tenant_ids:
            placeholders = ','.join(['%s'] * len(tenant_ids))
            cur.execute(f"""
                SELECT id, slug, template_version FROM t_p56134400_telegram_ai_bot_pdf.tenants
                WHERE id IN ({placeholders}) AND status = 'active'
            """, tenant_ids)
        else:
            cur.execute("""
                SELECT id, slug, template_version FROM t_p56134400_telegram_ai_bot_pdf.tenants
                WHERE auto_update = true AND status = 'active'
            """)

        tenants_to_update = cur.fetchall()
        
        updated_count = 0
        failed_count = 0
        results = []

        for tenant_id, slug, current_version in tenants_to_update:
            try:
                # Обновляем версию тенанта
                cur.execute("""
                    UPDATE t_p56134400_telegram_ai_bot_pdf.tenants
                    SET template_version = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (target_version, tenant_id))

                # Логируем обновление
                cur.execute("""
                    INSERT INTO t_p56134400_telegram_ai_bot_pdf.update_history
                    (tenant_id, from_version, to_version, update_type, status, updated_by)
                    VALUES (%s, %s, %s, %s, 'success', %s)
                """, (tenant_id, current_version, target_version, 
                      'bulk' if (update_all or tenant_ids) else 'auto', updated_by))

                conn.commit()
                updated_count += 1
                results.append({
                    'tenant_id': tenant_id,
                    'slug': slug,
                    'status': 'success',
                    'from_version': current_version,
                    'to_version': target_version
                })

            except Exception as e:
                # Логируем ошибку
                cur.execute("""
                    INSERT INTO t_p56134400_telegram_ai_bot_pdf.update_history
                    (tenant_id, from_version, to_version, update_type, status, error_message, updated_by)
                    VALUES (%s, %s, %s, %s, 'failed', %s, %s)
                """, (tenant_id, current_version, target_version,
                      'bulk' if (update_all or tenant_ids) else 'auto', str(e), updated_by))
                
                conn.commit()
                failed_count += 1
                results.append({
                    'tenant_id': tenant_id,
                    'slug': slug,
                    'status': 'failed',
                    'error': str(e)
                })

        cur.close()
        conn.close()

        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'success': True,
                'updated_count': updated_count,
                'failed_count': failed_count,
                'total_count': len(tenants_to_update),
                'results': results
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
