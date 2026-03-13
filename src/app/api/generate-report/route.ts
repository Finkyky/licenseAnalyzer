import { NextRequest, NextResponse } from 'next/server';
import { createModelAdapter } from '@/lib/models/adapter';
import { generationAgent } from '@/lib/agents/generationAgent';
import { ModelConfig } from '@/types/model';

export async function POST(request: NextRequest) {
  try {
    const { selectedLicense, projectDescription, model: modelConfig } = await request.json();

    if (!selectedLicense) {
      return NextResponse.json({ error: '缺少协议参数' }, { status: 400 });
    }

    const model = createModelAdapter(modelConfig as ModelConfig);
    const result = await generationAgent.executeWithContext(
      {
        projectInfo: { description: projectDescription || '' },
        rawContent: projectDescription || '',
      },
      model,
      { selectedLicense }
    );

    return NextResponse.json({ report: result.report || '' });
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json({ error: '生成报告失败' }, { status: 500 });
  }
}
