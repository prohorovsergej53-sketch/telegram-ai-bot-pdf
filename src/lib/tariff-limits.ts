export interface TariffLimits {
  id: string;
  name: string;
  maxPdfDocuments: number;
  hasWebChat: boolean;
  hasTelegram: boolean;
  hasWhatsApp: boolean;
  hasVK: boolean;
  hasMAX: boolean;
  hasAISettings: boolean;
  hasAdvancedAISettings: boolean;
  hasCustomization: boolean;
  hasPersonalManager: boolean;
}

export const TARIFF_LIMITS: Record<string, TariffLimits> = {
  basic: {
    id: 'basic',
    name: 'Старт',
    maxPdfDocuments: 10,
    hasWebChat: true,
    hasTelegram: false,
    hasWhatsApp: false,
    hasVK: false,
    hasMAX: false,
    hasAISettings: true,
    hasAdvancedAISettings: false,
    hasCustomization: false,
    hasPersonalManager: false
  },
  professional: {
    id: 'professional',
    name: 'Бизнес',
    maxPdfDocuments: 25,
    hasWebChat: true,
    hasTelegram: true,
    hasWhatsApp: false,
    hasVK: false,
    hasMAX: false,
    hasAISettings: true,
    hasAdvancedAISettings: true,
    hasCustomization: false,
    hasPersonalManager: false
  },
  enterprise: {
    id: 'enterprise',
    name: 'Премиум',
    maxPdfDocuments: 100,
    hasWebChat: true,
    hasTelegram: true,
    hasWhatsApp: true,
    hasVK: true,
    hasMAX: true,
    hasAISettings: true,
    hasAdvancedAISettings: true,
    hasCustomization: true,
    hasPersonalManager: true
  }
};

export function getTariffLimits(tariffId: string | null): TariffLimits {
  if (!tariffId || !TARIFF_LIMITS[tariffId]) {
    return TARIFF_LIMITS.basic;
  }
  return TARIFF_LIMITS[tariffId];
}

export function canUploadMoreDocuments(currentCount: number, tariffId: string | null): boolean {
  const isSuperAdminViewing = sessionStorage.getItem('superadmin_viewing_tenant') === 'true';
  if (isSuperAdminViewing) return true;
  
  const limits = getTariffLimits(tariffId);
  if (limits.maxPdfDocuments === -1) return true;
  return currentCount < limits.maxPdfDocuments;
}

export function hasFeatureAccess(feature: keyof Omit<TariffLimits, 'id' | 'name' | 'maxPdfDocuments'>, tariffId: string | null): boolean {
  const isSuperAdminViewing = sessionStorage.getItem('superadmin_viewing_tenant') === 'true';
  if (isSuperAdminViewing) return true;
  
  const limits = getTariffLimits(tariffId);
  return limits[feature];
}