// Model adapter types

export type ModelProvider = 'builtin' | 'claude' | 'openai' | 'deepseek' | 'qwen' | 'openai-compatible';

export interface ModelConfig {
  provider: ModelProvider;
  modelId: string;
  apiKey: string;
  baseUrl?: string;
}

export interface ModelMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ModelResponse {
  content: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
  };
}

export interface ModelAdapter {
  call(messages: ModelMessage[], options?: { maxTokens?: number; timeout?: number }): Promise<ModelResponse>;
}
