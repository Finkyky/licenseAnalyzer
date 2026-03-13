import { Agent, LicenseAnalysisOutput } from './types';
import { ModelAdapter } from '@/types/model';
import { AgentInput } from '@/types/agent';

const SYSTEM_PROMPT = `你是一个专业的开源协议分析专家。你的任务是深入分析开源协议的法律含义、关键条款、适用场景和限制条件。

请以JSON格式返回分析结果，格式如下：
{
  "analyses": [
    {
      "spdxId": "协议的SPDX标识符",
      "name": "协议全名",
      "summary": "协议的简要中文说明（2-3句话）",
      "keyTerms": ["关键条款1", "关键条款2"],
      "useCases": ["适用场景1", "适用场景2"],
      "restrictions": ["限制条件1", "限制条件2"]
    }
  ]
}

注意：
- 所有内容使用中文
- 分析要准确、专业
- 只返回JSON，不要添加其他文字`;

export const licenseAnalysisAgent: Agent<LicenseAnalysisOutput> = {
  name: '协议分析Agent',

  async execute(input: AgentInput, model: ModelAdapter): Promise<LicenseAnalysisOutput> {
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
        analyses: [{
          spdxId: 'unknown',
          name: '解析失败',
          summary: '无法解析AI返回的结果，请重试。',
          keyTerms: [],
          useCases: [],
          restrictions: [],
        }],
      };
    }
  },
};

function buildUserMessage(input: AgentInput): string {
  const parts: string[] = [];

  if (input.projectInfo.description) {
    parts.push(`项目描述：${input.projectInfo.description}`);
  }
  if (input.projectInfo.language) {
    parts.push(`编程语言：${input.projectInfo.language}`);
  }
  if (input.projectInfo.dependencies?.length) {
    const depLicenses = input.projectInfo.dependencies
      .filter(d => d.license)
      .map(d => `${d.name}: ${d.license}`)
      .join('\n');
    if (depLicenses) {
      parts.push(`依赖及其协议：\n${depLicenses}`);
    }
  }
  if (input.projectInfo.projectLicense) {
    parts.push(`当前项目协议：${input.projectInfo.projectLicense}`);
  }
  if (input.rawContent) {
    parts.push(`原始输入内容：\n${input.rawContent.substring(0, 2000)}`);
  }

  if (parts.length === 0) {
    parts.push('请分析以下常见开源协议：MIT, Apache-2.0, GPL-3.0-only, BSD-3-Clause, MPL-2.0');
  }

  return `请分析以下项目相关的开源协议：\n\n${parts.join('\n\n')}`;
}
