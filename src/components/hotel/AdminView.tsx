import AISettingsCard from './AISettingsCard';
import TelegramSettingsCard from './TelegramSettingsCard';
import WhatsAppSettingsCard from './WhatsAppSettingsCard';
import VKSettingsCard from './VKSettingsCard';
import MAXSettingsCard from './MAXSettingsCard';
import ChatStatsCard from './ChatStatsCard';
import PageSettingsCard from './PageSettingsCard';
import WidgetSettingsCard from './WidgetSettingsCard';
import AiSettingsCard from './AiSettingsCard';
import QualityGateStatsCard from './QualityGateStatsCard';
import RagDebugInfoCard from './RagDebugInfoCard';
import SubscriptionWidget from './SubscriptionWidget';
import YooKassaSettingsCard from './YooKassaSettingsCard';
import { DocumentStatsCards } from './DocumentStatsCards';
import { DocumentsPanel } from './DocumentsPanel';
import { Document, BACKEND_URLS } from './types';
import { getTenantId } from '@/lib/auth';

interface AdminViewProps {
  documents: Document[];
  isLoading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteDocument: (documentId: number) => void;
}

const AdminView = ({ documents, isLoading, onFileUpload, onDeleteDocument }: AdminViewProps) => {
  const tenantId = getTenantId();

  return (
    <div className="space-y-6 animate-fade-in">
      {tenantId && (
        <SubscriptionWidget tenantId={tenantId} />
      )}
      
      <DocumentStatsCards documents={documents} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AISettingsCard
          getSettingsUrl={BACKEND_URLS.getAiSettings}
          updateSettingsUrl={BACKEND_URLS.updateAiSettings}
        />
        <TelegramSettingsCard
          webhookUrl={BACKEND_URLS.telegramWebhook}
          chatFunctionUrl={BACKEND_URLS.chat}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WhatsAppSettingsCard
          webhookUrl={BACKEND_URLS.whatsappWebhook}
          chatFunctionUrl={BACKEND_URLS.chat}
        />
        <VKSettingsCard
          webhookUrl={BACKEND_URLS.vkWebhook}
          chatFunctionUrl={BACKEND_URLS.chat}
        />
      </div>

      <MAXSettingsCard
        webhookUrl={BACKEND_URLS.maxWebhook}
        chatFunctionUrl={BACKEND_URLS.chat}
      />

      <WidgetSettingsCard />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AiSettingsCard />
        <PageSettingsCard />
      </div>

      <YooKassaSettingsCard
        createPaymentUrl={BACKEND_URLS.yookassaCreatePayment}
        webhookUrl={BACKEND_URLS.yookassaWebhook}
      />

      <ChatStatsCard />

      <QualityGateStatsCard />

      <RagDebugInfoCard />

      <DocumentsPanel
        documents={documents}
        isLoading={isLoading}
        onFileUpload={onFileUpload}
        onDeleteDocument={onDeleteDocument}
      />
    </div>
  );
};

export default AdminView;