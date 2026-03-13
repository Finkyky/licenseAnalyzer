import { NextRequest, NextResponse } from 'next/server';
import { searchLicenses, getAllLicenses } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const spdx = searchParams.get('spdx');
    const query = name || spdx || '';

    let licenses;
    if (query) {
      licenses = searchLicenses(query);
    } else {
      licenses = getAllLicenses();
    }

    return NextResponse.json({ licenses });
  } catch (error) {
    console.error('Licenses API error:', error);
    return NextResponse.json(
      { error: '获取协议数据失败' },
      { status: 500 }
    );
  }
}
