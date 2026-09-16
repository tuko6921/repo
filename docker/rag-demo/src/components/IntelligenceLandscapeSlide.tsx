import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ToggleLeft, ToggleRight, Zap, Brain, Globe, Gauge } from "lucide-react";

interface ModelInfo {
  id: string;
  name: string;
  tagline: string;
  expertise: string;
  totalParams: number;
  activeParams?: number;
  color: string;
  borderColor: string;
  bgColor: string;
  icon: React.ReactNode;
  architectureType: "dense" | "moe";
}

const models: ModelInfo[] = [
  {
    id: "deepseek",
    name: "DeepSeek",
    tagline: "The Efficient Giant",
    expertise: "Uses MoE to act as a 671B model with the speed of 37B. Expertise: Advanced reasoning and deep logic.",
    totalParams: 671,
    activeParams: 37,
    color: "text-primary",
    borderColor: "border-primary/30",
    bgColor: "bg-primary/15",
    icon: <Brain className="w-5 h-5" />,
    architectureType: "moe",
  },
  {
    id: "gemini",
    name: "Gemini",
    tagline: "The Multimodal Native",
    expertise: "Expertise: Cross-media reasoning (Video/Audio/Text) and massive context retrieval.",
    totalParams: 540,
    color: "text-accent",
    borderColor: "border-accent/30",
    bgColor: "bg-accent/15",
    icon: <Globe className="w-5 h-5" />,
    architectureType: "dense",
  },
  {
    id: "claude",
    name: "Claude",
    tagline: "The Master of Nuance",
    expertise: "Expertise: Natural prose, long-form document synthesis, and human-like interaction.",
    totalParams: 480,
    color: "text-warning",
    borderColor: "border-warning/30",
    bgColor: "bg-warning/15",
    icon: <Zap className="w-5 h-5" />,
    architectureType: "dense",
  },
  {
    id: "mistral-large",
    name: "Mistral Large",
    tagline: "The Low-Latency Specialist",
    expertise: "Expertise: Real-time data processing and edge-deployment efficiency.",
    totalParams: 123,
    color: "text-success",
    borderColor: "border-success/30",
    bgColor: "bg-success/15",
    icon: <Gauge className="w-5 h-5" />,
    architectureType: "dense",
  },
  {
    id: "mistral-7b",
    name: "Mistral 7B",
    tagline: "The Edge Runner",
    expertise: "Expertise: Ultra-lightweight deployment, on-device inference, and cost-efficient fine-tuning for specialized tasks.",
    totalParams: 7,
    color: "text-success",
    borderColor: "border-success/30",
    bgColor: "bg-success/15",
    icon: <Gauge className="w-5 h-5" />,
    architectureType: "dense",
  },
];

const maxParams = 671;

