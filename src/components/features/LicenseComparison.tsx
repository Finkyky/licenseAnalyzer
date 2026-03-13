"use client";

import { ComparisonResult } from "@/types/license";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LicenseComparisonProps {
  comparison: ComparisonResult;
}

export function LicenseComparison({ comparison }: LicenseComparisonProps) {
  if (!comparison.dimensions.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-3 opacity-40"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
        暂无对比数据
      </div>
    );
  }

  const permissionDims = comparison.dimensions.filter((d) =>
    ["commercial", "modification", "distribution", "patentUse", "privateUse", "sublicense"].includes(d.key)
  );
  const conditionDims = comparison.dimensions.filter((d) =>
    ["discloseSource", "includeLicense", "includeCopyright", "stateChanges", "networkUse", "sameLicense"].includes(d.key)
  );
  const limitationDims = comparison.dimensions.filter((d) =>
    ["liability", "warranty"].includes(d.key)
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/></svg>
        <h3 className="text-lg font-semibold">协议对比</h3>
      </div>

      <ComparisonSection
        title="权限 (Permissions)"
        description="协议允许的操作"
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
        iconColor="text-green-500"
        borderColor="border-t-green-500"
        dimensions={permissionDims}
        licenses={comparison.licenses}
        trueLabel="允许"
        falseLabel="不允许"
        trueColor="bg-green-500/10 text-green-700"
        falseColor="bg-muted text-muted-foreground"
      />

      <ComparisonSection
        title="条件 (Conditions)"
        description="使用协议需要满足的条件"
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>}
        iconColor="text-blue-500"
        borderColor="border-t-blue-500"
        dimensions={conditionDims}
        licenses={comparison.licenses}
        trueLabel="要求"
        falseLabel="不要求"
        trueColor="bg-blue-500/10 text-blue-700"
        falseColor="bg-muted text-muted-foreground"
      />

      <ComparisonSection
        title="限制 (Limitations)"
        description="协议的限制条款"
        icon={<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>}
        iconColor="text-orange-500"
        borderColor="border-t-orange-500"
        dimensions={limitationDims}
        licenses={comparison.licenses}
        trueLabel="有"
        falseLabel="无"
        trueColor="bg-orange-500/10 text-orange-700"
        falseColor="bg-muted text-muted-foreground"
      />
    </div>
  );
}

function ComparisonSection({
  title,
  description,
  icon,
  iconColor,
  borderColor,
  dimensions,
  licenses,
  trueLabel,
  falseLabel,
  trueColor,
  falseColor,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  borderColor: string;
  dimensions: ComparisonResult["dimensions"];
  licenses: string[];
  trueLabel: string;
  falseLabel: string;
  trueColor: string;
  falseColor: string;
}) {
  if (!dimensions.length) return null;

  return (
    <Card className={`shadow-sm overflow-hidden border-t-2 ${borderColor}`}>
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <span className={iconColor}>{icon}</span>
          <span>{title}</span>
          <span className="text-xs font-normal text-muted-foreground">{description}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[140px] text-xs">维度</TableHead>
                {licenses.map((l) => (
                  <TableHead key={l} className="text-center min-w-[100px] text-xs font-semibold">
                    {l}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dimensions.map((dim) => (
                <TableRow key={dim.key}>
                  <TableCell className="font-medium text-xs">{dim.label}</TableCell>
                  {licenses.map((l) => {
                    const val = dim.values[l];
                    return (
                      <TableCell key={l} className="text-center">
                        {typeof val === "boolean" ? (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            val ? trueColor : falseColor
                          }`}>
                            {val ? trueLabel : falseLabel}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {val}
                          </span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
