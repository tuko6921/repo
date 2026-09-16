import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import {
  FileText, Scissors, Binary, Database, Zap, Search,
  Filter, Brain, Play, RotateCcw, ArrowRight, ArrowDown,
} from "lucide-react";

type Phase =
  | "idle"
  | "chunking"
  | "embedding"
  | "storing"
  | "expanding"
  | "searching"
  | "reranking"
  | "synthesis"
  | "done";

const phaseOrder: Phase[] = [
  "idle", "chunking", "embedding", "storing",
  "expanding", "searching", "reranking", "synthesis", "done",
];

interface StageNode {
  phase: Phase;
  label: string;
  shortDesc: string;
  icon: React.ReactNode;
  group: "ingestion" | "inference";
}

const stages: StageNode[] = [
  { phase: "chunking", label: "Chunking", shortDesc: "Slice text into overlapping fragments", icon: <Scissors className="w-5 h-5" />, group: "ingestion" },
  { phase: "embedding", label: "Embedding", shortDesc: "Convert chunks → vector coordinates", icon: <Binary className="w-5 h-5" />, group: "ingestion" },
  { phase: "storing", label: "Vector DB", shortDesc: "Store in high-dimensional space", icon: <Database className="w-5 h-5" />, group: "ingestion" },
  { phase: "expanding", label: "Multi-Query", shortDesc: "Expand prompt into 5 variations", icon: <Zap className="w-5 h-5" />, group: "inference" },
  { phase: "searching", label: "Similarity Search", shortDesc: "Retrieve top-K relevant chunks", icon: <Search className="w-5 h-5" />, group: "inference" },
  { phase: "reranking", label: "Reranker", shortDesc: "Quality gate → Golden 3", icon: <Filter className="w-5 h-5" />, group: "inference" },
  { phase: "synthesis", label: "MoE Synthesis", shortDesc: "Council of Experts → answer", icon: <Brain className="w-5 h-5" />, group: "inference" },
];

