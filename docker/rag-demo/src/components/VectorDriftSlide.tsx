import { motion } from "framer-motion";
import { useState, useRef, useMemo, useCallback, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import * as THREE from "three";

/* ── Noise point data ── */
const noisePoints = [
  { label: "Drag Queen", offset: [1.2, -0.6, 0.8] },
  { label: "Queen Mattress", offset: [-0.9, -1.0, 0.5] },
  { label: "Queen Bee", offset: [0.5, 0.9, -1.1] },
  { label: "Freddie Mercury", offset: [-0.7, 0.4, -0.9] },
] as const;

const KING_POS = new THREE.Vector3(1, 1, 1);
const QUEEN_INITIAL = new THREE.Vector3(-1, 1, 1);
const QUEEN_DRIFTED = new THREE.Vector3(-1.6, 0.4, 1.5);

/* ── Glowing Axis Lines ── */
function GlowingAxes() {
  const axisLength = 3;
  const axes = [
    { dir: [axisLength, 0, 0] as [number, number, number], color: "#ef4444" },
    { dir: [0, axisLength, 0] as [number, number, number], color: "#22c55e" },
    { dir: [0, 0, axisLength] as [number, number, number], color: "#3b82f6" },
  ];
  return (
    <>
      {axes.map(({ dir, color }, i) => (
        <Line
          key={i}
          points={[[0, 0, 0], dir]}
          color={color}
          lineWidth={2}
          transparent
          opacity={0.5}
        />
      ))}
    </>
  );
}

/* ── Grid Floor ── */
function GridFloor() {
  return (
    <gridHelper
      args={[8, 16, "#1e3a5f", "#0d1b2a"]}
      position={[0, -2.5, 0]}
    />
  );
}

/* ── Sphere with glow ── */
function GlowSphere({
  position,
  color,
  label,
  size = 0.18,
  labelOffset = 0.35,
}: {
  position: THREE.Vector3 | [number, number, number];
  color: string;
  label: string;
  size?: number;
  labelOffset?: number;
}) {
  const pos = position instanceof THREE.Vector3 ? position.toArray() : position;
  return (
    <group position={pos as [number, number, number]}>
      {/* Core sphere */}
      <mesh>
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      <Text
        position={[0, labelOffset, 0]}
        fontSize={0.18}
        color={color}
        anchorX="center"
        anchorY="bottom"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
      >
        {label}
      </Text>
    </group>
  );
}

/* ── Noise Point (interactive) ── */
function NoisePoint({
  basePosition,
  offset,
  label,
  visible,
  onHover,
  onUnhover,
}: {
  basePosition: THREE.Vector3;
  offset: readonly [number, number, number];
  label: string;
  visible: boolean;
  onHover: () => void;
  onUnhover: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetPos = useMemo(
    () => new THREE.Vector3(
      basePosition.x + offset[0],
      basePosition.y + offset[1],
      basePosition.z + offset[2]
    ),
    [basePosition, offset]
  );

  const currentPos = useRef(new THREE.Vector3().copy(targetPos));

  useFrame(() => {
    if (!meshRef.current) return;
    if (visible) {
      currentPos.current.lerp(targetPos, 0.05);
      meshRef.current.visible = true;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.min(mat.opacity + 0.03, 0.85);
    } else {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.opacity = Math.max(mat.opacity - 0.05, 0);
      if (mat.opacity <= 0) meshRef.current.visible = false;
    }
    meshRef.current.position.copy(currentPos.current);
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        visible={false}
        onPointerOver={onHover}
        onPointerOut={onUnhover}
      >
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#a78bfa"
          emissiveIntensity={0.6}
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>
      {visible && (
        <Text
          position={[targetPos.x, targetPos.y + 0.22, targetPos.z]}
          fontSize={0.11}
          color="#c4b5fd"
          anchorX="center"
          anchorY="bottom"
          font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

/* ── Animated Queen Sphere ── */
function AnimatedQueen({ drifted }: { drifted: boolean }) {
  const meshRef = useRef<THREE.Group>(null);
  const target = drifted ? QUEEN_DRIFTED : QUEEN_INITIAL;
  const current = useRef(new THREE.Vector3().copy(QUEEN_INITIAL));

  useFrame(() => {
    if (!meshRef.current) return;
    current.current.lerp(target, 0.02);
    meshRef.current.position.copy(current.current);
  });

  return (
    <group ref={meshRef} position={QUEEN_INITIAL.toArray()}>
      <mesh>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial
          color="#f472b6"
          emissive="#f472b6"
          emissiveIntensity={1.5}
          toneMapped={false}
        />
      </mesh>
      <Text
        position={[0, 0.35, 0]}
        fontSize={0.18}
        color="#f472b6"
        anchorX="center"
        anchorY="bottom"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf"
      >
        Queen
      </Text>
    </group>
  );
}

/* ── Symmetry Line between King & Queen ── */
function SymmetryLine({ drifted }: { drifted: boolean }) {
  const lineRef = useRef<any>(null);
  const queenPos = useRef(new THREE.Vector3().copy(QUEEN_INITIAL));
  const target = drifted ? QUEEN_DRIFTED : QUEEN_INITIAL;

  useFrame(() => {
    queenPos.current.lerp(target, 0.02);
    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position;
      positions.setXYZ(0, KING_POS.x, KING_POS.y, KING_POS.z);
      positions.setXYZ(1, queenPos.current.x, queenPos.current.y, queenPos.current.z);
      positions.needsUpdate = true;
    }
  });

  return (
    <line ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[new Float32Array([
            KING_POS.x, KING_POS.y, KING_POS.z,
            QUEEN_INITIAL.x, QUEEN_INITIAL.y, QUEEN_INITIAL.z
          ]), 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={drifted ? "#f59e0b" : "#22d3ee"}
        transparent
        opacity={drifted ? 0.3 : 0.6}
      />
    </line>
  );
}

/* ── Pull Line (hover effect) ── */
function PullLine({
  queenPos,
  noisePos,
  visible,
}: {
  queenPos: THREE.Vector3;
  noisePos: [number, number, number];
  visible: boolean;
}) {
  if (!visible) return null;
  return (
    <Line
      points={[queenPos.toArray() as [number, number, number], noisePos]}
      color="#f59e0b"
      lineWidth={1.5}
      transparent
      opacity={0.5}
      dashed
      dashSize={0.1}
      gapSize={0.05}
    />
  );
}

/* ── Scene ── */
function Scene({
  drifted,
  showNoise,
  hoveredNoise,
  setHoveredNoise,
}: {
  drifted: boolean;
  showNoise: boolean;
  hoveredNoise: number | null;
  setHoveredNoise: (i: number | null) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, 3, -3]} intensity={0.4} color="#a78bfa" />

      <GridFloor />
      <GlowingAxes />

      <GlowSphere position={KING_POS} color="#22d3ee" label="King" />
      <AnimatedQueen drifted={drifted} />
      <SymmetryLine drifted={drifted} />

      {noisePoints.map((np, i) => {
        const noiseWorldPos: [number, number, number] = [
          QUEEN_DRIFTED.x + np.offset[0],
          QUEEN_DRIFTED.y + np.offset[1],
          QUEEN_DRIFTED.z + np.offset[2],
        ];
        return (
          <group key={i}>
            <NoisePoint
              basePosition={QUEEN_DRIFTED}
              offset={np.offset}
              label={np.label}
              visible={showNoise}
              onHover={() => setHoveredNoise(i)}
              onUnhover={() => setHoveredNoise(null)}
            />
            <PullLine
              queenPos={QUEEN_DRIFTED}
              noisePos={noiseWorldPos}
              visible={hoveredNoise === i && showNoise}
            />
          </group>
        );
      })}

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={10}
        autoRotate={false}
      />
    </>
  );
}

/* ── Main Slide ── */
const VectorDriftSlide = () => {
  const [drifted, setDrifted] = useState(false);
  const [showNoise, setShowNoise] = useState(false);
  const [hoveredNoise, setHoveredNoise] = useState<number | null>(null);

  const handleAnalyze = useCallback(() => {
    if (!drifted) {
      setDrifted(true);
      setTimeout(() => setShowNoise(true), 1500);
    } else {
      setShowNoise(false);
      setDrifted(false);
      setHoveredNoise(null);
    }
  }, [drifted]);

  return (
    <section id="vector-drift" className="min-h-screen flex items-center py-24 px-6">
      <div className="max-w-7xl mx-auto w-full">
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
          Vector Ambiguity: When Symmetry Breaks
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg mb-10 max-w-2xl"
        >
          Explore how word vectors drift from ideal symmetry due to polysemy and training noise.
        </motion.p>

        <div className="grid lg:grid-cols-[1fr,340px] gap-6">
          {/* 3D Canvas */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-2xl overflow-hidden relative"
            style={{ minHeight: 480 }}
          >
            <div className="absolute top-4 left-4 z-10 flex items-center gap-3">
              <span className="font-mono text-xs text-muted-foreground">vector_space.3d</span>
              {drifted && showNoise && (
                <span className="text-xs text-warning font-mono animate-pulse">
                  ⚠ drift detected
                </span>
              )}
            </div>

            <Suspense
              fallback={
                <div className="w-full h-full min-h-[480px] flex items-center justify-center text-muted-foreground text-sm">
                  Loading 3D scene…
                </div>
              }
            >
              <Canvas
                camera={{ position: [4, 3, 5], fov: 45 }}
                style={{ height: 480 }}
                gl={{ antialias: true, alpha: true }}
                onCreated={({ gl }) => {
                  gl.setClearColor("#060d18", 1);
                  gl.toneMapping = THREE.ACESFilmicToneMapping;
                  gl.toneMappingExposure = 1.2;
                }}
              >
                <Scene
                  drifted={drifted}
                  showNoise={showNoise}
                  hoveredNoise={hoveredNoise}
                  setHoveredNoise={setHoveredNoise}
                />
              </Canvas>
            </Suspense>

            <div className="absolute bottom-4 left-4 right-4 flex gap-3 z-10">
              <button
                onClick={handleAnalyze}
                className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
              >
                {drifted ? "Reset Symmetry" : "⚡ Analyze Drift"}
              </button>
            </div>
          </motion.div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Symmetry card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-panel rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400/30 border border-cyan-400/40" />
                <span className="text-sm font-medium text-cyan-400">King</span>
                <span className="text-muted-foreground text-xs mx-1">↔</span>
                <span className="w-2.5 h-2.5 rounded-full bg-pink-400/30 border border-pink-400/40" />
                <span className="text-sm font-medium text-pink-400">Queen</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {drifted
                  ? "The symmetry line is now distorted. Training noise from unrelated usages pulls the 'Queen' vector away."
                  : "Perfectly symmetrical — King and Queen sit at mirrored coordinates in vector space."}
              </p>
            </motion.div>

            {/* Noise legend */}
            {showNoise && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel rounded-xl p-4"
              >
                <span className="text-xs font-mono text-accent mb-2 block">
                  noise_cloud.ambiguity
                </span>
                <div className="space-y-2">
                  {noisePoints.map((np, i) => (
                    <div
                      key={i}
                      onMouseEnter={() => setHoveredNoise(i)}
                      onMouseLeave={() => setHoveredNoise(null)}
                      className={`flex items-center gap-2 text-xs rounded-lg px-2 py-1.5 cursor-pointer transition-colors ${
                        hoveredNoise === i
                          ? "bg-accent/10 text-accent"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                      {np.label}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Insight */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-panel rounded-xl p-4"
            >
              <span className="text-xs font-mono text-warning mb-2 block">insight</span>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A vector is a mathematical average of every time a word was seen in training. This "Drift" explains why raw semantic search can fail—and why we need{" "}
                <span className="text-primary font-medium">Metadata</span> and{" "}
                <span className="text-primary font-medium">Rerankers</span> to restore precision.
              </p>
            </motion.div>

            <p className="text-[10px] text-muted-foreground/50 px-1">
              Drag to rotate · Scroll to zoom · Hover noise points to see pull effect
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VectorDriftSlide;
