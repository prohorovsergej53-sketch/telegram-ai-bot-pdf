import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const TechnicalStack = () => {
  return (
    <Card className="border-4 border-gradient-to-r from-purple-500 to-blue-500">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-blue-100">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Icon name="CheckCircle" size={24} className="text-green-600" />
          Ключевые таблицы БД
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">👥 tenants</p>
            <p className="text-xs text-slate-600">id, name, slug, tariff_id, subscription_end_date, owner_email, owner_phone, created_at</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">🔐 admin_users</p>
            <p className="text-xs text-slate-600">id, tenant_id, username, password_hash, role, email, tariff_id</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">💳 tariff_plans</p>
            <p className="text-xs text-slate-600">id, name, price, renewal_price, setup_fee, first_month_included, is_active</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">📄 tenant_documents</p>
            <p className="text-xs text-slate-600">id, tenant_id, filename, original_filename, file_path, created_at</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">📊 tenant_chunks</p>
            <p className="text-xs text-slate-600">id, tenant_id, document_id, chunk_text, embedding, metadata</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">🔑 tenant_api_keys</p>
            <p className="text-xs text-slate-600">id, tenant_id, provider (telegram/vk/max), api_key, settings (JSONB)</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">⚙️ tenant_settings</p>
            <p className="text-xs text-slate-600">tenant_id, ai_settings (JSONB), widget_settings (JSONB), page_settings (JSONB)</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">💬 chat_messages</p>
            <p className="text-xs text-slate-600">id, tenant_id, session_id, role (user/assistant), content, timestamp</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">📧 email_templates</p>
            <p className="text-xs text-slate-600">id, template_type, subject, html_body, variables</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">💳 subscription_payments</p>
            <p className="text-xs text-slate-600">id, tenant_id, payment_id, amount, status, tariff_id, payment_type</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">🎯 quality_gate_logs</p>
            <p className="text-xs text-slate-600">id, tenant_id, session_id, decision, reason, timestamp</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalStack;