import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LeaseFormData {
  network: string;
  system: string;
  satellite: string;
  antenna: string;
  terminalId: string;
  txGuaranteed: string;
  txMaximum: string;
  rxGuaranteed: string;
  rxMaximum: string;
  startDate: string;
  endDate: string;
  comment: string;
}

interface LeaseFormProps {
  data: LeaseFormData;
  onChange: (data: LeaseFormData) => void;
}

const ANTENNA_OPTIONS: Record<string, string[]> = {
  Oneweb: ["AFT", "FWD"],
  Starlink: ["AFT", "FWD", "Port", "Starboard"],
};

const LeaseForm = ({ data, onChange }: LeaseFormProps) => {
  const update = (field: keyof LeaseFormData, value: string) => {
    const updates: Partial<LeaseFormData> = { [field]: value };
    // Reset antenna when system changes
    if (field === "system") {
      updates.antenna = "";
    }
    onChange({ ...data, ...updates });
  };

  const antennaOptions = ANTENNA_OPTIONS[data.system] || [];

  return (
    <div className="form-section animate-in fade-in-50 duration-300">
      <h3 className="form-section-title">Lease Request</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="field-label">Network</label>
          <Select value={data.network} onValueChange={(v) => update("network", v)}>
            <SelectTrigger><SelectValue placeholder="Select network" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="NAVIS">NAVIS</SelectItem>
              <SelectItem value="IS2S">IS2S</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="field-label">System</label>
          <Select value={data.system} onValueChange={(v) => update("system", v)}>
            <SelectTrigger><SelectValue placeholder="Select system" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Oneweb">Oneweb</SelectItem>
              <SelectItem value="Starlink">Starlink</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="field-label">Satellite</label>
          <Select value={data.satellite} onValueChange={(v) => update("satellite", v)}>
            <SelectTrigger><SelectValue placeholder="Select orbit" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="LEO">LEO</SelectItem>
              <SelectItem value="MEO">MEO</SelectItem>
              <SelectItem value="GEO">GEO</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="field-label">Antenna</label>
          <Select value={data.antenna} onValueChange={(v) => update("antenna", v)} disabled={!data.system}>
            <SelectTrigger><SelectValue placeholder={data.system ? "Select antenna" : "Select system first"} /></SelectTrigger>
            <SelectContent>
              {antennaOptions.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="field-label">Terminal ID</label>
          <Input
            placeholder="Terminal ID"
            value={data.terminalId}
            onChange={(e) => update("terminalId", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="field-label">Tx Guaranteed (Mbps)</label>
          <Input type="number" value={data.txGuaranteed} onChange={(e) => update("txGuaranteed", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Tx Maximum (Mbps)</label>
          <Input type="number" value={data.txMaximum} onChange={(e) => update("txMaximum", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Rx Guaranteed (Mbps)</label>
          <Input type="number" value={data.rxGuaranteed} onChange={(e) => update("rxGuaranteed", e.target.value)} />
        </div>
        <div>
          <label className="field-label">Rx Maximum (Mbps)</label>
          <Input type="number" value={data.rxMaximum} onChange={(e) => update("rxMaximum", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="field-label">Start Date</label>
          <Input type="date" value={data.startDate} onChange={(e) => update("startDate", e.target.value)} />
        </div>
        <div>
          <label className="field-label">End Date</label>
          <Input type="date" value={data.endDate} onChange={(e) => update("endDate", e.target.value)} />
        </div>
      </div>
      {data.startDate && data.endDate && data.endDate < data.startDate && (
        <p className="text-destructive text-xs font-mono">⚠ End date must be after start date</p>
      )}

      <div>
        <label className="field-label">Comment</label>
        <Textarea placeholder="Lease notes..." rows={3} value={data.comment} onChange={(e) => update("comment", e.target.value)} />
      </div>
    </div>
  );
};

export default LeaseForm;
