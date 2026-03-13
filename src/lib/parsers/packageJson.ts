import { DependencyInfo } from '@/types/agent';

export interface PackageJsonMetadata {
  name?: string;
  license?: string;
  dependencies: DependencyInfo[];
}

export function parsePackageJson(content: string): DependencyInfo[] {
  return parsePackageJsonFull(content).dependencies;
}

export function parsePackageJsonFull(content: string): PackageJsonMetadata {
  try {
    const pkg = JSON.parse(content);
    const deps: DependencyInfo[] = [];

    const allDeps = {
      ...pkg.dependencies,
      ...pkg.devDependencies,
    };

    for (const [name, version] of Object.entries(allDeps)) {
      deps.push({
        name,
        version: version as string,
      });
    }

    return {
      name: typeof pkg.name === 'string' ? pkg.name : undefined,
      license: typeof pkg.license === 'string' ? pkg.license : undefined,
      dependencies: deps,
    };
  } catch {
    return { dependencies: [] };
  }
}
