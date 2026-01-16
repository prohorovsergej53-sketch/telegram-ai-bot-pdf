import json
import os
import psycopg2

def handler(event: dict, context) -> dict:
    """Одноразовая функция для добавления CASCADE constraints"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        results = []
        
        # Пересоздаём 2 существующих constraint с CASCADE
        sqls = [
            """ALTER TABLE t_p56134400_telegram_ai_bot_pdf.admin_users
               DROP CONSTRAINT IF EXISTS admin_users_tenant_id_fkey,
               ADD CONSTRAINT admin_users_tenant_id_fkey 
               FOREIGN KEY (tenant_id) REFERENCES t_p56134400_telegram_ai_bot_pdf.tenants(id) ON DELETE CASCADE""",
            
            """ALTER TABLE t_p56134400_telegram_ai_bot_pdf.subscription_payments
               DROP CONSTRAINT IF EXISTS subscription_payments_tenant_id_fkey,
               ADD CONSTRAINT subscription_payments_tenant_id_fkey 
               FOREIGN KEY (tenant_id) REFERENCES t_p56134400_telegram_ai_bot_pdf.tenants(id) ON DELETE CASCADE""",
            
            # Создаём 7 новых constraint с CASCADE
            """ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_settings
               ADD CONSTRAINT tenant_settings_tenant_id_fkey 
               FOREIGN KEY (tenant_id) REFERENCES t_p56134400_telegram_ai_bot_pdf.tenants(id) ON DELETE CASCADE""",
            
            """ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_documents
               ADD CONSTRAINT tenant_documents_tenant_id_fkey 
               FOREIGN KEY (tenant_id) REFERENCES t_p56134400_telegram_ai_bot_pdf.tenants(id) ON DELETE CASCADE""",
            
            """ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_chunks
               ADD CONSTRAINT tenant_chunks_tenant_id_fkey 
               FOREIGN KEY (tenant_id) REFERENCES t_p56134400_telegram_ai_bot_pdf.tenants(id) ON DELETE CASCADE""",
            
            """ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_chunks
               ADD CONSTRAINT tenant_chunks_document_id_fkey 
               FOREIGN KEY (document_id) REFERENCES t_p56134400_telegram_ai_bot_pdf.tenant_documents(id) ON DELETE CASCADE""",
            
            """ALTER TABLE t_p56134400_telegram_ai_bot_pdf.chat_messages
               ADD CONSTRAINT chat_messages_tenant_id_fkey 
               FOREIGN KEY (tenant_id) REFERENCES t_p56134400_telegram_ai_bot_pdf.tenants(id) ON DELETE CASCADE""",
            
            """ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_quality_gate_logs
               ADD CONSTRAINT tenant_quality_gate_logs_tenant_id_fkey 
               FOREIGN KEY (tenant_id) REFERENCES t_p56134400_telegram_ai_bot_pdf.tenants(id) ON DELETE CASCADE""",
            
            """ALTER TABLE t_p56134400_telegram_ai_bot_pdf.tenant_api_keys
               ADD CONSTRAINT tenant_api_keys_tenant_id_fkey 
               FOREIGN KEY (tenant_id) REFERENCES t_p56134400_telegram_ai_bot_pdf.tenants(id) ON DELETE CASCADE"""
        ]
        
        for i, sql in enumerate(sqls, 1):
            try:
                cur.execute(sql)
                conn.commit()
                results.append(f"✅ Constraint {i}/9 добавлен")
            except Exception as e:
                conn.rollback()
                error_msg = str(e)
                if 'already exists' in error_msg:
                    results.append(f"⚠️ Constraint {i}/9 уже существует")
                else:
                    results.append(f"❌ Constraint {i}/9 ошибка: {error_msg}")
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'ok': True,
                'results': results,
                'message': 'CASCADE constraints добавлены!'
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
