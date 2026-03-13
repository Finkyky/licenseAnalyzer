import { ModelAdapter } from '@/types/model';
import { AgentInput, LicenseAnalysisOutput, RiskAssessmentOutput, RecommendationOutput, GenerationOutput } from '@/types/agent';

export interface Agent<T> {
  name: string;
  execute(input: AgentInput, model: ModelAdapter): Promise<T>;
}

export type { LicenseAnalysisOutput, RiskAssessmentOutput, RecommendationOutput, GenerationOutput };
