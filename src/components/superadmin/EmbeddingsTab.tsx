import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { authenticatedFetch } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Tenant } from './types';
import Icon from '@/components/ui/icon';

interface TenantEmbedding extends Tenant {
  embedding_provider: string;
  embedding_doc_model: string;
  embedding_query_model: string;
}

const BACKEND_URL_EMBEDDINGS = 'https://functions.poehali.dev/eba16a48-59f3-4290-ae64-c0ca649f66a5';

export const EmbeddingsTab = () => {
  const { toast } = useToast();
  const [tenants, setTenants] = useState<TenantEmbedding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingTenantId, setEditingTenantId] = useState<number | null>(null);
  const [editedProvider, setEditedProvider] = useState('');
  const [editedDocModel, setEditedDocModel] = useState('');
  const [editedQueryModel, setEditedQueryModel] = useState('');

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    setIsLoading(true);
    try {
      const response = await authenticatedFetch(BACKEND_URL_EMBEDDINGS);
      if (response.ok) {
        const data = await response.json();
        setTenants(data.tenants || []);
      } else {
        throw new Error('Failed to load tenants');
      }
    } catch (error) {
      console.error('Error loading tenants:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить список ботов',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (tenant: TenantEmbedding) => {
    setEditingTenantId(tenant.id);
    setEditedProvider(tenant.embedding_provider);
    setEditedDocModel(tenant.embedding_doc_model);
    setEditedQueryModel(tenant.embedding_query_model);
  };

  const handleSave = async (tenantId: number) => {
    try {
      const response = await authenticatedFetch(BACKEND_URL_EMBEDDINGS, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenant_id: tenantId,
          embedding_provider: editedProvider,
          embedding_doc_model: editedDocModel,
          embedding_query_model: editedQueryModel
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Настройки эмбеддингов обновлены'
        });
        setEditingTenantId(null);
        loadTenants();
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update embeddings');
      }
    } catch (error: any) {
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить настройки',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditingTenantId(null);
    setEditedProvider('');
    setEditedDocModel('');
    setEditedQueryModel('');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Icon name="Loader2" className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Управление моделями эмбеддингов</CardTitle>
        <CardDescription>
          Настройте модели эмбеддингов для каждого бота. Для ботов с 152-ФЗ можно использовать только Яндекс.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tenants.map((tenant) => {
            const isEditing = editingTenantId === tenant.id;
            const isFz152 = tenant.fz152_enabled;

            return (
              <div key={tenant.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{tenant.name}</h3>
                    {isFz152 && (
                      <span className="text-xs text-muted-foreground">
                        152-ФЗ включён — только Яндекс
                      </span>
                    )}
                  </div>
                  {!isEditing ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(tenant)}
                      disabled={isFz152}
                    >
                      <Icon name="Settings" size={16} className="mr-2" />
                      Настроить
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleSave(tenant.id)}>
                        Сохранить
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        Отмена
                      </Button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="grid gap-3 pt-2">
                    <div>
                      <label className="text-sm font-medium">Провайдер эмбеддингов</label>
                      <Select value={editedProvider} onValueChange={setEditedProvider}>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите провайдера" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yandex">Яндекс (256 измерений)</SelectItem>
                          <SelectItem value="openai">OpenAI (1536 измерений)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {editedProvider === 'yandex' && (
                      <>
                        <div>
                          <label className="text-sm font-medium">Модель для документов</label>
                          <Select value={editedDocModel} onValueChange={setEditedDocModel}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text-search-doc">text-search-doc (256)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Модель для запросов</label>
                          <Select value={editedQueryModel} onValueChange={setEditedQueryModel}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text-search-query">text-search-query (256)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}

                    {editedProvider === 'openai' && (
                      <>
                        <div>
                          <label className="text-sm font-medium">Модель для документов</label>
                          <Select value={editedDocModel} onValueChange={setEditedDocModel}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text-embedding-3-small">text-embedding-3-small (1536)</SelectItem>
                              <SelectItem value="text-embedding-3-large">text-embedding-3-large (3072)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">Модель для запросов</label>
                          <Select value={editedQueryModel} onValueChange={setEditedQueryModel}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text-embedding-3-small">text-embedding-3-small (1536)</SelectItem>
                              <SelectItem value="text-embedding-3-large">text-embedding-3-large (3072)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-4 pt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Провайдер:</span>
                      <p className="font-medium">{tenant.embedding_provider}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Модель документов:</span>
                      <p className="font-medium">{tenant.embedding_doc_model}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Модель запросов:</span>
                      <p className="font-medium">{tenant.embedding_query_model}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {tenants.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Нет доступных ботов
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
