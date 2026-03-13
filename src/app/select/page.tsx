"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ModelSelector } from "@/components/features/ModelSelector";
import { InputForm } from "@/components/features/InputForm";
import { ResultDisplay } from "@/components/features/ResultDisplay";
import { LicenseComparison } from "@/components/features/LicenseComparison";
import { submitAnalysis, pollAnalysisResult, compareLicenses, fetchLicenseText } from "@/lib/api";
import { LicenseRecommendation, ComparisonResult } from "@/types/license";
import { toast } from "sonner";

type Stage = "input" | "processing" | "result" | "compare" | "generate";

export default function SelectPage() {
  const [stage, setStage] = useState<Stage>("input");
  const [error, setError] = useState<string>("");
  const [inputData, setInputData] = useState<{
    method: "file" | "github" | "text";
    content: string;
    fileName?: string;
  }>({
    method: "text",
    content: "",
    fileName: undefined,
  });
  const [modelConfig, setModelConfig] = useState({
    provider: "builtin",
    modelId: "LongCat-Flash-Chat",
    apiKey: "__builtin__",
    baseUrl: "",
  });
  const [recommendations, setRecommendations] = useState<LicenseRecommendation[]>([]);
  const [selectedLicense, setSelectedLicense] = useState<string>("");
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [licenseText, setLicenseText] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!inputData.content.trim()) {
      setError("请输入内容");
      return;
    }
    if (!modelConfig.apiKey && modelConfig.provider !== "builtin") {
      setError("请输入 API 密钥");
      return;
    }
    setError("");
    setStage("processing");
    try {
      const { jobId } = await submitAnalysis({ type: "select", input: inputData, model: modelConfig });
      pollingRef.current = setInterval(async () => {
        try {
          const result = await pollAnalysisResult(jobId);
          if (result.status === "completed" && result.result) {
            if (pollingRef.current) clearInterval(pollingRef.current);
            setRecommendations(result.result.recommendations || []);
            setLicenseText(result.result.licenseText || "");
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
    } catch (e) {
      setError(e instanceof Error ? e.message : "提交失败");
      setStage("input");
    }
  }, [inputData, modelConfig]);

  const handleCompare = useCallback(async () => {
    const ids = recommendations.slice(0, 3).map((r) => r.spdxId);
    if (ids.length < 2) {
      toast.error("需要至少2个协议才能对比");
      return;
    }
    try {
      const result = await compareLicenses({ licenses: ids });
      setComparison(result);
      setStage("compare");
    } catch {
      setError("对比失败");
    }
  }, [recommendations]);

  const handleGenerateLicense = useCallback(async () => {
    if (!selectedLicense) return;
    setStage("generate");
    try {
      const text = await fetchLicenseText(selectedLicense);
      setLicenseText(text);
    } catch {
      // 如果 DB 没有，保留 LLM 生成的文本
    }
  }, [selectedLicense]);

  const handleDownloadLicense = useCallback(() => {
    const text = licenseText || `请参考 ${selectedLicense} 协议的官方文本。`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "LICENSE";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("LICENSE 文件已下载");
  }, [licenseText, selectedLicense]);

  return (
    <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">协议选择</h1>
            <p className="text-sm text-muted-foreground">描述你的项目情况和诉求，AI 帮你推荐最合适的开源协议</p>
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6 animate-fade-in">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Input Stage */}
      {stage === "input" && (
        <div className="space-y-6 animate-fade-in">
          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                项目信息
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1 ml-8">描述你的项目类型、使用场景和商业化意向</p>
            </CardHeader>
            <CardContent>
              <InputForm value={inputData} onChange={setInputData} />
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
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            开始智能推荐
          </Button>
        </div>
      )}

      {/* Processing */}
      {stage === "processing" && (
        <Card className="shadow-sm animate-fade-in">
          <CardContent className="py-16 text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/25 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
            </div>
            <div className="space-y-2">
              <p className="font-medium text-lg">正在为你的项目挑选协议...</p>
              <p className="text-sm text-muted-foreground">正在分析项目特征并匹配最合适的协议，请稍候</p>
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

      {/* Result */}
      {stage === "result" && (
        <div className="space-y-6 animate-fade-in">
          <ResultDisplay recommendations={recommendations} onSelect={setSelectedLicense} selectedLicense={selectedLicense} />
          <Separator />
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleCompare}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
              对比协议
            </Button>
            {selectedLicense && (
              <Button onClick={handleGenerateLicense}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                生成 LICENSE 文件
              </Button>
            )}
            <Button variant="ghost" onClick={() => { setStage("input"); setRecommendations([]); setSelectedLicense(""); }}>
              重新分析
            </Button>
          </div>
        </div>
      )}

      {/* Compare */}
      {stage === "compare" && comparison && (
        <div className="space-y-6 animate-fade-in">
          <LicenseComparison comparison={comparison} />
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStage("result")}>返回推荐</Button>
            {selectedLicense && (
              <Button onClick={handleGenerateLicense}>生成 LICENSE 文件</Button>
            )}
          </div>
        </div>
      )}

      {/* Generate */}
      {stage === "generate" && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <Card className="shadow-sm overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-blue-500 to-violet-500" />
            <CardContent className="py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">已选择协议</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <h3 className="font-semibold text-lg">{selectedLicense}</h3>
                      <Badge variant="secondary" className="text-[10px]">SPDX</Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleDownloadLicense} size="sm" className="shadow-sm gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    下载 LICENSE
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setStage("result")}>返回推荐</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LICENSE Text */}
          {licenseText && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
                  LICENSE 文件内容
                  <Badge variant="outline" className="text-[10px] font-normal ml-auto">预览</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 rounded-xl p-5 border max-h-[480px] overflow-y-auto">
                  <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-muted-foreground">{licenseText}</pre>
                </div>
              </CardContent>
            </Card>
          )}

          {/* AI Report */}
          {report && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                  AI 分析报告
                  <Badge variant="outline" className="text-[10px] font-normal ml-auto">AI 生成</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none
                  prose-headings:font-semibold prose-headings:tracking-tight
                  prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
                  prose-p:text-[13px] prose-p:leading-relaxed
                  prose-li:text-[13px] prose-li:leading-relaxed
                  prose-strong:text-foreground
                  prose-code:text-xs prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                  <ReactMarkdown>{report}</ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
