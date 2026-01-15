import { useEffect } from 'react';

interface UseIndexEffectsParams {
  tenantSlug?: string;
  currentTenantId: number | null;
  view: 'guest' | 'admin';
  isAdminAuthenticated: boolean;
  loadTenantInfo: (slug?: string) => Promise<void>;
  loadPageSettings: () => Promise<void>;
  loadConsentSettings: () => Promise<void>;
  loadDocuments: () => Promise<void>;
}

export const useIndexEffects = (params: UseIndexEffectsParams) => {
  const {
    tenantSlug,
    currentTenantId,
    view,
    isAdminAuthenticated,
    loadTenantInfo,
    loadPageSettings,
    loadConsentSettings,
    loadDocuments
  } = params;

  useEffect(() => {
    if (tenantSlug) {
      loadTenantInfo(tenantSlug);
    }
  }, [tenantSlug]);

  useEffect(() => {
    loadPageSettings();
    loadConsentSettings();
  }, [currentTenantId]);

  useEffect(() => {
    if (view === 'admin' && isAdminAuthenticated) {
      loadDocuments();
    }
  }, [view, isAdminAuthenticated, currentTenantId]);
};
