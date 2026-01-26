export const COLOR_SCHEMES = {
  purple: {
    name: 'Фиолетовая',
    button_color: '#8b5cf6',
    button_color_end: '#6366f1',
    header_color: '#8b5cf6',
    header_color_end: '#6366f1'
  },
  blue: {
    name: 'Синяя',
    button_color: '#3b82f6',
    button_color_end: '#2563eb',
    header_color: '#3b82f6',
    header_color_end: '#2563eb'
  },
  indigo: {
    name: 'Индиго',
    button_color: '#6366f1',
    button_color_end: '#4f46e5',
    header_color: '#6366f1',
    header_color_end: '#4f46e5'
  },
  green: {
    name: 'Зелёная',
    button_color: '#10b981',
    button_color_end: '#059669',
    header_color: '#10b981',
    header_color_end: '#059669'
  },
  orange: {
    name: 'Оранжевая',
    button_color: '#f97316',
    button_color_end: '#ea580c',
    header_color: '#f97316',
    header_color_end: '#ea580c'
  },
  pink: {
    name: 'Розовая',
    button_color: '#ec4899',
    button_color_end: '#db2777',
    header_color: '#ec4899',
    header_color_end: '#db2777'
  },
  dark: {
    name: 'Тёмная',
    button_color: '#1f2937',
    button_color_end: '#111827',
    header_color: '#1f2937',
    header_color_end: '#111827'
  }
};

export interface WidgetSettings {
  button_color: string;
  button_color_end: string;
  button_size: number;
  button_position: string;
  button_icon: string;
  window_width: number;
  window_height: number;
  header_title: string;
  header_color: string;
  header_color_end: string;
  border_radius: number;
  show_branding: boolean;
  custom_css: string | null;
  chat_url: string | null;
}

export const applyColorScheme = (
  scheme: string,
  currentSettings: WidgetSettings
): WidgetSettings => {
  const colors = COLOR_SCHEMES[scheme as keyof typeof COLOR_SCHEMES];
  if (colors) {
    return {
      ...currentSettings,
      button_color: colors.button_color,
      button_color_end: colors.button_color_end,
      header_color: colors.header_color,
      header_color_end: colors.header_color_end
    };
  }
  return currentSettings;
};