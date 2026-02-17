import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Globe, Server, Database, CheckCircle2, XCircle, AlertTriangle,
  ChevronDown, ChevronUp, Lightbulb,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/GlassCard";
import AuthenticityGauge from "@/components/AuthenticityGauge";
import { type EvaluationResult, AI_SUGGESTED_QUESTIONS } from "@/lib/mockData";

function StatusIcon({ value }: { value: boolean | null }) {
  if (value === null) return <AlertTriangle className="w-4 h-4 text-warning" />;
  return value
    ? <CheckCircle2 className="w-4 h-4 text-success" />
    : <XCircle className="w-4 h-4 text-suspicious" />;
}

function StatusRow({ label, value, detail }: { label: string; value: boolean | null; detail?: string }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <StatusIcon value={value} />
        <span className="text-sm">{label}</span>
      </div>
      {detail && <span className="text-xs text-muted-foreground">{detail}</span>}
    </div>
  );
}

export default function Report() {
  const navigate = useNavigate();
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const [questionsOpen, setQuestionsOpen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("buildproof-result");
    if (!stored) {
      navigate("/submit");
      return;
    }
    setResult(JSON.parse(stored));
  }, [navigate]);

  if (!result) return null;

  const d = result.deployment;
  const s = result.stackVerification;
  const f = result.functionalityTest;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-20 max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Evaluation Report</p>
            <h1 className="text-3xl font-bold">{result.teamName}</h1>
            <span className="text-xs bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground mt-2 inline-block">
              {result.category}
            </span>
          </div>
          <button
            onClick={() => navigate("/judge")}
            className="gradient-bg text-primary-foreground px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Open Judge Panel →
          </button>
        </div>

        {/* Authenticity Index — Big */}
        <GlassCard className="mb-6 flex flex-col items-center py-10 gradient-border">
          <h2 className="text-lg font-semibold mb-6 text-muted-foreground">Authenticity Index</h2>
          <AuthenticityGauge score={result.authenticityScore} label={result.authenticityLabel} size="lg" />
        </GlassCard>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Deployment */}
          <GlassCard>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" /> Deployment Status
            </h3>
            <StatusRow label="Application Available" value={d.available} />
            <StatusRow label="Response Time" value={d.responseTime < 500} detail={`${d.responseTime}ms`} />
            <StatusRow label="Backend Detected" value={d.backendDetected} detail={d.backendDetected ? "Yes" : "No"} />
            <StatusRow label="Database Detected" value={d.databaseDetected} />
            <div className="mt-3 pt-3 border-t border-border">
              <span className="text-xs text-muted-foreground">Platform: </span>
              <span className="text-xs font-medium">{d.platform}</span>
            </div>
          </GlassCard>

          {/* Functionality */}
          <GlassCard>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
              <Server className="w-4 h-4 text-primary" /> Functionality Test
            </h3>
            <StatusRow label="Login Working" value={f.loginWorking} detail={f.loginWorking === null ? "N/A" : undefined} />
            <StatusRow label="API Dynamic" value={f.apiDynamic} />
            <StatusRow label="Data Persistent" value={f.dataPersistent} />
          </GlassCard>
        </div>

        {/* Stack Verification */}
        <GlassCard className="mb-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" /> Stack Verification
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-muted-foreground mb-2">Claimed Stack</p>
              <div className="flex flex-wrap gap-2">
                {s.claimed.map((t) => (
                  <span
                    key={t}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                      s.matches.includes(t)
                        ? "bg-success/15 text-success"
                        : "bg-suspicious/15 text-suspicious"
                    }`}
                  >
                    {t} {s.matches.includes(t) ? "✓" : "✗"}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-2">Detected Stack</p>
              <div className="flex flex-wrap gap-2">
                {s.detected.map((t) => (
                  <span key={t} className="px-2.5 py-1 rounded-md text-xs font-medium bg-primary/15 text-primary">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>
          {s.mismatches.length > 0 && (
            <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
              <p className="text-xs text-warning font-medium">
                ⚠ Mismatches detected: {s.mismatches.join(", ")}
              </p>
            </div>
          )}
        </GlassCard>

        {/* AI Reasoning */}
        <GlassCard className="mb-6">
          <button
            onClick={() => setReasoningOpen(!reasoningOpen)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-primary" /> AI Reasoning Trace
            </h3>
            {reasoningOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {reasoningOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 text-sm text-muted-foreground leading-relaxed"
            >
              {result.aiReasoning}
            </motion.div>
          )}
        </GlassCard>

        {/* AI Suggested Questions */}
        <GlassCard>
          <button
            onClick={() => setQuestionsOpen(!questionsOpen)}
            className="w-full flex items-center justify-between"
          >
            <h3 className="text-base font-semibold flex items-center gap-2">
              🧠 AI Suggested Questions for Judges
            </h3>
            {questionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {questionsOpen && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 space-y-2"
            >
              {AI_SUGGESTED_QUESTIONS.map((q, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary mt-0.5">→</span>
                  {q}
                </li>
              ))}
            </motion.ul>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
