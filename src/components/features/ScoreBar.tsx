"use client";

interface ScoreBarProps {
  score: number;
  label?: string;
}

export function ScoreBar({ score, label }: ScoreBarProps) {
  const getColor = (s: number) => {
    if (s >= 80) return "from-green-500 to-emerald-500";
    if (s >= 60) return "from-blue-500 to-cyan-500";
    if (s >= 40) return "from-yellow-500 to-orange-500";
    return "from-orange-500 to-red-500";
  };

  const getTextColor = (s: number) => {
    if (s >= 80) return "text-green-600";
    if (s >= 60) return "text-blue-600";
    if (s >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="flex items-center gap-3">
      {label && <span className="text-sm text-muted-foreground min-w-[60px]">{label}</span>}
      <div className="flex-1 relative h-2.5 bg-muted rounded-full overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${getColor(score)} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <span className={`text-sm font-bold min-w-[40px] text-right ${getTextColor(score)}`}>
        {score}
      </span>
    </div>
  );
}
