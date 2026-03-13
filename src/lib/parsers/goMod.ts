import { DependencyInfo } from '@/types/agent';

export function parseGoMod(content: string): DependencyInfo[] {
  const deps: DependencyInfo[] = [];
  const lines = content.split('\n');
  let inRequireBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === 'require (') {
      inRequireBlock = true;
      continue;
    }
    if (trimmed === ')') {
      inRequireBlock = false;
      continue;
    }

    // Single-line require
    const singleMatch = trimmed.match(/^require\s+(\S+)\s+(\S+)/);
    if (singleMatch) {
      deps.push({ name: singleMatch[1], version: singleMatch[2] });
      continue;
    }

    // Inside require block
    if (inRequireBlock) {
      const match = trimmed.match(/^(\S+)\s+(\S+)/);
      if (match && !trimmed.startsWith('//')) {
        deps.push({ name: match[1], version: match[2] });
      }
    }
  }

  return deps;
}
