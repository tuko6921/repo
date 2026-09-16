/**
 * ShipCard Component
 * Design: Aerospace Command Center - Compact ship information display
 * Features: Class hexagon badge, status indicator, terminal count
 */

import type { Ship, Terminal } from "@/../../shared/types";
import { cn } from "@/lib/utils";

interface ShipCardProps {
  ship: Ship;
  terminals: Terminal[];
  isSelected: boolean;
  onClick: () => void;
}

export default function ShipCard({
  ship,
  terminals,
  isSelected,
  onClick,
}: ShipCardProps) {
  const activeTerminals = terminals.filter((t) => t.status === "active").length;
  const totalTerminals = terminals.length;

  return (
    <div
      onClick={onClick}
      className={cn(
        "data-row group",
        isSelected && "bg-gray-800 border-l-cyan-400 border-l-2"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Ship Class Hexagon Badge */}
        <div className="hexagon-badge">{ship.class}</div>

        {/* Ship Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-cyan-400 truncate">
            {ship.name}
          </h3>
          <p className="text-xs text-gray-400 font-mono truncate">
            {ship.hullNumber}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-lime-400">
              {activeTerminals}/{totalTerminals} active
            </span>
            {activeTerminals > 0 && (
              <span className="inline-block w-2 h-2 bg-lime-400 rounded-full pulse-indicator" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
