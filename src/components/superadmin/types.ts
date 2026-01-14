export interface Tariff {
  id: string;
  name: string;
  price: number;
  period: string;
  setup_fee: number;
  renewal_price: number;
  is_active: boolean;
}

export interface Tenant {
  id: number;
  slug: string;
  name: string;
  description: string;
  tariff_id: string;
  subscription_end_date: string;
  documents_count: number;
  admins_count: number;
  created_at: string;
}

export const BACKEND_URLS = {
  tariffs: 'https://functions.poehali.dev/9aaca202-0192-4234-9f65-591df1552960',
  tenants: 'https://functions.poehali.dev/b1bdd2fb-cf88-4093-a3d7-15d273763e4c'
};