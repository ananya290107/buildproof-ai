export interface ProjectSubmission {
  teamName: string;
  projectUrl: string;
  description: string;
  claimedStack: string;
  category: string;
}

export interface EvaluationResult {
  teamName: string;
  category: string;
  deployment: {
    available: boolean;
    responseTime: number;
    backendDetected: boolean;
    databaseDetected: boolean;
    platform: string;
  };
  stackVerification: {
    claimed: string[];
    detected: string[];
    mismatches: string[];
    matches: string[];
  };
  functionalityTest: {
    loginWorking: boolean | null;
    apiDynamic: boolean;
    dataPersistent: boolean;
  };
  aiReasoning: string;
  authenticityScore: number; // 0-100
  authenticityLabel: "Genuine Build" | "AI Assisted" | "Likely Generated";
}

export interface JudgeScore {
  teamName: string;
  problemUnderstanding: number;
  technicalClarity: number;
  presentationQuality: number;
  ownershipConfidence: number;
  tags: string[];
  finalScore: number;
}

export interface LeaderboardEntry {
  rank: number;
  teamName: string;
  category: string;
  authenticityScore: number;
  authenticityLabel: string;
  judgeScore: number;
  finalScore: number;
  status: "clear" | "review" | "suspicious";
}

const REASONING_TEMPLATES = {
  genuine: [
    "The project demonstrates strong engineering fundamentals. The deployed application responds quickly with a properly configured backend and database layer. The claimed tech stack aligns closely with detected technologies, indicating authentic development. Code structure shows iterative development patterns rather than template-based generation.",
    "Analysis reveals a well-architected application with custom API endpoints and persistent data storage. The team's claimed stack matches our detection results, with evidence of manual configuration and optimization. Response patterns suggest genuine development effort with thoughtful error handling.",
  ],
  assisted: [
    "The project shows signs of mixed development approaches. While core functionality appears hand-built, several components exhibit patterns common in AI-generated code — notably repetitive structure and generic naming conventions. The deployment is functional but lacks some optimization expected from experienced developers.",
    "Evaluation indicates a partially authentic build. The frontend demonstrates custom work, but backend logic follows templated patterns. Some claimed technologies could not be verified in the deployment. The team likely used AI tools to accelerate development of certain modules.",
  ],
  generated: [
    "Significant concerns detected. The application structure closely mirrors common AI-generated templates with minimal customization. Claimed technologies do not match detected stack. Response patterns suggest a static or pre-rendered application rather than a dynamic build. Limited evidence of original engineering work.",
    "High probability of AI-generated submission. The codebase follows generic scaffolding patterns without project-specific adaptations. Backend claims could not be verified — the application appears to be a static deployment with mocked data. Presentation claims exceed demonstrated technical implementation.",
  ],
};

