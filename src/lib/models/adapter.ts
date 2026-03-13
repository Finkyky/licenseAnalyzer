import { ModelConfig, ModelAdapter } from '@/types/model';
import { ClaudeAdapter } from './claude';
import { OpenAIAdapter } from './openai';
import { OpenAICompatibleAdapter } from './openaiCompatible';

// Built-in model config (read from environment variables)
export const BUILTIN_MODEL = {
  baseUrl: process.env.BUILTIN_MODEL_BASE_URL || 'https://api.longcat.chat/openai/v1',
  apiKey: process.env.BUILTIN_MODEL_API_KEY || '',
  modelId: process.env.BUILTIN_MODEL_ID || 'LongCat-Flash-Chat',
};

// Known provider base URLs
const PROVIDER_BASE_URLS: Record<string, string> = {
  deepseek: 'https://api.deepseek.com/v1',
  qwen: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
};

export function createModelAdapter(config: ModelConfig): ModelAdapter {
  switch (config.provider) {
    case 'builtin':
      return new OpenAICompatibleAdapter({
        ...config,
        apiKey: BUILTIN_MODEL.apiKey,
        baseUrl: BUILTIN_MODEL.baseUrl,
        modelId: BUILTIN_MODEL.modelId,
      });
    case 'claude':
      return new ClaudeAdapter(config);
    case 'openai':
      return new OpenAIAdapter(config);
    case 'deepseek':
    case 'qwen':
      return new OpenAICompatibleAdapter({
        ...config,
        baseUrl: config.baseUrl || PROVIDER_BASE_URLS[config.provider],
      });
    case 'openai-compatible':
      return new OpenAICompatibleAdapter(config);
    default:
      throw new Error(`不支持的模型提供商: ${config.provider}`);
  }
}
