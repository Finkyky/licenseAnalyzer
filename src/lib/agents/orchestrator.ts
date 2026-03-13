import { ModelAdapter } from '@/types/model';
import { AgentInput, LicenseAnalysisOutput, RiskAssessmentOutput, RecommendationOutput, GenerationOutput } from '@/types/agent';
import { AnalysisResult } from '@/types/api';
import { licenseAnalysisAgent } from './licenseAnalysisAgent';
import { riskAssessmentAgent } from './riskAssessmentAgent';
import { recommendationAgent } from './recommendationAgent';
import { generationAgent } from './generationAgent';

export interface OrchestratorResult {
  analysis?: LicenseAnalysisOutput;
  risks?: RiskAssessmentOutput;
  recommendations?: RecommendationOutput;
  generation?: GenerationOutput;
}

/**
 * Execute the "select license" flow:
 * 1. Parallel: analysis + recommendation
 * 2. Then: generation
 */
export async function executeSelectFlow(
  input: AgentInput,
  model: ModelAdapter
): Promise<AnalysisResult> {
  try {
    // Step 1: Run analysis and recommendation in parallel
    const [analysis, recommendations] = await Promise.allSettled([
      licenseAnalysisAgent.execute(input, model),
      recommendationAgent.execute(input, model),
    ]);

    const analysisResult = analysis.status === 'fulfilled' ? analysis.value : undefined;
    const recommendationsResult = recommendations.status === 'fulfilled' ? recommendations.value : undefined;

    // Step 2: Generate report based on results
    let generation: GenerationOutput | undefined;
    try {
      generation = await generationAgent.executeWithContext(input, model, {
        analysis: analysisResult,
        recommendations: recommendationsResult,
      });
    } catch {
      // Generation failure is non-critical
    }

    return {
      type: 'select',
      status: 'completed',
      recommendations: recommendationsResult?.recommendations,
      licenseText: generation?.licenseText,
      report: generation?.report,
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
 * 1. Analysis
 * 2. Risk assessment
 * 3. Generation (report)
 */
export async function executeAnalyzeFlow(
  input: AgentInput,
  model: ModelAdapter
): Promise<AnalysisResult> {
  try {
    // Step 1: Run analysis and risk assessment in parallel
    const [analysis, risks] = await Promise.allSettled([
      licenseAnalysisAgent.execute(input, model),
      riskAssessmentAgent.execute(input, model),
    ]);

    const analysisResult = analysis.status === 'fulfilled' ? analysis.value : undefined;
    const risksResult = risks.status === 'fulfilled' ? risks.value : undefined;

    // Step 2: Generate report
    let generation: GenerationOutput | undefined;
    try {
      generation = await generationAgent.executeWithContext(input, model, {
        analysis: analysisResult,
        risks: risksResult,
      });
    } catch {
      // Generation failure is non-critical
    }

    return {
      type: 'analyze',
      status: 'completed',
      risks: risksResult?.risks,
      report: generation?.report,
    };
  } catch (error) {
    return {
      type: 'analyze',
      status: 'failed',
      error: error instanceof Error ? error.message : '分析过程中发生错误',
    };
  }
}
