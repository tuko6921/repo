import { motion } from "framer-motion";
import { useState } from "react";
import { Brain, Cpu, Database, Palette, Server, Shield, Zap, Code, Globe } from "lucide-react";

interface Expert {
  id: string;
  label: string;
  domain: string;
  icon: React.ReactNode;
  proficiency: number;
}

const experts: Expert[] = [
  { id: "fe", label: "Frontend", domain: "UI/UX", icon: <Palette className="w-5 h-5" />, proficiency: 92 },
  { id: "be", label: "Backend", domain: "APIs", icon: <Server className="w-5 h-5" />, proficiency: 88 },
  { id: "db", label: "Database", domain: "Schema", icon: <Database className="w-5 h-5" />, proficiency: 85 },
  { id: "infra", label: "DevOps", domain: "Infra", icon: <Globe className="w-5 h-5" />, proficiency: 78 },
  { id: "sec", label: "Security", domain: "Auth", icon: <Shield className="w-5 h-5" />, proficiency: 90 },
  { id: "ml", label: "ML/AI", domain: "Models", icon: <Brain className="w-5 h-5" />, proficiency: 82 },
  { id: "perf", label: "Performance", domain: "Optimization", icon: <Zap className="w-5 h-5" />, proficiency: 75 },
  { id: "arch", label: "Architecture", domain: "Design", icon: <Cpu className="w-5 h-5" />, proficiency: 87 },
  { id: "test", label: "QA/Testing", domain: "Quality", icon: <Code className="w-5 h-5" />, proficiency: 80 },
];

interface Task {
  id: string;
  label: string;
  description: string;
  activates: string[];
}

const tasks: Task[] = [
  {
    id: "auth",
    label: "Build Auth Flow",
    description: "Login page with OAuth, session management, and role-based access",
    activates: ["fe", "be", "sec", "db"],
  },
  {
    id: "dashboard",
    label: "Analytics Dashboard",
    description: "Real-time charts, data aggregation, and performance-optimized queries",
    activates: ["fe", "db", "perf"],
  },
  {
    id: "deploy",
    label: "CI/CD Pipeline",
    description: "Automated testing, containerization, and zero-downtime deployment",
    activates: ["infra", "test", "arch"],
  },
  {
    id: "ai-feature",
    label: "AI Recommendation Engine",
    description: "ML model integration, embedding pipeline, and API endpoints",
    activates: ["ml", "be", "db", "arch"],
  },
];

const CouncilOfExpertsSlide = () => {
  const [activeTask, setActiveTask] = useState<string | null>(null);

  const selectedTask = tasks.find((t) => t.id === activeTask);
  const activeExperts = selectedTask?.activates || [];

  return (
    <section id="council-of-experts" className="min-h-screen flex items-center py-24 px-6">
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
          The Council of Experts
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg mb-12 max-w-2xl"
        >
          A Mixture of Experts (MoE) model for engineering teams — only the most proficient specialists activate for each task, maximizing efficiency.
        </motion.p>

        <div className="grid md:grid-cols-[1fr,320px] gap-8">
          {/* Expert grid */}
          <div className="glass-panel rounded-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-mono text-sm text-primary font-semibold flex items-center gap-2">
                <Brain className="w-4 h-4" />
                expert_council.grid
              </h3>
              <span className="text-xs text-muted-foreground">
                {activeExperts.length > 0
                  ? `${activeExperts.length}/${experts.length} experts active`
                  : "Select a task to route"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {experts.map((expert) => {
                const isActive = activeExperts.includes(expert.id);
                const isDimmed = activeTask !== null && !isActive;

                return (
                  <motion.div
                    key={expert.id}
                    animate={{
                      opacity: isDimmed ? 0.25 : 1,
                      scale: isActive ? 1.03 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className={`rounded-xl p-4 text-center transition-all ${
                      isActive
                        ? "bg-primary/15 border border-primary/40 glow-primary"
                        : "glass-panel"
                    }`}
                  >
                    <div className={`flex justify-center mb-2 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                      {expert.icon}
                    </div>
                    <p className={`text-sm font-semibold ${isActive ? "text-primary" : "text-foreground/70"}`}>
                      {expert.label}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{expert.domain}</p>

                    {/* Proficiency bar */}
                    <div className="mt-2 h-1 rounded-full bg-secondary/40 overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${isActive ? "bg-primary" : "bg-muted-foreground/30"}`}
                        animate={{ width: `${expert.proficiency}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                    <p className="text-[9px] text-muted-foreground mt-1 font-mono">{expert.proficiency}%</p>
                  </motion.div>
                );
              })}
            </div>

            {/* Active task info */}
            {selectedTask && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel-strong rounded-xl p-4 font-mono text-xs"
              >
                <p className="text-primary mb-1">// Task routed → {selectedTask.label}</p>
                <p className="text-muted-foreground">{selectedTask.description}</p>
                <p className="text-success mt-2">
                  // Activated: [{activeExperts.join(", ")}] — {experts.length - activeExperts.length} experts idle (saving resources)
                </p>
              </motion.div>
            )}
          </div>

          {/* Task selector */}
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground font-mono mb-2">SELECT TASK TO ROUTE →</p>
            {tasks.map((task) => (
              <motion.button
                key={task.id}
                onClick={() => setActiveTask(activeTask === task.id ? null : task.id)}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className={`w-full text-left rounded-xl p-4 transition-all ${
                  activeTask === task.id
                    ? "bg-primary/15 border border-primary/30 ring-1 ring-primary/20"
                    : "glass-panel hover:border-primary/20"
                }`}
              >
                <p className={`text-sm font-semibold mb-1 ${
                  activeTask === task.id ? "text-primary" : "text-foreground"
                }`}>
                  {task.label}
                </p>
                <p className="text-xs text-muted-foreground">{task.description}</p>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {task.activates.map((expertId) => (
                    <span
                      key={expertId}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${
                        activeTask === task.id
                          ? "bg-primary/20 text-primary"
                          : "bg-secondary/50 text-muted-foreground"
                      }`}
                    >
                      {expertId}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="glass-panel rounded-xl p-4 mt-4 text-xs text-muted-foreground"
            >
              <p className="font-semibold text-foreground mb-1">MoE Efficiency Principle</p>
              <p>
                Like a Mixture of Experts neural network, only the relevant sub-networks fire for each input — idle experts consume zero resources, maximizing throughput.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CouncilOfExpertsSlide;
