import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { useState } from 'react';

export const VideoSection = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-4 px-6 py-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full shadow-lg">
              <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Icon name="Video" size={18} />
                Видео-презентация за 2 минуты
              </p>
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Посмотрите, как это работает
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Узнайте за 2 минуты, как AI-консультант увеличивает продажи и экономит ваше время
            </p>
          </div>

          <Card className="bg-slate-800/50 backdrop-blur border-2 border-blue-500/30 shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="relative aspect-video bg-gradient-to-br from-blue-900 to-slate-900">
                {!isPlaying ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl animate-pulse" />
                        <Button
                          size="lg"
                          onClick={() => setIsPlaying(true)}
                          className="relative w-32 h-32 rounded-full bg-gradient-to-br from-primary to-blue-600 hover:from-blue-600 hover:to-primary shadow-2xl hover:shadow-3xl transition-all"
                        >
                          <Icon name="Play" size={48} className="text-white ml-2" />
                        </Button>
                      </div>
                      <p className="text-white text-lg font-semibold mt-6">
                        Нажмите, чтобы посмотреть
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <iframe
                      className="w-full h-full"
                      src="https://chat.ai-ru.ru"
                      title="AI Консультант Демо"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card className="bg-white/10 backdrop-blur border-blue-400/30 hover:bg-white/20 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Без регистрации
                </h3>
                <p className="text-blue-200 text-sm">
                  Попробуйте прямо сейчас — без email, без карты
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-blue-400/30 hover:bg-white/20 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Zap" size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Мгновенные ответы
                </h3>
                <p className="text-blue-200 text-sm">
                  Задайте любой вопрос и получите ответ за 3 секунды
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-blue-400/30 hover:bg-white/20 transition-all">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Brain" size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Реальный AI
                </h3>
                <p className="text-blue-200 text-sm">
                  Это настоящий AI-консультант, который работает прямо сейчас
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <Button size="lg" asChild className="text-lg px-10 py-6 bg-white text-primary hover:bg-blue-50 shadow-xl">
              <a href="https://chat.ai-ru.ru" target="_blank" rel="noopener noreferrer">
                <Icon name="MessageCircle" className="mr-2" size={20} />
                Попробовать демо бесплатно
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
