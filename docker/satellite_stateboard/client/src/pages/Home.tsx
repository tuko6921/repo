/**
 * Home Page - Satellite Stateboard Dashboard
 * Design: Aerospace Command Center - Two-column layout with sidebar and main content
 * Features: Fleet overview, terminal status, lease management
 */

import { useState, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import MainContent from "@/components/MainContent";
import { SHIPS, TERMINALS, LEASES } from "@/lib/data";

export default function Home() {
  const [selectedShipId, setSelectedShipId] = useState<string>();

  const selectedShip = useMemo(
    () => SHIPS.find((s) => s.id === selectedShipId),
    [selectedShipId]
  );

  return (
    <div className="dashboard-grid bg-background text-foreground">
      {/* Sidebar - Ship List */}
      <Sidebar
        ships={SHIPS}
        terminals={TERMINALS}
        selectedShipId={selectedShipId}
        onSelectShip={setSelectedShipId}
      />

      {/* Main Content - Terminal Details */}
      <MainContent
        selectedShip={selectedShip}
        terminals={TERMINALS}
        leases={LEASES}
        onBack={() => setSelectedShipId(undefined)}
      />
    </div>
  );
}
