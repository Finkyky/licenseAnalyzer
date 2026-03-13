import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { analyzeRequestSchema } from '@/lib/validation/schemas';
import { createModelAdapter } from '@/lib/models/adapter';
import { executeSelectFlow, executeAnalyzeFlow } from '@/lib/agents/orchestrator';
import { parseDependencyFile } from '@/lib/parsers';
import { saveAnalysisResult } from '@/lib/db';
import { AgentInput, DependencyInfo } from '@/types/agent';
import { ModelConfig } from '@/types/model';
import { jobStore } from '@/lib/jobStore';
import { fetchRepoForAnalysis } from '@/lib/github';
import { detectLicense } from '@/lib/licenses/detector';
import { parsePackageJsonFull } from '@/lib/parsers/packageJson';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = analyzeRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: '输入验证失败', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { type, input, model } = parsed.data;
    const jobId = uuidv4();

    // Set initial job status
    jobStore.set(jobId, { status: 'processing' });

    // Run analysis asynchronously
    processJob(jobId, type, input, model as ModelConfig).catch(err => {
      console.error(`Job ${jobId} failed:`, err);
      jobStore.set(jobId, {
        status: 'failed',
        result: { type, status: 'failed', error: err.message || '处理失败' },
      });
    });

    return NextResponse.json({ jobId, status: 'processing' });
  } catch (error) {
    console.error('Analyze API error:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
}

async function processJob(
  jobId: string,
  type: string,
  input: { method: string; content: string; fileName?: string },
  modelConfig: ModelConfig
) {
  const model = createModelAdapter(modelConfig);

  // Build agent input from user input
  const agentInput = await buildAgentInput(input);

  let result;
  if (type === 'select') {
    result = await executeSelectFlow(agentInput, model);
  } else {
    result = await executeAnalyzeFlow(agentInput, model);
  }

  // Save to DB
  try {
    saveAnalysisResult(jobId, '', type, result);
  } catch {
    // DB save failure is non-critical
  }

  // Update job store
  jobStore.set(jobId, { status: result.status, result });
}

async function buildAgentInput(input: { method: string; content: string; fileName?: string }): Promise<AgentInput> {
  if (input.method === 'file' && input.fileName) {
    const dependencies = parseDependencyFile(input.fileName, input.content);

    // 如果是 package.json，额外提取项目名和许可证
    if (input.fileName.toLowerCase() === 'package.json') {
      const meta = parsePackageJsonFull(input.content);
      return {
        projectInfo: {
          name: meta.name,
          projectLicense: meta.license,
          dependencies,
        },
        rawContent: input.content,
      };
    }

    return {
      projectInfo: {
        dependencies,
      },
      rawContent: input.content,
    };
  }

  if (input.method === 'github') {
    const data = await fetchRepoForAnalysis(input.content);

    // 检测项目许可证
    let projectLicense: string | undefined;
    if (data.licenseFileContent) {
      const detected = detectLicense(data.licenseFileContent);
      if (detected.spdxId) {
        projectLicense = detected.spdxId;
      }
    }
    // 后备：使用 GitHub API 返回的许可证检测结果
    if (!projectLicense && data.repoInfo.licenseSpdxId && data.repoInfo.licenseSpdxId !== 'NOASSERTION') {
      projectLicense = data.repoInfo.licenseSpdxId;
    }

    // 解析依赖文件
    let dependencies: DependencyInfo[] = [];
    let projectName = data.repoInfo.name;

    for (const depFile of data.dependencyFiles) {
      // 对 package.json 使用增强解析器
      if (depFile.fileName.toLowerCase() === 'package.json') {
        const meta = parsePackageJsonFull(depFile.content);
        dependencies = dependencies.concat(meta.dependencies);
        if (meta.name) projectName = meta.name;
        // package.json 中的 license 字段也可作为后备
        if (!projectLicense && meta.license) {
          projectLicense = meta.license;
        }
      } else {
        const parsed = parseDependencyFile(depFile.fileName, depFile.content);
        dependencies = dependencies.concat(parsed);
      }
    }

    // 拼接 rawContent 供 AI agent 参考
    const rawParts: string[] = [];
    if (data.licenseFileContent) {
      rawParts.push(`=== LICENSE 文件内容 ===\n${data.licenseFileContent.substring(0, 3000)}`);
    }
    for (const depFile of data.dependencyFiles) {
      rawParts.push(`=== ${depFile.fileName} ===\n${depFile.content.substring(0, 2000)}`);
    }

    return {
      projectInfo: {
        name: projectName,
        description: data.repoInfo.description || undefined,
        language: data.repoInfo.language || undefined,
        projectLicense,
        dependencies,
      },
      rawContent: rawParts.join('\n\n') || `GitHub仓库: ${input.content}`,
    };
  }

  // Text input - try to detect if it's a dependency file
  const deps = parseDependencyFile('unknown', input.content);
  if (deps.length > 0) {
    return {
      projectInfo: {
        dependencies: deps,
      },
      rawContent: input.content,
    };
  }

  return {
    projectInfo: {
      description: input.content,
    },
    rawContent: input.content,
  };
}
