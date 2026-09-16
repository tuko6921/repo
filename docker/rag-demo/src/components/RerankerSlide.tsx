import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, CheckCircle, XCircle, Star, AlertTriangle, Zap } from "lucide-react";

interface Chunk {
  id: number;
  label: string;
  vectorRank: number;
  rerankScore: number;
  relevant: boolean;
  misleading?: boolean;
}

const initialChunks: Chunk[] = [
  { id: 1, label: "Solar panel voltage specs (2024)", vectorRank: 1, rerankScore: 0.62, relevant: false, misleading: true },
  { id: 2, label: "Inverter wiring diagram TX-99", vectorRank: 2, rerankScore: 0.91, relevant: true },
  { id: 3, label: "Solar panel cleaning schedule", vectorRank: 3, rerankScore: 0.28, relevant: false, misleading: true },
  { id: 4, label: "Grid-tie compliance checklist", vectorRank: 4, rerankScore: 0.35, relevant: false },
  { id: 5, label: "Battery storage capacity FAQ", vectorRank: 5, rerankScore: 0.41, relevant: false },
  { id: 6, label: "TX-99 installation troubleshooting", vectorRank: 6, rerankScore: 0.95, relevant: true },
  { id: 7, label: "TX-99 failure mode analysis", vectorRank: 7, rerankScore: 0.97, relevant: true },
  { id: 8, label: "General solar industry overview", vectorRank: 8, rerankScore: 0.15, relevant: false },
  { id: 9, label: "Roof mounting bracket dimensions", vectorRank: 9, rerankScore: 0.22, relevant: false },
  { id: 10, label: "Permit application template", vectorRank: 10, rerankScore: 0.18, relevant: false },
];

type Phase = "initial" | "scanning" | "reranked" | "golden";

