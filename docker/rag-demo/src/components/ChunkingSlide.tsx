import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { BookOpen, FileText, AlignLeft } from "lucide-react";

interface ZoomLevel {
  id: string;
  label: string;
  icon: React.ReactNode;
  volume: number;
  resolution: number;
  content: string;
  detail: string;
}

const zoomLevels: ZoomLevel[] = [
  {
    id: "book",
    label: "Whole Book",
    icon: <BookOpen className="w-4 h-4" />,
    volume: 95,
    resolution: 10,
    content:
      "Romeo and Juliet is a tragedy by Shakespeare about two star-crossed lovers from feuding families who ultimately take their own lives.",
    detail: "High volume, low resolution — the summary loses all nuance.",
  },
  {
    id: "chapter",
    label: "Chapter",
    icon: <FileText className="w-4 h-4" />,
    volume: 60,
    resolution: 45,
    content:
      "Act 2 covers the famous balcony scene, the secret marriage arranged by Friar Laurence, and the deepening bond between Romeo and Juliet despite their families' conflict.",
    detail: "Moderate trade-off — captures key scenes but misses dialogue specifics.",
  },
  {
    id: "paragraph",
    label: "Paragraph",
    icon: <AlignLeft className="w-4 h-4" />,
    volume: 25,
    resolution: 85,
    content:
      "\"What's in a name? That which we call a rose / By any other name would smell as sweet.\" — Juliet questions the meaning of Romeo's family name during the balcony scene.",
    detail: "Low volume, high resolution — the exact quote and its context are preserved.",
  },
];

const ChunkingSlide = () => {
  const [activeLevel, setActiveLevel] = useState(0);
  const level = zoomLevels[activeLevel];

  return (
    <section id="chunking" className="min-h-screen flex items-center py-24 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-sm font-mono text-primary mb-3 tracking-wider"
        >
          Section 04
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Strategic Chunking
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg mb-12 max-w-2xl"
        >
          The zoom trade-off: summarise an entire book and you lose the one-liner that answers the question.
        </motion.p>

        <div className="glass-panel rounded-2xl p-8 max-w-3xl mx-auto">
          {/* Zoom controls header */}
          <div className="flex items-center justify-between mb-6 text-xs font-mono text-muted-foreground">
            <span>ZOOM</span>
            <span>DETAIL</span>
          </div>

          {/* Zoom level selector */}
          <div className="flex gap-2 mb-8">
            {zoomLevels.map((z, i) => (
              <button
                key={z.id}
                onClick={() => setActiveLevel(i)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                  activeLevel === i
                    ? "bg-primary/15 text-primary border border-primary/30"
                    : "glass-panel text-muted-foreground hover:text-foreground"
                }`}
              >
                {z.icon}
                {z.label}
              </button>
            ))}
          </div>

          {/* Volume vs Resolution bars */}
          <div className="space-y-4 mb-6">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Volume (coverage)</span>
                <span>{level.volume}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary/60"
                  animate={{ width: `${level.volume}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Resolution (detail)</span>
                <span>{level.resolution}%</span>
              </div>
              <div className="h-2 rounded-full bg-secondary/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-accent/60"
                  animate={{ width: `${level.resolution}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic">{level.detail}</p>
          </div>

          {/* Content preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={level.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="glass-panel-strong rounded-xl p-5"
            >
              <div className="flex items-center gap-2 mb-3 text-xs font-mono text-muted-foreground">
                {level.icon}
                {level.label.toLowerCase()}_chunk.txt
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">{level.content}</p>
            </motion.div>
          </AnimatePresence>

          {/* Chunk token indicator */}
          <div className="mt-6">
            <p className="text-xs text-muted-foreground mb-2">Chunk tokens used</p>
            <div className="flex gap-1">
              {Array.from({ length: 20 }).map((_, i) => {
                const filled = Math.round((level.volume / 100) * 20);
                return (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-sm transition-colors duration-300 ${
                      i < filled ? "bg-primary/40" : "bg-secondary/30"
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ChunkingSlide;
