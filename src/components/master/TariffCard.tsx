import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Tariff {
  id: string;
  name: string;
  price: number;
  renewal_price: number;
  setup_fee: number;
  period: string;
  features: string[];
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
}

interface TariffCardProps {
  tariff: Tariff;
  onEdit: (tariff: Tariff) => void;
}

export const TariffCard = ({ tariff, onEdit }: TariffCardProps) => {
  return (
    <Card className={tariff.is_popular ? 'border-2 border-primary' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {tariff.name}
              {tariff.is_popular && (
                <Badge className="bg-primary">Популярный</Badge>
              )}
              {!tariff.is_active && (
                <Badge variant="secondary">Неактивен</Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-2">
              <div className="text-2xl font-bold text-slate-900">
                {tariff.price.toFixed(2)} ₽
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Продление: {tariff.renewal_price.toFixed(2)} ₽/{tariff.period}
              </div>
              <div className="text-sm text-muted-foreground">
                Setup fee: {tariff.setup_fee.toFixed(2)} ₽
              </div>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-4">
          {tariff.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <Icon name="Check" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => onEdit(tariff)}
        >
          <Icon name="Edit" className="mr-2" size={16} />
          Редактировать
        </Button>
      </CardContent>
    </Card>
  );
};
