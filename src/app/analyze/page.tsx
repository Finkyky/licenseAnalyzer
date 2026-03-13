"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ModelSelector } from "@/components/features/ModelSelector";
import { InputForm } from "@/components/features/InputForm";
import { RiskReport } from "@/components/features/RiskReport";
import { submitAnalysis, pollAnalysisResult } from "@/lib/api";
import { RiskItem } from "@/types/license";
import { toast } from "sonner";

type Stage = "input" | "processing" | "result";

export default function AnalyzePage() {
  const [stage, setStage] = useState<Stage>("input");
  const [error, setError] = useState<string>("");
  const [inputData, setInputData] = useState<{
    method: "file" | "github" | "text";
    content: string;
    fileName?: string;
  }>({
    method: "github",
    content: "",
    fileName: undefined,
  });
  const [modelConfig, setModelConfig] = useState({
    provider: "builtin",
    modelId: "LongCat-Flash-Chat",
    apiKey: "__builtin__",
    baseUrl: "",
  });
  const [risks, setRisks] = useState<RiskItem[]>([]);
  const [report, setReport] = useState<string>("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!inputData.content.trim()) {
      setError("请上传文件或输入内容");
      return;
    }
    if (!modelConfig.apiKey && modelConfig.provider !== "builtin") {
      setError("请输入 API 密钥");
      return;
    }
    setError("");
    setStage("processing");
    try {
      const { jobId } = await submitAnalysis({ type: "analyze", input: inputData, model: modelConfig });
      pollingRef.current = setInterval(async () => {
        try {
          const result = await pollAnalysisResult(jobId);
          if (result.status === "completed" && result.result) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setRisks(result.result.risks || []);
            setReport(result.result.report || "");
            setStage("result");
            toast.success("分析完成");
          } else if (result.status === "failed") {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setError(result.result?.error || "分析失败");
            setStage("input");
            toast.error("分析失败");
          }
        } catch {
          // retry
        }
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
      setStage("input");
    }
  }, [inputData, modelConfig]);

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">合规检查</h1>
            <p className="text-sm text-muted-foreground">检查你引用的开源项目是否存在协议冲突或法律风险</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 animate-fade-in">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {stage === "input" && (
        <div className="space-y-6 animate-fade-in">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                上传依赖清单
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1 ml-8">上传你项目的依赖文件，或粘贴你想使用的开源项目信息</p>
            </CardHeader>
            <CardContent>
              <InputForm value={inputData} onChange={setInputData} showFileUpload />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</span>
                模型配置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ModelSelector value={modelConfig} onChange={setModelConfig} />
            </CardContent>
          </Card>

          <Button className="w-full shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-all" size="lg" onClick={handleSubmit}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            开始合规检查
          </Button>
        </div>
      )}

      {stage === "processing" && (
        <Card className="shadow-sm animate-fade-in">
          <CardContent className="py-16 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-lg">正在检查合规风险...</p>
              <p className="text-sm text-muted-foreground">正在逐一排查协议冲突和使用限制，请稍候</p>
            </div>
            <div className="max-w-xs mx-auto space-y-3">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-4/5" />
              <Skeleton className="h-3 w-3/5" />
            </div>
            <p className="text-xs text-muted-foreground">通常需要 10-30 秒</p>
          </CardContent>
        </Card>
      )}

      {stage === "result" && (
        <div className="space-y-6 animate-fade-in">
          <RiskReport risks={risks} report={report} />
          <Button variant="outline" onClick={() => { setStage("input"); setRisks([]); setReport(""); }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
            重新分析
          </Button>
        </div>
      )}
    </div>
  );
}
