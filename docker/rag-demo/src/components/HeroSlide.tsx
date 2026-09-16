import { motion } from "framer-motion";

const HeroSlide = () => {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Grid background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />

      {/* Radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--glow-primary)/0.15),transparent_70%)]" />

      <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8"
        >
          <span className="text-gradient-primary">Retrieval-Augmented</span>
          <br />
          <span className="text-foreground">Generation</span>
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-primary to-transparent mb-8"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
        >
          Solving the Context Window
        </motion.p>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="mt-16 flex flex-col items-center gap-2 text-muted-foreground"
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-px h-8 bg-gradient-to-b from-primary/60 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSlide;
