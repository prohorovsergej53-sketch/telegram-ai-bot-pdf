import json
import os
import psycopg2
import boto3
from datetime import datetime

def handler(event: dict, context) -> dict:
    """Резервное копирование базы данных в S3 (экспорт критичных таблиц)"""
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': '',
            'isBase64Encoded': False
        }

    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        
        tables_data = {}
        critical_tables = ['tenants', 'admin_users', 'tariff_plans', 'default_settings']
        
        for table in critical_tables:
            cur.execute(f"""
                SELECT json_agg(row_to_json(t.*))
                FROM t_p56134400_telegram_ai_bot_pdf.{table} t
            """)
            tables_data[table] = cur.fetchone()[0] or []
        
        backup_content = json.dumps(tables_data, ensure_ascii=False, indent=2)
        backup_filename = f'backup_{timestamp}.json'
        
        s3 = boto3.client('s3',
            endpoint_url='https://bucket.poehali.dev',
            aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
            aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
        )
        
        s3.put_object(
            Bucket='files',
            Key=f'backups/{backup_filename}',
            Body=backup_content.encode('utf-8'),
            ContentType='application/json'
        )
        
        cur.close()
        conn.close()
        
        result = {
            'ok': True,
            'backup_file': backup_filename,
            'timestamp': timestamp,
            'tables_backed_up': len(critical_tables),
            'message': f'Бэкап успешно создан: {backup_filename}'
        }
        
        print(f'Backup completed: {json.dumps(result)}')
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(result),
            'isBase64Encoded': False
        }

    except Exception as e:
        print(f'Error creating backup: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }