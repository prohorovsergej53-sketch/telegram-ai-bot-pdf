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
import AdminHeader from './AdminHeader';
import UpgradeCard from './UpgradeCard';
import TenantUrlEditor from './TenantUrlEditor';
import TenantApiKeysCard from './TenantApiKeysCard';
import { DocumentStatsCards } from './DocumentStatsCards';
import { DocumentsPanel } from './DocumentsPanel';
import { Document, BACKEND_URLS } from './types';
import { getTenantId, getTariffId, isSuperAdmin, getAdminUser, exitTenantView } from '@/lib/auth';
import { useNavigate, useParams } from 'react-router-dom';
import { hasFeatureAccess } from '@/lib/tariff-limits';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

interface AdminViewProps {
  documents: Document[];
  isLoading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteDocument: (documentId: number) => void;
  currentTenantId: number | null;
  tenantName?: string;
}

const AdminView = ({ documents, isLoading, onFileUpload, onDeleteDocument, currentTenantId, tenantName }: AdminViewProps) => {
  const navigate = useNavigate();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const tenantId = getTenantId();
  const tariffId = getTariffId();
  const superAdmin = isSuperAdmin();
  const currentUser = getAdminUser();
  const isViewingOtherTenant = sessionStorage.getItem('superadmin_viewing_tenant') === 'true';
  const [activeTab, setActiveTab] = useState('documents');
  const [currentSlug, setCurrentSlug] = useState(tenantSlug || '');

  console.log('[AdminView] Props check for TenantApiKeysCard:', {
    superAdmin,
    currentTenantId,
    tenantName,
    willRender: superAdmin && !!currentTenantId && !!tenantName
  });

  // DEBUG: показать проблему с рендерингом
  if (activeTab === 'ai' && superAdmin && !currentTenantId) {
    console.error('[AdminView] TenantApiKeysCard НЕ рендерится: currentTenantId =', currentTenantId);
  }
  if (activeTab === 'ai' && superAdmin && !tenantName) {
    console.error('[AdminView] TenantApiKeysCard НЕ рендерится: tenantName =', tenantName);
  }

  const handleExitTenantView = () => {
    exitTenantView();
    sessionStorage.setItem('superadmin_active_tab', 'users');
    navigate('/super-admin');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <AdminHeader
        currentUser={currentUser}
        superAdmin={superAdmin}
        isViewingOtherTenant={isViewingOtherTenant}
        tenantId={tenantId}
        tariffId={tariffId}
        onExitTenantView={handleExitTenantView}
      />

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
                <>
                  <AiSettingsCard
                    currentTenantId={currentTenantId}
                    isSuperAdmin={superAdmin}
                  />
                  {currentTenantId && tenantName && (
                    <TenantApiKeysCard
                      tenantId={currentTenantId}
                      tenantName={tenantName}
                    />
                  )}
                  {currentTenantId && currentSlug && tenantName && (
                    <TenantUrlEditor
                      tenantId={currentTenantId}
                      currentSlug={currentSlug}
                      tenantName={tenantName}
                      onSlugUpdated={(newSlug) => setCurrentSlug(newSlug)}
                    />
                  )}
                </>
              )}
            </div>
          ) : (
            <UpgradeCard feature="Настройки AI" />
          )}
        </TabsContent>

        <TabsContent value="page" className="space-y-6">
          {(superAdmin || hasFeatureAccess('hasPageSettings', tariffId)) ? (
            <PageSettingsCard
              getSettingsUrl={BACKEND_URLS.getPageSettings}
              updateSettingsUrl={BACKEND_URLS.updatePageSettings}
            />
          ) : (
            <UpgradeCard feature="Настройки страницы" />
          )}
        </TabsContent>

        <TabsContent value="widget" className="space-y-6">
          {(superAdmin || hasFeatureAccess('hasWidget', tariffId)) ? (
            <WidgetSettingsCard
              getSettingsUrl={BACKEND_URLS.getWidgetSettings}
              updateSettingsUrl={BACKEND_URLS.updateWidgetSettings}
            />
          ) : (
            <UpgradeCard feature="Виджет для сайта" />
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          {(superAdmin || hasFeatureAccess('hasStats', tariffId)) ? (
            <ChatStatsCard statsUrl={BACKEND_URLS.getChatStats} />
          ) : (
            <UpgradeCard feature="Статистика чатов" />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminView;