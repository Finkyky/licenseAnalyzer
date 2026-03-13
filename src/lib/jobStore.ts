// Shared in-memory job store singleton
// Uses globalThis to survive module reloads in dev and ensure single instance

const globalForJobs = globalThis as typeof globalThis & {
  __jobStore?: Map<string, { status: string; result?: unknown }>;
};

if (!globalForJobs.__jobStore) {
  globalForJobs.__jobStore = new Map();
}

export const jobStore = globalForJobs.__jobStore;