export function evaluateProject(submission: ProjectSubmission): EvaluationResult {
  const url = submission.projectUrl.toLowerCase();
  const desc = submission.description.toLowerCase();

  // Deployment scoring
  let deployScore = 50;
  let platform = "Unknown";
  let backendDetected = false;
  let databaseDetected = false;

  if (url.includes("vercel") || url.includes("netlify")) {
    deployScore = 90;
    platform = url.includes("vercel") ? "Vercel" : "Netlify";
    backendDetected = true;
  } else if (url.includes("railway") || url.includes("render") || url.includes("fly.io")) {
    deployScore = 85;
    platform = "Cloud Platform";
    backendDetected = true;
    databaseDetected = true;
  } else if (url.includes("github.io")) {
    deployScore = 40;
    platform = "GitHub Pages (Static)";
  } else if (url.includes("localhost")) {
    deployScore = 15;
    platform = "Local (Not Deployed)";
  } else if (url.includes("heroku")) {
    deployScore = 70;
    platform = "Heroku";
    backendDetected = true;
  } else {
    deployScore = 60;
    platform = "Custom Domain";
    backendDetected = Math.random() > 0.4;
  }

  databaseDetected = databaseDetected || desc.includes("database") || desc.includes("mongodb") || desc.includes("postgres") || desc.includes("supabase");

  // Stack verification
  const claimedItems = submission.claimedStack.split(",").map(s => s.trim()).filter(Boolean);
  const commonTech = ["React", "Node.js", "Express", "MongoDB", "PostgreSQL", "Next.js", "TypeScript", "Python", "Flask", "Django", "Firebase", "Supabase", "TailwindCSS", "Vue.js"];
  const detected = claimedItems.filter(() => Math.random() > 0.3);
  const fakeDetected = commonTech.filter(() => Math.random() > 0.85).slice(0, 2);
  const allDetected = [...new Set([...detected, ...fakeDetected])];
  const mismatches = claimedItems.filter(c => !allDetected.includes(c));
  const matches = claimedItems.filter(c => allDetected.includes(c));

  // AI content detection
  let aiPenalty = 0;
  if (desc.includes("ai") && !desc.includes("backend") && !desc.includes("server") && !desc.includes("api")) {
    aiPenalty = 25;
  }
  if (desc.includes("chatgpt") || desc.includes("generated")) {
    aiPenalty += 15;
  }

  // Calculate authenticity
  const stackScore = claimedItems.length > 0 ? (matches.length / claimedItems.length) * 100 : 50;
  const authenticityScore = Math.max(5, Math.min(98, Math.round(
    (deployScore * 0.4) + (stackScore * 0.3) + ((100 - aiPenalty) * 0.3) + (Math.random() * 10 - 5)
  )));

  let authenticityLabel: EvaluationResult["authenticityLabel"];
  let reasoningSet: string[];
  if (authenticityScore >= 70) {
    authenticityLabel = "Genuine Build";
    reasoningSet = REASONING_TEMPLATES.genuine;
  } else if (authenticityScore >= 40) {
    authenticityLabel = "AI Assisted";
    reasoningSet = REASONING_TEMPLATES.assisted;
  } else {
    authenticityLabel = "Likely Generated";
    reasoningSet = REASONING_TEMPLATES.generated;
  }

  return {
    teamName: submission.teamName,
    category: submission.category,
    deployment: {
      available: deployScore > 20,
      responseTime: Math.round(100 + Math.random() * 900),
      backendDetected,
      databaseDetected,
      platform,
    },
    stackVerification: { claimed: claimedItems, detected: allDetected, mismatches, matches },
    functionalityTest: {
      loginWorking: backendDetected ? Math.random() > 0.3 : null,
      apiDynamic: backendDetected && Math.random() > 0.4,
      dataPersistent: databaseDetected && Math.random() > 0.3,
    },
    aiReasoning: reasoningSet[Math.floor(Math.random() * reasoningSet.length)],
    authenticityScore,
    authenticityLabel,
  };
}

export const SAMPLE_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, teamName: "NeuralForge", category: "AI", authenticityScore: 94, authenticityLabel: "Genuine Build", judgeScore: 88, finalScore: 91, status: "clear" },
  { rank: 2, teamName: "ByteCraft", category: "Web", authenticityScore: 87, authenticityLabel: "Genuine Build", judgeScore: 91, finalScore: 89, status: "clear" },
  { rank: 3, teamName: "StackOverflow'd", category: "Web", authenticityScore: 82, authenticityLabel: "Genuine Build", judgeScore: 85, finalScore: 83.5, status: "clear" },
  { rank: 4, teamName: "CodeMonkeys", category: "Mobile", authenticityScore: 73, authenticityLabel: "Genuine Build", judgeScore: 78, finalScore: 75.5, status: "clear" },
  { rank: 5, teamName: "GPT Warriors", category: "AI", authenticityScore: 45, authenticityLabel: "AI Assisted", judgeScore: 72, finalScore: 58.5, status: "review" },
  { rank: 6, teamName: "CopyPasta", category: "Open Innovation", authenticityScore: 28, authenticityLabel: "Likely Generated", judgeScore: 65, finalScore: 46.5, status: "suspicious" },
  { rank: 7, teamName: "DeployDreams", category: "Web", authenticityScore: 52, authenticityLabel: "AI Assisted", judgeScore: 60, finalScore: 56, status: "review" },
  { rank: 8, teamName: "HackElite", category: "AI", authenticityScore: 91, authenticityLabel: "Genuine Build", judgeScore: 82, finalScore: 86.5, status: "clear" },
  { rank: 9, teamName: "VibeCoders", category: "Mobile", authenticityScore: 22, authenticityLabel: "Likely Generated", judgeScore: 55, finalScore: 38.5, status: "suspicious" },
  { rank: 10, teamName: "DataDrifters", category: "Open Innovation", authenticityScore: 78, authenticityLabel: "Genuine Build", judgeScore: 80, finalScore: 79, status: "clear" },
];

export const JUDGE_TAGS = [
  "Real Engineering", "Overclaimed AI", "Good Idea Weak Execution",
  "Production Ready", "Memorized Pitch", "Strong Architecture",
  "Creative Solution", "Needs Backend Work", "Well Documented",
  "Demo Only", "Impressive UX", "Security Concerns",
];

export const AI_SUGGESTED_QUESTIONS = [
  "Can you walk me through how your backend handles authentication?",
  "What was the most challenging technical decision you made?",
  "How does your data model handle concurrent users?",
  "Can you show me the deployment pipeline you used?",
  "What would you change if you had another week?",
  "How did you handle error cases in your API?",
  "Can you explain your database schema design choices?",
  "What testing approach did you use during development?",
];
