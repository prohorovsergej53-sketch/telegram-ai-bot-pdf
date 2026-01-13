import AISettingsCard from './AISettingsCard';
import TelegramSettingsCard from './TelegramSettingsCard';
import WhatsAppSettingsCard from './WhatsAppSettingsCard';
import VKSettingsCard from './VKSettingsCard';
import MAXSettingsCard from './MAXSettingsCard';
import ChatStatsCard from './ChatStatsCard';
import PageSettingsCard from './PageSettingsCard';
import WidgetSettingsCard from './WidgetSettingsCard';
import AiSettingsCard from './AiSettingsCard';
import SubscriptionWidget from './SubscriptionWidget';
import YooKassaSettingsCard from './YooKassaSettingsCard';
import { DocumentStatsCards } from './DocumentStatsCards';
import { DocumentsPanel } from './DocumentsPanel';
import { Document, BACKEND_URLS } from './types';
import { getTenantId, getTariffId, isSuperAdmin } from '@/lib/auth';
import { hasFeatureAccess } from '@/lib/tariff-limits';
import { Card, CardContent } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AdminViewProps {
  documents: Document[];
  isLoading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteDocument: (documentId: number) => void;
}

const AdminView = ({ documents, isLoading, onFileUpload, onDeleteDocument }: AdminViewProps) => {
  const tenantId = getTenantId();
  const tariffId = getTariffId();
  const superAdmin = isSuperAdmin();

  const UpgradeCard = ({ feature }: { feature: string }) => (
    <Card className="border-amber-500 bg-amber-50">
      <CardContent className="py-8 text-center">
        <Icon name="Lock" size={32} className="mx-auto text-amber-600 mb-3" />
        <h3 className="text-lg font-semibold text-amber-900 mb-2">
          Недоступно в вашем тарифе
        </h3>
        <p className="text-sm text-amber-800 mb-4">
          {feature} доступен в тарифах Бизнес и Премиум
        </p>
        <a 
          href="/#pricing" 
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-900 hover:underline"
        >
          <Icon name="ArrowUpRight" size={16} />
          Сравнить тарифы
        </a>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {tenantId && (
        <SubscriptionWidget tenantId={tenantId} />
      )}
      
      <DocumentStatsCards documents={documents} />

      <DocumentsPanel
        documents={documents}
        isLoading={isLoading}
        onFileUpload={onFileUpload}
        onDeleteDocument={onDeleteDocument}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(superAdmin || hasFeatureAccess('hasAISettings', tariffId)) ? (
          <AISettingsCard
            getSettingsUrl={BACKEND_URLS.getAiSettings}
            updateSettingsUrl={BACKEND_URLS.updateAiSettings}
          />
        ) : (
          <UpgradeCard feature="Настройка AI провайдеров" />
        )}
        
        {(superAdmin || hasFeatureAccess('hasTelegram', tariffId)) ? (
          <TelegramSettingsCard
            webhookUrl={BACKEND_URLS.telegramWebhook}
            chatFunctionUrl={BACKEND_URLS.chat}
          />
        ) : (
          <UpgradeCard feature="Интеграция с Telegram" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(superAdmin || hasFeatureAccess('hasWhatsApp', tariffId)) ? (
          <WhatsAppSettingsCard
            webhookUrl={BACKEND_URLS.whatsappWebhook}
            chatFunctionUrl={BACKEND_URLS.chat}
          />
        ) : (
          <UpgradeCard feature="Интеграция с WhatsApp" />
        )}
        
        {(superAdmin || hasFeatureAccess('hasVK', tariffId)) ? (
          <VKSettingsCard
            webhookUrl={BACKEND_URLS.vkWebhook}
            chatFunctionUrl={BACKEND_URLS.chat}
          />
        ) : (
          <UpgradeCard feature="Интеграция с VK" />
        )}
      </div>

      {(superAdmin || hasFeatureAccess('hasMAX', tariffId)) ? (
        <MAXSettingsCard
          webhookUrl={BACKEND_URLS.maxWebhook}
          chatFunctionUrl={BACKEND_URLS.chat}
        />
      ) : (
        <UpgradeCard feature="Интеграция с MAX.ru" />
      )}

      <WidgetSettingsCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AiSettingsCard />
        {superAdmin && <PageSettingsCard />}
      </div>

      <ChatStatsCard />
    </div>
  );
};

export default AdminView;