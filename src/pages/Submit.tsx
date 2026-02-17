import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/GlassCard";
import AnalysisLoader from "@/components/AnalysisLoader";
import { evaluateProject, type ProjectSubmission } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Submit() {
  const navigate = useNavigate();
  const [form, setForm] = useState<ProjectSubmission>({
    teamName: "",
    projectUrl: "",
    description: "",
    claimedStack: "",
    category: "",
  });
  const [analyzing, setAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.teamName || !form.projectUrl || !form.category) return;
    setAnalyzing(true);
  };

  const handleComplete = useCallback(() => {
    const result = evaluateProject(form);
    // Store result for the report page
    sessionStorage.setItem("buildproof-result", JSON.stringify(result));
    navigate("/report");
  }, [form, navigate]);

  if (analyzing) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24">
          <AnalysisLoader onComplete={handleComplete} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-20 max-w-xl">
        <h1 className="text-3xl font-bold mb-2">Submit Project</h1>
        <p className="text-muted-foreground mb-8">Enter project details for AI-powered verification.</p>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                placeholder="e.g. NeuralForge"
                value={form.teamName}
                onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                className="mt-1.5 bg-secondary border-border"
              />
            </div>

            <div>
              <Label htmlFor="projectUrl">Project URL</Label>
              <Input
                id="projectUrl"
                placeholder="e.g. https://myproject.vercel.app"
                value={form.projectUrl}
                onChange={(e) => setForm({ ...form, projectUrl: e.target.value })}
                className="mt-1.5 bg-secondary border-border"
              />
            </div>

            <div>
              <Label htmlFor="description">PPT Description / Project Summary</Label>
              <Textarea
                id="description"
                placeholder="Describe what the project does, key features, and how it was built..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1.5 bg-secondary border-border min-h-[100px]"
              />
            </div>

            <div>
              <Label htmlFor="stack">Claimed Tech Stack</Label>
              <Input
                id="stack"
                placeholder="e.g. React, Node.js, MongoDB, TensorFlow"
                value={form.claimedStack}
                onChange={(e) => setForm({ ...form, claimedStack: e.target.value })}
                className="mt-1.5 bg-secondary border-border"
              />
              <p className="text-xs text-muted-foreground mt-1">Comma-separated list</p>
            </div>

            <div>
              <Label>Category</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="mt-1.5 bg-secondary border-border">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AI">AI / ML</SelectItem>
                  <SelectItem value="Web">Web Development</SelectItem>
                  <SelectItem value="Mobile">Mobile</SelectItem>
                  <SelectItem value="Open Innovation">Open Innovation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <button
              type="submit"
              className="w-full gradient-bg text-primary-foreground py-3 rounded-xl font-semibold text-base hover:opacity-90 transition-opacity glow"
            >
              ANALYZE PROJECT
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
