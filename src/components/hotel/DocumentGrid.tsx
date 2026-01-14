import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';
import { Document } from './types';

interface DocumentGridProps {
  documents: Document[];
  scrollAreaHeight: string;
  onDeleteDocument: (documentId: number) => void;
}

const DocumentGrid = ({ documents, scrollAreaHeight, onDeleteDocument }: DocumentGridProps) => {
  if (documents.length === 0) {
    return (
      <ScrollArea className={scrollAreaHeight}>
        <div className="p-8 text-center text-slate-500">
          <Icon name="FileText" size={48} className="mx-auto mb-3 opacity-30" />
          <p>Нет документов с выбранными фильтрами</p>
        </div>
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className={scrollAreaHeight}>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {documents.map((doc) => (
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
    </ScrollArea>
  );
};

export default DocumentGrid;
