import { Agent, RiskAssessmentOutput } from './types';
import { ModelAdapter } from '@/types/model';
import { AgentInput, RiskAssessmentOutput as RiskOutput } from '@/types/agent';
import { RiskItem } from '@/types/license';
import { COMPATIBILITY_MATRIX } from '@/lib/licenses/compatibility';

const SYSTEM_PROMPT = `你是一个专业的开源协议风险评估专家。你的任务是分析项目依赖的协议兼容性风险。

请以JSON格式返回评估结果，格式如下：
{
  "risks": [
    {
      "level": "high|medium|low",
      "title": "风险标题",
      "description": "风险详细描述",
      "suggestion": "改进建议",
      "relatedDependencies": ["相关依赖名称"]
    }
  ],
  "overallRiskLevel": "high|medium|low",
  "summary": "总体风险评估摘要"
}

注意：
- 所有内容使用中文
- 风险等级要准确
- 只返回JSON，不要添加其他文字`;

export const riskAssessmentAgent: Agent<RiskAssessmentOutput> = {
  name: '风险评估Agent',

  async execute(input: AgentInput, model: ModelAdapter): Promise<RiskOutput> {
    // Step 1: Local compatibility check
    const localRisks = performLocalCheck(input);

    // Step 2: If there are dependencies without known licenses, or complex situations, use AI
    const unknownDeps = input.projectInfo.dependencies?.filter(d => !d.license) || [];
    const needsAiCheck = unknownDeps.length > 0 || (input.projectInfo.dependencies?.length || 0) > 3;

    let aiRisks: RiskItem[] = [];
    if (needsAiCheck) {
      aiRisks = await performAiCheck(input, model);
    }

    // Merge results
    const allRisks = [...localRisks, ...aiRisks];
    const uniqueRisks = deduplicateRisks(allRisks);

    const overallLevel = uniqueRisks.some(r => r.level === 'high') ? 'high' :
                         uniqueRisks.some(r => r.level === 'medium') ? 'medium' : 'low';

    return {
      risks: uniqueRisks,
      overallRiskLevel: overallLevel,
      summary: generateSummary(uniqueRisks),
    };
  },
};

function performLocalCheck(input: AgentInput): RiskItem[] {
  const risks: RiskItem[] = [];
  const projectLicense = input.projectInfo.projectLicense;
  const deps = input.projectInfo.dependencies || [];

  for (const dep of deps) {
    if (!dep.license) continue;

    // Normalize license identifiers
    const depLicense = normalizeLicense(dep.license);
    if (!depLicense) continue;

    if (projectLicense) {
      const projLicense = normalizeLicense(projectLicense);
      if (projLicense && COMPATIBILITY_MATRIX[projLicense]?.[depLicense] === false) {
        risks.push({
          level: 'high',
          title: `协议不兼容：${dep.name}`,
          description: `依赖 ${dep.name} 使用 ${dep.license} 协议，与项目的 ${projectLicense} 协议不兼容。`,
          suggestion: `考虑更换 ${dep.name} 为使用兼容协议的替代库，或更改项目协议。`,
          relatedDependencies: [dep.name],
        });
      }
    }

    // Check for strong copyleft licenses
    if (['GPL-2.0-only', 'GPL-3.0-only', 'AGPL-3.0-only'].includes(depLicense)) {
      risks.push({
        level: 'medium',
        title: `强Copyleft依赖：${dep.name}`,
        description: `依赖 ${dep.name} 使用 ${dep.license} 协议（强Copyleft），可能要求您的项目也使用相同或兼容的协议。`,
        suggestion: `确认您的项目协议与 ${dep.license} 兼容，或寻找使用宽松许可证的替代库。`,
        relatedDependencies: [dep.name],
      });
    }
  }

  return risks;
}

async function performAiCheck(input: AgentInput, model: ModelAdapter): Promise<RiskItem[]> {
  const deps = input.projectInfo.dependencies || [];
  const depList = deps.map(d => `- ${d.name}${d.version ? ` (${d.version})` : ''}${d.license ? ` [${d.license}]` : ' [未知协议]'}`).join('\n');

  const userMessage = `请评估以下项目依赖的协议风险：

项目协议：${input.projectInfo.projectLicense || '未指定'}
项目描述：${input.projectInfo.description || '未提供'}

依赖列表：
${depList}

请特别注意：
1. 未知协议的依赖的潜在风险
2. 协议之间的兼容性问题
3. 商业使用限制
4. 专利风险`;

  try {
    const response = await model.call([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: userMessage },
    ]);

    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return [];
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.risks || [];
  } catch {
    return [];
  }
}

function normalizeLicense(license: string): string | null {
  const mapping: Record<string, string> = {
    'MIT': 'MIT',
    'Apache-2.0': 'Apache-2.0',
    'Apache 2.0': 'Apache-2.0',
    'GPL-2.0': 'GPL-2.0-only',
    'GPL-2.0-only': 'GPL-2.0-only',
    'GPLv2': 'GPL-2.0-only',
    'GPL-3.0': 'GPL-3.0-only',
    'GPL-3.0-only': 'GPL-3.0-only',
    'GPLv3': 'GPL-3.0-only',
    'BSD-2-Clause': 'BSD-2-Clause',
    'BSD-3-Clause': 'BSD-3-Clause',
    'LGPL-3.0': 'LGPL-3.0-only',
    'LGPL-3.0-only': 'LGPL-3.0-only',
    'MPL-2.0': 'MPL-2.0',
    'AGPL-3.0': 'AGPL-3.0-only',
    'AGPL-3.0-only': 'AGPL-3.0-only',
    'Unlicense': 'Unlicense',
    'ISC': 'MIT', // ISC is effectively the same as MIT
  };
  return mapping[license] || null;
}

function deduplicateRisks(risks: RiskItem[]): RiskItem[] {
  const seen = new Set<string>();
  return risks.filter(r => {
    const key = r.title;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function generateSummary(risks: RiskItem[]): string {
  if (risks.length === 0) return '未发现明显的协议风险。';
  const highCount = risks.filter(r => r.level === 'high').length;
  const mediumCount = risks.filter(r => r.level === 'medium').length;
  const lowCount = risks.filter(r => r.level === 'low').length;

  const parts: string[] = [`共发现 ${risks.length} 个风险项`];
  if (highCount > 0) parts.push(`${highCount} 个高风险`);
  if (mediumCount > 0) parts.push(`${mediumCount} 个中等风险`);
  if (lowCount > 0) parts.push(`${lowCount} 个低风险`);

  return parts.join('，') + '。';
}
