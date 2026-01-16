import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { Document } from './types';
import { getTariffId } from '@/lib/auth';
import { getTariffLimits, canUploadMoreDocuments } from '@/lib/tariff-limits';
import DocumentUploadArea from './DocumentUploadArea';
import DocumentGrid from './DocumentGrid';

interface DocumentsPanelProps {
  documents: Document[];
  isLoading: boolean;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteDocument: (documentId: number) => void;
}

export const DocumentsPanel = ({
  documents,
  isLoading,
  onFileUpload,
  onDeleteDocument
}: DocumentsPanelProps) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const tariffId = getTariffId();
  const limits = getTariffLimits(tariffId);
  const canUpload = canUploadMoreDocuments(documents.length, tariffId);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const statusMatch = selectedStatus === 'all' || doc.status === selectedStatus;
      return statusMatch;
    });
  }, [documents, selectedStatus]);

  const scrollAreaHeight = useMemo(() => {
    const count = filteredDocuments.length;
    if (count === 0) return 'h-[150px]';
    if (count <= 2) return 'h-[200px]';
    if (count <= 4) return 'h-[300px]';
    if (count <= 8) return 'h-[450px]';
    return 'h-[600px]';
  }, [filteredDocuments.length]);

  return (
    <div className="space-y-4">
      <Card className="shadow-lg">
        <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon name="Library" size={20} />
                База знаний
              </CardTitle>
              <CardDescription className="text-sm">{filteredDocuments.length} из {documents.length} документов</CardDescription>
            </div>
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
        </CardHeader>
        <CardContent className="p-0">
          <DocumentGrid
            documents={filteredDocuments}
            scrollAreaHeight={scrollAreaHeight}
            onDeleteDocument={onDeleteDocument}
          />
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardContent className="pt-4 pb-4">
          <DocumentUploadArea
            isLoading={isLoading}
            canUpload={canUpload}
            limits={limits}
            currentDocCount={documents.length}
            onFileUpload={onFileUpload}
          />
        </CardContent>
      </Card>
    </div>
  );
};