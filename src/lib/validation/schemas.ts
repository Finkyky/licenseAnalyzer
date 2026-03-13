import { z } from 'zod';

export const modelConfigSchema = z.object({
  provider: z.enum(['builtin', 'claude', 'openai', 'deepseek', 'qwen', 'openai-compatible']),
  modelId: z.string().min(1, '请选择模型'),
  apiKey: z.string().min(1, '请输入 API 密钥'),
  baseUrl: z.string().url('请输入有效的 URL').optional().or(z.literal('')),
});

export const analyzeRequestSchema = z.object({
  type: z.enum(['select', 'analyze']),
  input: z.object({
    method: z.enum(['file', 'github', 'text']),
    content: z.string().min(1, '请输入内容'),
    fileName: z.string().optional(),
  }),
  model: modelConfigSchema,
});

export const compareRequestSchema = z.object({
  licenses: z.array(z.string().min(1)).min(2, '请至少选择两个协议进行对比').max(5, '最多对比5个协议'),
});

export type AnalyzeRequestInput = z.infer<typeof analyzeRequestSchema>;
export type CompareRequestInput = z.infer<typeof compareRequestSchema>;
