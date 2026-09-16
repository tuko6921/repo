import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { Info, Scissors, AlignLeft, Layers, AlertTriangle } from "lucide-react";

const exampleSentence =
  "Juliet died of a broken heart, a detail often lost in high-level summaries. Romeo never learned the truth, which changed everything.";

const TOKENS = [
  "Jul", "iet", " ", "died", " ", "of", " ", "a", " ", "broken", " ",
  "heart", ",", " ", "a", " ", "det", "ail", " ", "often", " ", "lost",
  " ", "in", " ", "high", "-", "level", " ", "summ", "aries", ".",
  " ", "Romeo", " ", "never", " ", "learn", "ed", " ", "the", " ",
  "truth", ",", " ", "which", " ", "changed", " ", "every", "thing", "."
];

const TOKEN_COLORS = [
  "bg-[hsl(199,89%,48%,0.25)] border-[hsl(199,89%,48%,0.5)]",
  "bg-[hsl(263,70%,58%,0.25)] border-[hsl(263,70%,58%,0.5)]",
  "bg-[hsl(142,71%,45%,0.25)] border-[hsl(142,71%,45%,0.5)]",
  "bg-[hsl(38,92%,50%,0.25)] border-[hsl(38,92%,50%,0.5)]",
  "bg-[hsl(0,84%,60%,0.25)] border-[hsl(0,84%,60%,0.5)]",
];

type ChunkingMethod = "fixed" | "sentence" | "overlap" | "sentence-overlap";

const methodInfo: Record<ChunkingMethod, { label: string; icon: React.ReactNode; tag: string }> = {
  fixed: { label: "Fixed-Size", icon: <Scissors className="w-4 h-4" />, tag: "High Volume, Low Coherence" },
  sentence: { label: "Sentence-Aware", icon: <AlignLeft className="w-4 h-4" />, tag: "Preserves Meaning" },
  overlap: { label: "Overlapping", icon: <Layers className="w-4 h-4" />, tag: "Contextual Glue" },
  "sentence-overlap": { label: "Sentence + Overlap", icon: <Layers className="w-4 h-4" />, tag: "Best of Both" },
};

