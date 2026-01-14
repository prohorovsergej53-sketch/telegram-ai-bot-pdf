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
  header_icon: string;
  header_title: string;
  header_subtitle: string;
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
  public_description?: string;
}

export interface AiModelSettings {
  provider: string;
  model: string;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  system_priority?: string;
  creative_mode?: string;
  system_prompt?: string;
}

export const AI_PROVIDERS = [
  { value: 'yandex', label: 'Yandex' },
  { value: 'openrouter', label: 'OpenRouter' }
] as const;

export interface ModelOption {
  value: string;
  label: string;
  apiModel: string;
  price?: string;
  category?: string;
}

export const AI_MODELS_BY_PROVIDER: Record<string, ModelOption[]> = {
  yandex: [
    { value: 'yandexgpt', label: 'YandexGPT', apiModel: 'yandexgpt', price: 'от ₽1 за 1000 токенов', category: 'Стандартные' },
    { value: 'yandexgpt-lite', label: 'YandexGPT Lite', apiModel: 'yandexgpt-lite', price: '₽0.12 за 1000 токенов', category: 'Экономные' }
  ],
  openrouter: [
    { value: 'llama-3.1-8b', label: 'Meta Llama 3.1 8B', apiModel: 'meta-llama/llama-3.1-8b-instruct:free', price: 'Бесплатно', category: '⚡ Бесплатные' },
    { value: 'gemma-2-9b', label: 'Google Gemma 2 9B', apiModel: 'google/gemma-2-9b-it:free', price: 'Бесплатно', category: '⚡ Бесплатные' },
    { value: 'qwen-2.5-7b', label: 'Qwen 2.5 7B', apiModel: 'qwen/qwen-2.5-7b-instruct:free', price: 'Бесплатно', category: '⚡ Бесплатные' },
    { value: 'phi-3-medium', label: 'Microsoft Phi-3 Medium', apiModel: 'microsoft/phi-3-medium-128k-instruct:free', price: 'Бесплатно', category: '⚡ Бесплатные' },
    { value: 'deepseek-r1', label: 'DeepSeek R1', apiModel: 'deepseek/deepseek-r1:free', price: 'Бесплатно', category: '⚡ Бесплатные' },
    
    { value: 'gpt-4o', label: 'GPT-4o', apiModel: 'openai/gpt-4o', price: '$2.50/$10.00 за 1M', category: '💎 Топовые' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo', apiModel: 'openai/gpt-4-turbo', price: '$10.00/$30.00 за 1M', category: '💎 Топовые' },
    { value: 'claude-3.5-sonnet', label: 'Claude 3.5 Sonnet', apiModel: 'anthropic/claude-3.5-sonnet', price: '$3.00/$15.00 за 1M', category: '💎 Топовые' },
    { value: 'claude-3-opus', label: 'Claude 3 Opus', apiModel: 'anthropic/claude-3-opus', price: '$15.00/$75.00 за 1M', category: '💎 Топовые' },
    { value: 'gemini-pro-1.5', label: 'Google Gemini Pro 1.5', apiModel: 'google/gemini-pro-1.5', price: '$1.25/$5.00 за 1M', category: '💎 Топовые' },
    
    { value: 'llama-3.1-70b', label: 'Meta Llama 3.1 70B', apiModel: 'meta-llama/llama-3.1-70b-instruct', price: '$0.52/$0.75 за 1M', category: '💰 Дешевые' },
    { value: 'mixtral-8x7b', label: 'Mixtral 8x7B', apiModel: 'mistralai/mixtral-8x7b-instruct', price: '$0.24/$0.24 за 1M', category: '💰 Дешевые' },
    { value: 'claude-3-haiku', label: 'Claude 3 Haiku', apiModel: 'anthropic/claude-3-haiku', price: '$0.25/$1.25 за 1M', category: '💰 Дешевые' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', apiModel: 'openai/gpt-3.5-turbo', price: '$0.50/$1.50 за 1M', category: '💰 Дешевые' },
    { value: 'gemini-flash-1.5', label: 'Google Gemini Flash 1.5', apiModel: 'google/gemini-flash-1.5', price: '$0.075/$0.30 за 1M', category: '💰 Дешевые' }
  ]
};

export const EMBEDDING_CONFIG = {
  provider: 'yandex',
  dimension: 256,
  models: {
    doc: 'text-search-doc/latest',
    query: 'text-search-query/latest'
  }
};

export const DEFAULT_AI_SETTINGS: AiModelSettings = {
  provider: 'yandex',
  model: 'yandexgpt',
  temperature: 0.15,
  top_p: 1.0,
  frequency_penalty: 0,
  presence_penalty: 0,
  max_tokens: 600,
  system_priority: 'strict',
  creative_mode: 'off',
  system_prompt: ''
};

export const BACKEND_URLS = {
  chat: 'https://functions.poehali.dev/7b58f4fb-5db0-4f85-bb3b-55bafa4cbf73',
  uploadPdf: 'https://functions.poehali.dev/1ecfd90c-5cef-40a0-af5b-3ba36d6c50c9',
  processPdf: 'https://functions.poehali.dev/44b9c312-5377-4fa7-8b4c-522f4bbbf201',
  getDocuments: 'https://functions.poehali.dev/7588840b-ea6f-4e3e-9f16-ae0ace5a59c6',
  deletePdf: 'https://functions.poehali.dev/5652f065-3908-4520-89c7-18440a025bf1',
  getAiSettings: 'https://functions.poehali.dev/aa4e850d-6e48-49a5-8ffd-473d4ffa4235',
  updateAiSettings: 'https://functions.poehali.dev/a3f5f302-e16a-4bb7-8530-d0f6cd22091f',
  telegramWebhook: 'https://functions.poehali.dev/a54f2817-d6cf-49d2-9eeb-2c038523c0cb',
  vkWebhook: 'https://functions.poehali.dev/b008537a-2081-4b03-aaff-b39e8408818a',
  maxWebhook: 'https://functions.poehali.dev/ae0b074b-a749-4714-90d2-2146a6de57de',
  getChatStats: 'https://functions.poehali.dev/f818bf6f-d72f-49b5-9436-c59a8e588c61',
  authAdmin: 'https://functions.poehali.dev/20be465d-cf04-4dc0-bbd3-1fc7ffb67ada',
  getPageSettings: 'https://functions.poehali.dev/0534411b-d900-45d2-9082-a9485b33cf20',
  updatePageSettings: 'https://functions.poehali.dev/83326caa-63b4-4bfa-a3f1-b0fee1d4baf9',
  getWidgetSettings: 'https://functions.poehali.dev/7ca040c5-91c5-403c-9d60-baa0f7e390a0',
  updateWidgetSettings: 'https://functions.poehali.dev/0cf37b7e-c359-4a9f-8e34-8f0ca8b69efb',
  getQualityGateStats: 'https://functions.poehali.dev/398c246e-01fc-4a9c-9206-995f7881960a',
  messengerSettings: 'https://functions.poehali.dev/0993895c-dede-469e-94f6-18c2829df143',
  tariffManagement: 'https://functions.poehali.dev/9aaca202-0192-4234-9f65-591df1552960',
  yandexApiValidation: 'https://functions.poehali.dev/d7cc5843-8cc2-4c50-a819-04b1b43b744d',
  manageApiKeys: 'https://functions.poehali.dev/335a37e0-231e-4ba0-adf3-94f610d1c449',
  messengerAutoMessages: 'https://functions.poehali.dev/a5c44dff-b325-43e4-9c89-020d5c116178',
  revectorizeDocuments: 'https://functions.poehali.dev/2d832170-52ac-4e8c-957a-610cd1ec8795',
  getTenantBySlug: 'https://functions.poehali.dev/7d6bc169-78bf-43cd-a0d6-562bc5a6c9ad'
};

export const quickQuestions = [
  { icon: 'Bed', text: 'Типы номеров', question: 'Какие типы номеров доступны?' },
  { icon: 'UtensilsCrossed', text: 'Завтрак', question: 'Во сколько завтрак?' },
  { icon: 'Wifi', text: 'Wi-Fi', question: 'Как подключиться к Wi-Fi?' },
  { icon: 'Dumbbell', text: 'Фитнес', question: 'Есть ли тренажерный зал?' },
  { icon: 'Car', text: 'Парковка', question: 'Где находится парковка?' },
  { icon: 'Sparkles', text: 'SPA', question: 'Расскажите про SPA-центр' },
];