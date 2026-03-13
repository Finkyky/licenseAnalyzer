import { DependencyInfo } from '@/types/agent';

export function parseCargoToml(content: string): DependencyInfo[] {
  const deps: DependencyInfo[] = [];
  const lines = content.split('\n');
  let inDepsSection = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Check for dependencies section header
    if (/^\[(.*dependencies.*)\]$/i.test(trimmed)) {
      inDepsSection = true;
      continue;
    }

    // New section starts
    if (/^\[/.test(trimmed)) {
      inDepsSection = false;
      continue;
    }

    if (!inDepsSection || !trimmed || trimmed.startsWith('#')) continue;

    // Simple format: name = "version"
    const simpleMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*"([^"]+)"/);
    if (simpleMatch) {
      deps.push({ name: simpleMatch[1], version: simpleMatch[2] });
      continue;
    }

    // Table format: name = { version = "1.0", ... }
    const tableMatch = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*\{.*version\s*=\s*"([^"]+)"/);
    if (tableMatch) {
      deps.push({ name: tableMatch[1], version: tableMatch[2] });
      continue;
    }

    // Just name with table but no version
    const nameOnly = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*\{/);
    if (nameOnly) {
      deps.push({ name: nameOnly[1] });
    }
  }

  return deps;
}
