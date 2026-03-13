import { ModelAdapter } from '@/types/model';
import { AgentInput, RiskAssessmentOutput, RecommendationOutput, GenerationOutput } from '@/types/agent';
import { AnalysisResult } from '@/types/api';
import { licenseAnalysisAgent } from './licenseAnalysisAgent';
import { riskAssessmentAgent } from './riskAssessmentAgent';
import { recommendationAgent } from './recommendationAgent';
import { generationAgent } from './generationAgent';

export interface OrchestratorResult {
  risks?: RiskAssessmentOutput;
  recommendations?: RecommendationOutput;
  generation?: GenerationOutput;
}

/**
 * Execute the "select license" flow:
 * Only run analysis + recommendation in parallel (1 round-trip).
 * Report generation is deferred to when the user actually needs it.
 */
export async function executeSelectFlow(
  input: AgentInput,
  model: ModelAdapter
): Promise<AnalysisResult> {
  try {
    const [, recommendations] = await Promise.allSettled([
      licenseAnalysisAgent.execute(input, model),
      recommendationAgent.execute(input, model),
    ]);

    const recommendationsResult = recommendations.status === 'fulfilled' ? recommendations.value : undefined;

    return {
      type: 'select',
      status: 'completed',
      recommendations: recommendationsResult?.recommendations,
    };
  } catch (error) {
    return {
      type: 'select',
      status: 'failed',
      error: error instanceof Error ? error.message : '分析过程中发生错误',
    };
  }
}

/**
 * Execute the "analyze dependencies" flow:
 * Run analysis, risk assessment, and generation all in parallel (1 round-trip).
 */
export async function executeAnalyzeFlow(
  input: AgentInput,
  model: ModelAdapter
): Promise<AnalysisResult> {
  try {
    const [, risks, generation] = await Promise.allSettled([
      licenseAnalysisAgent.execute(input, model),
      riskAssessmentAgent.execute(input, model),
      generationAgent.execute(input, model),
    ]);

    const risksResult = risks.status === 'fulfilled' ? risks.value : undefined;
    const generationResult = generation.status === 'fulfilled' ? generation.value : undefined;

    return {
      type: 'analyze',
      status: 'completed',
      risks: risksResult?.risks,
      report: generationResult?.report,
    };
  } catch (error) {
    return {
      type: 'analyze',
      status: 'failed',
      error: error instanceof Error ? error.message : '分析过程中发生错误',
    };
  }
}
