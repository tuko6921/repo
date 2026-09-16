import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Brain, AlertTriangle, ChevronRight } from "lucide-react";

const TOTAL_BLOCKS = 20;
const WINDOW_SIZE = 8;

const ContextWindowSlide = () => {
  const [tokenCount, setTokenCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const fillPercentage = Math.min((tokenCount / TOTAL_BLOCKS) * 100, 100);
  const windowStart = Math.max(0, tokenCount - WINDOW_SIZE);
  const isForgetting = tokenCount > WINDOW_SIZE;

  useEffect(() => {
    if (!isRunning) return;
    if (tokenCount >= TOTAL_BLOCKS) {
      setIsRunning(false);
      return;
    }
    const t = setTimeout(() => setTokenCount((c) => c + 1), 600);
    return () => clearTimeout(t);
  }, [tokenCount, isRunning]);

  const handleSimulate = () => {
    setTokenCount(0);
    setIsRunning(true);
  };

  return (
    <section id="context-window" className="min-h-screen flex items-center py-24 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-sm font-mono text-primary mb-3 tracking-wider"
        >
          Section 02
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          The Context Window Constraint
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg mb-12 max-w-2xl"
        >
          As conversations grow, earlier context slides out of view—the model literally forgets.
        </motion.p>

        <div className="glass-panel rounded-2xl p-8 max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-mono text-sm text-muted-foreground">context_window.capacity</span>
            </div>
            <div className="flex items-center gap-3">
              {isForgetting && (
                <span className="flex items-center gap-1 text-xs text-destructive">
                  <AlertTriangle className="w-3 h-3" />
                  Tokens dropping
                </span>
              )}
              <span className="font-mono text-sm font-semibold text-foreground">
                {Math.round(fillPercentage)}%
              </span>
            </div>
          </div>

          {/* Meter bar */}
          <div className="h-3 rounded-full bg-secondary/50 mb-8 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background:
                  fillPercentage > 80
                    ? "linear-gradient(90deg, hsl(var(--destructive)), hsl(var(--warning)))"
                    : fillPercentage > 50
                    ? "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--warning)))"
                    : "linear-gradient(90deg, hsl(var(--primary)), hsl(var(--accent)))",
              }}
              animate={{ width: `${fillPercentage}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>

          {/* Token blocks */}
          <div className="grid grid-cols-20 gap-1.5 mb-6">
            {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => {
              const isActive = i < tokenCount;
              const isInWindow = i >= windowStart && i < tokenCount;
              const isForgottenBlock = isActive && !isInWindow;

              return (
                <motion.div
                  key={i}
                  className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-mono transition-all duration-300 ${
                    isInWindow
                      ? "bg-primary/20 border border-primary/40 text-primary"
                      : isForgottenBlock
                      ? "bg-destructive/10 border border-destructive/20 text-destructive/50 line-through"
                      : "bg-secondary/30 border border-border/30"
                  }`}
                >
                  {isActive && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>
                      {i + 1}
                    </motion.span>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex gap-6 text-xs text-muted-foreground mb-6">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-primary/20 border border-primary/40" />
              In Window (active)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-destructive/10 border border-destructive/20" />
              Forgotten (evicted)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-secondary/30 border border-border/30" />
              Unused
            </span>
          </div>

          {/* Sliding window indicator */}
          {tokenCount > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-panel-strong rounded-xl p-3 mb-6 font-mono text-xs"
            >
              <span className="text-primary flex items-center gap-1">
                <ChevronRight className="w-3 h-3" />
                Window: tokens [{windowStart + 1}–{Math.min(tokenCount, TOTAL_BLOCKS)}]
              </span>
              {isForgetting && (
                <span className="text-destructive/70 ml-5">
                  • {windowStart} token{windowStart > 1 ? "s" : ""} evicted
                </span>
              )}
            </motion.div>
          )}

          {/* Simulate button */}
          <button
            onClick={handleSimulate}
            disabled={isRunning}
            className="w-full rounded-xl py-3 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50"
          >
            {isRunning ? "Simulating..." : tokenCount > 0 ? "Reset & Replay" : "Simulate Token Growth"}
          </button>
        </div>
      </div>
    </section>
  );
};

export default ContextWindowSlide;
