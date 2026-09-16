import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface SARFormData {
  assystSR: string;
  dateOfSubmission: string;
  comment: string;
}

interface SARFormProps {
  data: SARFormData;
  onChange: (data: SARFormData) => void;
}

const SARForm = ({ data, onChange }: SARFormProps) => {
  const update = (field: keyof SARFormData, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="form-section animate-in fade-in-50 duration-300">
      <h3 className="form-section-title">SAR — Satellite Access Request</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="field-label">Assyst SR (S#)</label>
          <Input
            placeholder="S00000"
            value={data.assystSR}
            onChange={(e) => update("assystSR", e.target.value)}
          />
        </div>
        <div>
          <label className="field-label">Date of Submission</label>
          <Input
            type="date"
            value={data.dateOfSubmission}
            onChange={(e) => update("dateOfSubmission", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="field-label">Comment</label>
        <Textarea
          placeholder="Enter comments..."
          rows={4}
          value={data.comment}
          onChange={(e) => update("comment", e.target.value)}
        />
      </div>
    </div>
  );
};

export default SARForm;
