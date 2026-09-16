import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Package, Send, RotateCcw } from "lucide-react";

interface Message {
  id: number;
  text: string;
  from: "user" | "llm";
}

const conversationSteps: Message[] = [
  { id: 1, text: "What is RAG?", from: "user" },
  { id: 2, text: "RAG retrieves external docs to augment LLM responses.", from: "llm" },
  { id: 3, text: "How does retrieval work?", from: "user" },
  { id: 4, text: "It uses vector similarity to find relevant chunks.", from: "llm" },
  { id: 5, text: "What about the context window?", from: "user" },
  { id: 6, text: "All prior messages are re-sent as a single prompt.", from: "llm" },
];

const MemoryMythSlide = () => {
  const [step, setStep] = useState(0);
  const [showPackage, setShowPackage] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const visibleMessages = conversationSteps.slice(0, step);

  useEffect(() => {
    if (!autoPlay) return;
    if (step >= conversationSteps.length) {
      const t = setTimeout(() => {
        setShowPackage(true);
        setAutoPlay(false);
      }, 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep((s) => s + 1), 1200);
    return () => clearTimeout(t);
  }, [step, autoPlay]);

  const handleStart = () => {
    setStep(0);
    setShowPackage(false);
    setAutoPlay(true);
  };

  const handleReset = () => {
    setStep(0);
    setShowPackage(false);
    setAutoPlay(false);
  };

  return (
    <section id="memory-myth" className="min-h-screen flex items-center py-24 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="text-sm font-mono text-primary mb-3 tracking-wider"
        >
          Section 01
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          The Memory Myth
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg mb-12 max-w-2xl"
        >
          LLMs don't <em>remember</em> anything. Every turn, the entire conversation is repackaged and shipped back.
        </motion.p>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Chat visualization */}
          <div className="glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-sm text-muted-foreground">conversation.log</span>
              <span className="text-xs text-muted-foreground">
                {visibleMessages.length} / {conversationSteps.length} turns
              </span>
            </div>
            <div className="space-y-3 min-h-[260px]">
              <AnimatePresence>
                {visibleMessages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, x: msg.from === "user" ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`rounded-xl px-4 py-2.5 max-w-[85%] text-sm ${
                        msg.from === "user"
                          ? "bg-primary/15 text-primary border border-primary/20"
                          : "glass-panel-strong text-foreground"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={handleStart}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                <Send className="w-4 h-4" />
                {step === 0 ? "Start Conversation" : "Replay"}
              </button>
              {step > 0 && (
                <button
                  onClick={handleReset}
                  className="px-3 rounded-xl glass-panel text-muted-foreground hover:text-foreground transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Package visualization */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col justify-center">
            {!showPackage && step < conversationSteps.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center gap-4 text-muted-foreground"
              >
                <Package className="w-12 h-12 animate-pulse-glow text-primary/40" />
                <p className="text-sm">Watching conversation build...</p>
              </motion.div>
            )}

            {(showPackage || step >= conversationSteps.length) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  The "Memory" Package
                </h3>
                <p className="text-sm text-muted-foreground">
                  Every query re-sends the entire history as one prompt.
                </p>
                <div className="glass-panel-strong rounded-xl p-4 font-mono text-xs space-y-1 overflow-auto max-h-[200px]">
                  <p className="text-muted-foreground">{"// Full prompt sent to LLM:"}</p>
                  {conversationSteps.map((msg) => (
                    <p key={msg.id} className={msg.from === "user" ? "text-primary" : "text-accent"}>
                      {msg.from === "user" ? "USER:" : " LLM:"} {msg.text}
                    </p>
                  ))}
                  <p className="text-warning mt-2">
                    {"// ⚠ "}{conversationSteps.length} messages × every single call
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MemoryMythSlide;
