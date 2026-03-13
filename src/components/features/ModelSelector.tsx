"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ModelConfig {
  provider: string;
  modelId: string;
  apiKey: string;
  baseUrl: string;
}

const PROVIDERS = [
  { value: "builtin", label: "系统内置模型 (免费)" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "qwen", label: "通义千问 (Qwen)" },
  { value: "claude", label: "Anthropic Claude" },
  { value: "openai", label: "OpenAI" },
  { value: "openai-compatible", label: "OpenAI 兼容 (自定义)" },
];

const MODELS: Record<string, Array<{ value: string; label: string }>> = {
  builtin: [
    { value: "LongCat-Flash-Chat", label: "LongCat Flash Chat" },
  ],
  deepseek: [
    { value: "deepseek-chat", label: "DeepSeek Chat (V3)" },
    { value: "deepseek-reasoner", label: "DeepSeek Reasoner (R1)" },
  ],
  qwen: [
    { value: "qwen-plus", label: "Qwen Plus" },
    { value: "qwen-turbo", label: "Qwen Turbo" },
    { value: "qwen-max", label: "Qwen Max" },
  ],
  claude: [
    { value: "claude-sonnet-4-6", label: "Claude Sonnet 4.6" },
    { value: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5" },
    { value: "claude-opus-4-6", label: "Claude Opus 4.6" },
  ],
  openai: [
    { value: "gpt-4o", label: "GPT-4o" },
    { value: "gpt-4o-mini", label: "GPT-4o Mini" },
    { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
  ],
  "openai-compatible": [
    { value: "custom", label: "自定义模型" },
  ],
};

const NO_KEY_PROVIDERS = new Set(["builtin"]);

interface ModelSelectorProps {
  value: ModelConfig;
  onChange: (config: ModelConfig) => void;
}

export function ModelSelector({ value, onChange }: ModelSelectorProps) {
  const [customModel, setCustomModel] = useState("");

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (NO_KEY_PROVIDERS.has(value.provider)) return;
    const savedKey = sessionStorage.getItem(`apiKey_${value.provider}`);
    if (savedKey && !value.apiKey) {
      onChange({ ...value, apiKey: savedKey });
    }
  }, [value.provider]);

  const handleProviderChange = (provider: string) => {
    const models = MODELS[provider] || [];
    if (NO_KEY_PROVIDERS.has(provider)) {
      onChange({ provider, modelId: models[0]?.value || "", apiKey: "__builtin__", baseUrl: "" });
    } else {
      const savedKey = sessionStorage.getItem(`apiKey_${provider}`) || "";
      onChange({ provider, modelId: models[0]?.value || "", apiKey: savedKey, baseUrl: "" });
    }
  };

  const handleApiKeyChange = (apiKey: string) => {
    sessionStorage.setItem(`apiKey_${value.provider}`, apiKey);
    onChange({ ...value, apiKey });
  };

  const isBuiltin = value.provider === "builtin";
  const needsApiKey = !NO_KEY_PROVIDERS.has(value.provider);
  const needsBaseUrl = value.provider === "openai-compatible";
  const needsCustomModel = value.provider === "openai-compatible";

  return (
    <div className="space-y-4">
      {/* Row 1: Provider + Model side by side */}
      <div className={`grid gap-4 ${isBuiltin ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">提供商</Label>
          <Select value={value.provider} onValueChange={handleProviderChange}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {!isBuiltin && (
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">模型</Label>
            {needsCustomModel ? (
              <Input
                placeholder="输入模型名称"
                value={customModel}
                onChange={(e) => {
                  setCustomModel(e.target.value);
                  onChange({ ...value, modelId: e.target.value });
                }}
                className="h-10"
              />
            ) : (
              <Select value={value.modelId} onValueChange={(id) => onChange({ ...value, modelId: id })}>
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="选择模型" />
                </SelectTrigger>
                <SelectContent>
                  {(MODELS[value.provider] || []).map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}
      </div>

      {/* Built-in hint */}
      {isBuiltin && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-violet-50 dark:from-blue-500/10 dark:to-violet-500/10 border border-blue-200/60 dark:border-blue-500/20">
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">系统内置 AI 模型</p>
            <p className="text-xs text-muted-foreground">无需配置，直接点击下方按钮开始分析</p>
          </div>
        </div>
      )}

      {/* API Key */}
      {needsApiKey && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">API 密钥</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>
            </div>
            <Input
              type="password"
              placeholder="输入 API 密钥"
              value={value.apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            密钥仅存储在浏览器会话中，不会上传到服务器
          </p>
        </div>
      )}

      {/* Base URL */}
      {needsBaseUrl && (
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">API 地址</Label>
          <Input
            placeholder="例如: http://localhost:11434/v1"
            value={value.baseUrl}
            onChange={(e) => onChange({ ...value, baseUrl: e.target.value })}
            className="h-10"
          />
        </div>
      )}
    </div>
  );
}
