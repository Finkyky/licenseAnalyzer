// API request/response types

import { LicenseRecommendation, RiskItem, ComparisonResult } from './license';

export type AnalysisType = 'select' | 'analyze';
export type InputMethod = 'file' | 'github' | 'text';
export type JobStatus = 'processing' | 'completed' | 'failed';

export interface AnalyzeRequest {
  type: AnalysisType;
  input: {
    method: InputMethod;
    content: string;
    fileName?: string;
  };
  model: {
    provider: string;
    modelId: string;
    apiKey: string;
    baseUrl?: string;
  };
}

export interface AnalyzeResponse {
  jobId: string;
  status: JobStatus;
}

export interface AnalysisResult {
  type: AnalysisType;
  status: JobStatus;
  recommendations?: LicenseRecommendation[];
  risks?: RiskItem[];
  comparison?: ComparisonResult;
  licenseText?: string;
  report?: string;
  error?: string;
}

export interface JobResult {
  jobId: string;
  status: JobStatus;
  result?: AnalysisResult;
}

export interface LicenseSearchResponse {
  licenses: Array<{
    id: string;
    name: string;
    spdxId: string;
    summary?: string;
    summaryZh?: string;
  }>;
}

export interface CompareRequest {
  licenses: string[]; // SPDX IDs
}
