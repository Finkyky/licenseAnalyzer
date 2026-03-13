export interface DetectedLicense {
  spdxId: string | null;
  confidence: 'high' | 'medium' | 'low';
}

interface LicenseSignature {
  spdxId: string;
  requiredPhrases: string[];
  excludedPhrases?: string[];
}

// 按优先级排列：更具体的签名在前，避免误匹配
const SIGNATURES: LicenseSignature[] = [
  // AGPL 必须在 GPL 之前（都包含 "GNU" 关键词）
  {
    spdxId: 'AGPL-3.0-only',
    requiredPhrases: ['GNU AFFERO GENERAL PUBLIC LICENSE'],
  },
  // LGPL 必须在 GPL 之前
  {
    spdxId: 'LGPL-3.0-only',
    requiredPhrases: ['GNU LESSER GENERAL PUBLIC LICENSE', 'Version 3'],
  },
  {
    spdxId: 'LGPL-2.1-only',
    requiredPhrases: ['GNU LESSER GENERAL PUBLIC LICENSE', 'Version 2.1'],
  },
  // GPL-3.0 必须在 GPL-2.0 之前（都包含 "GNU GENERAL PUBLIC LICENSE"）
  {
    spdxId: 'GPL-3.0-only',
    requiredPhrases: ['GNU GENERAL PUBLIC LICENSE', 'Version 3'],
    excludedPhrases: ['LESSER', 'AFFERO'],
  },
  {
    spdxId: 'GPL-2.0-only',
    requiredPhrases: ['GNU GENERAL PUBLIC LICENSE', 'Version 2'],
    excludedPhrases: ['Version 3', 'LESSER', 'AFFERO'],
  },
  // Apache
  {
    spdxId: 'Apache-2.0',
    requiredPhrases: ['Apache License', 'Version 2.0'],
  },
  // MPL
  {
    spdxId: 'MPL-2.0',
    requiredPhrases: ['Mozilla Public License', '2.0'],
  },
  // MIT
  {
    spdxId: 'MIT',
    requiredPhrases: ['Permission is hereby granted, free of charge'],
  },
  // BSD-3-Clause（比 BSD-2-Clause 多一条限制）
  {
    spdxId: 'BSD-3-Clause',
    requiredPhrases: ['Redistributions of source code', 'Redistributions in binary form', 'endorse or promote'],
  },
  // BSD-2-Clause
  {
    spdxId: 'BSD-2-Clause',
    requiredPhrases: ['Redistributions of source code', 'Redistributions in binary form'],
    excludedPhrases: ['endorse or promote'],
  },
  // ISC
  {
    spdxId: 'ISC',
    requiredPhrases: ['Permission to use, copy, modify, and/or distribute this software'],
  },
  // Unlicense
  {
    spdxId: 'Unlicense',
    requiredPhrases: ['free and unencumbered software released into the public domain'],
  },
  // 0BSD
  {
    spdxId: '0BSD',
    requiredPhrases: ['BSD Zero Clause'],
  },
];

/**
 * 检测 LICENSE 文件文本对应的 SPDX 许可证 ID
 */
export function detectLicense(text: string): DetectedLicense {
  if (!text || text.trim().length === 0) {
    return { spdxId: null, confidence: 'low' };
  }

  // 策略 1: SPDX 标识头
  const spdxMatch = text.match(/SPDX-License-Identifier:\s*(\S+)/i);
  if (spdxMatch) {
    return { spdxId: spdxMatch[1], confidence: 'high' };
  }

  // 策略 2: 特征短语匹配
  const upperText = text.toUpperCase();

  for (const sig of SIGNATURES) {
    const allRequired = sig.requiredPhrases.every(phrase =>
      upperText.includes(phrase.toUpperCase())
    );
    if (!allRequired) continue;

    const hasExcluded = sig.excludedPhrases?.some(phrase =>
      upperText.includes(phrase.toUpperCase())
    );
    if (hasExcluded) continue;

    return { spdxId: sig.spdxId, confidence: 'high' };
  }

  // 策略 3: 无法识别
  return { spdxId: null, confidence: 'low' };
}
