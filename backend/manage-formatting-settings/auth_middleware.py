"""Middleware для проверки JWT токена пользователя"""
import os
import jwt
import psycopg2

def get_authenticated_user(event: dict) -> dict | None:
    """
    Извлекает и проверяет JWT токен из заголовка Authorization.
    Возвращает данные пользователя или None.
    """
    try:
        headers = event.get('headers', {})
        auth_header = headers.get('X-Authorization', headers.get('authorization', ''))
        
        if not auth_header:
            return None
        
        # Извлекаем токен (формат: "Bearer <token>")
        token = auth_header.replace('Bearer ', '').replace('bearer ', '')
        
        # Декодируем JWT
        jwt_secret = os.environ.get('JWT_SECRET')
        if not jwt_secret:
            print('JWT_SECRET не установлен')
            return None
        
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        user_id = payload.get('userId')
        
        if not user_id:
            return None
        
        # Получаем данные пользователя из БД
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute("""
            SELECT id, email, is_super_admin, tenant_id
            FROM t_p56134400_telegram_ai_bot_pdf.users
            WHERE id = %s
        """, (user_id,))
        
        row = cur.fetchone()
        cur.close()
        conn.close()
        
        if not row:
            return None
        
        return {
            'id': row[0],
            'email': row[1],
            'is_super_admin': row[2],
            'tenant_id': row[3]
        }
        
    except jwt.ExpiredSignatureError:
        print('JWT токен истёк')
        return None
    except jwt.InvalidTokenError as e:
        print(f'Невалидный JWT токен: {e}')
        return None
    except Exception as e:
        print(f'Ошибка аутентификации: {e}')
        return None
