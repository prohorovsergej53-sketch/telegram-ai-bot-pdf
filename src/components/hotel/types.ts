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

export const AI_MODELS = [
  { 
    value: 'yandexgpt', 
    label: 'YandexGPT', 
    embeddingDim: 256,
    embeddingProvider: 'yandex',
    embeddingModels: {
      doc: 'text-search-doc/latest',
      query: 'text-search-query/latest'
    }
  },
  { 
    value: 'openrouter-llama-3.1-8b', 
    label: 'Meta Llama 3.1 8B (Free)', 
    embeddingDim: 256,
    embeddingProvider: 'yandex',
    embeddingModels: {
      doc: 'text-search-doc/latest',
      query: 'text-search-query/latest'
    },
    routerModel: 'meta-llama/llama-3.1-8b-instruct:free'
  },
  { 
    value: 'openrouter-gemma-2-9b', 
    label: 'Google Gemma 2 9B (Free)', 
    embeddingDim: 256,
    embeddingProvider: 'yandex',
    embeddingModels: {
      doc: 'text-search-doc/latest',
      query: 'text-search-query/latest'
    },
    routerModel: 'google/gemma-2-9b-it:free'
  },
  { 
    value: 'openrouter-qwen-2.5-7b', 
    label: 'Qwen 2.5 7B (Free)', 
    embeddingDim: 256,
    embeddingProvider: 'yandex',
    embeddingModels: {
      doc: 'text-search-doc/latest',
      query: 'text-search-query/latest'
    },
    routerModel: 'qwen/qwen-2.5-7b-instruct:free'
  },
  { 
    value: 'openrouter-phi-3-medium', 
    label: 'Microsoft Phi-3 Medium (Free)', 
    embeddingDim: 256,
    embeddingProvider: 'yandex',
    embeddingModels: {
      doc: 'text-search-doc/latest',
      query: 'text-search-query/latest'
    },
    routerModel: 'microsoft/phi-3-medium-128k-instruct:free'
  },
  { 
    value: 'openrouter-deepseek-r1', 
    label: 'DeepSeek R1 (Free)', 
    embeddingDim: 256,
    embeddingProvider: 'yandex',
    embeddingModels: {
      doc: 'text-search-doc/latest',
      query: 'text-search-query/latest'
    },
    routerModel: 'deepseek/deepseek-r1:free'
  }
] as const;

export const DEFAULT_AI_SETTINGS: Record<string, AiModelSettings> = {
  yandexgpt: {
    model: 'yandexgpt',
    temperature: 0.15,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 600,
    system_priority: 'strict',
    creative_mode: 'off',
    system_prompt: ''
  },
  'openrouter-llama-3.1-8b': {
    model: 'openrouter-llama-3.1-8b',
    temperature: 0.3,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 600,
    system_prompt: ''
  },
  'openrouter-gemma-2-9b': {
    model: 'openrouter-gemma-2-9b',
    temperature: 0.3,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 600,
    system_prompt: ''
  },
  'openrouter-qwen-2.5-7b': {
    model: 'openrouter-qwen-2.5-7b',
    temperature: 0.3,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 600,
    system_prompt: ''
  },
  'openrouter-phi-3-medium': {
    model: 'openrouter-phi-3-medium',
    temperature: 0.3,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 600,
    system_prompt: ''
  },
  'openrouter-deepseek-r1': {
    model: 'openrouter-deepseek-r1',
    temperature: 0.3,
    top_p: 1.0,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 600,
    system_prompt: ''
  }
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
  checkJinaUsage: 'https://functions.poehali.dev/a531ae47-0841-419d-b681-dfcb2d83d095'
};

export const quickQuestions = [
  { icon: 'Bed', text: 'Типы номеров', question: 'Какие типы номеров доступны?' },
  { icon: 'UtensilsCrossed', text: 'Завтрак', question: 'Во сколько завтрак?' },
  { icon: 'Wifi', text: 'Wi-Fi', question: 'Как подключиться к Wi-Fi?' },
  { icon: 'Dumbbell', text: 'Фитнес', question: 'Есть ли тренажерный зал?' },
  { icon: 'Car', text: 'Парковка', question: 'Где находится парковка?' },
  { icon: 'Sparkles', text: 'SPA', question: 'Расскажите про SPA-центр' },
];