import { NextRequest, NextResponse } from 'next/server';
import { getLicenseBySpdx } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const spdxId = searchParams.get('spdx');

    if (!spdxId) {
      return NextResponse.json({ error: '缺少 spdx 参数' }, { status: 400 });
    }

    const license = getLicenseBySpdx(spdxId) as { text?: string } | undefined;

    if (!license?.text) {
      return NextResponse.json({ error: '未找到该协议文本' }, { status: 404 });
    }

    return NextResponse.json({ text: license.text });
  } catch (error) {
    console.error('License text API error:', error);
    return NextResponse.json({ error: '获取协议文本失败' }, { status: 500 });
  }
}
