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
      <div className="p-3 space-y-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white"
          >
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                doc.status === 'ready' ? 'bg-blue-100' : 'bg-orange-100'
              }`}>
                <Icon name={doc.status === 'ready' ? 'FileCheck' : 'Loader2'} 
                  size={16} 
                  className={`${doc.status === 'ready' ? 'text-primary' : 'text-orange-600 animate-spin'}`} 
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 truncate mb-0.5">{doc.name}</p>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  {doc.pages > 0 && <span>{doc.pages} стр.</span>}
                  <span>{doc.size}</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
                onClick={() => onDeleteDocument(doc.id)}
              >
                <Icon name="Trash2" size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default DocumentGrid;