import Anthropic from '@anthropic-ai/sdk';
import { ModelConfig, ModelAdapter, ModelMessage, ModelResponse } from '@/types/model';

export class ClaudeAdapter implements ModelAdapter {
  private client: Anthropic;
  private modelId: string;

  constructor(config: ModelConfig) {
    this.client = new Anthropic({ apiKey: config.apiKey });
    this.modelId = config.modelId;
  }

  async call(messages: ModelMessage[]): Promise<ModelResponse> {
    const systemMessage = messages.find(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    const response = await this.client.messages.create({
      model: this.modelId,
      max_tokens: 4096,
      system: systemMessage?.content || '',
      messages: nonSystemMessages.map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    const textBlock = response.content.find(b => b.type === 'text');
    return {
      content: textBlock?.text || '',
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
    };
  }
}
