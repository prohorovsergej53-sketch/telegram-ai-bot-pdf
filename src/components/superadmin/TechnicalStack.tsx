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
            <p className="font-bold text-slate-900 mb-2">🔐 users</p>
            <p className="text-xs text-slate-600">id, tenant_id, username, password_hash, is_superadmin</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">💳 tariffs</p>
            <p className="text-xs text-slate-600">id, name, price, renewal_price, setup_fee, period, message_limit, is_active</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">📄 documents</p>
            <p className="text-xs text-slate-600">id, tenant_id, filename, content, embeddings, created_at</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">🔑 messenger_api_keys</p>
            <p className="text-xs text-slate-600">id, tenant_id, provider (telegram/vk/max), api_key, bot_token</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">🧠 ai_settings</p>
            <p className="text-xs text-slate-600">id, tenant_id, model (yandexgpt-lite), system_prompt, temperature, max_tokens</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">💬 chats</p>
            <p className="text-xs text-slate-600">id, tenant_id, channel (web/telegram/vk/max), user_id, created_at</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">✉️ messages</p>
            <p className="text-xs text-slate-600">id, chat_id, role (user/assistant), content, timestamp</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">🎨 page_settings</p>
            <p className="text-xs text-slate-600">tenant_id, header_title, header_subtitle, contact_phone...</p>
          </div>
          <div className="bg-slate-50 p-4 rounded border">
            <p className="font-bold text-slate-900 mb-2">🛠️ widget_settings</p>
            <p className="text-xs text-slate-600">tenant_id, icon, position, primary_color, embed_code</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TechnicalStack;