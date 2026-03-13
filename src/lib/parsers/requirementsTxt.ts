import { DependencyInfo } from '@/types/agent';

export function parseRequirementsTxt(content: string): DependencyInfo[] {
  const deps: DependencyInfo[] = [];
  const lines = content.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('-')) continue;

    // Handle formats: package==1.0.0, package>=1.0.0, package~=1.0.0, package
    const match = trimmed.match(/^([a-zA-Z0-9_-]+(?:\[[a-zA-Z0-9_,-]+\])?)\s*([><=~!]+\s*[\d.]+(?:\s*,\s*[><=~!]+\s*[\d.]+)*)?/);
    if (match) {
      deps.push({
        name: match[1].replace(/\[.*\]/, ''),
        version: match[2]?.trim(),
      });
    }
  }

  return deps;
}
