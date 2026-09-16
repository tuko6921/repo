/**
 * MainContent Component
 * Design: Aerospace Command Center - Terminal list and details display
 * Features: Terminal rows, lease information, operational notes
 */

import type { Ship, Terminal, SatelliteLease } from "@/../../shared/types";
import { useState } from "react";
import TerminalRow from "./TerminalRow";
import TerminalDetail from "./TerminalDetail";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface MainContentProps {
  selectedShip?: Ship;
  terminals: Terminal[];
  leases: SatelliteLease[];
  onBack: () => void;
}

export default function MainContent({
  selectedShip,
  terminals,
  leases,
  onBack,
}: MainContentProps) {
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>();

  if (!selectedShip) {
    return (
      <div className="main-content flex flex-col items-center justify-center text-center">
        <div className="text-gray-500 space-y-4">
          <h2 className="text-2xl font-bold text-cyan-400">STATEBOARD</h2>
          <p className="text-gray-400">Select a ship from the fleet list</p>
          <p className="text-xs text-gray-600 font-mono">
            to view terminal status and lease information
          </p>
        </div>
      </div>
    );
  }

  const shipTerminals = terminals.filter((t) => t.shipId === selectedShip.id);
  const selectedTerminal = shipTerminals.find(
    (t) => t.id === selectedTerminalId
  );
  const selectedLease = selectedTerminal
    ? leases.find((l) => l.id === selectedTerminal.currentLeaseId)
    : undefined;

  return (
    <div className="main-content flex flex-col h-full">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-8 w-8 p-0 text-gray-500 hover:text-cyan-400"
          >
            <ChevronLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-cyan-400 font-mono">
              {selectedShip.name}
            </h1>
            <p className="text-xs text-gray-400 font-mono">
              {selectedShip.hullNumber} • Class {selectedShip.class}
            </p>
          </div>
        </div>
        {selectedShip.description && (
          <p className="text-sm text-gray-300 ml-11">
            {selectedShip.description}
          </p>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex gap-6">
        {/* Terminal List */}
        <div className="flex-1 overflow-y-auto">
          <h2 className="text-sm font-mono text-lime-400 uppercase mb-3">
            Terminals ({shipTerminals.length})
          </h2>
          <div className="space-y-1">
            {shipTerminals.length === 0 ? (
              <p className="text-gray-500 text-sm">No terminals assigned</p>
            ) : (
              shipTerminals.map((terminal) => {
                const lease = leases.find(
                  (l) => l.id === terminal.currentLeaseId
                );
                return (
                  <TerminalRow
                    key={terminal.id}
                    terminal={terminal}
                    lease={lease}
                    isSelected={selectedTerminalId === terminal.id}
                    onClick={() => setSelectedTerminalId(terminal.id)}
                  />
                );
              })
            )}
          </div>
        </div>

        {/* Terminal Detail Panel */}
        {selectedTerminal && (
          <div className="w-96 border-l border-gray-700 pl-6 overflow-y-auto">
            <TerminalDetail
              terminal={selectedTerminal}
              lease={selectedLease}
            />
          </div>
        )}
      </div>
    </div>
  );
}
