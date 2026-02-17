import { motion } from "framer-motion";

interface AuthenticityGaugeProps {
  score: number;
  label: string;
  size?: "sm" | "lg";
}

export default function AuthenticityGauge({ score, label, size = "lg" }: AuthenticityGaugeProps) {
  const isLg = size === "lg";
  const radius = isLg ? 90 : 50;
  const stroke = isLg ? 10 : 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const svgSize = (radius + stroke) * 2;

  const color =
    score >= 70 ? "hsl(var(--success))" :
    score >= 40 ? "hsl(var(--warning))" :
    "hsl(var(--suspicious))";

  const bgColor =
    score >= 70 ? "hsl(var(--success) / 0.15)" :
    score >= 40 ? "hsl(var(--warning) / 0.15)" :
    "hsl(var(--suspicious) / 0.15)";

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: svgSize, height: svgSize }}>
        <svg width={svgSize} height={svgSize} className="-rotate-90">
          <circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={radius + stroke}
            cy={radius + stroke}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - progress }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            style={{ filter: `drop-shadow(0 0 8px ${color})` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className={`font-bold ${isLg ? "text-4xl" : "text-xl"}`}
            style={{ color }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {score}
          </motion.span>
          {isLg && <span className="text-xs text-muted-foreground mt-1">/ 100</span>}
        </div>
      </div>
      <div
        className={`px-4 py-1.5 rounded-full text-sm font-semibold ${isLg ? "text-base" : "text-xs"}`}
        style={{ backgroundColor: bgColor, color }}
      >
        {label}
      </div>
    </div>
  );
}
