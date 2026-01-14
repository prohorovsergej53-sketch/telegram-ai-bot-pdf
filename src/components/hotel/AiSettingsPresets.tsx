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
  openai: [
    {
      id: 'openai-precise',
      name: 'Точный (рекомендуется)',
      description: 'Минимум вариативности, факты',
      settings: {
        model: 'openai',
        temperature: 0.2,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 600
      }
    },
    {
      id: 'openai-creative',
      name: 'Креативный',
      description: 'Более живые и интересные ответы',
      settings: {
        model: 'openai',
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.3,
        max_tokens: 800
      }
    },
    {
      id: 'openai-balanced',
      name: 'Сбалансированный',
      description: 'Оптимальный баланс параметров',
      settings: {
        model: 'openai',
        temperature: 0.4,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        max_tokens: 700
      }
    }
  ],
  openrouter: [
    {
      id: 'openrouter-precise',
      name: 'Точный (рекомендуется)',
      description: 'Минимум вариативности через OpenRouter',
      settings: {
        model: 'openrouter',
        temperature: 0.2,
        top_p: 1.0,
        frequency_penalty: 0,
        presence_penalty: 0,
        max_tokens: 600
      }
    },
    {
      id: 'openrouter-creative',
      name: 'Креативный',
      description: 'Более живые ответы через OpenRouter',
      settings: {
        model: 'openrouter',
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.5,
        presence_penalty: 0.3,
        max_tokens: 800
      }
    },
    {
      id: 'openrouter-balanced',
      name: 'Сбалансированный',
      description: 'Оптимальный баланс через OpenRouter',
      settings: {
        model: 'openrouter',
        temperature: 0.4,
        top_p: 0.95,
        frequency_penalty: 0.2,
        presence_penalty: 0.1,
        max_tokens: 700
      }
    }
  ]
};