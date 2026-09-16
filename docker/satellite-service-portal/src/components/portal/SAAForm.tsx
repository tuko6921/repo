import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Trash2 } from "lucide-react";

const TERMINALS = ["AN/USC-42", "AN/WSC-6", "AN/USC-61", "GMF-1", "GMF-2"];
const ANCHOR_STATIONS = [
  "MGAS Great Village",
  "MGAS Esquimalt",
  "MGAS Shirley's Bay",
  "PMSC Shirley's Bay",
  "PMSC Lietrim",
];

interface Phase {
  id: number;
  startDate: string;
  endDate: string;
  comment: string;
}

interface SAAFormData {
  missionNumber: string;
  priority: number;
  title: string;
  missionComment: string;
  txDataRate: number;
  txUnit: string;
  rxDataRate: number;
  rxUnit: string;
  terminal: string;
  terminalId: string;
  satellite: string;
  anchorStation: string;
  phases: Phase[];
}

interface SAAFormProps {
  data: SAAFormData;
  onChange: (data: SAAFormData) => void;
  service: string;
  location: string;
}

const SATELLITES: Record<string, string[]> = {
  WGS: ["WGS-1", "WGS-2", "WGS-3", "WGS-4", "WGS-5", "WGS-6"],
  PMSC: ["Anik F1", "Anik F2", "Anik F3"],
  Commercial: ["SES-12", "Intelsat-22", "Eutelsat-36B"],
};

const SAAForm = ({ data, onChange, service }: SAAFormProps) => {
  const update = (field: keyof SAAFormData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const addPhase = () => {
    const lastPhase = data.phases[data.phases.length - 1];
    const newPhase: Phase = {
      id: data.phases.length + 1,
      startDate: lastPhase?.endDate || "",
      endDate: "",
      comment: "",
    };
    update("phases", [...data.phases, newPhase]);
  };

  const updatePhase = (index: number, field: keyof Phase, value: string) => {
    const updated = [...data.phases];
    updated[index] = { ...updated[index], [field]: value };
    update("phases", updated);
  };

  const removePhase = (index: number) => {
    if (data.phases.length <= 1) return;
    update("phases", data.phases.filter((_, i) => i !== index));
  };

  const isActiveLease = () => {
    if (data.phases.length === 0) return false;
    const today = new Date().toISOString().split("T")[0];
    const start = data.phases[0]?.startDate;
    const lastEnd = data.phases[data.phases.length - 1]?.endDate;
    return start && lastEnd && today >= start && today <= lastEnd;
  };

  const satellites = SATELLITES[service] || [];

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      {/* Mission Identification */}
      <div className="form-section">
        <h3 className="form-section-title">A. Mission Identification</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="field-label">Mission Number</label>
            <Input
              placeholder="MISSION-001"
              value={data.missionNumber}
              onChange={(e) => update("missionNumber", e.target.value.toUpperCase())}
              className="uppercase"
            />
          </div>
          <div>
            <label className="field-label">Priority</label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => update("priority", Math.max(1, data.priority - 1))}
                className="h-9 w-9"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                type="number"
                min={1}
                value={data.priority}
                onChange={(e) => update("priority", parseInt(e.target.value) || 1)}
                className="text-center w-20"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => update("priority", data.priority + 1)}
                className="h-9 w-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="field-label">Title</label>
            <Input
              placeholder="Mission title"
              value={data.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="field-label">Mission Comment</label>
          <Textarea
            placeholder="Mission-specific notes..."
            rows={3}
            value={data.missionComment}
            onChange={(e) => update("missionComment", e.target.value)}
          />
        </div>
      </div>

      {/* Technical Parameters */}
      <div className="form-section">
        <h3 className="form-section-title">B. Technical Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Tx Data Rate</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={data.txDataRate}
                onChange={(e) => update("txDataRate", parseInt(e.target.value) || 0)}
                className="flex-1"
              />
              <Select value={data.txUnit} onValueChange={(v) => update("txUnit", v)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kbps">Kbps</SelectItem>
                  <SelectItem value="Mbps">Mbps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <label className="field-label">Rx Data Rate</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={data.rxDataRate}
                onChange={(e) => update("rxDataRate", parseInt(e.target.value) || 0)}
                className="flex-1"
              />
              <Select value={data.rxUnit} onValueChange={(v) => update("rxUnit", v)}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kbps">Kbps</SelectItem>
                  <SelectItem value="Mbps">Mbps</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Terminal</label>
            <Select value={data.terminal} onValueChange={(v) => update("terminal", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select terminal" />
              </SelectTrigger>
              <SelectContent>
                {TERMINALS.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
                <SelectItem value="__new__">+ Add New Terminal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="field-label">Terminal ID</label>
            <Input
              placeholder="Auto-filled or manual"
              value={data.terminalId}
              onChange={(e) => update("terminalId", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Satellite</label>
            <Select value={data.satellite} onValueChange={(v) => update("satellite", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select satellite" />
              </SelectTrigger>
              <SelectContent>
                {satellites.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
                <SelectItem value="__new__">+ Add New Satellite</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="field-label">Anchor Station</label>
            <Select value={data.anchorStation} onValueChange={(v) => update("anchorStation", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select station" />
              </SelectTrigger>
              <SelectContent>
                {ANCHOR_STATIONS.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Phase Management */}
      <div className="form-section">
        <div className="flex items-center justify-between">
          <h3 className="form-section-title">C. Phase Management</h3>
          <div className="flex items-center gap-3">
            {isActiveLease() ? (
              <span className="status-badge-active">● ACTIVE LEASE</span>
            ) : (
              <span className="status-badge-inactive">○ INACTIVE</span>
            )}
            <Button type="button" variant="outline" size="sm" onClick={addPhase}>
              <Plus className="h-3 w-3 mr-1" /> Add Phase
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {data.phases.map((phase, idx) => (
            <div key={phase.id} className="border border-border rounded-md p-4 bg-muted/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-primary">
                  {idx === 0 ? "Phase 1" : `Change ${idx + 1}`}
                </span>
                {idx > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePhase(idx)}
                    className="h-7 w-7 text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="field-label">Start Date</label>
                  <Input
                    type="date"
                    value={phase.startDate}
                    onChange={(e) => updatePhase(idx, "startDate", e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label">End Date</label>
                  <Input
                    type="date"
                    value={phase.endDate}
                    onChange={(e) => updatePhase(idx, "endDate", e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-3">
                <label className="field-label">Phase Comment</label>
                <Textarea
                  placeholder="Phase notes..."
                  rows={2}
                  value={phase.comment}
                  onChange={(e) => updatePhase(idx, "comment", e.target.value)}
                />
              </div>
              {phase.startDate && phase.endDate && phase.endDate < phase.startDate && (
                <p className="text-destructive text-xs mt-2 font-mono">
                  ⚠ End date must be after start date
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SAAForm;
