import Icon from '@/components/ui/icon';

interface DocumentUploadAreaProps {
  isLoading: boolean;
  canUpload: boolean;
  limits: {
    name: string;
    maxPdfDocuments: number;
  };
  currentDocCount: number;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const DocumentUploadArea = ({ 
  isLoading, 
  canUpload, 
  limits, 
  currentDocCount, 
  onFileUpload 
}: DocumentUploadAreaProps) => {
  if (!canUpload) {
    return (
      <div className="border-2 border-dashed border-amber-300 bg-amber-50 rounded-xl p-8 text-center">
        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Icon name="Lock" size={20} className="text-amber-600" />
        </div>
        <p className="font-medium text-amber-900 mb-1">
          Достигнут лимит по тарифу
        </p>
        <p className="text-sm text-amber-800 mb-3">
          {limits.maxPdfDocuments === -1 
            ? 'Безлимит документов'
            : `Ваш тариф "${limits.name}" позволяет загрузить до ${limits.maxPdfDocuments} документов`}
        </p>
        <a 
          href="/#pricing" 
          className="inline-flex items-center gap-2 text-sm font-medium text-amber-900 hover:underline"
        >
          <Icon name="ArrowUpRight" size={16} />
          Перейти на тариф Бизнес или Премиум
        </a>
      </div>
    );
  }

  return (
    <>
      <label htmlFor="file-upload" className="cursor-pointer">
        <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-primary hover:bg-blue-50/50 transition-all group">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
            <Icon name={isLoading ? 'Loader2' : 'Upload'} size={20} className={`text-primary ${isLoading ? 'animate-spin' : ''}`} />
          </div>
          <p className="font-medium text-slate-900 mb-1">
            {isLoading ? 'Загрузка...' : 'Выберите PDF файлы'}
          </p>
          <p className="text-sm text-slate-600">
            {limits.maxPdfDocuments === -1 
              ? 'можно несколько одновременно (безлимит)' 
              : `можно несколько (осталось ${limits.maxPdfDocuments - currentDocCount})`}
          </p>
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
      
      <div className="mt-4 bg-slate-50 border border-slate-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Icon name="Info" size={18} className="text-slate-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-slate-700 space-y-1">
            <p className="font-semibold text-slate-900">Требования к файлам:</p>
            <ul className="space-y-1 list-disc list-inside ml-1">
              <li>Только PDF формат</li>
              <li>Максимальный размер: 50 МБ</li>
              <li>Максимум 500 страниц в одном документе</li>
              <li>Максимум 2000 фрагментов текста после обработки</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentUploadArea;