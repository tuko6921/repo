/**
 * OperationalNotes Component
 * Design: Aerospace Command Center - Maintenance and operational notes display
 * Features: Note type badges, severity indicators, timestamps
 */

import type { OperationalNote } from "@/../../shared/types";
import { AlertCircle, Wrench, Eye, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface OperationalNotesProps {
  notes: OperationalNote[];
  terminalId: string;
}

const noteTypeIcons: Record<OperationalNote["type"], React.ReactNode> = {
  maintenance: <Wrench size={16} />,
  issue: <AlertCircle size={16} />,
  observation: <Eye size={16} />,
  triage: <CheckCircle size={16} />,
};

const noteTypeColors: Record<OperationalNote["type"], string> = {
  maintenance: "border-blue-400 text-blue-400",
  issue: "border-red-400 text-red-400",
  observation: "border-cyan-400 text-cyan-400",
  triage: "border-lime-400 text-lime-400",
};

const severityColors: Record<NonNullable<OperationalNote["severity"]>, string> = {
  low: "bg-green-400/10 border-green-400 text-green-400",
  medium: "bg-yellow-400/10 border-yellow-400 text-yellow-400",
  high: "bg-orange-400/10 border-orange-400 text-orange-400",
  critical: "bg-red-400/10 border-red-400 text-red-400",
};

export default function OperationalNotes({
  notes,
  terminalId,
}: OperationalNotesProps) {
  const terminalNotes = notes.filter((n) => n.terminalId === terminalId);

  if (terminalNotes.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">No operational notes</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {terminalNotes.map((note) => (
        <div
          key={note.id}
          className="bg-gray-800 border border-gray-700 rounded p-3"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`text-gray-400 ${noteTypeColors[note.type]}`}>
                {noteTypeIcons[note.type]}
              </div>
              <h4 className="text-sm font-bold text-cyan-400">{note.title}</h4>
            </div>
            {note.severity && (
              <Badge
                variant="outline"
                className={`text-xs font-mono ${severityColors[note.severity]}`}
              >
                {note.severity.toUpperCase()}
              </Badge>
            )}
          </div>

          {/* Content */}
          <p className="text-xs text-gray-300 mb-2">{note.content}</p>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div>
              <span className="text-gray-600">
                {new Date(note.createdAt).toLocaleDateString()}
              </span>
              {note.createdBy && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-gray-600">{note.createdBy}</span>
                </>
              )}
            </div>
            {note.resolvedAt && (
              <span className="text-lime-400 font-mono">RESOLVED</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
