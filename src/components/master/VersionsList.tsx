import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Version {
  version: string;
  description: string;
  code_hash: string;
  created_at: string;
  created_by: string;
  tenant_count: number;
}

interface VersionsListProps {
  versions: Version[];
}

const VersionsList = ({ versions }: VersionsListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Версии мастер-шаблона</CardTitle>
        <CardDescription>История версий кода</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {versions.map((version) => (
              <div
                key={version.version}
                className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-semibold text-slate-900">{version.version}</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                    {version.tenant_count} тенантов
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{version.description}</p>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span>{new Date(version.created_at).toLocaleDateString('ru-RU')}</span>
                  <span>•</span>
                  <span>{version.created_by}</span>
                  <span>•</span>
                  <span className="font-mono">{version.code_hash}</span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default VersionsList;
