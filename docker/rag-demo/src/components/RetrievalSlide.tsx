import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Search, Zap, CheckCircle, Database } from "lucide-react";

type Phase = "idle" | "query" | "search" | "grab" | "inject" | "answer";

const chunks = [
  { id: 1, label: "Romeo's monologue", relevant: false },
  { id: 2, label: "Balcony scene dialogue", relevant: true },
  { id: 3, label: "Nurse's comic relief", relevant: false },
  { id: 4, label: '"A rose by any other name"', relevant: true },
  { id: 5, label: "Friar Laurence's plan", relevant: false },
  { id: 6, label: "Juliet on naming", relevant: true },
  { id: 7, label: "Mercutio's Queen Mab", relevant: false },
  { id: 8, label: "Tybalt's challenge", relevant: false },
];

const phaseLabels: Record<Phase, string> = {
  idle: "Ready to retrieve",
  query: "Prompt enters vector space…",
  search: "Searching nearest neighbors…",
  grab: "Grabbing relevant chunks…",
  inject: "Injecting into context window…",
  answer: "LLM generates grounded answer",
};

const RetrievalSlide = () => {
  const [phase, setPhase] = useState<Phase>("idle");

  const handleSimulate = () => {
    setPhase("query");
  };

  useEffect(() => {
    if (phase === "idle") return;
    const sequence: { next: Phase; delay: number }[] = [
      { next: "search", delay: 1000 },
      { next: "grab", delay: 1200 },
      { next: "inject", delay: 1200 },
      { next: "answer", delay: 1500 },
    ];
    const currentIdx = ["query", "search", "grab", "inject"].indexOf(phase);
    if (currentIdx === -1) return;
    const { next, delay } = sequence[currentIdx];
    const t = setTimeout(() => setPhase(next), delay);
    return () => clearTimeout(t);
  }, [phase]);

  const isActive = phase !== "idle";
  const showGrab = ["grab", "inject", "answer"].includes(phase);
  const showInject = ["inject", "answer"].includes(phase);

  return (
    <section id="retrieval" className="min-h-screen flex items-center py-24 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-sm font-mono text-primary mb-3 tracking-wider"
        >
          Section 05
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          The Retrieval Process
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg mb-12 max-w-2xl"
        >
          A prompt lands in vector space, grabs only the relevant chunks that fit the context window, and generates a grounded answer.
        </motion.p>

        <div className="glass-panel rounded-2xl p-8">
          {/* Status bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <Search className={`w-4 h-4 ${isActive ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
              <span className="font-mono text-sm text-muted-foreground">{phaseLabels[phase]}</span>
            </div>
            {phase === "answer" && (
              <span className="flex items-center gap-1 text-xs text-success">
                <CheckCircle className="w-3 h-3" />
                Complete
              </span>
            )}
          </div>

          {/* Three-column pipeline */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Query column */}
            <div className="space-y-3">
              <h3 className="font-mono text-sm text-primary font-semibold">1. Query</h3>
              <div className={`glass-panel-strong rounded-xl p-4 text-sm transition-all ${
                isActive ? "ring-1 ring-primary/30 glow-primary" : ""
              }`}>
                <span className="text-foreground">"What does Juliet say about names?"</span>
              </div>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-primary text-2xl"
                >
                  →
                </motion.div>
              )}
            </div>

            {/* Vector store column */}
            <div className="space-y-3">
              <h3 className="font-mono text-sm text-primary font-semibold flex items-center gap-1">
                <Database className="w-3 h-3" />
                2. Vector Store
              </h3>
              <div className="space-y-1.5">
                {chunks.map((chunk) => {
                  const isSearching = phase === "search";
                  const isGrabbed = showGrab && chunk.relevant;
                  const isDimmed = showGrab && !chunk.relevant;

                  return (
                    <motion.div
                      key={chunk.id}
                      animate={{
                        opacity: isDimmed ? 0.3 : 1,
                        scale: isGrabbed ? 1.02 : 1,
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-mono transition-all ${
                        isGrabbed
                          ? "bg-success/15 border border-success/30 text-success"
                          : isSearching
                          ? "bg-primary/10 border border-primary/20 text-primary animate-pulse"
                          : "glass-panel text-muted-foreground"
                      }`}
                    >
                      {chunk.label}
                      {isGrabbed && <CheckCircle className="inline w-3 h-3 ml-1" />}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Context window column */}
            <div className="space-y-3">
              <h3 className="font-mono text-sm text-primary font-semibold">3. Context Window</h3>
              <div className="glass-panel-strong rounded-xl p-4 min-h-[200px]">
                {showInject ? (
                  <>
                    <p className="text-xs font-mono text-muted-foreground mb-2">
                      {"// Injected chunks:"}
                    </p>
                    {chunks
                      .filter((c) => c.relevant)
                      .map((chunk, i) => (
                        <motion.p
                          key={chunk.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.15 }}
                          className="text-xs font-mono text-success mb-1"
                        >
                          ✓ {chunk.label}
                        </motion.p>
                      ))}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40">
                    <Zap className="w-8 h-8 mb-2" />
                    <span className="text-xs">Awaiting chunks…</span>
                  </div>
                )}

                <AnimatePresence>
                  {phase === "answer" && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 pt-4 border-t border-border/30"
                    >
                      <p className="text-xs font-mono text-primary mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        LLM Response
                      </p>
                      <p className="text-sm text-foreground/90 leading-relaxed">
                        Juliet argues that a name is an arbitrary label: "A rose by any other name would smell as sweet," questioning why Romeo's Montague identity should matter.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Simulate button */}
          <button
            onClick={() => phase === "answer" ? setPhase("idle") : handleSimulate()}
            disabled={isActive && phase !== "answer"}
            className="w-full mt-8 rounded-xl py-3 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {phase === "answer" ? "Replay Retrieval" : isActive ? "Retrieving..." : "Simulate RAG Retrieval"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default RetrievalSlide;
