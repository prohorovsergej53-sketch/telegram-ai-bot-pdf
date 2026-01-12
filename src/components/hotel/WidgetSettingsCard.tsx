import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BACKEND_URLS } from './types';

interface WidgetSettings {
  button_color: string;
  button_color_end: string;
  button_size: number;
  button_position: string;
  window_width: number;
  window_height: number;
  header_title: string;
  header_color: string;
  header_color_end: string;
  border_radius: number;
  show_branding: boolean;
  custom_css: string | null;
}

const WidgetSettingsCard = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<WidgetSettings>({
    button_color: '#667eea',
    button_color_end: '#764ba2',
    button_size: 60,
    button_position: 'bottom-right',
    window_width: 380,
    window_height: 600,
    header_title: 'AI Ассистент',
    header_color: '#667eea',
    header_color_end: '#764ba2',
    border_radius: 16,
    show_branding: true,
    custom_css: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch(BACKEND_URLS.getWidgetSettings);
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error loading widget settings:', error);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(BACKEND_URLS.updateWidgetSettings, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: 'Настройки сохранены',
          description: 'Настройки виджета успешно обновлены'
        });
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось сохранить настройки',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateWidgetCode = () => {
    const chatUrl = window.location.origin;
    
    return `<!-- AI Bot Widget - Вставьте этот код перед закрывающим тегом </body> -->
<script>
(function() {
    var widget = document.createElement('div');
    widget.id = 'ai-bot-widget-container';
    document.body.appendChild(widget);

    var style = document.createElement('style');
    style.textContent = \`
        #ai-bot-widget-container { position: fixed; ${settings.button_position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : settings.button_position === 'bottom-left' ? 'bottom: 20px; left: 20px;' : 'bottom: 20px; right: 20px;'} z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        #ai-bot-button { width: ${settings.button_size}px; height: ${settings.button_size}px; border-radius: 50%; background: linear-gradient(135deg, ${settings.button_color} 0%, ${settings.button_color_end} 100%); border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; transition: transform 0.3s ease; }
        #ai-bot-button:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(0,0,0,0.2); }
        #ai-bot-button svg { width: ${settings.button_size * 0.45}px; height: ${settings.button_size * 0.45}px; color: white; }
        #ai-bot-chat { position: absolute; bottom: ${settings.button_size + 20}px; ${settings.button_position.includes('right') ? 'right: 0;' : 'left: 0;'} width: ${settings.window_width}px; height: ${settings.window_height}px; max-height: calc(100vh - 120px); background: white; border-radius: ${settings.border_radius}px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); display: none; flex-direction: column; overflow: hidden; animation: slideUp 0.3s ease; }
        #ai-bot-chat.open { display: flex; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        #ai-bot-header { background: linear-gradient(135deg, ${settings.header_color} 0%, ${settings.header_color_end} 100%); color: white; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; }
        #ai-bot-header h3 { margin: 0; font-size: 18px; font-weight: 600; }
        #ai-bot-close { background: none; border: none; color: white; cursor: pointer; padding: 4px; display: flex; }
        #ai-bot-close:hover { opacity: 0.8; }
        #ai-bot-iframe { flex: 1; border: none; width: 100%; height: 100%; }
        ${settings.custom_css || ''}
        @media (max-width: 480px) {
            #ai-bot-widget-container { bottom: 10px; right: 10px; }
            #ai-bot-chat { width: calc(100vw - 20px); height: calc(100vh - 100px); bottom: ${settings.button_size + 20}px; right: -5px; }
        }
    \`;
    document.head.appendChild(style);

    widget.innerHTML = \`
        <button id="ai-bot-button" aria-label="Открыть чат">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
        </button>
        <div id="ai-bot-chat">
            <div id="ai-bot-header">
                <h3>${settings.header_title}</h3>
                <button id="ai-bot-close" aria-label="Закрыть чат">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <iframe id="ai-bot-iframe" src="" title="AI Bot Chat"></iframe>
        </div>
    \`;

    var CHAT_URL = '${chatUrl}';
    var button = document.getElementById('ai-bot-button');
    var chat = document.getElementById('ai-bot-chat');
    var closeBtn = document.getElementById('ai-bot-close');
    var iframe = document.getElementById('ai-bot-iframe');
    var isOpen = false;

    function toggleChat() {
        isOpen = !isOpen;
        if (isOpen) {
            chat.classList.add('open');
            if (!iframe.src) iframe.src = CHAT_URL;
        } else {
            chat.classList.remove('open');
        }
    }

    button.addEventListener('click', toggleChat);
    closeBtn.addEventListener('click', toggleChat);
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) toggleChat();
    });
})();
</script>`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateWidgetCode());
    toast({
      title: 'Скопировано!',
      description: 'Код виджета скопирован в буфер обмена'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Icon name="Code" size={20} />
              Виджет для сайта
            </CardTitle>
            <CardDescription>
              Настройте внешний вид виджета и получите код для встраивания
            </CardDescription>
          </div>
          <Button
            onClick={() => setShowCode(!showCode)}
            variant="outline"
            size="sm"
          >
            <Icon name={showCode ? 'EyeOff' : 'Code'} size={16} className="mr-2" />
            {showCode ? 'Скрыть код' : 'Показать код'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {showCode ? (
          <div className="space-y-4">
            <div className="relative">
              <Textarea
                value={generateWidgetCode()}
                readOnly
                className="font-mono text-xs h-96"
              />
              <Button
                onClick={copyToClipboard}
                size="sm"
                className="absolute top-2 right-2"
              >
                <Icon name="Copy" size={16} className="mr-2" />
                Копировать
              </Button>
            </div>
            <p className="text-sm text-slate-600">
              Вставьте этот код перед закрывающим тегом &lt;/body&gt; на вашем сайте
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Кнопка чата */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Кнопка чата</h3>
                
                <div className="space-y-2">
                  <Label>Цвет кнопки (начало)</Label>
                  <Input
                    type="color"
                    value={settings.button_color}
                    onChange={(e) => setSettings({ ...settings, button_color: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Цвет кнопки (конец)</Label>
                  <Input
                    type="color"
                    value={settings.button_color_end}
                    onChange={(e) => setSettings({ ...settings, button_color_end: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Размер кнопки (px)</Label>
                  <Input
                    type="number"
                    value={settings.button_size}
                    onChange={(e) => setSettings({ ...settings, button_size: parseInt(e.target.value) })}
                    min={40}
                    max={80}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Позиция</Label>
                  <Select
                    value={settings.button_position}
                    onValueChange={(value) => setSettings({ ...settings, button_position: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bottom-right">Справа внизу</SelectItem>
                      <SelectItem value="bottom-left">Слева внизу</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Окно чата */}
              <div className="space-y-4">
                <h3 className="font-semibold text-sm">Окно чата</h3>

                <div className="space-y-2">
                  <Label>Заголовок</Label>
                  <Input
                    value={settings.header_title}
                    onChange={(e) => setSettings({ ...settings, header_title: e.target.value })}
                    placeholder="AI Ассистент"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Цвет заголовка (начало)</Label>
                  <Input
                    type="color"
                    value={settings.header_color}
                    onChange={(e) => setSettings({ ...settings, header_color: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Цвет заголовка (конец)</Label>
                  <Input
                    type="color"
                    value={settings.header_color_end}
                    onChange={(e) => setSettings({ ...settings, header_color_end: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label>Ширина (px)</Label>
                    <Input
                      type="number"
                      value={settings.window_width}
                      onChange={(e) => setSettings({ ...settings, window_width: parseInt(e.target.value) })}
                      min={300}
                      max={600}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Высота (px)</Label>
                    <Input
                      type="number"
                      value={settings.window_height}
                      onChange={(e) => setSettings({ ...settings, window_height: parseInt(e.target.value) })}
                      min={400}
                      max={800}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Скругление углов (px)</Label>
                  <Input
                    type="number"
                    value={settings.border_radius}
                    onChange={(e) => setSettings({ ...settings, border_radius: parseInt(e.target.value) })}
                    min={0}
                    max={32}
                  />
                </div>
              </div>
            </div>

            {/* Дополнительные настройки */}
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold text-sm">Дополнительно</h3>

              <div className="flex items-center justify-between">
                <Label>Показывать брендинг</Label>
                <Switch
                  checked={settings.show_branding}
                  onCheckedChange={(checked) => setSettings({ ...settings, show_branding: checked })}
                />
              </div>

              <div className="space-y-2">
                <Label>Пользовательский CSS</Label>
                <Textarea
                  value={settings.custom_css || ''}
                  onChange={(e) => setSettings({ ...settings, custom_css: e.target.value })}
                  placeholder="Дополнительные стили CSS..."
                  rows={4}
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-4 bg-slate-50">
              <h3 className="font-semibold text-sm mb-3">Предпросмотр</h3>
              <div className="relative h-40 bg-white rounded-lg overflow-hidden border">
                <div
                  className="absolute"
                  style={{
                    [settings.button_position.includes('right') ? 'right' : 'left']: '20px',
                    bottom: '20px'
                  }}
                >
                  <button
                    className="flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                    style={{
                      width: `${settings.button_size}px`,
                      height: `${settings.button_size}px`,
                      borderRadius: '50%',
                      background: `linear-gradient(135deg, ${settings.button_color} 0%, ${settings.button_color_end} 100%)`,
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <Icon name="MessageCircle" size={settings.button_size * 0.45} className="text-white" />
                  </button>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={isLoading} className="w-full">
              {isLoading ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Icon name="Save" size={16} className="mr-2" />
                  Сохранить настройки
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WidgetSettingsCard;