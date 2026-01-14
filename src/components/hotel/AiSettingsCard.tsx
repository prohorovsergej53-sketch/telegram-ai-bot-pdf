import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URLS, AI_MODELS, DEFAULT_AI_SETTINGS, AiModelSettings } from './types';
import Icon from '@/components/ui/icon';
import { AI_PRESETS } from './AiSettingsPresets';
import AiSettingsSliders from './AiSettingsSliders';
import { authenticatedFetch, getTenantId } from '@/lib/auth';
import RevectorizationProgress from './RevectorizationProgress';

interface AiSettingsCardProps {
  currentTenantId?: number | null;
  isSuperAdmin?: boolean;
}

const AiSettingsCard = ({ currentTenantId, isSuperAdmin = false }: AiSettingsCardProps) => {
  const [selectedModel, setSelectedModel] = useState<string>('yandexgpt');
  const [settings, setSettings] = useState<AiModelSettings>(DEFAULT_AI_SETTINGS.yandexgpt);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [configStatus, setConfigStatus] = useState<'not_set' | 'active' | 'error'>('not_set');
  const [showRevectorization, setShowRevectorization] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const getStatusBadge = () => {
    if (configStatus === 'active') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
          <Icon name="CheckCircle" size={12} />
          Настроено
        </span>
      );
    }
    if (configStatus === 'error') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
          <Icon name="XCircle" size={12} />
          Ошибка
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
        <Icon name="Circle" size={12} />
        По умолчанию
      </span>
    );
  };

  const loadSettings = async () => {
    try {
      const tenantId = currentTenantId !== null && currentTenantId !== undefined ? currentTenantId : getTenantId();
      const url = tenantId !== null && tenantId !== undefined ? `${BACKEND_URLS.getAiSettings}?tenant_id=${tenantId}` : BACKEND_URLS.getAiSettings;
      const response = await authenticatedFetch(url);
      const data = await response.json();
      if (data.settings) {
        setSelectedModel(data.settings.model);
        setSettings(data.settings);
        setConfigStatus('active');
      }
    } catch (error) {
      console.error('Error loading AI settings:', error);
      setConfigStatus('error');
    }
  };

  const handleModelChange = async (model: string) => {
    const oldModel = selectedModel;
    const oldEmbeddingDim = AI_MODELS.find(m => m.value === oldModel)?.embeddingDim;
    const newEmbeddingDim = AI_MODELS.find(m => m.value === model)?.embeddingDim;
    
    setSelectedModel(model);
    setSettings(DEFAULT_AI_SETTINGS[model as keyof typeof DEFAULT_AI_SETTINGS]);
    setSelectedPreset('');
    
    // Если размерность эмбеддингов изменилась - нужна ревекторизация
    if (oldEmbeddingDim !== newEmbeddingDim) {
      toast({
        title: 'Изменение модели',
        description: `Модель изменена с ${oldModel} (${oldEmbeddingDim}D) на ${model} (${newEmbeddingDim}D). При сохранении документы будут автоматически ревекторизованы.`,
        duration: 8000
      });
    }
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = AI_PRESETS[selectedModel]?.find(p => p.id === presetId);
    if (preset) {
      setSettings(preset.settings);
      toast({
        title: 'Пресет применён',
        description: preset.name
      });
    }
  };

  const handleResetToDefaults = () => {
    setSettings(DEFAULT_AI_SETTINGS[selectedModel as keyof typeof DEFAULT_AI_SETTINGS]);
    setSelectedPreset('');
    toast({
      title: 'Сброшено',
      description: 'Настройки восстановлены по умолчанию'
    });
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      const tenantId = currentTenantId !== null && currentTenantId !== undefined ? currentTenantId : getTenantId();
      
      // Загрузить старые настройки чтобы сравнить модель
      const getUrl = tenantId !== null && tenantId !== undefined ? `${BACKEND_URLS.getAiSettings}?tenant_id=${tenantId}` : BACKEND_URLS.getAiSettings;
      const getResponse = await authenticatedFetch(getUrl);
      const oldData = await getResponse.json();
      const oldModel = oldData.settings?.model || 'yandexgpt';
      
      // Сохранить новые настройки
      const updateUrl = tenantId !== null && tenantId !== undefined ? `${BACKEND_URLS.updateAiSettings}?tenant_id=${tenantId}` : BACKEND_URLS.updateAiSettings;
      const response = await authenticatedFetch(updateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });

      const data = await response.json();

      if (response.ok) {
        setConfigStatus('active');
        
        // Проверить нужна ли ревекторизация
        const oldModelInfo = AI_MODELS.find(m => m.value === oldModel);
        const newModelInfo = AI_MODELS.find(m => m.value === selectedModel);
        
        if (oldModelInfo && newModelInfo && oldModelInfo.embeddingDim !== newModelInfo.embeddingDim) {
          // Запустить ревекторизацию
          const revectorizeUrl = tenantId !== null && tenantId !== undefined 
            ? `${BACKEND_URLS.revectorizeDocuments}?tenant_id=${tenantId}` 
            : BACKEND_URLS.revectorizeDocuments;
          
          await authenticatedFetch(revectorizeUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: selectedModel })
          });
          
          setShowRevectorization(true);
          
          toast({
            title: 'Сохранено! Запущена ревекторизация',
            description: `Модель изменена. Документы обрабатываются с новыми embeddings (${newModelInfo.embeddingDim}D)`,
            duration: 10000
          });
        } else {
          toast({
            title: 'Сохранено!',
            description: 'Настройки AI обновлены'
          });
        }
      } else {
        setConfigStatus('error');
        throw new Error(data.error);
      }
    } catch (error: any) {
      setConfigStatus('error');
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось сохранить настройки',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentDefaults = DEFAULT_AI_SETTINGS[selectedModel as keyof typeof DEFAULT_AI_SETTINGS];
  const isDefaultSettings = JSON.stringify(settings) === JSON.stringify(currentDefaults);
  const currentPresets = AI_PRESETS[selectedModel] || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Brain" size={24} />
            Настройки AI
          </div>
          {getStatusBadge()}
        </CardTitle>
        <CardDescription>
          Параметры языковой модели для генерации ответов
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isSuperAdmin ? (
          <div className="space-y-2">
            <Label>Модель AI</Label>
            <Select value={selectedModel} onValueChange={handleModelChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{model.label}</span>
                      <span className="text-xs text-slate-500 ml-2">({model.embeddingDim}D)</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Информация об эмбеддингах */}
            {selectedModel && (() => {
              const modelInfo = AI_MODELS.find(m => m.value === selectedModel);
              if (!modelInfo) return null;
              
              const hasMultipleEmbeddings = modelInfo.embeddingModels.doc !== modelInfo.embeddingModels.query;
              
              return (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                  <div className="flex items-start gap-2">
                    <Icon name="Database" size={16} className="text-blue-600 mt-0.5" />
                    <div className="text-xs text-blue-900">
                      <p className="font-semibold mb-2">Настройки эмбеддингов:</p>
                      <div className="space-y-2">
                        <div className="bg-white/60 rounded p-2">
                          <p className="font-medium text-blue-800">Провайдер: {modelInfo.embeddingProvider === 'yandex' ? 'Yandex' : modelInfo.embeddingProvider === 'jinaai' ? 'Jina AI' : modelInfo.embeddingProvider}</p>
                          <p className="text-blue-700 mt-1">Размерность: {modelInfo.embeddingDim}D</p>
                        </div>
                        {hasMultipleEmbeddings ? (
                          <>
                            <div className="bg-white/60 rounded p-2">
                              <p className="font-medium text-blue-800 flex items-center gap-1">
                                <Icon name="FileText" size={12} />
                                Для документов:
                              </p>
                              <p className="text-blue-700 font-mono text-[10px] mt-1">{modelInfo.embeddingModels.doc}</p>
                            </div>
                            <div className="bg-white/60 rounded p-2">
                              <p className="font-medium text-blue-800 flex items-center gap-1">
                                <Icon name="Search" size={12} />
                                Для запросов:
                              </p>
                              <p className="text-blue-700 font-mono text-[10px] mt-1">{modelInfo.embeddingModels.query}</p>
                            </div>
                          </>
                        ) : (
                          <div className="bg-white/60 rounded p-2">
                            <p className="font-medium text-blue-800">Единая модель:</p>
                            <p className="text-blue-700 font-mono text-[10px] mt-1">{modelInfo.embeddingModels.doc}</p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-2 border-t border-blue-300">
                        <p className="text-amber-700 flex items-center gap-1">
                          <Icon name="AlertTriangle" size={12} />
                          <span className="font-medium">При смене модели все документы будут ревекторизованы</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <Icon name="Brain" size={16} className="text-slate-600" />
              <Label className="text-slate-700">Текущая модель</Label>
            </div>
            <p className="text-lg font-semibold text-slate-900">
              {AI_MODELS.find(m => m.value === selectedModel)?.label || selectedModel}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Изменение модели доступно только суперадмину
            </p>
          </div>
        )}

        {currentPresets.length > 0 && (
          <div className="space-y-2">
            <Label>Пресеты настроек</Label>
            <Select value={selectedPreset} onValueChange={handlePresetChange}>
              <SelectTrigger>
                <SelectValue placeholder="Выберите пресет или настройте вручную" />
              </SelectTrigger>
              <SelectContent>
                {currentPresets.map((preset) => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{preset.name}</span>
                      <span className="text-xs text-slate-500">{preset.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedPreset && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <Icon name="Info" size={16} className="inline mr-1" />
                  {currentPresets.find(p => p.id === selectedPreset)?.description}
                </p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="system_prompt">Системный промпт</Label>
          <Textarea
            id="system_prompt"
            value={settings.system_prompt || ''}
            onChange={(e) => {
              setSettings({ ...settings, system_prompt: e.target.value });
              setSelectedPreset('');
            }}
            placeholder="Введите системный промпт для AI ассистента..."
            rows={8}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Системный промпт определяет поведение и стиль ответов AI ассистента
          </p>
        </div>

        <AiSettingsSliders
          settings={settings}
          selectedModel={selectedModel}
          onSettingsChange={(newSettings) => {
            setSettings(newSettings);
            setSelectedPreset('');
          }}
        />

        <div className="flex gap-2 pt-4">
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Сохранение...' : 'Сохранить'}
          </Button>
          <Button
            onClick={handleResetToDefaults}
            variant="outline"
            disabled={isDefaultSettings}
          >
            Сбросить
          </Button>
        </div>

        {!isDefaultSettings && !selectedPreset && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <Icon name="AlertTriangle" size={16} className="inline mr-1" />
              Настройки отличаются от рекомендованных
            </p>
          </div>
        )}

        {showRevectorization && (
          <RevectorizationProgress 
            currentTenantId={currentTenantId}
            onComplete={() => setShowRevectorization(false)}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AiSettingsCard;