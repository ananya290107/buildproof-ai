import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Loader2, Globe, Cpu, GitCompare, Brain } from "lucide-react";

const STEPS = [
  { icon: Globe, label: "Scanning deployment...", duration: 1500 },
  { icon: Cpu, label: "Detecting technologies...", duration: 2000 },
  { icon: GitCompare, label: "Comparing claims...", duration: 1800 },
  { icon: Brain, label: "Generating reasoning...", duration: 2200 },
];

interface AnalysisLoaderProps {
  onComplete: () => void;
}

export default function AnalysisLoader({ onComplete }: AnalysisLoaderProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (currentStep >= STEPS.length) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCurrentStep((s) => s + 1), STEPS[currentStep].duration);
    return () => clearTimeout(timer);
  }, [currentStep, onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
      <motion.div
        className="relative w-24 h-24 rounded-full gradient-border flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      >
        <div className="absolute inset-[2px] rounded-full bg-background flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </motion.div>

      <div className="space-y-4 w-full max-w-sm">
        {STEPS.map((step, i) => {
          const Icon = step.icon;
          const isActive = i === currentStep;
          const isDone = i < currentStep;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.2 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                isDone
                  ? "glass-card text-success"
                  : isActive
                  ? "glass-card text-primary glow"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{step.label}</span>
              {isDone && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="ml-auto text-success text-xs font-bold"
                >
                  ✓
                </motion.span>
              )}
              {isActive && (
                <motion.div
                  className="ml-auto w-2 h-2 rounded-full bg-primary"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.div>
          );
        })}
      </div>

      <p className="text-sm text-muted-foreground animate-pulse">
        Analyzing project authenticity...
      </p>
    </div>
  );
}
