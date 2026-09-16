import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Crosshair, Zap, Users } from "lucide-react";

const expansions = [
  "Incentive models for technical staff",
  "Story point compensation framework",
  "Outcome-based salary structures",
  "Engineering bonus & equity plans",
  "Performance-linked pay for developers",
];

interface VectorHit {
  id: number;
  label: string;
  queryIdx: number;
  x: number;
  y: number;
}

const vectorHits: VectorHit[] = [
  { id: 1, label: "Bonus policy doc", queryIdx: 0, x: 18, y: 25 },
  { id: 2, label: "Tech ladder guide", queryIdx: 0, x: 24, y: 32 },
  { id: 3, label: "SP valuation memo", queryIdx: 1, x: 55, y: 20 },
  { id: 4, label: "Sprint velocity pay", queryIdx: 1, x: 60, y: 28 },
  { id: 5, label: "OKR-linked comp", queryIdx: 2, x: 75, y: 60 },
  { id: 6, label: "Outcome metrics v2", queryIdx: 2, x: 80, y: 52 },
  { id: 7, label: "Equity vesting sched", queryIdx: 3, x: 30, y: 70 },
  { id: 8, label: "RSU refresh policy", queryIdx: 3, x: 35, y: 78 },
  { id: 9, label: "Perf review rubric", queryIdx: 4, x: 65, y: 75 },
  { id: 10, label: "Dev tier benchmarks", queryIdx: 4, x: 58, y: 82 },
];

const queryColors = [
  "text-primary border-primary/30 bg-primary/10",
  "text-accent border-accent/30 bg-accent/10",
  "text-success border-success/30 bg-success/10",
  "text-warning border-warning/30 bg-warning/10",
  "text-destructive border-destructive/30 bg-destructive/10",
];

const dotColors = [
  "bg-primary shadow-[0_0_8px_hsl(var(--primary)/0.5)]",
  "bg-accent shadow-[0_0_8px_hsl(var(--accent)/0.5)]",
  "bg-success shadow-[0_0_8px_hsl(var(--success)/0.5)]",
  "bg-warning shadow-[0_0_8px_hsl(var(--warning)/0.5)]",
  "bg-destructive shadow-[0_0_8px_hsl(var(--destructive)/0.5)]",
];

const ringColors = [
  "border-primary/20",
  "border-accent/20",
  "border-success/20",
  "border-warning/20",
  "border-destructive/20",
];

type Phase = "idle" | "expanding" | "scattered" | "merging" | "done";

const MultiQuerySlide = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [visibleQueries, setVisibleQueries] = useState(0);
  const [hitRate, setHitRate] = useState(0);

  const run = () => {
    setPhase("expanding");
    setVisibleQueries(0);
    setHitRate(0);
  };

  // Expand queries one by one
  useEffect(() => {
    if (phase !== "expanding") return;
    if (visibleQueries >= expansions.length) {
      setTimeout(() => setPhase("scattered"), 600);
      return;
    }
    const t = setTimeout(() => setVisibleQueries((v) => v + 1), 350);
    return () => clearTimeout(t);
  }, [phase, visibleQueries]);

  // After scatter, go straight to done
  useEffect(() => {
    if (phase !== "scattered") return;
    const t = setTimeout(() => setPhase("done"), 2000);
    return () => clearTimeout(t);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    const target = 94;
    const step = () => setHitRate((h) => (h < target ? h + 2 : target));
    const id = setInterval(step, 30);
    return () => clearInterval(id);
  }, [phase]);

  const showScatter = ["scattered", "done"].includes(phase);

  return (
    <section id="multi-query" className="min-h-screen flex items-center py-24 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-sm font-mono text-primary mb-3 tracking-wider">
          Section 09
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">
          Multi-Query Retrieval
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg mb-12 max-w-2xl">
          The shotgun approach — one prompt becomes many queries, each finding unique chunks a single search would miss.
        </motion.p>

        <div className="glass-panel rounded-2xl p-8">
          {/* Prompt → Expansion */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row items-start gap-4">
              {/* Original prompt */}
              <div className="glass-panel-strong rounded-xl px-5 py-3 font-mono text-sm text-foreground shrink-0 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-muted-foreground" />
                "How do we pay engineers?"
              </div>

              {phase !== "idle" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary text-2xl pt-1 hidden md:block">
                  →
                </motion.div>
              )}

              {/* Expanded queries */}
              <div className="flex flex-wrap gap-2 flex-1">
                <AnimatePresence>
                  {phase !== "idle" &&
                    expansions.slice(0, visibleQueries).map((q, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.5, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-mono ${queryColors[i]}`}
                      >
                        {q}
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Vector scatter / radar */}
          <div className="grid md:grid-cols-[1fr,200px] gap-6">
            <div className="glass-panel-strong rounded-xl p-4 relative overflow-hidden" style={{ minHeight: 340 }}>
              {/* Sonar rings */}
              {showScatter && phase !== "done" && (
                <>
                  {[30, 50, 70].map((size) => (
                    <motion.div
                      key={size}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0.15, 0.05, 0.15], scale: 1 }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className="absolute border border-primary/10 rounded-full"
                      style={{
                        width: `${size}%`,
                        height: `${size}%`,
                        left: `${50 - size / 2}%`,
                        top: `${50 - size / 2}%`,
                      }}
                    />
                  ))}
                </>
              )}

              {/* Grid */}
              <div className="absolute inset-0 grid-pattern opacity-10 rounded-xl" />

              {/* Hits */}
              <AnimatePresence>
                {showScatter &&
                  vectorHits.map((hit) => {
                    return (
                      <motion.div
                        key={hit.id}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ type: "spring", bounce: 0.2 }}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${hit.x}%`, top: `${hit.y}%` }}
                      >
                        <div className={`w-3 h-3 rounded-full ${dotColors[hit.queryIdx]}`} />
                        <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-muted-foreground whitespace-nowrap">
                          {hit.label}
                        </span>
                      </motion.div>
                    );
                  })}
              </AnimatePresence>

              {/* Legend */}
              {showScatter && (
                <div className="absolute bottom-3 left-3 flex gap-3">
                  {expansions.map((_, i) => (
                    <div key={i} className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${dotColors[i]}`} />
                      <span className="text-[9px] font-mono text-muted-foreground">Q{i + 1}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Accuracy meter */}
            <div className="space-y-4">
              <div className="glass-panel rounded-xl p-4 text-center">
                <h4 className="font-mono text-xs text-muted-foreground mb-3">Hit Rate</h4>
                <div className="relative w-24 h-24 mx-auto mb-2">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--border))" strokeWidth="6" opacity="0.2" />
                    <motion.circle
                      cx="50" cy="50" r="42" fill="none"
                      stroke="hsl(var(--success))"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 42}
                      strokeDashoffset={2 * Math.PI * 42 * (1 - hitRate / 100)}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-lg text-success font-bold">
                    {hitRate}%
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  vs. <span className="text-foreground/60">~80%</span> single-query
                </p>
              </div>

              <div className="glass-panel rounded-xl p-4 text-center">
                <Zap className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="text-primary font-semibold">+10-15%</span> retrieval accuracy by covering blind spots a single query misses.
                </p>
              </div>
            </div>
          </div>

          {/* Button */}
          <button
            onClick={() => (phase === "done" ? setPhase("idle") : run())}
            disabled={phase !== "idle" && phase !== "done"}
            className="w-full mt-6 rounded-xl py-3 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {phase === "done" ? "Replay" : phase === "idle" ? "Fire Multi-Query" : "Processing…"}
          </button>

          {/* Management parallel */}
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-6 glass-panel rounded-xl p-5">
            <div className="flex items-start gap-2 mb-2">
              <Users className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <h4 className="font-mono text-sm font-semibold text-accent">The Management Parallel</h4>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This is <em>Multi-Perspective Analysis</em> — you don't just ask one person for their opinion. You ask the same question to{" "}
              <span className="text-primary">Sales</span>, <span className="text-accent">Engineering</span>, and{" "}
              <span className="text-success">Product</span> to get the full context before making a decision.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MultiQuerySlide;