const AnatomyOfChunkSlide = () => {
  const [method, setMethod] = useState<ChunkingMethod>("fixed");
  const [showInfo, setShowInfo] = useState(false);
  const [inputText] = useState(exampleSentence);

  const wordCount = inputText.split(/\s+/).filter(Boolean).length;
  const tokenCount = TOKENS.filter((t) => !/^\s+$/.test(t)).length;

  const fixedChunks = useMemo(() => {
    const size = 28;
    const chunks: string[] = [];
    for (let i = 0; i < inputText.length; i += size) {
      chunks.push(inputText.slice(i, i + size));
    }
    return chunks;
  }, [inputText]);

  const sentenceChunks = useMemo(() => {
    return inputText.split(/(?<=\.)\s*/).filter(Boolean);
  }, [inputText]);

  // Simple overlap chunks: split at comma, with overlap
  const overlapChunks = useMemo(() => {
    const mid = inputText.indexOf(",") + 1;
    const overlapSize = 8;
    const chunkA = inputText.slice(0, mid + overlapSize);
    const chunkB = inputText.slice(mid - overlapSize);
    const overlapText = inputText.slice(mid - overlapSize, mid + overlapSize);
    return { chunkA, chunkB, overlapText, overlapStart: mid - overlapSize, overlapEnd: mid + overlapSize };
  }, [inputText]);

  // Sentence-aware overlap: each chunk gets its own sentence + the adjacent sentence as overlap
  // Sentence + overlap: split at sentence boundary, bleed a few words across
  const sentenceOverlapChunks = useMemo(() => {
    const sentences = inputText.split(/(?<=\.)\s*/).filter(Boolean);
    if (sentences.length <= 1) return [{ main: inputText, overlap: "" }];
    const s2Words = (sentences[1] || "").split(/\s+/);
    const overlapText = s2Words.slice(0, 3).join(" "); // "Romeo never learned"
    return [
      { main: sentences[0], overlap: overlapText },
      { main: s2Words.slice(3).join(" "), overlap: overlapText },
    ];
  }, [inputText]);

  return (
    <section id="anatomy-chunk" className="min-h-screen flex items-center py-24 px-6">
      <div className="max-w-6xl mx-auto w-full">
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="text-sm font-mono text-primary mb-3 tracking-wider">
          Section 04b
        </motion.p>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-4">
          The Anatomy of a Chunk
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.2 }} className="text-muted-foreground text-lg mb-12 max-w-2xl">
          Tokens and Contextual Glue — how LLMs slice text, and why the seams matter.
        </motion.p>

        <div className="grid lg:grid-cols-[1fr_280px] gap-6">
          {/* Main panel */}
          <div className="space-y-6">
            {/* Tokenizer */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                  <span className="w-3 h-3 rounded-full bg-destructive/60 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-warning/60 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-success/60 inline-block" />
                  <span className="ml-2">tokenizer.py</span>
                </div>
                <div className="flex gap-4 text-xs font-mono">
                  <span className="text-muted-foreground">Words: <span className="text-foreground">{wordCount}</span></span>
                  <span className="text-muted-foreground">Tokens: <span className="text-primary">{tokenCount}</span></span>
                </div>
              </div>

              <div className="glass-panel-strong rounded-xl p-4 mb-4 font-mono text-sm text-foreground/80 leading-relaxed">
                {inputText}
              </div>

              <div className="flex flex-wrap gap-1">
                {TOKENS.map((token, i) =>
                  /^\s+$/.test(token) ? (
                    <div key={i} className="w-1" />
                  ) : (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className={`px-2 py-1 rounded border font-mono text-xs ${TOKEN_COLORS[i % TOKEN_COLORS.length]}`}
                    >
                      {token}
                    </motion.div>
                  )
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-3 italic">
                LLMs read fragments, not words — "summaries" becomes ["summ", "aries"].
              </p>
            </div>

            {/* Chunking strategy */}
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4 text-xs font-mono text-muted-foreground">
                <Scissors className="w-3.5 h-3.5" />
                chunking_strategy
              </div>

              <div className="flex gap-2 mb-6 flex-wrap">
                {(Object.keys(methodInfo) as ChunkingMethod[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition-all ${
                      method === m
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "glass-panel text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {methodInfo[m].icon}
                    <span className="text-xs">{methodInfo[m].label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {method === "fixed" && (
                  <motion.div key="fixed" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                    <div className="flex gap-2 flex-wrap">
                      {fixedChunks.map((chunk, i) => (
                        <div key={i} className="glass-panel-strong rounded-lg px-3 py-2 font-mono text-xs text-foreground/80 border border-destructive/30 relative">
                          <span className="absolute -top-2 -left-1 text-[10px] font-mono text-destructive/60">
                            {i * 28}:{Math.min((i + 1) * 28, inputText.length)}
                          </span>
                          {chunk}
                          {!chunk.endsWith(" ") && i < fixedChunks.length - 1 && (
                            <span className="text-destructive font-bold">|</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs font-mono mt-2 px-1">
                      <span className="text-destructive/80">⚠</span>{" "}
                      <span className="text-muted-foreground">{methodInfo.fixed.tag} — words get sliced mid-token.</span>
                    </p>
                  </motion.div>
                )}

                {method === "sentence" && (
                  <motion.div key="sentence" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-2">
                    {sentenceChunks.map((chunk, i) => (
                      <div key={i} className="glass-panel-strong rounded-lg px-4 py-3 font-mono text-xs text-foreground/80 border border-success/30">
                        <span className="text-success/60 text-[10px] mr-2">chunk_{i}</span>
                        {chunk}
                      </div>
                    ))}
                    <p className="text-xs font-mono mt-2 px-1">
                      <span className="text-success/80">✓</span>{" "}
                      <span className="text-muted-foreground">{methodInfo.sentence.tag} — the slicer waits for a period.</span>
                    </p>
                  </motion.div>
                )}

                {method === "overlap" && (
                  <motion.div key="overlap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                    <div className="relative space-y-1">
                      <div className="glass-panel-strong rounded-lg px-4 py-3 font-mono text-xs border border-primary/30 relative">
                        <span className="text-primary/60 text-[10px] mr-2">chunk_A</span>
                        <span className="text-foreground/80">{overlapChunks.chunkA.slice(0, overlapChunks.chunkA.length - 16)}</span>
                        <span className="bg-warning/20 text-warning border-b border-warning/50 px-0.5">
                          {overlapChunks.chunkA.slice(overlapChunks.chunkA.length - 16)}
                        </span>
                      </div>
                      <div className="glass-panel-strong rounded-lg px-4 py-3 font-mono text-xs border border-accent/30 relative">
                        <span className="text-accent/60 text-[10px] mr-2">chunk_B</span>
                        <span className="bg-warning/20 text-warning border-b border-warning/50 px-0.5">
                          {overlapChunks.chunkB.slice(0, 16)}
                        </span>
                        <span className="text-foreground/80">{overlapChunks.chunkB.slice(16)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-px flex-1 bg-warning/30" />
                        <span className="text-[10px] font-mono text-warning/80 whitespace-nowrap">← Contextual Overlap (≈15%) →</span>
                        <div className="h-px flex-1 bg-warning/30" />
                      </div>
                    </div>
                    <p className="text-xs font-mono px-1">
                      <span className="text-warning/80">◆</span>{" "}
                      <span className="text-muted-foreground">{methodInfo.overlap.tag} — shared text bridges ideas across chunks.</span>
                    </p>
                  </motion.div>
                )}

                {method === "sentence-overlap" && (
                  <motion.div key="sentence-overlap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                    <div className="relative space-y-1">
                      {sentenceOverlapChunks.map((chunk, i) => (
                        <div key={i} className="glass-panel-strong rounded-lg px-4 py-3 font-mono text-xs border border-accent/30 relative">
                          <span className="text-accent/60 text-[10px] mr-2">chunk_{i}</span>
                          {i === 0 ? (
                            <>
                              <span className="text-foreground/80">{chunk.main} </span>
                              <span className="bg-warning/20 text-warning border-b border-warning/50 px-0.5">
                                {chunk.overlap}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="bg-warning/20 text-warning border-b border-warning/50 px-0.5">
                                {chunk.overlap}
                              </span>
                              <span className="text-foreground/80"> {chunk.main}</span>
                            </>
                          )}
                        </div>
                      ))}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="h-px flex-1 bg-warning/30" />
                        <span className="text-[10px] font-mono text-warning/80 whitespace-nowrap">← Sentence-boundary overlap →</span>
                        <div className="h-px flex-1 bg-warning/30" />
                      </div>
                    </div>
                    <p className="text-xs font-mono px-1">
                      <span className="text-accent/80">★</span>{" "}
                      <span className="text-muted-foreground">{methodInfo["sentence-overlap"].tag} — splits at sentence boundaries AND shares adjacent sentences as overlap, preserving both coherence and context bridges.</span>
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="glass-panel rounded-xl p-5 border-l-2 border-primary/40">
              <p className="text-sm text-foreground/85 leading-relaxed font-mono">
                "As you zoom in and summarize to handle larger volumes, you sacrifice fine details.{" "}
                <span className="text-primary">Small chunks with high overlap</span> ensure the 'one-liners'
                aren't lost in the noise of the library."
              </p>
            </motion.div>
          </div>

          {/* Info sidebar */}
          <div className="space-y-4">
            <button onClick={() => setShowInfo(!showInfo)} className="lg:hidden flex items-center gap-2 text-sm text-primary font-mono">
              <Info className="w-4 h-4" /> Technical Deep Dive
            </button>

            <div className={`space-y-4 ${showInfo ? "block" : "hidden lg:block"}`}>
              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-xs font-mono text-primary/80">
                  <Info className="w-3.5 h-3.5" />
                  THE TRADE-OFF
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  As you zoom in and summarize to handle larger volumes, you sacrifice fine details.
                  Small chunks with high overlap ensure the "one-liners" aren't lost in the "noise" of
                  the library.
                </p>
              </div>

              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-xs font-mono text-warning/80">
                  <Layers className="w-3.5 h-3.5" />
                  WHY OVERLAP?
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Without overlap, the model loses the "bridge" between concepts. If a question's answer spans two chunks, the AI won't see the full picture — overlap ensures continuity across boundaries.
                </p>
              </div>

              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-xs font-mono text-destructive/80">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  TOO MUCH OVERLAP?
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Excessive overlap ({">"} 25%) wastes your context window budget by repeating the same text across many chunks. The model sees redundant data instead of new information — retrieval slows, storage bloats, and you hit token limits faster. <span className="text-warning">Sweet spot: 10–20% overlap.</span>
                </p>
              </div>

              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-xs font-mono text-accent/80">
                  <AlignLeft className="w-3.5 h-3.5" />
                  TOKEN ≠ WORD
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Tokenizers split text into sub-word fragments. A 13-word sentence may produce 20+
                  tokens — this affects context window budgets and chunk sizing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnatomyOfChunkSlide;
