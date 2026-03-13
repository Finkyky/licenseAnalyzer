export interface GitHubRepoInfo {
  name: string;
  description: string | null;
  language: string | null;
  licenseSpdxId: string | null;
  defaultBranch: string;
}

interface GitHubContentItem {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url: string | null;
  size: number;
}

export interface GitHubAnalysisData {
  repoInfo: GitHubRepoInfo;
  licenseFileContent: string | null;
  dependencyFiles: Array<{ fileName: string; content: string }>;
}

const GITHUB_API = 'https://api.github.com';
const MAX_FILE_SIZE = 500_000; // 500KB

const LICENSE_FILE_NAMES = [
  'license', 'licence', 'copying', 'copying.lesser',
  'license.md', 'licence.md', 'license.txt', 'licence.txt',
  'license-mit', 'license-apache',
];

const DEPENDENCY_FILE_NAMES = [
  'package.json', 'requirements.txt', 'go.mod', 'cargo.toml',
];

const headers: Record<string, string> = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'LicenseAnalyzer/1.0',
  ...(process.env.GITHUB_TOKEN ? { 'Authorization': `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
};

/**
 * 解析 GitHub URL，提取 owner 和 repo
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // 支持格式：
  // https://github.com/owner/repo
  // https://github.com/owner/repo.git
  // https://github.com/owner/repo/tree/main
  // github.com/owner/repo
  const match = url.match(/github\.com\/([^/\s]+)\/([^/\s.#]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

/**
 * 获取仓库基本信息
 */
async function fetchRepoInfo(owner: string, repo: string): Promise<GitHubRepoInfo> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, { headers });

  if (res.status === 404) {
    throw new Error('仓库不存在或为私有仓库');
  }
  if (res.status === 403) {
    throw new Error('GitHub API 请求频率超限，请稍后再试');
  }
  if (!res.ok) {
    throw new Error(`获取仓库信息失败: HTTP ${res.status}`);
  }

  const data = await res.json();
  return {
    name: data.name,
    description: data.description,
    language: data.language,
    licenseSpdxId: data.license?.spdx_id || null,
    defaultBranch: data.default_branch || 'main',
  };
}

/**
 * 获取仓库根目录文件列表
 */
async function fetchRepoContents(owner: string, repo: string): Promise<GitHubContentItem[]> {
  const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents`, { headers });

  if (!res.ok) {
    throw new Error(`获取仓库文件列表失败: HTTP ${res.status}`);
  }

  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data;
}

/**
 * 获取文件原始内容
 */
async function fetchFileContent(downloadUrl: string): Promise<string> {
  const res = await fetch(downloadUrl);
  if (!res.ok) {
    throw new Error(`获取文件内容失败: HTTP ${res.status}`);
  }

  const contentLength = res.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > MAX_FILE_SIZE) {
    throw new Error('文件过大，跳过');
  }

  return res.text();
}

/**
 * 主入口：获取 GitHub 仓库数据用于分析
 */
export async function fetchRepoForAnalysis(url: string): Promise<GitHubAnalysisData> {
  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    throw new Error('无效的 GitHub 仓库地址，请输入如 https://github.com/user/repo 的格式');
  }

  const { owner, repo } = parsed;

  // 并行获取仓库信息和文件列表
  const [repoInfo, contents] = await Promise.all([
    fetchRepoInfo(owner, repo),
    fetchRepoContents(owner, repo),
  ]);

  // 识别 LICENSE 文件和依赖文件
  const licenseFiles: GitHubContentItem[] = [];
  const depFiles: GitHubContentItem[] = [];

  for (const item of contents) {
    if (item.type !== 'file' || !item.download_url) continue;

    const lowerName = item.name.toLowerCase();
    if (LICENSE_FILE_NAMES.includes(lowerName)) {
      licenseFiles.push(item);
    }
    if (DEPENDENCY_FILE_NAMES.includes(lowerName)) {
      depFiles.push(item);
    }
  }

  // 并行获取所有需要的文件内容
  const fetchTasks: Array<{ type: 'license' | 'dep'; item: GitHubContentItem; promise: Promise<string> }> = [];

  // 只取第一个 LICENSE 文件
  if (licenseFiles.length > 0) {
    fetchTasks.push({
      type: 'license',
      item: licenseFiles[0],
      promise: fetchFileContent(licenseFiles[0].download_url!),
    });
  }

  for (const item of depFiles) {
    fetchTasks.push({
      type: 'dep',
      item,
      promise: fetchFileContent(item.download_url!),
    });
  }

  const results = await Promise.allSettled(fetchTasks.map(t => t.promise));

  let licenseFileContent: string | null = null;
  const dependencyFiles: Array<{ fileName: string; content: string }> = [];

  results.forEach((result, index) => {
    if (result.status !== 'fulfilled') return;
    const task = fetchTasks[index];
    if (task.type === 'license') {
      licenseFileContent = result.value;
    } else {
      dependencyFiles.push({
        fileName: task.item.name,
        content: result.value,
      });
    }
  });

  return { repoInfo, licenseFileContent, dependencyFiles };
}
