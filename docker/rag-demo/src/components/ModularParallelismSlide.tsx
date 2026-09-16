import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Box, GitBranch, GitMerge, CheckCircle, Play, RotateCcw, Cpu, ArrowDown, Puzzle, FlaskConical } from "lucide-react";

interface Module {
  id: number;
  label: string;
  lane: number;
  status: "idle" | "running" | "done";
  duration: number;
}

const generateModules = (): Module[] => {
  const labels = [
    "Auth Service", "User API", "DB Schema", "Session Mgr",
    "Dashboard UI", "Chart Engine", "Data Pipe", "Cache Layer",
    "Notification", "Email Queue", "Search Index", "File Upload",
    "Payment Gate", "Invoice Gen", "Rate Limiter", "Logger",
    "Health Check", "CI Pipeline", "Deploy Script", "Smoke Tests",
  ];
  return labels.map((label, i) => ({
    id: i,
    label,
    lane: i % 4,
    status: "idle",
    duration: 600 + Math.random() * 800,
  }));
};

const stitchSteps = [
  { label: "Merge outputs", desc: "Combining 4 lane outputs into unified codebase" },
  { label: "Resolve conflicts", desc: "Auto-resolving interface mismatches across modules" },
  { label: "Link dependencies", desc: "Wiring cross-module imports and shared state" },
  { label: "Build artifact", desc: "Compiling merged source into deployable bundle" },
];

