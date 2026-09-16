import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Point {
  id: number;
  label: string;
  x: number;
  y: number;
  z: number;
  cluster: "royalty" | "animals" | "tech" | "food";
}

const clusterColors: Record<string, { bg: string; text: string; border: string }> = {
  royalty: { bg: "bg-primary/20", text: "text-primary", border: "border-primary/30" },
  animals: { bg: "bg-accent/20", text: "text-accent", border: "border-accent/30" },
  tech: { bg: "bg-success/20", text: "text-success", border: "border-success/30" },
  food: { bg: "bg-warning/20", text: "text-warning", border: "border-warning/30" },
};

const rawPoints: Point[] = [
  { id: 1, label: "King", x: 0.2, y: 0.25, z: 0.8, cluster: "royalty" },
  { id: 2, label: "Queen", x: 0.25, y: 0.3, z: 0.75, cluster: "royalty" },
  { id: 3, label: "Prince", x: 0.18, y: 0.35, z: 0.7, cluster: "royalty" },
  { id: 4, label: "Crown", x: 0.28, y: 0.22, z: 0.65, cluster: "royalty" },
  { id: 5, label: "Cat", x: 0.7, y: 0.6, z: 0.5, cluster: "animals" },
  { id: 6, label: "Dog", x: 0.75, y: 0.65, z: 0.55, cluster: "animals" },
  { id: 7, label: "Lion", x: 0.65, y: 0.55, z: 0.6, cluster: "animals" },
  { id: 8, label: "GPU", x: 0.5, y: 0.8, z: 0.3, cluster: "tech" },
  { id: 9, label: "CPU", x: 0.55, y: 0.82, z: 0.35, cluster: "tech" },
  { id: 10, label: "RAM", x: 0.48, y: 0.78, z: 0.28, cluster: "tech" },
  { id: 11, label: "Pizza", x: 0.8, y: 0.2, z: 0.4, cluster: "food" },
  { id: 12, label: "Pasta", x: 0.82, y: 0.25, z: 0.45, cluster: "food" },
  { id: 13, label: "Bread", x: 0.78, y: 0.18, z: 0.38, cluster: "food" },
];

const VectorSpaceSlide = () => {
  const [hoveredCluster, setHoveredCluster] = useState<string | null>(null);
  const [droppedCount, setDroppedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleAnimate = () => {
    setDroppedCount(0);
    setIsAnimating(true);
  };

  useEffect(() => {
    if (!isAnimating) return;
    if (droppedCount >= rawPoints.length) {
      setIsAnimating(false);
      return;
    }
    const t = setTimeout(() => setDroppedCount((c) => c + 1), 200);
    return () => clearTimeout(t);
  }, [droppedCount, isAnimating]);

  const project = (p: Point) => {
    const perspective = 1.2;
    const scale = perspective / (perspective + p.z * 0.5);
    return {
      px: p.x * 100 * scale,
      py: p.y * 100 * scale,
      scale,
      depth: p.z,
    };
  };

  return (
    <section id="vector-space" className="min-h-screen flex items-center py-24 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-sm font-mono text-primary mb-3 tracking-wider"
        >
          Section 03
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Vector Space & Association
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg mb-12 max-w-2xl"
        >
          Data is embedded into high-dimensional space where <em>meaning</em> determines proximity—"King" and "Queen" naturally cluster together.
        </motion.p>

        <div className="grid md:grid-cols-[1fr,320px] gap-8">
          {/* 3D cluster map */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-sm text-muted-foreground">embedding_space.3d</span>
              <span className="text-xs text-muted-foreground">{droppedCount}/{rawPoints.length} vectors</span>
            </div>

            <div className="relative w-full aspect-square max-h-[400px] overflow-hidden">
              {/* Axis grid */}
              <div className="absolute inset-0 grid-pattern opacity-20 rounded-xl" />
              <div className="absolute bottom-2 left-2 font-mono text-[10px] text-muted-foreground/40">
                x<span className="mx-2">y</span>z
              </div>

              {/* Connection lines */}
              {droppedCount > 1 && (
                <svg className="absolute inset-0 w-full h-full">
                  {Object.keys(clusterColors).map((cluster) => {
                    const pts = rawPoints
                      .filter((p) => p.cluster === cluster)
                      .slice(0, droppedCount)
                      .map((p) => project(p));
                    if (pts.length < 2) return null;
                    const isHighlighted = hoveredCluster === null || hoveredCluster === cluster;
                    return pts.slice(1).map((pt, i) => (
                      <line
                        key={`${cluster}-${i}`}
                        x1={`${pts[i].px}%`}
                        y1={`${pts[i].py}%`}
                        x2={`${pt.px}%`}
                        y2={`${pt.py}%`}
                        stroke="hsl(var(--border))"
                        strokeWidth={1}
                        opacity={isHighlighted ? 0.5 : 0.1}
                      />
                    ));
                  })}
                </svg>
              )}

              {/* Points */}
              {rawPoints.slice(0, droppedCount).map((p) => {
                const { px, py, scale } = project(p);
                const colors = clusterColors[p.cluster];
                const isHighlighted = hoveredCluster === null || hoveredCluster === p.cluster;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: isHighlighted ? 1 : 0.2, scale: 1 }}
                    style={{ left: `${px}%`, top: `${py}%`, transform: `scale(${scale})` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    onMouseEnter={() => setHoveredCluster(p.cluster)}
                    onMouseLeave={() => setHoveredCluster(null)}
                  >
                    <div className={`w-3 h-3 rounded-full ${colors.bg} border ${colors.border}`} />
                    <span className={`absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono ${colors.text} whitespace-nowrap`}>
                      {p.label}
                    </span>
                  </motion.div>
                );
              })}
            </div>

            <button
              onClick={handleAnimate}
              disabled={isAnimating}
              className="w-full mt-4 rounded-xl py-2.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors disabled:opacity-50"
            >
              {isAnimating ? "Embedding..." : droppedCount > 0 ? "Re-embed All Vectors" : "Embed Into Vector Space"}
            </button>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {Object.entries(clusterColors).map(([cluster, colors]) => (
              <motion.div
                key={cluster}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
              >
                <div
                  onMouseEnter={() => setHoveredCluster(cluster)}
                  onMouseLeave={() => setHoveredCluster(null)}
                  className={`glass-panel rounded-xl p-4 cursor-pointer transition-all ${
                    hoveredCluster === cluster ? "ring-1 ring-primary/30" : ""
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`w-2.5 h-2.5 rounded-full ${colors.bg} border ${colors.border}`} />
                    <span className={`font-medium text-sm capitalize ${colors.text}`}>{cluster}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {cluster === "royalty" && "King ≈ Queen ≈ Prince — semantic neighbors in vector space"}
                    {cluster === "animals" && "Cat ≈ Dog ≈ Lion — grouped by conceptual similarity"}
                    {cluster === "tech" && "GPU ≈ CPU ≈ RAM — hardware terms form a tight cluster"}
                    {cluster === "food" && "Pizza ≈ Pasta ≈ Bread — culinary concepts converge"}
                  </p>
                </div>
              </motion.div>
            ))}
            <p className="text-xs text-muted-foreground mt-4 px-1">
              → Vectors with similar <em>meaning</em> have small cosine distances, regardless of spelling or syntax.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VectorSpaceSlide;
