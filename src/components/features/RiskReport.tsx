"use client";

import ReactMarkdown from "react-markdown";
import { RiskItem } from "@/types/license";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface RiskReportProps {
  risks: RiskItem[];
  report?: string;
}

export function RiskReport({ risks, report }: RiskReportProps) {
  const highRisks = risks.filter((r) => r.level === "high");
  const mediumRisks = risks.filter((r) => r.level === "medium");
  const lowRisks = risks.filter((r) => r.level === "low");

  const handleDownloadReport = () => {
    const content = generateReportText(risks, report);
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "risk-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
          <h3 className="text-lg font-semibold">风险报告</h3>
        </div>
        <Button variant="outline" size="sm" onClick={handleDownloadReport} className="gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
          下载报告
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard label="高风险" count={highRisks.length} color="red" />
        <SummaryCard label="中等风险" count={mediumRisks.length} color="yellow" />
        <SummaryCard label="低风险" count={lowRisks.length} color="green" />
      </div>

      {/* Risk items */}
      {risks.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-8 text-center">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mx-auto mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
            </div>
            <p className="font-medium text-green-600">未发现风险</p>
            <p className="text-sm text-muted-foreground mt-1">未检测到明显的协议兼容性风险</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {[...highRisks, ...mediumRisks, ...lowRisks].map((risk, i) => (
            <Alert
              key={i}
              variant={risk.level === "high" ? "destructive" : "default"}
              className="shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  risk.level === "high"
                    ? "bg-red-500/10"
                    : risk.level === "medium"
                    ? "bg-yellow-500/10"
                    : "bg-green-500/10"
                }`}>
                  {risk.level === "high" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                  ) : risk.level === "medium" ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
                  )}
                </div>
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <AlertTitle className="text-sm m-0">{risk.title}</AlertTitle>
                    <Badge
                      variant={
                        risk.level === "high"
                          ? "destructive"
                          : risk.level === "medium"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-[10px] px-1.5"
                    >
                      {risk.level === "high" ? "高风险" : risk.level === "medium" ? "中风险" : "低风险"}
                    </Badge>
                  </div>
                  <AlertDescription className="text-xs leading-relaxed">
                    {risk.description}
                  </AlertDescription>
                  {risk.suggestion && (
                    <p className="text-xs flex items-start gap-1.5 text-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                      建议: {risk.suggestion}
                    </p>
                  )}
                  {risk.relatedDependencies?.length ? (
                    <div className="flex gap-1 flex-wrap pt-0.5">
                      {risk.relatedDependencies.map((dep) => (
                        <Badge key={dep} variant="outline" className="text-[10px] px-1.5 font-mono">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </Alert>
          ))}
        </div>
      )}

      {/* AI Report */}
      {report && (
        <>
          <Separator />
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
              详细分析报告
            </h4>
            <div className="bg-muted/30 rounded-xl p-5 border prose prose-sm prose-neutral dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-h1:text-lg prose-h2:text-base prose-h3:text-sm
              prose-p:text-[13px] prose-p:leading-relaxed
              prose-li:text-[13px] prose-li:leading-relaxed
              prose-strong:text-foreground
              prose-code:text-xs prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, count, color }: { label: string; count: number; color: "red" | "yellow" | "green" }) {
  const styles = {
    red: {
      bg: "bg-red-500/5 border-red-200",
      icon: "bg-red-500/10 text-red-500",
      text: "text-red-600",
    },
    yellow: {
      bg: "bg-yellow-500/5 border-yellow-200",
      icon: "bg-yellow-500/10 text-yellow-600",
      text: "text-yellow-600",
    },
    green: {
      bg: "bg-green-500/5 border-green-200",
      icon: "bg-green-500/10 text-green-500",
      text: "text-green-600",
    },
  }[color];

  return (
    <div className={`rounded-xl border p-3 ${styles.bg}`}>
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${styles.icon}`}>
          <span className="text-sm font-bold">{count}</span>
        </div>
        <span className={`text-xs font-medium ${styles.text}`}>{label}</span>
      </div>
    </div>
  );
}

function generateReportText(risks: RiskItem[], report?: string): string {
  let content = "# 协议风险分析报告\n\n";
  content += `生成时间: ${new Date().toLocaleString("zh-CN")}\n\n`;

  if (risks.length === 0) {
    content += "## 结论\n\n未检测到明显的协议兼容性风险。\n";
  } else {
    content += `## 风险概要\n\n`;
    content += `- 高风险: ${risks.filter((r) => r.level === "high").length}\n`;
    content += `- 中等风险: ${risks.filter((r) => r.level === "medium").length}\n`;
    content += `- 低风险: ${risks.filter((r) => r.level === "low").length}\n\n`;

    content += "## 风险详情\n\n";
    for (const risk of risks) {
      content += `### [${risk.level.toUpperCase()}] ${risk.title}\n\n`;
      content += `${risk.description}\n\n`;
      if (risk.suggestion) {
        content += `**建议**: ${risk.suggestion}\n\n`;
      }
      if (risk.relatedDependencies?.length) {
        content += `**相关依赖**: ${risk.relatedDependencies.join(", ")}\n\n`;
      }
    }
  }

  if (report) {
    content += "\n---\n\n## AI 分析报告\n\n" + report;
  }

  return content;
}
