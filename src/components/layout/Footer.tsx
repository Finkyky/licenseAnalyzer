import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="mt-auto">
      <Separator />
      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-gradient-to-br from-blue-600 to-violet-600 text-white font-bold text-[10px]">
              LA
            </div>
            <span className="text-sm font-medium">License Analyzer</span>
          </div>
          <p className="text-xs text-muted-foreground">
            AI 驱动的开源协议智能助手 &middot; 协议数据来源于 SPDX License List
          </p>
        </div>
      </div>
    </footer>
  );
}
