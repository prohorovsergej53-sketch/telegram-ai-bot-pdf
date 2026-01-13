import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageSettings } from './types';

interface ContactsSettingsSectionProps {
  settings: PageSettings;
  onSettingsChange: (settings: PageSettings) => void;
}

export const ContactsSettingsSection = ({
  settings,
  onSettingsChange
}: ContactsSettingsSectionProps) => {
  return (
    <div className="border-b pb-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Контакты</h3>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="contact_phone_label">Название телефона</Label>
            <Input
              id="contact_phone_label"
              value={settings.contact_phone_label}
              onChange={(e) => onSettingsChange({ ...settings, contact_phone_label: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="contact_phone_value">Номер телефона</Label>
            <Input
              id="contact_phone_value"
              value={settings.contact_phone_value}
              onChange={(e) => onSettingsChange({ ...settings, contact_phone_value: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="contact_email_label">Название email</Label>
            <Input
              id="contact_email_label"
              value={settings.contact_email_label}
              onChange={(e) => onSettingsChange({ ...settings, contact_email_label: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="contact_email_value">Email</Label>
            <Input
              id="contact_email_value"
              type="email"
              value={settings.contact_email_value}
              onChange={(e) => onSettingsChange({ ...settings, contact_email_value: e.target.value })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="contact_address_label">Название адреса</Label>
            <Input
              id="contact_address_label"
              value={settings.contact_address_label}
              onChange={(e) => onSettingsChange({ ...settings, contact_address_label: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="contact_address_value">Адрес</Label>
            <Input
              id="contact_address_value"
              value={settings.contact_address_value}
              onChange={(e) => onSettingsChange({ ...settings, contact_address_value: e.target.value })}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="contacts_title">Заголовок секции контактов</Label>
          <Input
            id="contacts_title"
            value={settings.contacts_title}
            onChange={(e) => onSettingsChange({ ...settings, contacts_title: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
};
