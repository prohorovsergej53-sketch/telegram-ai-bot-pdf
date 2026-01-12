export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Document {
  id: number;
  name: string;
  size: string;
  pages: number;
  category: string;
  status: string;
  uploadedAt: string;
}

export interface QuickQuestion {
  id?: number;
  icon: string;
  text: string;
  question: string;
  sort_order?: number;
}

export interface PageSettings {
  page_title: string;
  page_subtitle: string;
  quick_questions_title: string;
  contacts_title: string;
  contact_phone_label: string;
  contact_phone_value: string;
  contact_email_label: string;
  contact_email_value: string;
  contact_address_label: string;
  contact_address_value: string;
  footer_text: string;
  footer_link: string;
  input_placeholder: string;
}

export const BACKEND_URLS = {
  chat: 'https://functions.poehali.dev/7b58f4fb-5db0-4f85-bb3b-55bafa4cbf73',
  uploadPdf: 'https://functions.poehali.dev/1ecfd90c-5cef-40a0-af5b-3ba36d6c50c9',
  processPdf: 'https://functions.poehali.dev/44b9c312-5377-4fa7-8b4c-522f4bbbf201',
  getDocuments: 'https://functions.poehali.dev/7588840b-ea6f-4e3e-9f16-ae0ace5a59c6',
  deletePdf: 'https://functions.poehali.dev/5652f065-3908-4520-89c7-18440a025bf1',
  getAiSettings: 'https://functions.poehali.dev/aa4e850d-6e48-49a5-8ffd-473d4ffa4235',
  updateAiSettings: 'https://functions.poehali.dev/a3f5f302-e16a-4bb7-8530-d0f6cd22091f',
  telegramWebhook: 'https://functions.poehali.dev/a54f2817-d6cf-49d2-9eeb-2c038523c0cb',
  getChatStats: 'https://functions.poehali.dev/f818bf6f-d72f-49b5-9436-c59a8e588c61',
  authAdmin: 'https://functions.poehali.dev/20be465d-cf04-4dc0-bbd3-1fc7ffb67ada',
  getPageSettings: 'https://functions.poehali.dev/0534411b-d900-45d2-9082-a9485b33cf20',
  updatePageSettings: 'https://functions.poehali.dev/83326caa-63b4-4bfa-a3f1-b0fee1d4baf9',
  getWidgetSettings: 'https://functions.poehali.dev/7ca040c5-91c5-403c-9d60-baa0f7e390a0',
  updateWidgetSettings: 'https://functions.poehali.dev/0cf37b7e-c359-4a9f-8e34-8f0ca8b69efb'
};

export const quickQuestions = [
  { icon: 'Bed', text: 'Типы номеров', question: 'Какие типы номеров доступны?' },
  { icon: 'UtensilsCrossed', text: 'Завтрак', question: 'Во сколько завтрак?' },
  { icon: 'Wifi', text: 'Wi-Fi', question: 'Как подключиться к Wi-Fi?' },
  { icon: 'Dumbbell', text: 'Фитнес', question: 'Есть ли тренажерный зал?' },
  { icon: 'Car', text: 'Парковка', question: 'Где находится парковка?' },
  { icon: 'Sparkles', text: 'SPA', question: 'Расскажите про SPA-центр' },
];