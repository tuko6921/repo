/**
 * Sidebar Component
 * Design: Aerospace Command Center - Ship list with grouping and filtering
 * Features: Group by class or status, filter by status, search functionality
 */

import type { Ship, Terminal } from "@/../../shared/types";
import { Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import ShipCard from "./ShipCard";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SidebarProps {
  ships: Ship[];
  terminals: Terminal[];
  selectedShipId?: string;
  onSelectShip: (shipId: string) => void;
}

type GroupBy = "class" | "none";

export default function Sidebar({
  ships,
  terminals,
  selectedShipId,
  onSelectShip,
}: SidebarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [groupBy, setGroupBy] = useState<GroupBy>("class");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Filter ships by search term
  const filteredShips = useMemo(() => {
    return ships.filter((ship) => {
      const matchesSearch = ship.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [ships, searchTerm]);

  // Group ships
  const groupedShips = useMemo(() => {
    if (groupBy === "none") {
      return { "All Ships": filteredShips };
    }

    if (groupBy === "class") {
      const groups: Record<string, Ship[]> = {};
      filteredShips.forEach((ship) => {
        const key = `Class ${ship.class}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(ship);
      });
      return groups;
    }

    return { "All Ships": filteredShips };
  }, [filteredShips, groupBy]);

  return (
    <div className="sidebar-panel flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-cyan-400 mb-4 font-mono">
          FLEET STATUS
        </h2>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
          <Input
            placeholder="Search ships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-xs bg-gray-900 border-gray-700 text-cyan-400 placeholder-gray-600"
          />
        </div>

        {/* Group By Selector */}
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-500" />
          <Select value={groupBy} onValueChange={(value) => setGroupBy(value as GroupBy)}>
            <SelectTrigger className="h-8 text-xs bg-gray-900 border-gray-700">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="none">All Ships</SelectItem>
              <SelectItem value="class">Group by Class</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ship List */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {Object.entries(groupedShips).map(([groupName, groupShips]) => (
          <div key={groupName}>
            {groupBy !== "none" && (
              <h3 className="text-xs font-mono text-lime-400 uppercase mb-2 px-1">
                {groupName}
              </h3>
            )}
            <div className="space-y-1">
              {groupShips.map((ship) => {
                const shipTerminals = terminals.filter(
                  (t) => t.shipId === ship.id
                );
                return (
                  <ShipCard
                    key={ship.id}
                    ship={ship}
                    terminals={shipTerminals}
                    isSelected={selectedShipId === ship.id}
                    onClick={() => onSelectShip(ship.id)}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 space-y-1">
          <p>
            <span className="text-lime-400">{filteredShips.length}</span> ships
          </p>
          <p>
            <span className="text-cyan-400">
              {terminals.filter((t) => t.status === "active").length}
            </span>
            /{terminals.length} terminals active
          </p>
        </div>
      </div>
    </div>
  );
}
