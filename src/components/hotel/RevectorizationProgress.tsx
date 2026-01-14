import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { authenticatedFetch, getTenantId } from '@/lib/auth';
import { BACKEND_URLS } from './types';

interface RevectorizationStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress: number;
  total: number;
  error?: string | null;
}

interface RevectorizationProgressProps {
  currentTenantId?: number | null;
  onComplete?: () => void;
}

const RevectorizationProgress = ({ currentTenantId, onComplete }: RevectorizationProgressProps) => {
  const [status, setStatus] = useState<RevectorizationStatus>({
    status: 'idle',
    progress: 0,
    total: 0
  });
  const [isPolling, setIsPolling] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [estimatedTimeLeft, setEstimatedTimeLeft] = useState<string>('');

  useEffect(() => {
    loadStatus();
    
    // Автоматический polling если процесс идёт
    if (status.status === 'processing') {
      setIsPolling(true);
      const interval = setInterval(loadStatus, 2000); // Каждые 2 секунды
      return () => clearInterval(interval);
    } else {
      setIsPolling(false);
    }
  }, [status.status]);

  const loadStatus = async () => {
    try {
      const tenantId = currentTenantId !== null && currentTenantId !== undefined ? currentTenantId : getTenantId();
      const url = tenantId !== null && tenantId !== undefined 
        ? `${BACKEND_URLS.revectorizeDocuments}?tenant_id=${tenantId}` 
        : BACKEND_URLS.revectorizeDocuments;
      
      const response = await authenticatedFetch(url);
      const data = await response.json();
      
      const newStatus: RevectorizationStatus = {
        status: data.status || 'idle',
        progress: data.progress || 0,
        total: data.total || 0,
        error: data.error
      };
      
      // Запомнить время старта
      if (newStatus.status === 'processing' && !startTime) {
        setStartTime(Date.now());
      }
      
      // Рассчитать оставшееся время
      if (newStatus.status === 'processing' && startTime && newStatus.progress > 0) {
        const elapsed = Date.now() - startTime;
        const avgTimePerDoc = elapsed / newStatus.progress;
        const remaining = avgTimePerDoc * (newStatus.total - newStatus.progress);
        
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        
        if (minutes > 0) {
          setEstimatedTimeLeft(`~${minutes} мин ${seconds} сек`);
        } else {
          setEstimatedTimeLeft(`~${seconds} сек`);
        }
      } else if (newStatus.status !== 'processing') {
        setStartTime(null);
        setEstimatedTimeLeft('');
      }
      
      setStatus(newStatus);
      
      // Если процесс завершён - вызвать callback
      if (newStatus.status === 'completed' && onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error loading revectorization status:', error);
    }
  };

  const getProgressPercentage = () => {
    if (status.total === 0) return 0;
    return Math.round((status.progress / status.total) * 100);
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-slate-300';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'processing':
        return <Icon name="Loader2" size={20} className="animate-spin text-blue-600" />;
      case 'completed':
        return <Icon name="CheckCircle" size={20} className="text-green-600" />;
      case 'error':
        return <Icon name="XCircle" size={20} className="text-red-600" />;
      default:
        return <Icon name="Circle" size={20} className="text-slate-400" />;
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'processing':
        return 'Документы обрабатываются с новыми эмбеддингами';
      case 'completed':
        return `Успешно ревекторизовано ${status.total} документов`;
      case 'error':
        return `Ошибка: ${status.error || 'Неизвестная ошибка'}`;
      default:
        return 'Ревекторизация не требуется';
    }
  };

  // Если статус idle - не показываем компонент
  if (status.status === 'idle') {
    return null;
  }

  return (
    <Card className="border-2 border-blue-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Ревекторизация документов
        </CardTitle>
        <CardDescription>
          {getStatusText()}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        {status.status === 'processing' && (
          <>
            <Progress value={getProgressPercentage()} className="h-3" />
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-1">Прогресс</p>
                <p className="font-semibold text-slate-700">{getProgressPercentage()}%</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-1">Документов</p>
                <p className="font-semibold text-slate-700">{status.progress} / {status.total}</p>
              </div>
              {estimatedTimeLeft && (
                <div className="col-span-2">
                  <p className="text-slate-500 text-xs mb-1">Осталось времени</p>
                  <p className="font-semibold text-blue-700 flex items-center gap-1">
                    <Icon name="Clock" size={14} />
                    {estimatedTimeLeft}
                  </p>
                </div>
              )}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <p className="font-medium">Идёт ревекторизация</p>
                  <p className="text-blue-800 mt-1">
                    Документы обрабатываются с использованием новой модели embeddings. 
                    Это может занять несколько минут.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {status.status === 'completed' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="CheckCircle" size={20} className="text-green-600" />
              <span className="font-semibold text-green-900">Ревекторизация завершена!</span>
            </div>
            <p className="text-sm text-green-800">
              Все документы успешно обработаны с новой моделью embeddings. 
              Теперь поиск будет работать корректно.
            </p>
          </div>
        )}

        {status.status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="XCircle" size={20} className="text-red-600" />
              <span className="font-semibold text-red-900">Ошибка ревекторизации</span>
            </div>
            <p className="text-sm text-red-800 mb-3">
              {status.error || 'Произошла неизвестная ошибка при обработке документов'}
            </p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={loadStatus}
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              <Icon name="RefreshCw" size={14} className="mr-2" />
              Повторить попытку
            </Button>
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={loadStatus}
            disabled={isPolling}
          >
            <Icon name="RefreshCw" size={14} className={`mr-2 ${isPolling ? 'animate-spin' : ''}`} />
            Обновить статус
          </Button>
          <span className="text-xs text-slate-500">
            {isPolling ? 'Автообновление...' : 'Готово'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default RevectorizationProgress;