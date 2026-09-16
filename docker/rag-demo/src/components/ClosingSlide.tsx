import { motion } from "framer-motion";

const ClosingSlide = () => {
  return (
    <section
      id="closing"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >
      <div className="absolute inset-0 grid-pattern opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--glow-primary)/0.12),transparent_70%)]" />

      <div className="relative z-10 text-center">
        <motion.h2
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-6xl md:text-8xl font-bold text-gradient-primary"
        >
          Questions?
        </motion.h2>
      </div>
    </section>
  );
};

export default ClosingSlide;
