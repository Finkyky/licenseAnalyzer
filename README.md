<div align="center">

# License Analyzer

**AI 驱动的开源协议分析平台**

智能协议推荐 · 依赖合规检查 · 协议对比解读

体验地址: https://licenseanalyzer.onrender.com

[中文](#中文文档) | [English](#english-documentation)

</div>

---

## 中文文档

### 项目背景

开源协议的选择和合规检查是开发者在项目开发中常常忽视但至关重要的环节。选错协议可能导致法律纠纷，引用不兼容的开源组件可能带来合规风险。

**License Analyzer** 利用 AI 多智能体协作，帮助开发者：
- 根据项目需求智能推荐最合适的开源协议
- 检查项目依赖的开源组件是否存在协议冲突或法律风险
- 直观对比多个协议的权限、条件和限制

### 核心功能

**协议选择** — 描述你的项目，AI 推荐最适合的开源协议，支持对比和一键生成 LICENSE 文件

**合规检查** — 上传依赖文件或输入 GitHub 地址，自动分析每个依赖的协议风险等级并给出修复建议

**协议对比** — 从权限、条件、限制等 14 个维度对比多个协议的差异

**多模型支持** — 内置免费模型开箱即用，同时支持 DeepSeek、通义千问、Claude、OpenAI 及任意 OpenAI 兼容接口

### 技术架构

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│          Next.js 14 App Router + React 18        │
│          Tailwind CSS + shadcn/ui + Radix UI     │
├─────────────────────────────────────────────────┤
│                   API Routes                     │
│    /api/analyze    /api/compare    /api/licenses │
│              /api/generate-report                │
├─────────────────────────────────────────────────┤
│               AI Agent Pipeline                  │
│  ┌──────────────┐  ┌────────────────────┐       │
│  │ 协议分析Agent │  │ 推荐Agent / 风险Agent│       │
│  └──────┬───────┘  └────────┬───────────┘       │
│         └────── 并行执行 ──────┘                   │
│                     ↓                            │
│            ┌──────────────┐                      │
│            │  报告生成Agent │ (按需调用)            │
│            └──────────────┘                      │
├─────────────────────────────────────────────────┤
│  LLM Adapters        │  Database                 │
│  OpenAI / Claude /   │  better-sqlite3           │
│  OpenAI Compatible   │  SPDX 协议全量数据          │
├─────────────────────────────────────────────────┤
│  Parsers: package.json / requirements.txt /      │
│           go.mod / Cargo.toml                    │
│  GitHub API: 自动获取仓库协议和依赖文件              │
└─────────────────────────────────────────────────┘
```

### 目录结构

```
licenseAnalyzer/
├── src/
│   ├── app/                        # 页面和 API 路由
│   │   ├── page.tsx                #   首页
│   │   ├── select/page.tsx         #   协议选择页
│   │   ├── analyze/page.tsx        #   合规检查页
│   │   └── api/                    #   API 路由
│   │       ├── analyze/            #     分析任务提交与轮询
│   │       ├── compare/            #     协议对比
│   │       ├── generate-report/    #     AI 报告生成
│   │       └── licenses/           #     协议数据查询
│   ├── components/
│   │   ├── features/               #   业务组件 (InputForm, ResultDisplay, RiskReport...)
│   │   ├── layout/                 #   布局组件 (Navbar, Footer)
│   │   └── ui/                     #   shadcn/ui 基础组件
│   ├── lib/
│   │   ├── agents/                 #   AI 智能体
│   │   │   ├── orchestrator.ts     #     流程编排 (并行调度)
│   │   │   ├── licenseAnalysisAgent.ts
│   │   │   ├── recommendationAgent.ts
│   │   │   ├── riskAssessmentAgent.ts
│   │   │   └── generationAgent.ts
│   │   ├── models/                 #   LLM 适配器 (Claude / OpenAI / 通用)
│   │   ├── db/                     #   数据库 (schema + seed + CRUD)
│   │   ├── github/                 #   GitHub API 集成
│   │   ├── licenses/               #   协议检测与兼容性数据
│   │   ├── parsers/                #   依赖文件解析器
│   │   └── api.ts                  #   客户端 API 封装
│   └── types/                      # TypeScript 类型定义
├── data/                           # SQLite 数据库 (自动生成)
├── .env                            # 环境变量 (不提交到 Git)
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

### 快速开始

**环境要求：** Node.js 18+

```bash
# 克隆项目
git clone <repo-url>
cd licenseAnalyzer

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入内置模型配置 (见下方环境变量说明)

# 启动开发服务器
npm run dev
```

访问 `http://localhost:3000` 即可使用。

### 环境变量

| 变量 | 说明 | 必填 |
|---|---|---|
| `BUILTIN_MODEL_BASE_URL` | 内置模型 API 地址 | 否 (默认 `https://api.longcat.chat/openai/v1`) |
| `BUILTIN_MODEL_API_KEY` | 内置模型 API Key | 是 |
| `BUILTIN_MODEL_ID` | 内置模型 ID | 否 (默认 `LongCat-Flash-Chat`) |

用户通过界面配置的其他模型 API Key 仅在浏览器端使用，不会存储到服务端。

### 部署 (Render)

1. 将代码推送到 GitHub
2. 在 [Render](https://render.com) 创建 **Web Service**，连接仓库
3. 配置：
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx next start -p $PORT`
   - **Instance Type**: Free
4. 在 Environment 中添加上述环境变量
5. 部署完成后访问 `https://your-app.onrender.com`

> 注意：Free 计划 15 分钟无流量会休眠，首次访问需等待冷启动。SQLite 数据在每次部署时自动重建。

### 技术栈

| 类别 | 技术 |
|---|---|
| 框架 | Next.js 14 (App Router) + React 18 |
| 语言 | TypeScript 5 |
| 样式 | Tailwind CSS 3.4 + @tailwindcss/typography |
| UI 组件 | shadcn/ui + Radix UI |
| 数据库 | better-sqlite3 (自动初始化 + seed SPDX 全量数据) |
| AI/LLM | @anthropic-ai/sdk + openai SDK |
| 依赖解析 | package.json / requirements.txt / go.mod / Cargo.toml |
| Markdown | react-markdown |

### 演示
![首页](/imgs/首页.png)

![首页](/imgs/协议选择.png)

![首页](/imgs/分析选择.png)

![首页](/imgs/license下载.png)

![首页](/imgs/推荐页面.png)

![首页](/imgs/检查页面.png)

![首页](/imgs/合规检查.png)

---

## English Documentation

### Background

Choosing the right open-source license and ensuring compliance with dependency licenses are critical yet often overlooked aspects of software development. A wrong license choice can lead to legal disputes, and using incompatible open-source components can introduce compliance risks.

**License Analyzer** leverages a multi-agent AI pipeline to help developers:
- Get intelligent license recommendations based on project requirements
- Check dependencies for license conflicts and legal risks
- Visually compare licenses across permissions, conditions, and limitations

### Core Features

**License Selection** — Describe your project, and AI recommends the best license with one-click LICENSE file generation

**Compliance Check** — Upload dependency files or enter a GitHub URL to analyze license risks for each dependency

**License Comparison** — Compare multiple licenses across 14 dimensions including permissions, conditions, and limitations

**Multi-Model Support** — Built-in free model works out of the box; also supports DeepSeek, Qwen, Claude, OpenAI, and any OpenAI-compatible endpoint

### Architecture

```
┌─────────────────────────────────────────────────┐
│                   Frontend                       │
│          Next.js 14 App Router + React 18        │
│          Tailwind CSS + shadcn/ui + Radix UI     │
├─────────────────────────────────────────────────┤
│                   API Routes                     │
│    /api/analyze    /api/compare    /api/licenses │
│              /api/generate-report                │
├─────────────────────────────────────────────────┤
│               AI Agent Pipeline                  │
│  ┌────────────────┐  ┌─────────────────────┐    │
│  │ Analysis Agent  │  │ Recommend / Risk    │    │
│  └───────┬────────┘  └─────────┬───────────┘    │
│          └──── Parallel Execution ────┘          │
│                      ↓                           │
│             ┌────────────────┐                   │
│             │ Generation Agent│ (on-demand)       │
│             └────────────────┘                   │
├─────────────────────────────────────────────────┤
│  LLM Adapters        │  Database                 │
│  OpenAI / Claude /   │  better-sqlite3           │
│  OpenAI Compatible   │  Full SPDX license data   │
├─────────────────────────────────────────────────┤
│  Parsers: package.json / requirements.txt /      │
│           go.mod / Cargo.toml                    │
│  GitHub API: auto-fetch repo license & deps      │
└─────────────────────────────────────────────────┘
```

### Project Structure

```
licenseAnalyzer/
├── src/
│   ├── app/                        # Pages and API routes
│   │   ├── page.tsx                #   Home page
│   │   ├── select/page.tsx         #   License selection
│   │   ├── analyze/page.tsx        #   Compliance check
│   │   └── api/                    #   API routes
│   │       ├── analyze/            #     Analysis job submit & poll
│   │       ├── compare/            #     License comparison
│   │       ├── generate-report/    #     AI report generation
│   │       └── licenses/           #     License data queries
│   ├── components/
│   │   ├── features/               #   Business components
│   │   ├── layout/                 #   Layout (Navbar, Footer)
│   │   └── ui/                     #   shadcn/ui base components
│   ├── lib/
│   │   ├── agents/                 #   AI agents & orchestrator
│   │   ├── models/                 #   LLM adapters (Claude / OpenAI / generic)
│   │   ├── db/                     #   Database (schema + seed + CRUD)
│   │   ├── github/                 #   GitHub API integration
│   │   ├── licenses/               #   License detection & compatibility data
│   │   ├── parsers/                #   Dependency file parsers
│   │   └── api.ts                  #   Client-side API helpers
│   └── types/                      # TypeScript type definitions
├── data/                           # SQLite database (auto-generated)
├── .env                            # Environment variables (git-ignored)
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

### Quick Start

**Requirements:** Node.js 18+

```bash
# Clone the project
git clone <repo-url>
cd licenseAnalyzer

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your built-in model config (see Environment Variables below)

# Start development server
npm run dev
```

Visit `http://localhost:3000` to get started.

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `BUILTIN_MODEL_BASE_URL` | Built-in model API endpoint | No (defaults to `https://api.longcat.chat/openai/v1`) |
| `BUILTIN_MODEL_API_KEY` | Built-in model API key | Yes |
| `BUILTIN_MODEL_ID` | Built-in model ID | No (defaults to `LongCat-Flash-Chat`) |

API keys for other models (Claude, OpenAI, etc.) are configured by users in the browser and never stored on the server.

### Deployment (Render)

1. Push your code to GitHub
2. Create a **Web Service** on [Render](https://render.com) and connect your repo
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx next start -p $PORT`
   - **Instance Type**: Free
4. Add the environment variables above in the Environment settings
5. Access your app at `https://your-app.onrender.com`

> Note: Free tier instances sleep after 15 minutes of inactivity. First visit requires a cold start. SQLite data is auto-rebuilt on each deploy.

### Tech Stack

| Category | Technology |
|---|---|
| Framework | Next.js 14 (App Router) + React 18 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3.4 + @tailwindcss/typography |
| UI Components | shadcn/ui + Radix UI |
| Database | better-sqlite3 (auto-init + SPDX full catalog seed) |
| AI/LLM | @anthropic-ai/sdk + openai SDK |
| Dep Parsers | package.json / requirements.txt / go.mod / Cargo.toml |
| Markdown | react-markdown |
