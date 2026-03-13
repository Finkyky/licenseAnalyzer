// License related types

export interface License {
  id: string;
  name: string;
  spdxId: string;
  text?: string;
  summary?: string;
  summaryZh?: string;
  cachedAt?: string;
  updatedAt?: string;
}

export interface LicensePermissions {
  commercial: boolean;
  modification: boolean;
  distribution: boolean;
  patentUse: boolean;
  privateUse: boolean;
  sublicense: boolean;
}

export interface LicenseConditions {
  discloseSource: boolean;
  includeLicense: boolean;
  includeCopyright: boolean;
  stateChanges: boolean;
  networkUseIsDistribution: boolean;
  sameLicense: boolean;
}

export interface LicenseLimitations {
  liability: boolean;
  warranty: boolean;
  trademarkUse: boolean;
}

export interface LicenseDetail {
  spdxId: string;
  name: string;
  permissions: LicensePermissions;
  conditions: LicenseConditions;
  limitations: LicenseLimitations;
  description: string;
  descriptionZh: string;
}

export interface LicenseRecommendation {
  spdxId: string;
  name: string;
  score: number; // 0-100
  reason: string;
  pros: string[];
  cons: string[];
}

export interface RiskItem {
  level: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  suggestion: string;
  relatedDependencies?: string[];
}

export interface ComparisonDimension {
  label: string;
  key: string;
  values: Record<string, boolean | string>;
}

export interface ComparisonResult {
  licenses: string[];
  dimensions: ComparisonDimension[];
}
