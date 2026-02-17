import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/GlassCard";
import AuthenticityGauge from "@/components/AuthenticityGauge";
import { Slider } from "@/components/ui/slider";
import { JUDGE_TAGS, type EvaluationResult } from "@/lib/mockData";
import { X } from "lucide-react";

export default function Judge() {
  const navigate = useNavigate();
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [scores, setScores] = useState({
    problemUnderstanding: 50,
    technicalClarity: 50,
    presentationQuality: 50,
    ownershipConfidence: 50,
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("buildproof-result");
    if (!stored) {
      navigate("/submit");
      return;
    }
    setResult(JSON.parse(stored));
  }, [navigate]);

  const judgeAvg = Math.round(
    (scores.problemUnderstanding + scores.technicalClarity + scores.presentationQuality + scores.ownershipConfidence) / 4
  );
  const finalScore = result ? Math.round((result.authenticityScore + judgeAvg) / 2) : 0;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitScore = () => {
    if (!result) return;
    // Add to leaderboard in session
    const entry = {
      rank: 0,
      teamName: result.teamName,
      category: result.category,
      authenticityScore: result.authenticityScore,
      authenticityLabel: result.authenticityLabel,
      judgeScore: judgeAvg,
      finalScore,
      status: result.authenticityScore >= 70 ? "clear" : result.authenticityScore >= 40 ? "review" : "suspicious",
    };
    const existing = JSON.parse(sessionStorage.getItem("buildproof-leaderboard-extra") || "[]");
    existing.push(entry);
    sessionStorage.setItem("buildproof-leaderboard-extra", JSON.stringify(existing));
    navigate("/leaderboard");
  };

  if (!result) return null;

  const sliders: { key: keyof typeof scores; label: string }[] = [
    { key: "problemUnderstanding", label: "Problem Understanding" },
    { key: "technicalClarity", label: "Technical Clarity" },
    { key: "presentationQuality", label: "Presentation Quality" },
    { key: "ownershipConfidence", label: "Ownership Confidence" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-20 max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">Judge Panel</h1>
        <p className="text-muted-foreground mb-8">
          Scoring <span className="text-foreground font-semibold">{result.teamName}</span>
        </p>

        {/* Live score preview */}
        <GlassCard className="mb-8 gradient-border">
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
            <AuthenticityGauge score={result.authenticityScore} label="AI Score" size="sm" />
            <AuthenticityGauge score={judgeAvg} label="Judge Score" size="sm" />
            <div className="text-center">
              <motion.div
                key={finalScore}
                initial={{ scale: 1.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-4xl font-bold gradient-text"
              >
                {finalScore}
              </motion.div>
              <p className="text-xs text-muted-foreground mt-1">Final Score</p>
            </div>
          </div>
        </GlassCard>

        {/* Sliders */}
        <GlassCard className="mb-6">
          <h3 className="text-base font-semibold mb-6">Scoring Criteria</h3>
          <div className="space-y-6">
            {sliders.map(({ key, label }) => (
              <div key={key}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">{label}</span>
                  <span className="text-sm font-semibold text-primary">{scores[key]}</span>
                </div>
                <Slider
                  value={[scores[key]]}
                  onValueChange={([v]) => setScores((s) => ({ ...s, [key]: v }))}
                  min={0}
                  max={100}
                  step={1}
                  className="cursor-pointer"
                />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Tags */}
        <GlassCard className="mb-6">
          <h3 className="text-base font-semibold mb-4">Evaluation Tags</h3>
          <div className="flex flex-wrap gap-2">
            {JUDGE_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    active
                      ? "gradient-bg text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-muted"
                  }`}
                >
                  {tag}
                  {active && <X className="w-3 h-3 inline ml-1" />}
                </button>
              );
            })}
          </div>
        </GlassCard>

        <button
          onClick={handleSubmitScore}
          className="w-full gradient-bg text-primary-foreground py-3.5 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity glow"
        >
          Submit Score & View Leaderboard
        </button>
      </div>
    </div>
  );
}
