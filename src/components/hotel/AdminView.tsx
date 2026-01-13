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
import ApiKeysCard from './ApiKeysCard';
import MessengerAutoMessages from './MessengerAutoMessages';
import { DocumentStatsCards } from './DocumentStatsCards';
import { DocumentsPanel } from './DocumentsPanel';
import { Document, BACKEND_URLS } from './types';
import { getTenantId, getTariffId, isSuperAdmin, getAdminUser, exitTenantView } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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
  const navigate = useNavigate();
  const tenantId = getTenantId();
  const tariffId = getTariffId();
  const superAdmin = isSuperAdmin();
  const currentUser = getAdminUser();
  const isViewingOtherTenant = sessionStorage.getItem('superadmin_viewing_tenant') === 'true';

  const handleExitTenantView = () => {
    exitTenantView();
    navigate('/super-admin');
  };

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
      {currentUser && (
        <Card className={superAdmin ? "border-purple-500 bg-purple-50" : "border-blue-500 bg-blue-50"}>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon name={superAdmin ? "ShieldCheck" : "User"} size={20} className={superAdmin ? "text-purple-600" : "text-blue-600"} />
                <span className={`font-semibold ${superAdmin ? "text-purple-900" : "text-blue-900"}`}>
                  {superAdmin ? (isViewingOtherTenant ? "Режим просмотра (суперадмин)" : "Режим суперадмина") : "Админ-панель"}
                </span>
                <span className={`text-sm ${superAdmin ? "text-purple-700" : "text-blue-700"}`}>
                  • Логин: {currentUser.username}
                </span>
                <span className={`text-sm ${superAdmin ? "text-purple-700" : "text-blue-700"}`}>
                  • Роль: {currentUser.role === 'super_admin' ? 'Суперадмин' : 'Админ бота'}
                </span>
                <span className={`text-sm ${superAdmin ? "text-purple-700" : "text-blue-700"}`}>
                  • Tenant ID: {tenantId}
                </span>
                <span className={`text-sm ${superAdmin ? "text-purple-700" : "text-blue-700"}`}>
                  • Tariff: {tariffId || 'не установлен'}
                </span>
              </div>
              {isViewingOtherTenant && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExitTenantView}
                  className="border-purple-600 text-purple-700 hover:bg-purple-100"
                >
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Вернуться к суперадмину
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

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

      <ApiKeysCard />

      <WidgetSettingsCard />

      <MessengerAutoMessages isSuperAdmin={superAdmin} />

      <ChatStatsCard />

      <PageSettingsCard />

      {superAdmin && (
        <AiSettingsCard />
      )}

      {superAdmin && isViewingOtherTenant && (
        <Card className="border-purple-500 bg-purple-50">
          <CardContent className="py-6 text-center">
            <Icon name="Crown" size={32} className="mx-auto text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              Режим суперадмина активен
            </h3>
            <p className="text-sm text-purple-700">
              У вас полный доступ ко всем функциям и настройкам этого бота, включая:
            </p>
            <ul className="mt-3 text-sm text-purple-700 space-y-1">
              <li>• Редактирование системных промптов и AI моделей</li>
              <li>• Настройка футера страницы</li>
              <li>• Все интеграции (Telegram, WhatsApp, VK, MAX)</li>
              <li>• Безлимитная загрузка документов</li>
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminView;