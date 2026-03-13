"use client";

import { LicenseRecommendation } from "@/types/license";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreBar } from "./ScoreBar";

interface ResultDisplayProps {
  recommendations: LicenseRecommendation[];
  onSelect?: (spdxId: string) => void;
  selectedLicense?: string;
}

const RANK_STYLES = [
  { bg: "bg-gradient-to-br from-amber-400 to-orange-500", text: "text-white", shadow: "shadow-amber-500/20" },
  { bg: "bg-gradient-to-br from-slate-300 to-slate-400", text: "text-white", shadow: "shadow-slate-400/20" },
  { bg: "bg-gradient-to-br from-amber-600 to-amber-700", text: "text-white", shadow: "shadow-amber-600/20" },
];

export function ResultDisplay({
  recommendations,
  onSelect,
  selectedLicense,
}: ResultDisplayProps) {
  if (!recommendations.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-40"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
        暂无推荐结果
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
        <h3 className="text-lg font-semibold">推荐协议</h3>
        <Badge variant="secondary" className="text-xs">{recommendations.length} 个推荐</Badge>
      </div>

      <div className="grid gap-3">
        {recommendations.map((rec, index) => {
          const isSelected = selectedLicense === rec.spdxId;
          const rank = RANK_STYLES[index] || null;

          return (
            <Card
              key={rec.spdxId}
              className={`overflow-hidden transition-all duration-200 ${
                isSelected
                  ? "ring-2 ring-primary shadow-md shadow-primary/10"
                  : "hover:shadow-md"
              }`}
            >
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  {/* Rank badge */}
                  <div className={`flex items-center justify-center w-14 shrink-0 ${
                    rank ? rank.bg : "bg-muted"
                  }`}>
                    <span className={`text-lg font-bold ${rank ? rank.text : "text-muted-foreground"}`}>
                      {index + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{rec.name}</span>
                        <Badge variant="outline" className="text-xs font-mono">{rec.spdxId}</Badge>
                      </div>
                      {onSelect && (
                        <Button
                          size="sm"
                          variant={isSelected ? "default" : "outline"}
                          onClick={() => onSelect(rec.spdxId)}
                          className={`shrink-0 text-xs ${isSelected ? "shadow-sm" : ""}`}
                        >
                          {isSelected ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><polyline points="20 6 9 17 4 12"/></svg>
                              已选择
                            </>
                          ) : "选择"}
                        </Button>
                      )}
                    </div>

                    <ScoreBar score={rec.score} label="匹配度" />

                    <p className="text-sm text-muted-foreground leading-relaxed">{rec.reason}</p>

                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium flex items-center gap-1 text-green-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          优势
                        </p>
                        <ul className="space-y-1">
                          {rec.pros.map((pro, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-green-500 mt-0.5 shrink-0">+</span>
                              {pro}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-medium flex items-center gap-1 text-orange-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                          注意事项
                        </p>
                        <ul className="space-y-1">
                          {rec.cons.map((con, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-orange-500 mt-0.5 shrink-0">-</span>
                              {con}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
