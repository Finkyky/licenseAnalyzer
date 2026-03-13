import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-transparent to-transparent" />
        <div className="container mx-auto px-4 md:px-8 py-20 md:py-28 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
              AI 驱动 &middot; 开箱即用
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              开源协议
              <span className="text-gradient"> 智能助手 </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              为自己的项目挑选合适的开源协议，或检查引用的开源项目是否存在合规风险
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Link href="/select">
                <Button size="lg" className="w-full sm:w-auto px-8 shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 transition-shadow">
                  为我的项目选协议
                </Button>
              </Link>
              <Link href="/analyze">
                <Button size="lg" variant="outline" className="w-full sm:w-auto px-8">
                  检查开源合规风险
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="container mx-auto px-4 md:px-8 py-16 md:py-20">
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <Card className="group relative overflow-hidden border-0 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600" />
            <CardContent className="p-8 space-y-5">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">协议选择</h3>
                <p className="text-muted-foreground leading-relaxed">
                  我要开源自己的项目，但不知道该选哪个协议？描述你的项目和诉求，AI 帮你推荐最合适的方案。
                </p>
              </div>
              <ul className="space-y-2.5">
                <FeatureItem>根据项目场景智能推荐协议</FeatureItem>
                <FeatureItem>详细解读每个协议的权限和限制</FeatureItem>
                <FeatureItem>一键生成 LICENSE 文件</FeatureItem>
              </ul>
              <Link href="/select">
                <Button className="w-full mt-1 group-hover:shadow-md transition-shadow">
                  为我的项目选协议
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden border-0 shadow-lg shadow-violet-500/5 hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-violet-600" />
            <CardContent className="p-8 space-y-5">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-600"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">合规检查</h3>
                <p className="text-muted-foreground leading-relaxed">
                  我想使用别人的开源项目，会不会有法律风险？上传依赖清单，AI 帮你逐一排查协议合规问题。
                </p>
              </div>
              <ul className="space-y-2.5">
                <FeatureItem>自动识别所有依赖的协议类型</FeatureItem>
                <FeatureItem>检测协议冲突和商用限制</FeatureItem>
                <FeatureItem>给出风险等级和整改建议</FeatureItem>
              </ul>
              <Link href="/analyze">
                <Button variant="outline" className="w-full mt-1 group-hover:shadow-md transition-shadow">
                  检查开源合规风险
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-1.5"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            三步即可完成
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <StepCard
              step={1}
              title="描述你的情况"
              description="描述你的项目需求，或上传 package.json 等依赖文件"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>}
            />
            <StepCard
              step={2}
              title="AI 分析"
              description="内置免费模型开箱即用，也可切换为自己的 DeepSeek、Claude 等"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>}
            />
            <StepCard
              step={3}
              title="获取结果"
              description="查看推荐协议或合规报告，一键下载 LICENSE 文件"
              icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
      {children}
    </li>
  );
}

function StepCard({
  step,
  title,
  description,
  icon,
}: {
  step: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="text-center space-y-4 animate-slide-up" style={{ animationDelay: `${(step - 1) * 100}ms` }}>
      <div className="relative mx-auto w-fit">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
          {icon}
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-primary text-primary flex items-center justify-center text-xs font-bold shadow-sm">
          {step}
        </div>
      </div>
      <h3 className="font-semibold text-lg">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
