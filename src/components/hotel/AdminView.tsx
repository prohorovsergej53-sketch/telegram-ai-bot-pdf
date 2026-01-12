import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
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
import { Document, BACKEND_URLS } from './types';
import { useState, useMemo } from 'react';

interface AdminViewProps {
  documents: Document[];
  isLoading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteDocument: (documentId: number) => void;
}

const AdminView = ({ documents, isLoading, onFileUpload, onDeleteDocument }: AdminViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(documents.map(d => d.category));
    return ['all', ...Array.from(cats)];
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const categoryMatch = selectedCategory === 'all' || doc.category === selectedCategory;
      const statusMatch = selectedStatus === 'all' || doc.status === selectedStatus;
      return categoryMatch && statusMatch;
    });
  }, [documents, selectedCategory, selectedStatus]);

  const scrollAreaHeight = useMemo(() => {
    const count = filteredDocuments.length;
    if (count === 0) return 'h-[200px]';
    if (count <= 3) return 'h-[180px]';
    if (count <= 6) return 'h-[360px]';
    if (count <= 12) return 'h-[540px]';
    return 'h-[720px]';
  }, [filteredDocuments.length]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Icon name="FileText" size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{documents.length}</p>
                <p className="text-xs text-slate-600">Документов</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Icon name="BookOpen" size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {documents.reduce((sum, doc) => sum + (doc.pages || 0), 0)}
                </p>
                <p className="text-xs text-slate-600">Страниц</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle" size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {documents.filter(d => d.status === 'ready').length}
                </p>
                <p className="text-xs text-slate-600">Готовы</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Icon name="Loader2" size={20} className="text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">
                  {documents.filter(d => d.status === 'processing').length}
                </p>
                <p className="text-xs text-slate-600">Обработка</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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

      <ChatStatsCard />

      <QualityGateStatsCard />

      <RagDebugInfoCard />

      <Card className="shadow-xl">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Library" size={20} />
                База знаний
              </CardTitle>
              <CardDescription>{filteredDocuments.length} из {documents.length} документов</CardDescription>
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Все категории' : cat}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">Все статусы</option>
                <option value="ready">Готовы</option>
                <option value="processing">Обработка</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 pb-4">
          <label htmlFor="file-upload" className="cursor-pointer">
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary hover:bg-blue-50/50 transition-all group">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <Icon name={isLoading ? 'Loader2' : 'Upload'} size={20} className={`text-primary ${isLoading ? 'animate-spin' : ''}`} />
              </div>
              <p className="font-medium text-slate-900 mb-1">
                {isLoading ? 'Загрузка...' : 'Выберите PDF файлы'}
              </p>
              <p className="text-sm text-slate-600">можно несколько одновременно</p>
            </div>
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".pdf"
            multiple
            className="hidden"
            onChange={onFileUpload}
            disabled={isLoading}
          />
        </CardContent>
        <CardContent className="p-0">
          <ScrollArea className={scrollAreaHeight}>
            {filteredDocuments.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Icon name="FileText" size={48} className="mx-auto mb-3 opacity-30" />
                <p>{documents.length === 0 ? 'Документы ещё не загружены' : 'Нет документов с выбранными фильтрами'}</p>
              </div>
            ) : (
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        doc.status === 'ready' ? 'bg-blue-100' : 'bg-orange-100'
                      }`}>
                        <Icon name={doc.status === 'ready' ? 'FileText' : 'Loader2'} 
                          size={18} 
                          className={`${doc.status === 'ready' ? 'text-primary' : 'text-orange-600 animate-spin'}`} 
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900 break-words whitespace-normal mb-2">{doc.name}</p>
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700">{doc.category}</span>
                          {doc.pages > 0 && <span className="text-xs text-slate-600">{doc.pages} стр.</span>}
                          <span className="text-xs text-slate-600">{doc.size}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 w-full"
                          onClick={() => onDeleteDocument(doc.id)}
                        >
                          <Icon name="Trash2" size={14} className="mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminView;