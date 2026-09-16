import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Search, Hash, Brain, Blend, ChevronRight, CheckCircle, XCircle, Info } from "lucide-react";

interface Result {
  label: string;
  score: number;
  exact?: boolean;
}

const vectorResults: Result[] = [
  { label: "Hardware component catalog", score: 0.92 },
  { label: "TX-series specifications", score: 0.87 },
  { label: "Related connectors & adapters", score: 0.81 },
  { label: "Part #TX-99 datasheet", score: 0.74, exact: true },
  { label: "Maintenance schedule docs", score: 0.68 },
];

const keywordResults: Result[] = [
  { label: "Part #TX-99 datasheet", score: 1.0, exact: true },
  { label: "TX-99 revision history", score: 0.95, exact: true },
  { label: "Invoice #TX-990 (false hit)", score: 0.6 },
];

const fusedResults: Result[] = [
  { label: "Part #TX-99 datasheet", score: 0.97, exact: true },
  { label: "TX-99 revision history", score: 0.91, exact: true },
  { label: "TX-series specifications", score: 0.84 },
  { label: "Hardware component catalog", score: 0.78 },
  { label: "Related connectors & adapters", score: 0.65 },
];

type Phase = "idle" | "searching" | "vector" | "keyword" | "fusing" | "fused";

const HybridSearchSlide = () => {
  const [phase, setPhase] = useState<Phase>("idle");

  const runSearch = () => {
    setPhase("searching");
    setTimeout(() => setPhase("vector"), 800);
    setTimeout(() => setPhase("keyword"), 1600);
    setTimeout(() => setPhase("fusing"), 2400);
    setTimeout(() => setPhase("fused"), 3200);
  };

  const showVector = ["vector", "keyword", "fusing", "fused"].includes(phase);
  const showKeyword = ["keyword", "fusing", "fused"].includes(phase);
  const showFused = phase === "fused";
  const isFusing = phase === "fusing";

  return (
    <section id="hybrid-search" className="min-h-screen flex items-center py-24 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-sm font-mono text-primary mb-3 tracking-wider"
        >
          Section 07
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Hybrid Search
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg mb-12 max-w-2xl"
        >
          Why meaning isn't always enough—combining semantic understanding with lexical precision.
        </motion.p>

        {/* Query bar */}
        <div className="glass-panel rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="flex-1 glass-panel-strong rounded-xl px-4 py-3 font-mono text-sm flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">"Find part #TX-99"</span>
            </div>
            <button
              onClick={() => (phase === "fused" ? setPhase("idle") : runSearch())}
              disabled={phase !== "idle" && phase !== "fused"}
              className="rounded-xl px-6 py-3 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {phase === "fused" ? "Reset" : phase === "idle" ? "Search" : "Searching…"}
            </button>
          </div>

          {/* Dual tracks */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Vector track */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-accent" />
                <h3 className="font-mono text-sm font-semibold text-accent">Track A — Semantic Meaning</h3>
              </div>
              <div className={`glass-panel-strong rounded-xl p-4 min-h-[220px] transition-all ${showVector ? "ring-1 ring-accent/30" : ""}`}>
                <AnimatePresence>
                  {showVector ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      {vectorResults.map((r, i) => (
                        <motion.div
                          key={r.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between text-xs font-mono"
                        >
                          <span className={r.exact ? "text-success" : "text-muted-foreground"}>{r.label}</span>
                          <span className="text-accent/70">{r.score.toFixed(2)}</span>
                        </motion.div>
                      ))}
                      <p className="text-[10px] text-muted-foreground/60 mt-3 pt-2 border-t border-border/20">
                        Finds <em>related</em> concepts but buries the exact ID at rank #4
                      </p>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 py-8">
                      <Brain className="w-8 h-8 mb-2" />
                      <span className="text-xs">Vector search</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Keyword track */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-warning" />
                <h3 className="font-mono text-sm font-semibold text-warning">Track B — Lexical Precision</h3>
              </div>
              <div className={`glass-panel-strong rounded-xl p-4 min-h-[220px] transition-all ${showKeyword ? "ring-1 ring-warning/30" : ""}`}>
                <AnimatePresence>
                  {showKeyword ? (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                      {keywordResults.map((r, i) => (
                        <motion.div
                          key={r.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="flex items-center justify-between text-xs font-mono"
                        >
                          <span className="flex items-center gap-1">
                            {r.exact ? (
                              <CheckCircle className="w-3 h-3 text-success" />
                            ) : (
                              <XCircle className="w-3 h-3 text-destructive/50" />
                            )}
                            <span className={r.exact ? "text-success" : "text-muted-foreground/50"}>{r.label}</span>
                          </span>
                          <span className="text-warning/70">{r.score.toFixed(2)}</span>
                        </motion.div>
                      ))}
                      <p className="text-[10px] text-muted-foreground/60 mt-3 pt-2 border-t border-border/20">
                        Hits the exact string <code className="text-warning">"TX-99"</code> instantly
                      </p>
                    </motion.div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground/30 py-8">
                      <Hash className="w-8 h-8 mb-2" />
                      <span className="text-xs">Keyword search</span>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* RRF Fusion */}
          <AnimatePresence>
            {(isFusing || showFused) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Blend className={`w-5 h-5 ${isFusing ? "animate-spin" : ""}`} />
                  <h3 className="font-mono text-sm font-semibold">
                    Reciprocal Rank Fusion (RRF)
                  </h3>
                  {showFused && <CheckCircle className="w-4 h-4 text-success" />}
                </div>

                {showFused && (
                  <div className="glass-panel-strong rounded-xl p-4">
                    <div className="space-y-2">
                      {fusedResults.map((r, i) => (
                        <motion.div
                          key={r.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          className="flex items-center gap-3 text-xs font-mono"
                        >
                          <span className="text-muted-foreground/50 w-4">#{i + 1}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-border/20 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${r.score * 100}%` }}
                              transition={{ delay: i * 0.08 + 0.2, duration: 0.4 }}
                              className={`h-full rounded-full ${r.exact ? "bg-success" : "bg-primary/60"}`}
                            />
                          </div>
                          <span className={r.exact ? "text-success" : "text-foreground/70"}>{r.label}</span>
                          <span className="text-primary/60">{r.score.toFixed(2)}</span>
                        </motion.div>
                      ))}
                    </div>
                    <p className="text-[10px] text-muted-foreground/60 mt-3 pt-2 border-t border-border/20">
                      Exact matches promoted to top — semantic context preserved below
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Logic section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid md:grid-cols-2 gap-4"
          >
            <div className="glass-panel rounded-xl p-5">
              <div className="flex items-start gap-2 mb-2">
                <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <h4 className="font-mono text-sm font-semibold text-primary">Why It Matters</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Semantic search excels at <em>"What is this?"</em> — understanding intent and meaning. But keyword search is essential for{" "}
                <em>"Find exactly this ID"</em> — where precision beats interpretation.
              </p>
            </div>
            <div className="glass-panel rounded-xl p-5">
              <div className="flex items-start gap-2 mb-2">
                <ChevronRight className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <h4 className="font-mono text-sm font-semibold text-accent">The Management Link</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Just like a manager needs both a <span className="text-accent">Visionary</span> (Semantic) and a{" "}
                <span className="text-warning">Detail-Oriented specialist</span> (Keyword) to get a project right — hybrid search combines both lenses.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HybridSearchSlide;
