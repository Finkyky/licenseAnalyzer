import { Agent, GenerationOutput } from './types';
import { ModelAdapter } from '@/types/model';
import { AgentInput, GenerationOutput as GenOutput, LicenseAnalysisOutput, RiskAssessmentOutput, RecommendationOutput } from '@/types/agent';

const SYSTEM_PROMPT = `你是一个专业的开源协议生成专家。根据分析结果生成最终的报告和LICENSE文件内容。

请以JSON格式返回结果，格式如下：
{
  "licenseText": "完整的LICENSE文件内容（英文，标准格式）",
  "report": "中文分析报告（Markdown格式），包含：\\n1. 项目概述\\n2. 推荐协议及理由\\n3. 风险提示\\n4. 结论"
}

注意：
- LICENSE文件内容使用标准英文格式
- 报告使用中文Markdown格式
- 只返回JSON，不要添加其他文字`;

interface GenerationContext {
  analysis?: LicenseAnalysisOutput;
  risks?: RiskAssessmentOutput;
  recommendations?: RecommendationOutput;
  selectedLicense?: string;
}

export const generationAgent: Agent<GenerationOutput> & {
  executeWithContext(input: AgentInput, model: ModelAdapter, context: GenerationContext): Promise<GenOutput>;
} = {
  name: '生成Agent',

  async execute(input: AgentInput, model: ModelAdapter): Promise<GenOutput> {
    return this.executeWithContext(input, model, {});
  },

  async executeWithContext(input: AgentInput, model: ModelAdapter, context: GenerationContext): Promise<GenOutput> {
    const userMessage = buildUserMessage(input, context);

    const response = await model.call([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ]);

    try {
      const jsonMatch = response.content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('无法解析AI响应');
      return JSON.parse(jsonMatch[0]);
    } catch {
      const selectedLicense = context.selectedLicense || context.recommendations?.recommendations[0]?.spdxId || 'MIT';
      return {
        licenseText: generateDefaultLicense(selectedLicense),
        report: '# 分析报告\n\n无法生成详细报告，请重试。',
      };
    }
  },
};

function buildUserMessage(input: AgentInput, context: GenerationContext): string {
  const parts: string[] = ['请根据以下分析结果生成报告和LICENSE文件：'];

  if (input.projectInfo.name) {
    parts.push(`项目名称：${input.projectInfo.name}`);
  }
  if (input.projectInfo.description) {
    parts.push(`项目描述：${input.projectInfo.description}`);
  }

  if (context.selectedLicense) {
    parts.push(`用户选择的协议：${context.selectedLicense}`);
  }

  if (context.recommendations?.recommendations.length) {
    const recs = context.recommendations.recommendations
      .map(r => `- ${r.name} (${r.spdxId}): 评分${r.score} - ${r.reason}`)
      .join('\n');
    parts.push(`推荐协议：\n${recs}`);
  }

  if (context.analysis?.analyses.length) {
    const analyses = context.analysis.analyses
      .map(a => `- ${a.name}: ${a.summary}`)
      .join('\n');
    parts.push(`协议分析：\n${analyses}`);
  }

  if (context.risks?.risks.length) {
    const risks = context.risks.risks
      .map(r => `- [${r.level}] ${r.title}: ${r.description}`)
      .join('\n');
    parts.push(`风险评估（${context.risks.overallRiskLevel}）：\n${risks}`);
  }

  const year = new Date().getFullYear();
  parts.push(`当前年份：${year}`);
  parts.push(`版权持有人：[项目作者]`);

  return parts.join('\n\n');
}

function generateDefaultLicense(spdxId: string): string {
  const year = new Date().getFullYear();
  if (spdxId === 'MIT') {
    return `MIT License

Copyright (c) ${year} [项目作者]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
  }
  return `请参考 ${spdxId} 协议的官方文本。`;
}
