"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface InputData {
  method: "file" | "github" | "text";
  content: string;
  fileName?: string;
}

interface InputFormProps {
  value: InputData;
  onChange: (data: InputData) => void;
  showFileUpload?: boolean;
}

export function InputForm({ value, onChange, showFileUpload = false }: InputFormProps) {
  const [activeTab, setActiveTab] = useState<string>(value.method);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onChange({ method: tab as InputData["method"], content: "", fileName: undefined });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      onChange({ method: "file", content, fileName: file.name });
    };
    reader.readAsText(file);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className={`grid w-full h-10 ${showFileUpload ? "grid-cols-3" : "grid-cols-2"}`}>
        {showFileUpload ? (
          <>
            <TabsTrigger value="github" className="text-xs sm:text-sm gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              GitHub
            </TabsTrigger>
            <TabsTrigger value="file" className="text-xs sm:text-sm gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
              上传文件
            </TabsTrigger>
            <TabsTrigger value="text" className="text-xs sm:text-sm gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>
              文本输入
            </TabsTrigger>
          </>
        ) : (
          <>
            <TabsTrigger value="text" className="text-xs sm:text-sm gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>
              文本输入
            </TabsTrigger>
            <TabsTrigger value="github" className="text-xs sm:text-sm gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              GitHub
            </TabsTrigger>
          </>
        )}
      </TabsList>

      {showFileUpload && (
        <TabsContent value="file" className="mt-4">
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">上传依赖文件</Label>
            {!value.fileName ? (
              <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="flex flex-col items-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
                  <div className="text-center">
                    <p className="text-sm font-medium">点击选择文件</p>
                    <p className="text-xs mt-0.5">package.json, requirements.txt, go.mod, Cargo.toml</p>
                  </div>
                </div>
                <Input
                  type="file"
                  accept=".json,.txt,.toml,.mod,.lock"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary shrink-0"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                  <span className="text-sm font-medium text-primary truncate">{value.fileName}</span>
                  <button
                    type="button"
                    onClick={() => onChange({ method: "file", content: "", fileName: undefined })}
                    className="ml-auto text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
                {value.content && (
                  <Textarea
                    value={value.content}
                    readOnly
                    className="h-32 font-mono text-xs bg-muted/30 border-muted"
                    placeholder="文件内容预览"
                  />
                )}
              </div>
            )}
          </div>
        </TabsContent>
      )}

      <TabsContent value="text" className="mt-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            {showFileUpload ? "输入你想使用的开源项目或依赖信息" : "描述项目或粘贴依赖文件内容"}
          </Label>
          <Textarea
            placeholder={showFileUpload
              ? "输入你想引用的开源项目信息，例如：\n\n我的商业项目想使用 React、Ant Design 和 FFmpeg，需要检查这些开源组件的协议是否允许商业使用...\n\n或者直接粘贴 package.json / requirements.txt 等依赖文件内容"
              : "描述你的项目需求，例如：\n\n我想开发一个商业化的 React 组件库，需要允许用户免费使用但保留商业授权...\n\n或者直接粘贴 package.json / requirements.txt 等文件内容"}
            className="h-40 leading-relaxed"
            value={value.method === "text" ? value.content : ""}
            onChange={(e) =>
              onChange({ method: "text", content: e.target.value })
            }
          />
        </div>
      </TabsContent>

      <TabsContent value="github" className="mt-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">GitHub 仓库地址</Label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </div>
            <Input
              placeholder="https://github.com/user/repo"
              value={value.method === "github" ? value.content : ""}
              onChange={(e) =>
                onChange({ method: "github", content: e.target.value })
              }
              className="pl-9 h-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">输入仓库地址，自动读取 package.json 等依赖文件</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
