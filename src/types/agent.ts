// Agent types

import { LicenseRecommendation, RiskItem } from './license';

export interface ProjectInfo {
  name?: string;
  description?: string;
  language?: string;
  dependencies?: DependencyInfo[];
  projectLicense?: string;
  isCommercial?: boolean;
  wantsModification?: boolean;
  wantsDistribution?: boolean;
}

export interface DependencyInfo {
  name: string;
  version?: string;
  license?: string;
}

export interface AgentInput {
  projectInfo: ProjectInfo;
  rawContent?: string;
}

export interface LicenseAnalysisOutput {
  analyses: Array<{
    spdxId: string;
    name: string;
    summary: string;
    keyTerms: string[];
    useCases: string[];
    restrictions: string[];
  }>;
}

export interface RiskAssessmentOutput {
  risks: RiskItem[];
  overallRiskLevel: 'high' | 'medium' | 'low';
  summary: string;
}

export interface RecommendationOutput {
  recommendations: LicenseRecommendation[];
  reasoning: string;
}

export interface GenerationOutput {
  licenseText: string;
  report: string;
}
