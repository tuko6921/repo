import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const sections = [
  { id: "hero", label: "Hero" },
  { id: "memory-myth", label: "Memory" },
  { id: "context-window", label: "Context" },
  { id: "vector-space", label: "Vectors" },
  { id: "vector-drift", label: "Drift" },
  { id: "chunking", label: "Chunks" },
  { id: "anatomy-chunk", label: "Tokens" },
  { id: "retrieval", label: "RAG" },
  { id: "hybrid-search", label: "Hybrid" },
  { id: "reranker", label: "Rerank" },
  { id: "multi-query", label: "Multi-Q" },
  { id: "council-of-experts", label: "MoE" },
  { id: "modular-parallelism", label: "Parallel" },
  { id: "intelligence-landscape", label: "Scale" },
  { id: "rag-pipeline", label: "Pipeline" },
  { id: "closing", label: "Questions" },
];

const StickyNav = () => {
  const [active, setActive] = useState("hero");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActive(visible.target.id);
      },
      { threshold: 0.4 }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass-panel-strong rounded-full px-2 py-1.5 flex gap-1">
      {sections.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => scrollTo(id)}
          className={`relative px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            active === id ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {active === id && (
            <motion.div
              layoutId="nav-pill"
              className="absolute inset-0 rounded-full bg-primary"
              transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
            />
          )}
          <span className="relative z-10">{label}</span>
        </button>
      ))}
    </nav>
  );
};

export default StickyNav;