const RAGPipelineSlide = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [isRunning, setIsRunning] = useState(false);
  const phaseIndex = phaseOrder.indexOf(phase);

  const run = () => { setPhase("chunking"); setIsRunning(true); };
  const reset = () => { setPhase("idle"); setIsRunning(false); };

  useEffect(() => {
    if (!isRunning || phase === "idle") return;
    if (phase === "done") { setIsRunning(false); return; }
    const next = phaseOrder[phaseOrder.indexOf(phase) + 1];
    const t = setTimeout(() => setPhase(next), 1000);
    return () => clearTimeout(t);
  }, [phase, isRunning]);

  const metrics = {
    precision: phase === "done" ? 96 : phaseIndex >= 6 ? 82 : phaseIndex >= 5 ? 64 : 0,
    density: phase === "done" ? 94 : phaseIndex >= 6 ? 88 : phaseIndex >= 4 ? 45 : 0,
    efficiency: phase === "done" ? 95 : phaseIndex >= 7 ? 95 : 0,
  };

  const ingestion = stages.filter(s => s.group === "ingestion");
  const inference = stages.filter(s => s.group === "inference");

  const renderNode = (s: StageNode, i: number, arr: StageNode[]) => {
    const idx = phaseOrder.indexOf(s.phase);
    const isActive = phase === s.phase;
    const isPast = phaseIndex > idx;
    const isFuture = phaseIndex < idx;

    return (
      <div key={s.phase} className="flex flex-col items-center">
        {/* Node */}
        <motion.div
          animate={{
            scale: isActive ? 1.08 : 1,
            opacity: isFuture && phase !== "idle" ? 0.3 : 1,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className={`relative w-full max-w-[160px] rounded-2xl border-2 p-4 flex flex-col items-center text-center transition-colors ${
            isActive
              ? s.group === "ingestion"
                ? "border-primary bg-primary/15 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                : "border-accent bg-accent/15 shadow-[0_0_20px_hsl(var(--accent)/0.3)]"
              : isPast
              ? "border-success/40 bg-success/10"
              : "border-border bg-card"
          }`}
        >
          <div className={`p-2.5 rounded-xl mb-2 ${
            isActive
              ? s.group === "ingestion" ? "bg-primary/20 text-primary" : "bg-accent/20 text-accent"
              : isPast ? "bg-success/15 text-success" : "bg-secondary text-muted-foreground"
          }`}>
            {s.icon}
          </div>
          <p className={`text-sm font-bold mb-0.5 ${
            isActive ? (s.group === "ingestion" ? "text-primary" : "text-accent") : isPast ? "text-success" : "text-foreground"
          }`}>{s.label}</p>
          <p className="text-[10px] text-muted-foreground leading-tight">{s.shortDesc}</p>

          {/* Pulse indicator */}
          {isActive && (
            <motion.div
              className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${s.group === "ingestion" ? "bg-primary" : "bg-accent"}`}
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          )}
        </motion.div>

        {/* Arrow to next node */}
        {i < arr.length - 1 && (
          <div className="py-2 flex flex-col items-center">
            {/* Desktop: down arrow */}
            <ArrowDown className={`w-4 h-4 hidden md:block transition-colors ${
              isPast ? "text-success" : isActive ? (s.group === "ingestion" ? "text-primary" : "text-accent") : "text-muted-foreground/30"
            }`} />
            {/* Mobile: also down since we stack */}
            <ArrowDown className={`w-4 h-4 md:hidden transition-colors ${
              isPast ? "text-success" : "text-muted-foreground/30"
            }`} />
          </div>
        )}
      </div>
    );
  };

  return (
    <section id="rag-pipeline" className="min-h-screen flex items-center py-24 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-sm font-mono text-primary mb-3 tracking-wider">
          Summary
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">
          The RAG Pipeline
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg mb-8 max-w-2xl">
          From raw text ingestion to expert-level inference — see the entire flow at a glance.
        </motion.p>

        {/* Controls */}
        <div className="flex gap-2 mb-8">
          <button onClick={run} disabled={isRunning} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50">
            <Play className="w-4 h-4" /> Run Pipeline
          </button>
          <button onClick={reset} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium bg-secondary/50 text-muted-foreground border border-border hover:bg-secondary transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>

        {/* Flowchart */}
        <div className="glass-panel rounded-2xl p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-0">
            {/* Source node */}
            <div className="flex flex-col items-center shrink-0">
              <motion.div
                animate={{ opacity: phase !== "idle" ? 1 : 0.6 }}
                className="w-[140px] rounded-2xl border-2 border-border bg-card p-4 flex flex-col items-center"
              >
                <div className="p-2.5 rounded-xl bg-secondary text-muted-foreground mb-2">
                  <FileText className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold">Source Data</p>
                <p className="text-[10px] text-muted-foreground">Raw text input</p>
              </motion.div>
            </div>

            {/* Arrow to ingestion */}
            <div className="flex items-center px-2 shrink-0">
              <ArrowRight className={`w-5 h-5 hidden md:block ${phaseIndex >= 1 ? "text-primary" : "text-muted-foreground/30"}`} />
              <ArrowDown className={`w-5 h-5 md:hidden ${phaseIndex >= 1 ? "text-primary" : "text-muted-foreground/30"}`} />
            </div>

            {/* Ingestion column */}
            <div className="flex flex-col items-center shrink-0">
              <p className="text-[10px] font-mono text-primary/60 mb-3 tracking-widest uppercase">Ingestion</p>
              {ingestion.map((s, i) => renderNode(s, i, ingestion))}
            </div>

            {/* Bridge arrow between phases */}
            <div className="flex items-center px-3 shrink-0">
              <motion.div
                animate={{
                  opacity: phaseIndex >= 4 ? 1 : 0.2,
                }}
                className="flex items-center gap-1"
              >
                <div className={`hidden md:block w-8 h-0.5 ${phaseIndex >= 4 ? "bg-gradient-to-r from-primary to-accent" : "bg-muted-foreground/20"}`} />
                <ArrowRight className={`w-5 h-5 hidden md:block ${phaseIndex >= 4 ? "text-accent" : "text-muted-foreground/30"}`} />
                <ArrowDown className={`w-5 h-5 md:hidden ${phaseIndex >= 4 ? "text-accent" : "text-muted-foreground/30"}`} />
              </motion.div>
            </div>

            {/* Inference column */}
            <div className="flex flex-col items-center shrink-0">
              <p className="text-[10px] font-mono text-accent/60 mb-3 tracking-widest uppercase">Inference</p>
              {inference.map((s, i) => renderNode(s, i, inference))}
            </div>

            {/* Arrow to output */}
            <div className="flex items-center px-2 shrink-0">
              <ArrowRight className={`w-5 h-5 hidden md:block ${phase === "done" ? "text-success" : "text-muted-foreground/30"}`} />
              <ArrowDown className={`w-5 h-5 md:hidden ${phase === "done" ? "text-success" : "text-muted-foreground/30"}`} />
            </div>

            {/* Output node */}
            <div className="flex flex-col items-center shrink-0">
              <motion.div
                animate={{
                  opacity: phase === "done" ? 1 : 0.4,
                  borderColor: phase === "done" ? "hsl(var(--success))" : "hsl(var(--border))",
                }}
                className="w-[140px] rounded-2xl border-2 bg-card p-4 flex flex-col items-center"
              >
                <div className={`p-2.5 rounded-xl mb-2 ${phase === "done" ? "bg-success/20 text-success" : "bg-secondary text-muted-foreground"}`}>
                  <Brain className="w-5 h-5" />
                </div>
                <p className="text-sm font-bold">Answer</p>
                <p className="text-[10px] text-muted-foreground">Expert synthesis</p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Performance Dashboard */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Retrieval Precision", value: metrics.precision, note: "Boosted by Reranking + Overlap" },
            { label: "Context Density", value: metrics.density, note: "Noise removed from prompt window" },
            { label: "Arch. Efficiency", value: metrics.efficiency, note: "37B Active / 671B Total (MoE)" },
          ].map((m) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-4">
              <p className="text-xs font-mono text-muted-foreground mb-2">{m.label}</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-bold text-foreground font-mono">{m.value}</span>
                <span className="text-sm text-muted-foreground mb-1">%</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary/40 overflow-hidden mb-2">
                <motion.div className="h-full rounded-full bg-primary" animate={{ width: `${m.value}%` }} transition={{ duration: 0.8 }} />
              </div>
              <p className="text-[10px] text-muted-foreground">{m.note}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RAGPipelineSlide;
