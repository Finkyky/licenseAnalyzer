import { DependencyInfo } from '@/types/agent';
import { parsePackageJson } from './packageJson';
import { parseRequirementsTxt } from './requirementsTxt';
import { parseGoMod } from './goMod';
import { parseCargoToml } from './cargoToml';

export function parseDependencyFile(filename: string, content: string): DependencyInfo[] {
  const lower = filename.toLowerCase();

  if (lower === 'package.json' || lower.endsWith('/package.json')) {
    return parsePackageJson(content);
  }
  if (lower === 'requirements.txt' || lower.endsWith('/requirements.txt')) {
    return parseRequirementsTxt(content);
  }
  if (lower === 'go.mod' || lower.endsWith('/go.mod')) {
    return parseGoMod(content);
  }
  if (lower === 'cargo.toml' || lower.endsWith('/cargo.toml')) {
    return parseCargoToml(content);
  }

  // Try to auto-detect
  try {
    JSON.parse(content);
    return parsePackageJson(content);
  } catch {
    // Not JSON, try requirements.txt format
    if (content.includes('==') || content.includes('>=')) {
      return parseRequirementsTxt(content);
    }
    if (content.includes('require (') || content.includes('module ')) {
      return parseGoMod(content);
    }
    if (content.includes('[dependencies]') || content.includes('[package]')) {
      return parseCargoToml(content);
    }
  }

  return [];
}

export { parsePackageJson, parseRequirementsTxt, parseGoMod, parseCargoToml };
