import { AiModelSettings } from './types';

export interface AiPreset {
  id: string;
  name: string;
  description: string;
  settings: AiModelSettings;
}

export const AI_PRESETS: Record<string, AiPreset[]> = {
  yandexgpt: [
    {
      id: 'yandexgpt-concierge',
      name: 'Консьерж (рекомендуется)',
      description: 'Минимум галлюцинаций, строгие шаблоны',
      settings: {
        model: 'yandexgpt',
        temperature: 0.15,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 600,
        system_priority: 'strict',
        creative_mode: 'off'
      }
    },
    {
      id: 'yandexgpt-creative',
      name: 'Креативный',
      description: 'Более живые и разнообразные ответы',
      settings: {
        model: 'yandexgpt',
        temperature: 0.4,
        top_p: 0.95,
        frequency_penalty: 0.3,
        presence_penalty: 0.2,
        max_tokens: 800,
        system_priority: 'normal',
        creative_mode: 'on'
      }
    },
    {
      id: 'yandexgpt-balanced',
      name: 'Сбалансированный',
      description: 'Золотая середина между точностью и креативом',
      settings: {
        model: 'yandexgpt',
        temperature: 0.25,
        top_p: 0.95,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        max_tokens: 700,
        system_priority: 'strict',
        creative_mode: 'off'
      }
    }
  ],
  'openrouter-llama-3.1-8b': [
    {
      id: 'llama-precise',
      name: 'Точный (рекомендуется)',
      description: 'Минимум вариативности для Llama 3.1',
      settings: {
        model: 'openrouter-llama-3.1-8b',
        temperature: 0.3,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 600
      }
    },
    {
      id: 'llama-balanced',
      name: 'Сбалансированный',
      description: 'Оптимальный баланс для Llama 3.1',
      settings: {
        model: 'openrouter-llama-3.1-8b',
        temperature: 0.5,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        max_tokens: 700
      }
    }
  ],
  'openrouter-gemma-2-9b': [
    {
      id: 'gemma-precise',
      name: 'Точный (рекомендуется)',
      description: 'Минимум вариативности для Gemma 2',
      settings: {
        model: 'openrouter-gemma-2-9b',
        temperature: 0.3,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 600
      }
    },
    {
      id: 'gemma-balanced',
      name: 'Сбалансированный',
      description: 'Оптимальный баланс для Gemma 2',
      settings: {
        model: 'openrouter-gemma-2-9b',
        temperature: 0.5,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        max_tokens: 700
      }
    }
  ],
  'openrouter-qwen-2.5-7b': [
    {
      id: 'qwen-precise',
      name: 'Точный (рекомендуется)',
      description: 'Минимум вариативности для Qwen 2.5',
      settings: {
        model: 'openrouter-qwen-2.5-7b',
        temperature: 0.3,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 600
      }
    },
    {
      id: 'qwen-balanced',
      name: 'Сбалансированный',
      description: 'Оптимальный баланс для Qwen 2.5',
      settings: {
        model: 'openrouter-qwen-2.5-7b',
        temperature: 0.5,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        max_tokens: 700
      }
    }
  ],
  'openrouter-phi-3-medium': [
    {
      id: 'phi-precise',
      name: 'Точный (рекомендуется)',
      description: 'Минимум вариативности для Phi-3',
      settings: {
        model: 'openrouter-phi-3-medium',
        temperature: 0.3,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 600
      }
    },
    {
      id: 'phi-balanced',
      name: 'Сбалансированный',
      description: 'Оптимальный баланс для Phi-3',
      settings: {
        model: 'openrouter-phi-3-medium',
        temperature: 0.5,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        max_tokens: 700
      }
    }
  ],
  'openrouter-deepseek-r1': [
    {
      id: 'deepseek-precise',
      name: 'Точный (рекомендуется)',
      description: 'Минимум вариативности для DeepSeek R1',
      settings: {
        model: 'openrouter-deepseek-r1',
        temperature: 0.3,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 600
      }
    },
    {
      id: 'deepseek-balanced',
      name: 'Сбалансированный',
      description: 'Оптимальный баланс для DeepSeek R1',
      settings: {
        model: 'openrouter-deepseek-r1',
        temperature: 0.5,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        max_tokens: 700
      }
    }
  ],
  'deepseek-chat': [
    {
      id: 'deepseek-chat-precise',
      name: 'Точный',
      description: 'Фокусировка на точности ответов',
      settings: {
        model: 'deepseek-chat',
        temperature: 0.2,
        top_p: 0.9,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 600
      }
    },
    {
      id: 'deepseek-chat-balanced',
      name: 'Сбалансированный',
      description: 'Оптимальный баланс для DeepSeek Chat',
      settings: {
        model: 'deepseek-chat',
        temperature: 0.5,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        max_tokens: 700
      }
    }
  ]
};