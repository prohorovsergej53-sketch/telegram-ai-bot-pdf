import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Document } from './types';

interface AdminViewProps {
  documents: Document[];
  isLoading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const AdminView = ({ documents, isLoading, onFileUpload }: AdminViewProps) => {
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
        <Card className="shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Upload" size={20} />
              Загрузка документов
            </CardTitle>
            <CardDescription>Добавьте PDF с информацией об отеле</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:border-primary hover:bg-blue-50/50 transition-all group">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Icon name={isLoading ? 'Loader2' : 'Upload'} size={24} className={`text-primary ${isLoading ? 'animate-spin' : ''}`} />
                </div>
                <p className="font-medium text-slate-900 mb-1">
                  {isLoading ? 'Загрузка...' : 'Выберите PDF файл'}
                </p>
                <p className="text-sm text-slate-600">или перетащите сюда</p>
              </div>
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={onFileUpload}
              disabled={isLoading}
            />
          </CardContent>
        </Card>

        <Card className="shadow-xl">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
            <CardTitle className="flex items-center gap-2">
              <Icon name="Library" size={20} />
              База знаний
            </CardTitle>
            <CardDescription>{documents.length} документов</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[320px]">
              {documents.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  <Icon name="FileText" size={48} className="mx-auto mb-3 opacity-30" />
                  <p>Документы ещё не загружены</p>
                </div>
              ) : (
                <div className="p-4 space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          doc.status === 'ready' ? 'bg-blue-100' : 'bg-orange-100'
                        }`}>
                          <Icon name={doc.status === 'ready' ? 'FileText' : 'Loader2'} 
                            size={18} 
                            className={`${doc.status === 'ready' ? 'text-primary' : 'text-orange-600 animate-spin'}`} 
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-slate-900 truncate">{doc.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-slate-100 rounded text-slate-700">{doc.category}</span>
                            {doc.pages > 0 && <span className="text-xs text-slate-600">{doc.pages} стр.</span>}
                            <span className="text-xs text-slate-600">{doc.size}</span>
                          </div>
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
    </div>
  );
};

export default AdminView;
