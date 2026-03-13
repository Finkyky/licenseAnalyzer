import { LicenseDetail } from '@/types/license';

// Compatibility matrix: can the row license be used with the column license?
// true = compatible, false = incompatible, null = uncertain (needs AI check)
export const COMPATIBILITY_MATRIX: Record<string, Record<string, boolean | null>> = {
  'MIT': {
    'MIT': true, 'Apache-2.0': true, 'GPL-2.0-only': true, 'GPL-3.0-only': true,
    'BSD-2-Clause': true, 'BSD-3-Clause': true, 'LGPL-3.0-only': true,
    'MPL-2.0': true, 'AGPL-3.0-only': true, 'Unlicense': true,
  },
  'Apache-2.0': {
    'MIT': true, 'Apache-2.0': true, 'GPL-2.0-only': false, 'GPL-3.0-only': true,
    'BSD-2-Clause': true, 'BSD-3-Clause': true, 'LGPL-3.0-only': true,
    'MPL-2.0': true, 'AGPL-3.0-only': true, 'Unlicense': true,
  },
  'GPL-2.0-only': {
    'MIT': true, 'Apache-2.0': false, 'GPL-2.0-only': true, 'GPL-3.0-only': false,
    'BSD-2-Clause': true, 'BSD-3-Clause': true, 'LGPL-3.0-only': true,
    'MPL-2.0': false, 'AGPL-3.0-only': false, 'Unlicense': true,
  },
  'GPL-3.0-only': {
    'MIT': true, 'Apache-2.0': true, 'GPL-2.0-only': false, 'GPL-3.0-only': true,
    'BSD-2-Clause': true, 'BSD-3-Clause': true, 'LGPL-3.0-only': true,
    'MPL-2.0': true, 'AGPL-3.0-only': true, 'Unlicense': true,
  },
  'BSD-2-Clause': {
    'MIT': true, 'Apache-2.0': true, 'GPL-2.0-only': true, 'GPL-3.0-only': true,
    'BSD-2-Clause': true, 'BSD-3-Clause': true, 'LGPL-3.0-only': true,
    'MPL-2.0': true, 'AGPL-3.0-only': true, 'Unlicense': true,
  },
  'BSD-3-Clause': {
    'MIT': true, 'Apache-2.0': true, 'GPL-2.0-only': true, 'GPL-3.0-only': true,
    'BSD-2-Clause': true, 'BSD-3-Clause': true, 'LGPL-3.0-only': true,
    'MPL-2.0': true, 'AGPL-3.0-only': true, 'Unlicense': true,
  },
  'LGPL-3.0-only': {
    'MIT': true, 'Apache-2.0': true, 'GPL-2.0-only': false, 'GPL-3.0-only': true,
    'BSD-2-Clause': true, 'BSD-3-Clause': true, 'LGPL-3.0-only': true,
    'MPL-2.0': true, 'AGPL-3.0-only': true, 'Unlicense': true,
  },
  'MPL-2.0': {
    'MIT': true, 'Apache-2.0': true, 'GPL-2.0-only': true, 'GPL-3.0-only': true,
    'BSD-2-Clause': true, 'BSD-3-Clause': true, 'LGPL-3.0-only': true,
    'MPL-2.0': true, 'AGPL-3.0-only': true, 'Unlicense': true,
  },
  'AGPL-3.0-only': {
    'MIT': true, 'Apache-2.0': true, 'GPL-2.0-only': false, 'GPL-3.0-only': true,
    'BSD-2-Clause': true, 'BSD-3-Clause': true, 'LGPL-3.0-only': true,
    'MPL-2.0': true, 'AGPL-3.0-only': true, 'Unlicense': true,
  },
  'Unlicense': {
    'MIT': true, 'Apache-2.0': true, 'GPL-2.0-only': true, 'GPL-3.0-only': true,
    'BSD-2-Clause': true, 'BSD-3-Clause': true, 'LGPL-3.0-only': true,
    'MPL-2.0': true, 'AGPL-3.0-only': true, 'Unlicense': true,
  },
};