const ModularParallelismSlide = () => {
  const [modules, setModules] = useState<Module[]>(generateModules);
  const [phase, setPhase] = useState<"idle" | "splitting" | "running" | "stitching" | "testing" | "done">("idle");
  const [splitCount, setSplitCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [stitchStep, setStitchStep] = useState(0);

  const handleStart = () => {
    setModules(generateModules());
    setSplitCount(0);
    setCompletedCount(0);
    setStitchStep(0);
    setPhase("splitting");
  };

  const handleReset = () => {
    setModules(generateModules());
    setSplitCount(0);
    setCompletedCount(0);
    setStitchStep(0);
    setPhase("idle");
  };

  // Splitting animation
  useEffect(() => {
    if (phase !== "splitting") return;
    if (splitCount >= modules.length) {
      setPhase("running");
      return;
    }
    const t = setTimeout(() => setSplitCount((c) => c + 1), 80);
    return () => clearTimeout(t);
  }, [phase, splitCount, modules.length]);

  // Running animation
  useEffect(() => {
    if (phase !== "running") return;
    setModules((prev) =>
      prev.map((m) => (m.status === "idle" ? { ...m, status: "running" } : m))
    );
    const t = setTimeout(() => {
      setModules((prev) => prev.map((m) => ({ ...m, status: "done" })));
      setCompletedCount(modules.length);
      setPhase("stitching");
    }, 2000);
    return () => clearTimeout(t);
  }, [phase, modules.length]);

  // Stitching steps animation
  useEffect(() => {
    if (phase !== "stitching") return;
    if (stitchStep >= stitchSteps.length) {
      const t = setTimeout(() => setPhase("testing"), 600);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStitchStep((s) => s + 1), 800);
    return () => clearTimeout(t);
  }, [phase, stitchStep]);

  // Testing → done
  useEffect(() => {
    if (phase === "testing") {
      const t = setTimeout(() => setPhase("done"), 1500);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Increment completed during running
  useEffect(() => {
    if (phase !== "running") return;
    if (completedCount >= modules.length) return;
    const t = setTimeout(() => setCompletedCount((c) => c + 1), 90);
    return () => clearTimeout(t);
  }, [phase, completedCount, modules.length]);

  const lanes = [0, 1, 2, 3];
  const laneLabels = ["Instance A", "Instance B", "Instance C", "Instance D"];
  const showStitch = ["stitching", "testing", "done"].includes(phase);

  return (
    <section id="modular-parallelism" className="min-h-screen flex items-center py-24 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-sm font-mono text-primary mb-3 tracking-wider">
          Section 09
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">
          Modular Parallelism
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg mb-12 max-w-2xl">
          A complex problem is subdivided into 20 modules, distributed across parallel instances, then stitched back together for integration testing.
        </motion.p>

        <div className="glass-panel rounded-2xl p-8">
          {/* Pipeline status */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Cpu className={`w-4 h-4 ${phase !== "idle" ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
              <span className="font-mono text-sm text-muted-foreground">
                {phase === "idle" && "pipeline.ready"}
                {phase === "splitting" && `Subdividing problem → ${splitCount}/${modules.length} modules`}
                {phase === "running" && `Executing in parallel → ${completedCount}/${modules.length} complete`}
                {phase === "stitching" && `Stitching → Step ${stitchStep}/${stitchSteps.length}`}
                {phase === "testing" && "Running unit tests on merged output…"}
                {phase === "done" && "Pipeline complete — all tests passed"}
              </span>
            </div>
            {phase === "done" && (
              <span className="flex items-center gap-1 text-xs text-success">
                <CheckCircle className="w-3 h-3" />
                20/20 passed
              </span>
            )}
          </div>

          {/* Flowchart visualization */}
          <div className="space-y-6">
            {/* Source node */}
            <div className="flex justify-center">
              <motion.div
                animate={{ borderColor: phase !== "idle" ? "hsl(var(--primary))" : "hsl(var(--border))" }}
                className="glass-panel-strong rounded-xl px-6 py-3 flex items-center gap-2 border"
              >
                <Box className="w-4 h-4 text-primary" />
                <span className="font-mono text-sm">Complex Problem</span>
              </motion.div>
            </div>

            {/* Split arrows */}
            <div className="flex justify-center">
              <GitBranch className={`w-5 h-5 rotate-180 ${phase !== "idle" ? "text-primary" : "text-muted-foreground/30"}`} />
            </div>

            {/* Parallel lanes */}
            <div className="grid grid-cols-4 gap-3">
              {lanes.map((lane) => {
                const laneModules = modules.filter((m) => m.lane === lane);
                return (
                  <div key={lane} className="space-y-2">
                    <p className="text-[10px] font-mono text-primary/60 text-center mb-1">{laneLabels[lane]}</p>
                    {laneModules.map((mod) => {
                      const isVisible = splitCount > mod.id;
                      return (
                        <AnimatePresence key={mod.id}>
                          {isVisible && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`rounded-lg px-2 py-1.5 text-[10px] font-mono text-center transition-all duration-500 ${
                                mod.status === "done"
                                  ? "bg-success/15 border border-success/30 text-success"
                                  : mod.status === "running"
                                  ? "bg-primary/15 border border-primary/30 text-primary animate-pulse"
                                  : "glass-panel text-muted-foreground"
                              }`}
                            >
                              {mod.label}
                              {mod.status === "done" && <CheckCircle className="inline w-2.5 h-2.5 ml-1" />}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Merge arrows */}
            <div className="flex justify-center">
              <GitMerge className={`w-5 h-5 ${showStitch ? "text-primary" : "text-muted-foreground/30"}`} />
            </div>

            {/* Stitch & Merge expanded section */}
            <div className="flex justify-center">
              <motion.div
                animate={{
                  borderColor: showStitch ? "hsl(var(--primary))" : "hsl(var(--border))",
                  opacity: showStitch ? 1 : 0.4,
                }}
                className="glass-panel-strong rounded-xl border w-full max-w-xl overflow-hidden"
              >
                <div className="px-5 py-3 flex items-center gap-2 border-b border-border/50">
                  <Puzzle className={`w-4 h-4 ${showStitch ? "text-accent" : "text-muted-foreground/40"}`} />
                  <span className="font-mono text-sm font-semibold">Stitch & Merge</span>
                </div>

                {/* Stitch steps */}
                <div className="p-4 space-y-2">
                  {stitchSteps.map((step, i) => {
                    const isActive = phase === "stitching" && stitchStep === i;
                    const isDone = phase === "stitching" ? stitchStep > i : showStitch;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0.3 }}
                        animate={{
                          opacity: isDone || isActive ? 1 : 0.3,
                        }}
                        className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-mono transition-colors ${
                          isActive
                            ? "bg-primary/10 border border-primary/30 text-primary"
                            : isDone
                            ? "bg-success/10 border border-success/20 text-success"
                            : "text-muted-foreground"
                        }`}
                      >
                        {isDone && !isActive ? (
                          <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        ) : isActive ? (
                          <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                            <ArrowDown className="w-3.5 h-3.5 shrink-0" />
                          </motion.div>
                        ) : (
                          <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30 shrink-0" />
                        )}
                        <div>
                          <span className="font-semibold">{step.label}</span>
                          <span className="text-muted-foreground ml-2">— {step.desc}</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* Arrow to tests */}
            <div className="flex justify-center">
              <ArrowDown className={`w-4 h-4 ${["testing", "done"].includes(phase) ? "text-primary" : "text-muted-foreground/20"}`} />
            </div>

            {/* Test node */}
            <div className="flex justify-center">
              <motion.div
                animate={{
                  borderColor: phase === "done"
                    ? "hsl(var(--success))"
                    : phase === "testing"
                    ? "hsl(var(--primary))"
                    : "hsl(var(--border))",
                  opacity: ["testing", "done"].includes(phase) ? 1 : 0.4,
                }}
                className="glass-panel-strong rounded-xl px-6 py-3 flex items-center gap-2 border"
              >
                <FlaskConical className={`w-4 h-4 ${phase === "done" ? "text-success" : phase === "testing" ? "text-primary animate-pulse" : "text-muted-foreground/40"}`} />
                <span className="font-mono text-sm">Integration Tests</span>
                {phase === "done" && <span className="text-[10px] text-success font-mono ml-1">ALL PASS</span>}
              </motion.div>
            </div>
          </div>

          {/* Control button */}
          <div className="flex gap-3 mt-8">
            <button
              onClick={phase === "done" ? handleReset : handleStart}
              disabled={phase !== "idle" && phase !== "done"}
              className="flex-1 rounded-xl py-3 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {phase === "idle" && <><Play className="w-4 h-4" /> Run Parallel Pipeline</>}
              {phase === "done" && <><RotateCcw className="w-4 h-4" /> Reset & Replay</>}
              {!["idle", "done"].includes(phase) && "Processing..."}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ModularParallelismSlide;
