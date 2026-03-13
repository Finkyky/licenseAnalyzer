import { AnalyzeRequest, AnalyzeResponse, JobResult, CompareRequest, LicenseSearchResponse } from '@/types/api';
import { ComparisonResult } from '@/types/license';

export async function submitAnalysis(data: AnalyzeRequest): Promise<AnalyzeResponse> {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: '提交失败' }));
    throw new Error(error.error || '提交失败');
  }
  return res.json();
}

export async function pollAnalysisResult(jobId: string): Promise<JobResult> {
  const res = await fetch(`/api/analyze/${jobId}`);
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: '查询失败' }));
    throw new Error(error.error || '查询失败');
  }
  return res.json();
}

export async function compareLicenses(data: CompareRequest): Promise<ComparisonResult> {
  const res = await fetch('/api/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: '对比失败' }));
    throw new Error(error.error || '对比失败');
  }
  return res.json();
}

export async function fetchLicenseText(spdxId: string): Promise<string> {
  const res = await fetch(`/api/licenses/text?spdx=${encodeURIComponent(spdxId)}`);
  if (!res.ok) {
    throw new Error('获取协议文本失败');
  }
  const data = await res.json();
  return data.text;
}

export async function generateReport(params: {
  selectedLicense: string;
  projectDescription?: string;
  model: Record<string, string>;
}): Promise<string> {
  const res = await fetch('/api/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error('生成报告失败');
  }
  const data = await res.json();
  return data.report;
}

export async function searchLicenses(query?: string): Promise<LicenseSearchResponse> {
  const params = query ? `?name=${encodeURIComponent(query)}` : '';
  const res = await fetch(`/api/licenses${params}`);
  if (!res.ok) {
    throw new Error('获取协议数据失败');
  }
  return res.json();
}
