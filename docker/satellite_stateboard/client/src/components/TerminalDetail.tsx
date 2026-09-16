/**
 * TerminalDetail Component
 * Design: Aerospace Command Center - Detailed terminal and lease information
 * Features: Lease phases, data rates, notes, phase timeline, triage workflow
 */

import type { Terminal, SatelliteLease } from "@/../../shared/types";
import { Calendar, Zap, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OperationalNotes from "./OperationalNotes";
import TriageWorkflow from "./TriageWorkflow";
import { OPERATIONAL_NOTES } from "@/lib/data";

interface TerminalDetailProps {
  terminal: Terminal;
  lease?: SatelliteLease;
}

export default function TerminalDetail({
  terminal,
  lease,
}: TerminalDetailProps) {
  const terminalNotes = OPERATIONAL_NOTES.filter(
    (n) => n.terminalId === terminal.id
  );

  return (
    <div className="space-y-6">
      {/* Terminal Info */}
      <div>
        <h3 className="text-sm font-mono text-lime-400 uppercase mb-3">
          Terminal Info
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Designation:</span>
            <span className="text-cyan-400 font-mono">{terminal.designation}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Type:</span>
            <span className="text-cyan-400 font-mono">{terminal.type}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Status:</span>
            <Badge
              variant="outline"
              className={`text-xs font-mono ${
                terminal.status === "active"
                  ? "border-lime-400 text-lime-400"
                  : terminal.status === "maintenance"
                    ? "border-yellow-400 text-yellow-400"
                    : terminal.status === "standby"
                      ? "border-cyan-400 text-cyan-400"
                      : "border-gray-500 text-gray-500"
              }`}
            >
              {terminal.status.toUpperCase()}
            </Badge>
          </div>
          {terminal.notes && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-xs text-gray-400 italic">{terminal.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Lease Information */}
      {lease ? (
        <div>
          <h3 className="text-sm font-mono text-lime-400 uppercase mb-3">
            Active Lease
          </h3>
          <div className="space-y-3">
            {/* Satellite Name */}
            <div className="bg-gray-800 p-3 rounded border border-gray-700">
              <p className="text-xs text-gray-400 mb-1">Satellite</p>
              <p className="text-sm font-bold text-cyan-400">
                {lease.satelliteName}
              </p>
            </div>

            {/* Data Rates */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-800 p-3 rounded border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-lime-400" />
                  <p className="text-xs text-gray-400">TX Rate</p>
                </div>
                <p className="text-sm font-mono text-lime-400">
                  {lease.txDataRate} Mbps
                </p>
              </div>
              <div className="bg-gray-800 p-3 rounded border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={14} className="text-cyan-400 rotate-180" />
                  <p className="text-xs text-gray-400">RX Rate</p>
                </div>
                <p className="text-sm font-mono text-cyan-400">
                  {lease.rxDataRate} Mbps
                </p>
              </div>
            </div>

            {/* Lease Dates */}
            <div className="bg-gray-800 p-3 rounded border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-orange-400" />
                <p className="text-xs text-gray-400">Lease Period</p>
              </div>
              <div className="space-y-1 text-xs font-mono">
                <p className="text-gray-300">
                  Start: <span className="text-lime-400">{lease.startDate}</span>
                </p>
                <p className="text-gray-300">
                  End: <span className="text-orange-400">{lease.endDate}</span>
                </p>
              </div>
            </div>

            {/* Lease Phases */}
            {lease.phases.length > 0 && (
              <div>
                <h4 className="text-xs font-mono text-cyan-400 uppercase mb-2">
                  Phases
                </h4>
                <div className="space-y-2">
                  {lease.phases.map((phase) => (
                    <div
                      key={phase.id}
                      className="bg-gray-800 p-2 rounded border border-gray-700 text-xs"
                    >
                      <p className="font-bold text-cyan-400 mb-1">
                        {phase.name}
                      </p>
                      <p className="text-gray-400 mb-1">
                        {phase.startDate} → {phase.endDate}
                      </p>
                      {(phase.txDataRate || phase.rxDataRate) && (
                        <p className="text-lime-400 font-mono">
                          ↑{phase.txDataRate || lease.txDataRate} Mbps ↓
                          {phase.rxDataRate || lease.rxDataRate} Mbps
                        </p>
                      )}
                      {phase.description && (
                        <p className="text-gray-500 mt-1 italic">
                          {phase.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lease Notes */}
            {lease.notes && (
              <div className="bg-gray-800 p-3 rounded border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <FileText size={14} className="text-gray-400" />
                  <p className="text-xs text-gray-400">Notes</p>
                </div>
                <p className="text-xs text-gray-300 italic">{lease.notes}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 p-4 rounded border border-gray-700 text-center">
          <p className="text-sm text-gray-400">No active lease assigned</p>
        </div>
      )}

      {/* Tabs for Notes and Triage */}
      <Tabs defaultValue="notes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-800 border border-gray-700 h-9">
          <TabsTrigger value="notes" className="text-xs">
            Notes ({terminalNotes.length})
          </TabsTrigger>
          <TabsTrigger value="triage" className="text-xs">
            Triage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notes" className="mt-4">
          <OperationalNotes
            notes={OPERATIONAL_NOTES}
            terminalId={terminal.id}
          />
        </TabsContent>

        <TabsContent value="triage" className="mt-4">
          <TriageWorkflow terminalId={terminal.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
