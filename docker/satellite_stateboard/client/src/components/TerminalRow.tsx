/**
 * TerminalRow Component
 * Design: Aerospace Command Center - Data row with status and lease info
 * Features: Terminal type badge, status indicator, lease info, expandable detail
 */

import type { Terminal, SatelliteLease } from "@/../../shared/types";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalRowProps {
  terminal: Terminal;
  lease?: SatelliteLease;
  isSelected: boolean;
  onClick: () => void;
}

const terminalTypeColors: Record<string, string> = {
  UHF: "terminal-badge-uhf",
  VHF: "terminal-badge-vhf",
  "X-Band": "terminal-badge-xband",
  "Ka-Band": "terminal-badge-kaband",
};

const statusColors: Record<Terminal["status"], string> = {
  active: "status-active",
  inactive: "status-inactive",
  maintenance: "status-maintenance",
  standby: "status-standby",
};

export default function TerminalRow({
  terminal,
  lease,
  isSelected,
  onClick,
}: TerminalRowProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "data-row flex items-center justify-between",
        isSelected && "bg-gray-800 border-l-cyan-400 border-l-2"
      )}
    >
      <div className="flex-1 flex items-center gap-4">
        {/* Terminal Designation */}
        <div className="w-24">
          <h4 className="text-sm font-bold text-cyan-400">
            {terminal.designation}
          </h4>
        </div>

        {/* Terminal Type Badge */}
        <div className={cn("terminal-badge", terminalTypeColors[terminal.type])}>
          {terminal.type}
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className={cn("text-xs font-mono", statusColors[terminal.status])}>
            {terminal.status.toUpperCase()}
          </span>
          {terminal.status === "active" && (
            <span className="inline-block w-2 h-2 bg-lime-400 rounded-full pulse-indicator" />
          )}
        </div>

        {/* Lease Info */}
        {lease && (
          <div className="text-xs text-gray-300">
            <span className="text-lime-400">{lease.satelliteName}</span>
            <span className="text-gray-500 mx-2">•</span>
            <span className="text-gray-400">
              ↑{lease.txDataRate} Mbps ↓{lease.rxDataRate} Mbps
            </span>
          </div>
        )}
      </div>

      {/* Expand Indicator */}
      <ChevronRight
        size={20}
        className={cn(
          "text-gray-500 transition-transform",
          isSelected && "text-cyan-400 rotate-90"
        )}
      />
    </div>
  );
}
