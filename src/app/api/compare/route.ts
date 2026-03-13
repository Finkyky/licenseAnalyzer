import { NextRequest, NextResponse } from 'next/server';
import { compareRequestSchema } from '@/lib/validation/schemas';
import { LICENSE_DETAILS } from '@/lib/licenses/compatibility';
import { ComparisonResult, ComparisonDimension } from '@/types/license';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parsed = compareRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '输入验证失败', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { licenses } = parsed.data;

    // Build comparison using local data
    const result = buildComparison(licenses);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Compare API error:', error);
    return NextResponse.json(
      { error: '对比失败' },
      { status: 500 }
    );
  }
}

function buildComparison(spdxIds: string[]): ComparisonResult {
  const dimensions: ComparisonDimension[] = [
    buildDimension('商业使用', 'commercial', spdxIds, d => d.permissions.commercial),
    buildDimension('修改', 'modification', spdxIds, d => d.permissions.modification),
    buildDimension('分发', 'distribution', spdxIds, d => d.permissions.distribution),
    buildDimension('专利授权', 'patentUse', spdxIds, d => d.permissions.patentUse),
    buildDimension('私人使用', 'privateUse', spdxIds, d => d.permissions.privateUse),
    buildDimension('再授权', 'sublicense', spdxIds, d => d.permissions.sublicense),
    buildDimension('公开源码', 'discloseSource', spdxIds, d => d.conditions.discloseSource),
    buildDimension('包含许可证', 'includeLicense', spdxIds, d => d.conditions.includeLicense),
    buildDimension('包含版权', 'includeCopyright', spdxIds, d => d.conditions.includeCopyright),
    buildDimension('注明更改', 'stateChanges', spdxIds, d => d.conditions.stateChanges),
    buildDimension('网络使用即分发', 'networkUse', spdxIds, d => d.conditions.networkUseIsDistribution),
    buildDimension('相同许可证', 'sameLicense', spdxIds, d => d.conditions.sameLicense),
    buildDimension('免责声明', 'liability', spdxIds, d => d.limitations.liability),
    buildDimension('无担保', 'warranty', spdxIds, d => d.limitations.warranty),
  ];

  return { licenses: spdxIds, dimensions };
}

function buildDimension(
  label: string,
  key: string,
  spdxIds: string[],
  getter: (detail: (typeof LICENSE_DETAILS)[string]) => boolean
): ComparisonDimension {
  const values: Record<string, boolean | string> = {};

  for (const id of spdxIds) {
    const detail = LICENSE_DETAILS[id];
    if (detail) {
      values[id] = getter(detail);
    } else {
      values[id] = '未知';
    }
  }

  return { label, key, values };
}
