import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import GlassCard from "@/components/GlassCard";
import { SAMPLE_LEADERBOARD, type LeaderboardEntry } from "@/lib/mockData";
import { Trophy, AlertTriangle, Filter } from "lucide-react";

type FilterType = "all" | "clear" | "review" | "suspicious";
type CategoryFilter = "all" | "AI" | "Web" | "Mobile" | "Open Innovation";

const STATUS_STYLES: Record<string, string> = {
  clear: "bg-success/15 text-success",
  review: "bg-warning/15 text-warning",
  suspicious: "bg-suspicious/15 text-suspicious",
};

export default function Leaderboard() {
  const [statusFilter, setStatusFilter] = useState<FilterType>("all");
  const [catFilter, setCatFilter] = useState<CategoryFilter>("all");

  const allEntries = useMemo(() => {
    const extra: LeaderboardEntry[] = JSON.parse(
      sessionStorage.getItem("buildproof-leaderboard-extra") || "[]"
    );
    const merged = [...SAMPLE_LEADERBOARD, ...extra];
    merged.sort((a, b) => b.finalScore - a.finalScore);
    return merged.map((e, i) => ({ ...e, rank: i + 1 }));
  }, []);

  const filtered = useMemo(() => {
    return allEntries.filter((e) => {
      if (statusFilter !== "all" && e.status !== statusFilter) return false;
      if (catFilter !== "all" && e.category !== catFilter) return false;
      return true;
    });
  }, [allEntries, statusFilter, catFilter]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-28 pb-20 max-w-5xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Trophy className="w-7 h-7 text-primary" /> Leaderboard
            </h1>
            <p className="text-muted-foreground text-sm mt-1">{allEntries.length} teams ranked</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-muted-foreground" />
            {(["all", "clear", "review", "suspicious"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                  statusFilter === f ? "gradient-bg text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-muted"
                }`}
              >
                {f === "all" ? "All" : f}
              </button>
            ))}
            <select
              value={catFilter}
              onChange={(e) => setCatFilter(e.target.value as CategoryFilter)}
              className="bg-secondary text-secondary-foreground text-xs px-3 py-1.5 rounded-full border-none outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="AI">AI</option>
              <option value="Web">Web</option>
              <option value="Mobile">Mobile</option>
              <option value="Open Innovation">Open Innovation</option>
            </select>
          </div>
        </div>

        <GlassCard className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="text-left p-4 w-12">#</th>
                  <th className="text-left p-4">Team</th>
                  <th className="text-left p-4 hidden sm:table-cell">Category</th>
                  <th className="text-center p-4">Authenticity</th>
                  <th className="text-center p-4">Judge</th>
                  <th className="text-center p-4">Final</th>
                  <th className="text-center p-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry, i) => (
                  <motion.tr
                    key={entry.teamName + i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-border/50 hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4 font-bold text-muted-foreground">
                      {entry.rank <= 3 ? (
                        <span className="gradient-text">{entry.rank}</span>
                      ) : (
                        entry.rank
                      )}
                    </td>
                    <td className="p-4 font-semibold">{entry.teamName}</td>
                    <td className="p-4 hidden sm:table-cell text-muted-foreground">{entry.category}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`${
                          entry.authenticityScore >= 70
                            ? "text-success"
                            : entry.authenticityScore >= 40
                            ? "text-warning"
                            : "text-suspicious"
                        } font-semibold`}
                      >
                        {entry.authenticityScore}
                      </span>
                    </td>
                    <td className="p-4 text-center font-medium">{entry.judgeScore}</td>
                    <td className="p-4 text-center font-bold gradient-text">{entry.finalScore}</td>
                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[entry.status]}`}>
                        {entry.status === "suspicious" && <AlertTriangle className="w-3 h-3 inline mr-1" />}
                        {entry.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              No teams match the current filters.
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