const IntelligenceLandscapeSlide = () => {
  const [showActiveMoE, setShowActiveMoE] = useState(false);
  const [hoveredModel, setHoveredModel] = useState<string | null>(null);

  const getRadius = (params: number) => {
    // Use sqrt scaling for area-proportional representation
    const minR = 20;
    const maxR = 100;
    return minR + Math.sqrt(params / maxParams) * (maxR - minR);
  };

  return (
    <section id="intelligence-landscape" className="min-h-screen flex items-center py-24 px-4 md:px-6">
      <div className="max-w-5xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-sm font-mono text-primary mb-3 tracking-wider"
        >
          Section 11
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          The Scale of Intelligence
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg mb-8 max-w-2xl"
        >
          Parameters vs. Architecture — raw size tells only half the story.
        </motion.p>

        {/* MoE Toggle */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 mb-10"
        >
          <button
            onClick={() => setShowActiveMoE(!showActiveMoE)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              showActiveMoE
                ? "bg-primary/20 text-primary border border-primary/40 glow-primary"
                : "glass-panel text-muted-foreground hover:text-foreground"
            }`}
          >
            {showActiveMoE ? (
              <ToggleRight className="w-5 h-5" />
            ) : (
              <ToggleLeft className="w-5 h-5" />
            )}
            Show Active Parameters (MoE Efficiency)
          </button>
          {showActiveMoE && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xs text-primary font-mono"
            >
              DeepSeek: 671B → 37B active per token
            </motion.span>
          )}
        </motion.div>

        <div className="grid md:grid-cols-[1fr,280px] gap-6">
          {/* Size Proportionality Map */}
          <div className="glass-panel rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <span className="font-mono text-sm text-muted-foreground">parameter_scale.map</span>
              <span className="text-xs text-muted-foreground">
                {showActiveMoE ? "Active params view" : "Total params view"}
              </span>
            </div>

            <div className="relative w-full aspect-[3/2] flex items-center justify-center">
              {/* Grid background */}
              <div className="absolute inset-0 grid-pattern opacity-15 rounded-xl" />

              {/* Model spheres */}
              <div className="relative flex items-end justify-center gap-4 md:gap-6 w-full h-full pb-12 pt-6">
                {models.map((model) => {
                  const displayParams =
                    showActiveMoE && model.activeParams
                      ? model.activeParams
                      : model.totalParams;
                  const radius = getRadius(displayParams);
                  const isHovered = hoveredModel === model.id;
                  const diameter = radius * 2;

                  return (
                    <div
                      key={model.id}
                      className="flex flex-col items-center justify-end flex-1"
                      onMouseEnter={() => setHoveredModel(model.id)}
                      onMouseLeave={() => setHoveredModel(null)}
                    >
                      <motion.div
                        animate={{
                          width: diameter,
                          height: diameter,
                        }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className={`rounded-full ${model.bgColor} border-2 ${model.borderColor} flex items-center justify-center cursor-pointer relative ${
                          isHovered ? "glow-primary" : ""
                        }`}
                        style={{ minWidth: 60, minHeight: 60 }}
                      >
                        <div className="text-center">
                          <div className={`${model.color} mb-1 flex justify-center`}>
                            {model.icon}
                          </div>
                          <motion.p
                            key={displayParams}
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            className={`text-lg md:text-xl font-bold font-mono ${model.color}`}
                          >
                            {displayParams}B
                          </motion.p>
                        </div>

                        {/* MoE badge */}
                        {model.architectureType === "moe" && (
                          <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-mono bg-primary/30 text-primary border border-primary/40">
                            MoE
                          </span>
                        )}
                      </motion.div>

                      {/* Model label */}
                      <p className={`mt-3 text-sm font-semibold ${model.color}`}>
                        {model.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {showActiveMoE && model.activeParams
                          ? `${model.activeParams}B active`
                          : `${model.totalParams}B total`}
                      </p>
                      {model.architectureType === "dense" && (
                        <span className="text-[9px] text-muted-foreground/60 font-mono mt-0.5">
                          Dense
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Hover info cards */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-mono mb-2">
              HOVER A SPHERE FOR DETAILS →
            </p>
            <AnimatePresence mode="wait">
              {hoveredModel ? (
                <motion.div
                  key={hoveredModel}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="glass-panel-strong rounded-xl p-5"
                >
                  {(() => {
                    const m = models.find((mod) => mod.id === hoveredModel)!;
                    return (
                      <>
                        <div className={`flex items-center gap-2 mb-2 ${m.color}`}>
                          {m.icon}
                          <span className="font-semibold text-lg">{m.name}</span>
                        </div>
                        <p className={`text-sm font-medium ${m.color} mb-2 italic`}>
                          "{m.tagline}"
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {m.expertise}
                        </p>
                        {m.activeParams && (
                          <div className="mt-3 glass-panel rounded-lg p-3">
                            <p className="text-xs font-mono text-primary">
                              Total: {m.totalParams}B → Active: {m.activeParams}B per token
                            </p>
                            <div className="mt-2 h-2 rounded-full bg-secondary/40 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full bg-primary/60"
                                animate={{
                                  width: showActiveMoE
                                    ? `${(m.activeParams / m.totalParams) * 100}%`
                                    : "100%",
                                }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {showActiveMoE
                                ? `Only ${Math.round((m.activeParams / m.totalParams) * 100)}% of parameters active`
                                : "Toggle MoE to see active parameters"}
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-panel rounded-xl p-5 flex flex-col items-center justify-center min-h-[200px] text-muted-foreground/40"
                >
                  <Brain className="w-10 h-10 mb-3 animate-pulse-glow" />
                  <p className="text-sm text-center">
                    Hover over a model sphere to see its expertise profile
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Architecture cards */}
            {[
              {
                label: "Dense Architecture",
                desc: "All parameters active for every token. Full power, higher compute cost.",
                badge: "Always fully active",
              },
              {
                label: "MoE Architecture",
                desc: "Council of Experts — only relevant sub-networks fire per token. Massive capacity, lean execution.",
                badge: "Selective activation",
              },
            ].map((arch) => (
              <motion.div
                key={arch.label}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="glass-panel rounded-xl p-4"
              >
                <p className="text-sm font-semibold text-foreground mb-1">{arch.label}</p>
                <p className="text-xs text-muted-foreground">{arch.desc}</p>
                <span className="inline-block mt-2 px-2 py-0.5 rounded-md text-[10px] font-mono bg-secondary/50 text-muted-foreground">
                  {arch.badge}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Logic Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 glass-panel-strong rounded-2xl p-6 max-w-4xl mx-auto text-center"
        >
          <p className="text-sm md:text-base text-foreground/90 leading-relaxed">
            <span className="text-primary font-semibold">Size ≠ Quality.</span>{" "}
            A model's structure—whether{" "}
            <span className="text-accent font-medium">'Dense'</span> (always fully active) or{" "}
            <span className="text-primary font-medium">'MoE'</span> (Council of Experts)—determines
            its proficiency. True velocity comes from matching the task to the model's architectural
            expertise.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default IntelligenceLandscapeSlide;
