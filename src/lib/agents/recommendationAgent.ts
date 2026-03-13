import { Agent, RecommendationOutput } from './types';
import { ModelAdapter } from '@/types/model';
import { AgentInput, RecommendationOutput as RecOutput } from '@/types/agent';

const SYSTEM_PROMPT = `你是一个专业的开源协议推荐专家。根据用户的项目特征，推荐最合适的3-5个开源协议。

请以JSON格式返回推荐结果，格式如下：
{
  "recommendations": [
    {
      "spdxId": "协议的SPDX标识符",
      "name": "协议全名",
      "score": 85,
      "reason": "推荐理由（中文，2-3句话）",
      "pros": ["优势1", "优势2"],
      "cons": ["劣势1", "劣势2"]
    }
  ],
  "reasoning": "整体推荐逻辑说明"
}

常见协议的SPDX标识符：
- MIT
- Apache-2.0
- GPL-3.0-only
- GPL-2.0-only
- BSD-3-Clause
- BSD-2-Clause
- LGPL-3.0-only
- MPL-2.0
- AGPL-3.0-only
- Unlicense

注意：
- 所有内容使用中文
- 评分范围0-100
- 按推荐度从高到低排序
- 推荐理由要与项目特征紧密结合
- 只返回JSON，不要添加其他文字`;

export const recommendationAgent: Agent<RecommendationOutput> = {
  name: '推荐Agent',

  async execute(input: AgentInput, model: ModelAdapter): Promise<RecOutput> {
    const userMessage = buildUserMessage(input);

    const response = await model.call([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ]);

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('无法解析AI响应');
      return JSON.parse(jsonMatch[0]);
    } catch {
      return {
        recommendations: [
          {
            spdxId: 'MIT',
            name: 'MIT License',
            score: 90,
            reason: '默认推荐MIT许可证，它是最流行和最宽松的开源许可证之一。',
            pros: ['简单易懂', '几乎无限制', '最广泛使用'],
            cons: ['无专利保护', '无Copyleft保护'],
          },
        ],
        reasoning: 'AI分析暂时不可用，默认推荐MIT许可证。',
      };
    }
  },
};

function buildUserMessage(input: AgentInput): string {
  const parts: string[] = ['请根据以下项目信息推荐合适的开源协议：'];

  if (input.projectInfo.description) {
    parts.push(`项目描述：${input.projectInfo.description}`);
  }
  if (input.projectInfo.language) {
    parts.push(`编程语言：${input.projectInfo.language}`);
  }
  if (input.projectInfo.isCommercial !== undefined) {
    parts.push(`是否商业用途：${input.projectInfo.isCommercial ? '是' : '否'}`);
  }
  if (input.projectInfo.wantsModification !== undefined) {
    parts.push(`是否允许修改：${input.projectInfo.wantsModification ? '是' : '否'}`);
  }
  if (input.projectInfo.wantsDistribution !== undefined) {
    parts.push(`是否允许分发：${input.projectInfo.wantsDistribution ? '是' : '否'}`);
  }
  if (input.projectInfo.dependencies?.length) {
    const depInfo = input.projectInfo.dependencies
      .map(d => `${d.name}${d.license ? ` (${d.license})` : ''}`)
      .join(', ');
    parts.push(`主要依赖：${depInfo}`);
  }
  if (input.rawContent) {
    parts.push(`补充信息：\n${input.rawContent.substring(0, 1500)}`);
  }

  return parts.join('\n\n');
}
