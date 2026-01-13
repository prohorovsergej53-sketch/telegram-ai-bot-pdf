import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TariffManagementCard from '@/components/superadmin/TariffManagementCard';
import { isSuperAdmin } from '@/lib/auth';

const SuperAdmin = () => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSuperAdmin()) {
      navigate('/admin');
    }
  }, [navigate]);

  if (!isSuperAdmin()) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Суперадмин-панель</h1>
          <p className="text-slate-600">Управление тарифами и настройками платформы</p>
        </div>

        <div className="space-y-6">
          <TariffManagementCard />
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
