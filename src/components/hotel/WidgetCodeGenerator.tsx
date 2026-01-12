import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';
import { WidgetSettings } from './WidgetColorSchemes';
import { getIconSvgPath } from './WidgetPreview';

interface WidgetCodeGeneratorProps {
  settings: WidgetSettings;
  showCode: boolean;
  onToggleCode: () => void;
}

export const generateWidgetCode = (settings: WidgetSettings): string => {
  let chatUrl = settings.chat_url;
  
  if (!chatUrl) {
    const currentDomain = window.location.hostname;
    
    if (currentDomain.startsWith('admin.')) {
      chatUrl = `${window.location.protocol}//${currentDomain.replace('admin.', '')}`;
    } else {
      chatUrl = window.location.origin;
    }
  }
  
  return `<!-- AI Bot Widget - Вставьте этот код перед закрывающим тегом </body> -->
<script>
(function() {
    var widget = document.createElement('div');
    widget.id = 'ai-bot-widget-container';
    document.body.appendChild(widget);

    var style = document.createElement('style');
    style.textContent = \`
        #ai-bot-widget-container { position: fixed; ${settings.button_position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : settings.button_position === 'bottom-left' ? 'bottom: 20px; left: 20px;' : 'bottom: 20px; right: 20px;'} z-index: 999999; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
        #ai-bot-button { width: ${settings.button_size}px; height: ${settings.button_size}px; border-radius: 50%; background: linear-gradient(135deg, ${settings.button_color} 0%, ${settings.button_color_end} 100%); border: none; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; transition: transform 0.2s, box-shadow 0.2s; }
        #ai-bot-button:hover { transform: scale(1.05); box-shadow: 0 6px 16px rgba(0,0,0,0.2); }
        #ai-bot-button svg { width: ${settings.button_size * 0.5}px; height: ${settings.button_size * 0.5}px; }
        #ai-bot-iframe-container { position: fixed; ${settings.button_position === 'bottom-right' ? 'bottom: 90px; right: 20px;' : settings.button_position === 'bottom-left' ? 'bottom: 90px; left: 20px;' : 'bottom: 90px; right: 20px;'} width: ${settings.window_width}px; height: ${settings.window_height}px; border-radius: ${settings.border_radius}px; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.15); display: none; z-index: 999998; background: white; }
        #ai-bot-iframe { width: 100%; height: 100%; border: none; border-radius: ${settings.border_radius}px; }
        ${settings.custom_css || ''}
    \`;
    document.head.appendChild(style);

    var button = document.createElement('button');
    button.id = 'ai-bot-button';
    button.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${getIconSvgPath(settings.button_icon)}</svg>';
    widget.appendChild(button);

    var iframeContainer = document.createElement('div');
    iframeContainer.id = 'ai-bot-iframe-container';
    widget.appendChild(iframeContainer);

    var iframe = document.createElement('iframe');
    iframe.id = 'ai-bot-iframe';
    iframe.src = '${chatUrl}';
    iframeContainer.appendChild(iframe);

    var isOpen = false;
    button.addEventListener('click', function() {
        isOpen = !isOpen;
        iframeContainer.style.display = isOpen ? 'block' : 'none';
    });

    document.addEventListener('click', function(e) {
        if (isOpen && !widget.contains(e.target)) {
            isOpen = false;
            iframeContainer.style.display = 'none';
        }
    });
})();
</script>`;
};

const WidgetCodeGenerator = ({ settings, showCode, onToggleCode }: WidgetCodeGeneratorProps) => {
  const handleCopyCode = () => {
    const code = generateWidgetCode(settings);
    navigator.clipboard.writeText(code);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Button
          onClick={onToggleCode}
          variant="outline"
          className="flex-1"
        >
          <Icon name={showCode ? 'EyeOff' : 'Code'} size={16} className="mr-2" />
          {showCode ? 'Скрыть код' : 'Показать код встройки'}
        </Button>
        {showCode && (
          <Button onClick={handleCopyCode} variant="outline">
            <Icon name="Copy" size={16} />
          </Button>
        )}
      </div>
      
      {showCode && (
        <Textarea
          value={generateWidgetCode(settings)}
          readOnly
          className="font-mono text-xs h-64"
        />
      )}
    </div>
  );
};

export default WidgetCodeGenerator;
