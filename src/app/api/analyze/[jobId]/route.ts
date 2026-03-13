import { NextRequest, NextResponse } from 'next/server';
import { jobStore } from '@/lib/jobStore';
import { getAnalysisResult } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const { jobId } = params;

  // Check in-memory store first
  const job = jobStore.get(jobId);
  if (job) {
    return NextResponse.json({
      jobId,
      status: job.status,
      result: job.result,
    });
  }

  // Check database
  try {
    const dbResult = getAnalysisResult(jobId);
    if (dbResult) {
      return NextResponse.json({
        jobId,
        status: 'completed',
        result: dbResult.result,
      });
    }
  } catch {
    // DB query failure
  }

  return NextResponse.json(
    { error: '未找到该任务' },
    { status: 404 }
  );
}
