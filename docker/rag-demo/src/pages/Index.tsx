import HeroSlide from "@/components/HeroSlide";
import MemoryMythSlide from "@/components/MemoryMythSlide";
import ContextWindowSlide from "@/components/ContextWindowSlide";
import VectorSpaceSlide from "@/components/VectorSpaceSlide";
import VectorDriftSlide from "@/components/VectorDriftSlide";
import ChunkingSlide from "@/components/ChunkingSlide";
import AnatomyOfChunkSlide from "@/components/AnatomyOfChunkSlide";
import RetrievalSlide from "@/components/RetrievalSlide";
import HybridSearchSlide from "@/components/HybridSearchSlide";
import RerankerSlide from "@/components/RerankerSlide";
import MultiQuerySlide from "@/components/MultiQuerySlide";
import CouncilOfExpertsSlide from "@/components/CouncilOfExpertsSlide";
import ModularParallelismSlide from "@/components/ModularParallelismSlide";
import IntelligenceLandscapeSlide from "@/components/IntelligenceLandscapeSlide";
import RAGPipelineSlide from "@/components/RAGPipelineSlide";
import ClosingSlide from "@/components/ClosingSlide";
import StickyNav from "@/components/StickyNav";

const Index = () => {
  return (
    <div className="relative">
      <StickyNav />
      <HeroSlide />
      <MemoryMythSlide />
      <ContextWindowSlide />
      <VectorSpaceSlide />
      <VectorDriftSlide />
      <ChunkingSlide />
      <AnatomyOfChunkSlide />
      <RetrievalSlide />
      <HybridSearchSlide />
      <RerankerSlide />
      <MultiQuerySlide />
      <CouncilOfExpertsSlide />
      <ModularParallelismSlide />
      <IntelligenceLandscapeSlide />
      <RAGPipelineSlide />
      <ClosingSlide />
    </div>
  );
};

export default Index;