const RerankerSlide = () => {
  const [phase, setPhase] = useState<Phase>("initial");
  const [scanIndex, setScanIndex] = useState(-1);

  const runRerank = () => {
    setPhase("scanning");
    setScanIndex(0);
  };

  useEffect(() => {
    if (phase !== "scanning") return;
    if (scanIndex >= initialChunks.length) {
      setTimeout(() => setPhase("reranked"), 400);
      return;
    }
    const t = setTimeout(() => setScanIndex((i) => i + 1), 250);
    return () => clearTimeout(t);
  }, [phase, scanIndex]);

  const sorted = [...initialChunks].sort((a, b) => b.rerankScore - a.rerankScore);
  const displayChunks = phase === "reranked" || phase === "golden" ? sorted : initialChunks;
  const goldenChunks = sorted.filter((c) => c.relevant);

  return (
    <section id="reranker" className="min-h-screen flex items-center py-24 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-sm font-mono text-primary mb-3 tracking-wider"
        >
          Section 08
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          The Reranker
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg mb-12 max-w-2xl"
        >
          Quality over proximity—a senior editor that promotes buried gems and demotes misleading noise.
        </motion.p>

        <div className="grid md:grid-cols-[1fr,320px] gap-6">
          {/* Main chunk list */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Search className={`w-4 h-4 ${phase === "scanning" ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
                <span className="font-mono text-sm text-muted-foreground">
                  {phase === "initial" && "Top-K retrieval results (by vector similarity)"}
                  {phase === "scanning" && `Reranker analyzing chunk ${Math.min(scanIndex + 1, 10)}/10…`}
                  {phase === "reranked" && "Reranked by semantic relevance"}
                  {phase === "golden" && "The Golden 3 — maximum signal, zero noise"}
                </span>
              </div>
              {(phase === "reranked" || phase === "golden") && (
                <span className="text-xs text-success flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Reranked
                </span>
              )}
            </div>

            <div className="space-y-2">
              <AnimatePresence mode="popLayout">
                {(phase === "golden" ? goldenChunks : displayChunks).map((chunk, i) => {
                  const isScanning = phase === "scanning" && i === scanIndex;
                  const isScanned = phase === "scanning" && i < scanIndex;
                  const isReranked = phase === "reranked" || phase === "golden";
                  const isGolden = phase === "golden" && chunk.relevant;

                  return (
                    <motion.div
                      key={chunk.id}
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", bounce: 0.15, duration: 0.5 }}
                      className={`flex items-center gap-3 rounded-xl px-4 py-2.5 font-mono text-xs transition-all ${
                        isGolden
                          ? "bg-success/10 border border-success/30 ring-1 ring-success/20"
                          : isScanning
                          ? "bg-primary/15 border border-primary/30 ring-1 ring-primary/20"
                          : isReranked && chunk.relevant
                          ? "bg-success/10 border border-success/20"
                          : isReranked && chunk.misleading
                          ? "bg-destructive/5 border border-destructive/10 opacity-40"
                          : isScanned
                          ? "glass-panel-strong border border-border/20"
                          : "glass-panel border border-transparent"
                      }`}
                    >
                      <span className="w-5 text-muted-foreground/50 shrink-0">#{i + 1}</span>

                      {isScanning && <Search className="w-3.5 h-3.5 text-primary animate-pulse shrink-0" />}
                      {isReranked && chunk.relevant && <Star className="w-3.5 h-3.5 text-success shrink-0" />}
                      {isReranked && chunk.misleading && <XCircle className="w-3.5 h-3.5 text-destructive/50 shrink-0" />}

                      <span className={`flex-1 ${
                        isReranked && chunk.relevant ? "text-success" : isReranked && chunk.misleading ? "text-muted-foreground/40 line-through" : "text-foreground/80"
                      }`}>
                        {chunk.label}
                      </span>

                      {isReranked && (
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="w-16 h-1.5 rounded-full bg-border/20 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${chunk.rerankScore * 100}%` }}
                              transition={{ delay: 0.2, duration: 0.4 }}
                              className={`h-full rounded-full ${chunk.relevant ? "bg-success" : "bg-muted-foreground/30"}`}
                            />
                          </div>
                          <span className={chunk.relevant ? "text-success" : "text-muted-foreground/40"}>
                            {chunk.rerankScore.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className="flex gap-3 mt-6">
              {phase === "initial" && (
                <button onClick={runRerank} className="flex-1 rounded-xl py-3 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                  Run Reranker
                </button>
              )}
              {phase === "reranked" && (
                <>
                  <button onClick={() => setPhase("golden")} className="flex-1 rounded-xl py-3 text-sm font-medium bg-success/10 text-success border border-success/20 hover:bg-success/20 transition-colors">
                    Extract Golden 3
                  </button>
                  <button onClick={() => { setPhase("initial"); setScanIndex(-1); }} className="rounded-xl py-3 px-5 text-sm font-medium bg-muted/50 text-muted-foreground border border-border/20 hover:bg-muted transition-colors">
                    Reset
                  </button>
                </>
              )}
              {phase === "golden" && (
                <button onClick={() => { setPhase("initial"); setScanIndex(-1); }} className="flex-1 rounded-xl py-3 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors">
                  Replay
                </button>
              )}
            </div>
          </div>

          {/* Sidebar insights */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} className="glass-panel rounded-xl p-5">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                <h4 className="font-mono text-sm font-semibold text-warning">"Lost in the Middle"</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                LLMs struggle when given 20+ chunks — they pay attention to the first and last but <em>lose focus</em> on middle entries. The Reranker cuts noise down to the <span className="text-success font-semibold">Golden 3</span>, preventing the model from drowning in mediocre context.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-xl p-5">
              <div className="flex items-start gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <h4 className="font-mono text-sm font-semibold text-primary">Speed Trade-off</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Rerankers are slower than vector search — they use cross-encoder models that read query + chunk together. That's why we only rerank the final <span className="text-primary">Top-K candidates</span>, not the entire corpus.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-xl p-5">
              <div className="flex items-start gap-2 mb-2">
                <Star className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                <h4 className="font-mono text-sm font-semibold text-accent">The #7 → #1 Effect</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Notice how "TX-99 failure mode analysis" jumped from rank #7 to #1. Vector similarity missed it because the <em>words</em> were different — but the Reranker understood the <em>meaning</em> matched perfectly.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RerankerSlide;
