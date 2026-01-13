import { useState } from 'react';
import AISettingsCard from './AISettingsCard';
import TelegramSettingsCard from './TelegramSettingsCard';
import VKSettingsCard from './VKSettingsCard';
import MAXSettingsCard from './MAXSettingsCard';
import ChatStatsCard from './ChatStatsCard';
import PageSettingsCard from './PageSettingsCard';
import WidgetSettingsCard from './WidgetSettingsCard';
import AiSettingsCard from './AiSettingsCard';
import SubscriptionWidget from './SubscriptionWidget';
import MessengerAutoMessages from './MessengerAutoMessages';
import { DocumentStatsCards } from './DocumentStatsCards';
import { DocumentsPanel } from './DocumentsPanel';
import { Document, BACKEND_URLS } from './types';
import { getTenantId, getTariffId, isSuperAdmin, getAdminUser, exitTenantView } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { hasFeatureAccess } from '@/lib/tariff-limits';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface AdminViewProps {
  documents: Document[];
  isLoading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteDocument: (documentId: number) => void;
  currentTenantId: number | null;
}

const AdminView = ({ documents, isLoading, onFileUpload, onDeleteDocument, currentTenantId }: AdminViewProps) => {
  const navigate = useNavigate();
  const tenantId = getTenantId();
  const tariffId = getTariffId();
  const superAdmin = isSuperAdmin();
  const currentUser = getAdminUser();
  const isViewingOtherTenant = sessionStorage.getItem('superadmin_viewing_tenant') === 'true';
  const [activeTab, setActiveTab] = useState('documents');

  const handleExitTenantView = () => {
    exitTenantView();
    sessionStorage.setItem('superadmin_active_tab', 'users');
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

      {tenantId !== null && tenantId !== undefined && (
        <SubscriptionWidget tenantId={tenantId} />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg p-2 grid grid-cols-3 lg:grid-cols-6 gap-2 h-auto">
          <TabsTrigger value="documents" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=inactive]:text-white py-3 px-4 text-base font-semibold">
            <Icon name="FileText" size={20} className="mr-2" />
            <span>Документы</span>
          </TabsTrigger>
          <TabsTrigger value="messengers" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=inactive]:text-white py-3 px-4 text-base font-semibold">
            <Icon name="MessageCircle" size={20} className="mr-2" />
            <span>Мессенджеры</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=inactive]:text-white py-3 px-4 text-base font-semibold">
            <Icon name="Brain" size={20} className="mr-2" />
            <span>AI</span>
          </TabsTrigger>
          <TabsTrigger value="page" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=inactive]:text-white py-3 px-4 text-base font-semibold">
            <Icon name="Layout" size={20} className="mr-2" />
            <span>Страница</span>
          </TabsTrigger>
          <TabsTrigger value="widget" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=inactive]:text-white py-3 px-4 text-base font-semibold">
            <Icon name="Code" size={20} className="mr-2" />
            <span>Виджет</span>
          </TabsTrigger>
          <TabsTrigger value="stats" className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=inactive]:text-white py-3 px-4 text-base font-semibold">
            <Icon name="BarChart" size={20} className="mr-2" />
            <span>Статистика</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="documents" className="space-y-6">
          <DocumentStatsCards documents={documents} />
          <DocumentsPanel
            documents={documents}
            isLoading={isLoading}
            onFileUpload={onFileUpload}
            onDeleteDocument={onDeleteDocument}
          />
        </TabsContent>

        <TabsContent value="messengers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(superAdmin || hasFeatureAccess('hasTelegram', tariffId)) ? (
              <TelegramSettingsCard
                webhookUrl={BACKEND_URLS.telegramWebhook}
                chatFunctionUrl={BACKEND_URLS.chat}
              />
            ) : (
              <UpgradeCard feature="Интеграция с Telegram" />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {(superAdmin || hasFeatureAccess('hasMAX', tariffId)) ? (
              <MAXSettingsCard
                webhookUrl={BACKEND_URLS.maxWebhook}
                chatFunctionUrl={BACKEND_URLS.chat}
              />
            ) : (
              <UpgradeCard feature="Интеграция с MAX.ru" />
            )}
          </div>

          <MessengerAutoMessages isSuperAdmin={superAdmin} />
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          {(superAdmin || hasFeatureAccess('hasAISettings', tariffId)) ? (
            <div className="space-y-6">
              <AISettingsCard
                getSettingsUrl={BACKEND_URLS.getAiSettings}
                updateSettingsUrl={BACKEND_URLS.updateAiSettings}
              />
              {superAdmin && (
                <AiSettingsCard currentTenantId={currentTenantId} />
              )}
            </div>
          ) : (
            <UpgradeCard feature="Настройка AI провайдеров" />
          )}
        </TabsContent>

        <TabsContent value="page" className="space-y-6">
          <PageSettingsCard />
        </TabsContent>

        <TabsContent value="widget" className="space-y-6">
          <WidgetSettingsCard />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <ChatStatsCard />
        </TabsContent>
      </Tabs>

      {superAdmin && isViewingOtherTenant && (
        <Card className="border-purple-500 bg-purple-50">
          <CardContent className="py-6 text-center">
            <Icon name="Crown" size={32} className="mx-auto text-purple-600 mb-3" />
            <h3 className="text-lg font-semibold text-purple-900 mb-2">
              Режим суперадмина активен
            </h3>
            <p className="text-sm text-purple-700">
              У вас полный доступ ко всем функциям и настройкам этого бота
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminView;