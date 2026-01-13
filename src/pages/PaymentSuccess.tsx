import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 10000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <Icon name="CheckCircle" size={40} className="text-green-600" />
          </div>
          <CardTitle className="text-3xl">Оплата прошла успешно</CardTitle>
          <CardDescription className="text-lg">
            Спасибо за подписку на AI-консьерж
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Icon name="Mail" size={24} className="text-blue-600 mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-2">Проверьте вашу почту</h3>
                <p className="text-muted-foreground">
                  Мы отправили письмо с доступами к системе на указанный при оплате email.
                  В письме вы найдете логин, пароль и ссылку для входа в личный кабинет.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <Icon name="Clock" size={24} className="text-amber-600 mt-1 flex-shrink-0" />
              <div className="text-left">
                <h3 className="font-semibold text-lg mb-2">Что дальше?</h3>
                <ul className="text-muted-foreground space-y-2 list-disc list-inside">
                  <li>Письмо должно прийти в течение 1-2 минут</li>
                  <li>Проверьте папку "Спам", если письма нет во Входящих</li>
                  <li>Используйте полученные данные для входа в систему</li>
                  <li>Загрузите документы вашего отеля для обучения AI</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Button
              onClick={() => navigate('/')}
              size="lg"
              className="w-full"
            >
              <Icon name="Home" className="mr-2" size={20} />
              Вернуться на главную
            </Button>

            <p className="text-sm text-muted-foreground">
              Автоматический переход через 10 секунд...
            </p>
          </div>

          <div className="border-t pt-6 text-sm text-muted-foreground">
            <p>
              Если у вас возникли вопросы или письмо не пришло, напишите нам:
            </p>
            <a href="mailto:support@your-domain.com" className="text-primary hover:underline">
              support@your-domain.com
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
