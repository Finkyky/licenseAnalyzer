import OpenAI from 'openai';
import { ModelConfig, ModelAdapter, ModelMessage, ModelResponse } from '@/types/model';

export class OpenAIAdapter implements ModelAdapter {
  private client: OpenAI;
  private modelId: string;

  constructor(config: ModelConfig) {
    this.client = new OpenAI({ apiKey: config.apiKey });
    this.modelId = config.modelId;
  }

  async call(messages: ModelMessage[], options?: { maxTokens?: number; timeout?: number }): Promise<ModelResponse> {
    const response = await this.client.chat.completions.create({
      model: this.modelId,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: options?.maxTokens ?? 2048,
    }, {
      timeout: options?.timeout ?? 30000,
    });

    return {
      content: response.choices[0]?.message?.content || '',
      usage: response.usage ? {
        inputTokens: response.usage.prompt_tokens,
        outputTokens: response.usage.completion_tokens || 0,
      } : undefined,
    };
  }
}
