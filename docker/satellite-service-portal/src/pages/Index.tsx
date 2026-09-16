import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Satellite, Send } from "lucide-react";
import SARForm from "@/components/portal/SARForm";
import SAAForm from "@/components/portal/SAAForm";
import LeaseForm from "@/components/portal/LeaseForm";
import { toast } from "sonner";

const LOCATIONS = [
  "MGAS Shirley's Bay", "MGAS Great Village", "MGAS Esquimalt",
  "PMSC Shirley's Bay", "PMSC Lietrim",
];

type Action = "Add" | "Modify" | "Delete" | "List";

const initialSAR = { assystSR: "", dateOfSubmission: "", comment: "" };
const initialSAA = {
  missionNumber: "", priority: 1, title: "", missionComment: "",
  txDataRate: 5000, txUnit: "Kbps", rxDataRate: 5000, rxUnit: "Kbps",
  terminal: "", terminalId: "", satellite: "", anchorStation: "",
  phases: [{ id: 1, startDate: "", endDate: "", comment: "" }],
};
const initialLease = {
  network: "", system: "", satellite: "LEO", antenna: "", terminalId: "",
  txGuaranteed: "", txMaximum: "", rxGuaranteed: "", rxMaximum: "",
  startDate: "", endDate: "", comment: "",
};

const Index = () => {
  const [service, setService] = useState("");
  const [location, setLocation] = useState("");
  const [action, setAction] = useState<Action>("Add");
  const [listCount, setListCount] = useState(5);
  const [requestType, setRequestType] = useState("");

  const [sarData, setSarData] = useState(initialSAR);
  const [saaData, setSaaData] = useState(initialSAA);
  const [leaseData, setLeaseData] = useState(initialLease);

  const handleRequestTypeChange = (value: string) => {
    setRequestType(value);
    // Clear sub-form state to prevent data cross-contamination
    setSarData(initialSAR);
    setSaaData({
      ...initialSAA,
      phases: [{ id: 1, startDate: "", endDate: "", comment: "" }],
    });
    setLeaseData(initialLease);
  };

  const handleSubmit = () => {
    if (!service || !location || !requestType) {
      toast.error("Please fill in all required header fields.");
      return;
    }
    toast.success("Request submitted successfully.");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-5xl mx-auto py-4 px-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center">
            <Satellite className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-mono text-lg font-bold text-foreground tracking-tight">
              Satellite Service Portal
            </h1>
            <p className="text-xs text-muted-foreground font-mono">
              Request Management System
            </p>
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto py-8 px-4 space-y-6">
        {/* Global Header Fields */}
        <div className="form-section">
          <h3 className="form-section-title">Request Header</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="field-label">Service *</label>
              <Select value={service} onValueChange={setService}>
                <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="WGS">WGS</SelectItem>
                  <SelectItem value="PMSC">PMSC</SelectItem>
                  <SelectItem value="Commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="field-label">Location *</label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger><SelectValue placeholder="Select location" /></SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="field-label">Action</label>
              <div className="flex rounded-md border border-border overflow-hidden">
                {(["Add", "Modify", "Delete", "List"] as Action[]).map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAction(a)}
                    className={`flex-1 px-2 py-2 text-xs font-mono transition-colors ${
                      action === a
                        ? "bg-primary text-primary-foreground"
                        : "bg-input text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="field-label">Type of Request *</label>
              <Select value={requestType} onValueChange={handleRequestTypeChange}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">SAR</SelectItem>
                  <SelectItem value="SAA">SAA</SelectItem>
                  <SelectItem value="Lease">Lease</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {action === "List" && (
            <div className="mt-2 max-w-xs">
              <label className="field-label">List Count</label>
              <Input
                type="number"
                min={1}
                value={listCount}
                onChange={(e) => setListCount(parseInt(e.target.value) || 5)}
              />
            </div>
          )}
        </div>

        {/* Conditional Sub-Forms */}
        {requestType === "SAR" && (
          <SARForm data={sarData} onChange={setSarData} />
        )}
        {requestType === "SAA" && (
          <SAAForm data={saaData} onChange={setSaaData} service={service} location={location} />
        )}
        {requestType === "Lease" && (
          <LeaseForm data={leaseData} onChange={setLeaseData} />
        )}

        {/* Submit */}
        {requestType && (
          <div className="flex justify-end">
            <Button onClick={handleSubmit} className="font-mono gap-2">
              <Send className="h-4 w-4" />
              Submit Request
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