export const LICENSE_DETAILS: Record<string, LicenseDetail> = {
  'MIT': {
    spdxId: 'MIT',
    name: 'MIT License',
    permissions: { commercial: true, modification: true, distribution: true, patentUse: false, privateUse: true, sublicense: true },
    conditions: { discloseSource: false, includeLicense: true, includeCopyright: true, stateChanges: false, networkUseIsDistribution: false, sameLicense: false },
    limitations: { liability: true, warranty: true, trademarkUse: true },
    description: 'A short and simple permissive license.',
    descriptionZh: '一个简短的宽松许可证。允许几乎任何用途，只需保留版权声明。',
  },
  'Apache-2.0': {
    spdxId: 'Apache-2.0',
    name: 'Apache License 2.0',
    permissions: { commercial: true, modification: true, distribution: true, patentUse: true, privateUse: true, sublicense: true },
    conditions: { discloseSource: false, includeLicense: true, includeCopyright: true, stateChanges: true, networkUseIsDistribution: false, sameLicense: false },
    limitations: { liability: true, warranty: true, trademarkUse: true },
    description: 'A permissive license with patent protection.',
    descriptionZh: '一个带有专利保护的宽松许可证。要求注明修改，提供专利授权。',
  },
  'GPL-3.0-only': {
    spdxId: 'GPL-3.0-only',
    name: 'GNU General Public License v3.0',
    permissions: { commercial: true, modification: true, distribution: true, patentUse: true, privateUse: true, sublicense: false },
    conditions: { discloseSource: true, includeLicense: true, includeCopyright: true, stateChanges: true, networkUseIsDistribution: false, sameLicense: true },
    limitations: { liability: true, warranty: true, trademarkUse: false },
    description: 'A strong copyleft license.',
    descriptionZh: '强Copyleft许可证。衍生作品必须以相同许可证发布，确保代码始终开源。',
  },
  'GPL-2.0-only': {
    spdxId: 'GPL-2.0-only',
    name: 'GNU General Public License v2.0',
    permissions: { commercial: true, modification: true, distribution: true, patentUse: false, privateUse: true, sublicense: false },
    conditions: { discloseSource: true, includeLicense: true, includeCopyright: true, stateChanges: true, networkUseIsDistribution: false, sameLicense: true },
    limitations: { liability: true, warranty: true, trademarkUse: false },
    description: 'GPL version 2.',
    descriptionZh: 'GPL第2版。衍生作品必须以相同许可证发布。',
  },
  'BSD-3-Clause': {
    spdxId: 'BSD-3-Clause',
    name: 'BSD 3-Clause License',
    permissions: { commercial: true, modification: true, distribution: true, patentUse: false, privateUse: true, sublicense: true },
    conditions: { discloseSource: false, includeLicense: true, includeCopyright: true, stateChanges: false, networkUseIsDistribution: false, sameLicense: false },
    limitations: { liability: true, warranty: true, trademarkUse: true },
    description: 'A permissive license with a non-endorsement clause.',
    descriptionZh: '宽松许可证，附带禁止使用名称背书条款。',
  },
  'BSD-2-Clause': {
    spdxId: 'BSD-2-Clause',
    name: 'BSD 2-Clause License',
    permissions: { commercial: true, modification: true, distribution: true, patentUse: false, privateUse: true, sublicense: true },
    conditions: { discloseSource: false, includeLicense: true, includeCopyright: true, stateChanges: false, networkUseIsDistribution: false, sameLicense: false },
    limitations: { liability: true, warranty: true, trademarkUse: false },
    description: 'A simplified BSD license.',
    descriptionZh: '简化版BSD许可证。',
  },
  'LGPL-3.0-only': {
    spdxId: 'LGPL-3.0-only',
    name: 'GNU Lesser General Public License v3.0',
    permissions: { commercial: true, modification: true, distribution: true, patentUse: true, privateUse: true, sublicense: false },
    conditions: { discloseSource: true, includeLicense: true, includeCopyright: true, stateChanges: true, networkUseIsDistribution: false, sameLicense: true },
    limitations: { liability: true, warranty: true, trademarkUse: false },
    description: 'A weak copyleft license for libraries.',
    descriptionZh: '弱Copyleft许可证。库的修改必须开源，但使用库的程序不受限制。',
  },
  'MPL-2.0': {
    spdxId: 'MPL-2.0',
    name: 'Mozilla Public License 2.0',
    permissions: { commercial: true, modification: true, distribution: true, patentUse: true, privateUse: true, sublicense: false },
    conditions: { discloseSource: true, includeLicense: true, includeCopyright: true, stateChanges: false, networkUseIsDistribution: false, sameLicense: true },
    limitations: { liability: true, warranty: true, trademarkUse: true },
    description: 'A file-level copyleft license.',
    descriptionZh: '文件级Copyleft许可证。修改的文件必须开源，可与其他许可证混用。',
  },
  'AGPL-3.0-only': {
    spdxId: 'AGPL-3.0-only',
    name: 'GNU Affero General Public License v3.0',
    permissions: { commercial: true, modification: true, distribution: true, patentUse: true, privateUse: true, sublicense: false },
    conditions: { discloseSource: true, includeLicense: true, includeCopyright: true, stateChanges: true, networkUseIsDistribution: true, sameLicense: true },
    limitations: { liability: true, warranty: true, trademarkUse: false },
    description: 'The strongest copyleft license.',
    descriptionZh: '最强Copyleft许可证。网络使用也视为分发，必须提供源代码。',
  },
  'Unlicense': {
    spdxId: 'Unlicense',
    name: 'The Unlicense',
    permissions: { commercial: true, modification: true, distribution: true, patentUse: false, privateUse: true, sublicense: true },
    conditions: { discloseSource: false, includeLicense: false, includeCopyright: false, stateChanges: false, networkUseIsDistribution: false, sameLicense: false },
    limitations: { liability: true, warranty: true, trademarkUse: false },
    description: 'A public domain dedication.',
    descriptionZh: '公共领域贡献。放弃所有版权，无任何条件。',
  },
};

export function checkCompatibility(license1: string, license2: string): boolean | null {
  return COMPATIBILITY_MATRIX[license1]?.[license2] ?? null;
}

export function getLicenseDetail(spdxId: string): LicenseDetail | undefined {
  return LICENSE_DETAILS[spdxId];
}

export function getAllLicenseDetails(): LicenseDetail[] {
  return Object.values(LICENSE_DETAILS);
}
