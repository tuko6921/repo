/**
 * TriageWorkflow Component
 * Design: Aerospace Command Center - Problem diagnosis and escalation workflow
 * Features: Problem nature selection, guided questions, information collection
 */

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
import { AlertCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TriageWorkflowProps {
  terminalId: string;
}

type ProblemNature =
  | "signal-loss"
  | "data-rate-degradation"
  | "equipment-failure"
  | "interference"
  | "other";

const problemNatures: Record<ProblemNature, string> = {
  "signal-loss": "Signal Loss",
  "data-rate-degradation": "Data Rate Degradation",
  "equipment-failure": "Equipment Failure",
  interference: "Interference",
  other: "Other",
};

const guidedQuestions: Record<ProblemNature, string[]> = {
  "signal-loss": [
    "When did the signal loss begin?",
    "Is the loss complete or intermittent?",
    "Have you verified the antenna alignment?",
    "What is the current signal strength reading?",
    "Have there been recent weather changes?",
  ],
  "data-rate-degradation": [
    "What was the expected data rate?",
    "What is the current measured data rate?",
    "When did the degradation start?",
    "Is the degradation constant or intermittent?",
    "Have you checked for interference sources?",
  ],
  "equipment-failure": [
    "Which component is suspected to have failed?",
    "What error messages are displayed?",
    "When was the last successful operation?",
    "Have you performed a power cycle?",
    "Is there any visible damage to the equipment?",
  ],
  interference: [
    "What frequency band is affected?",
    "When did the interference start?",
    "Is the interference constant or intermittent?",
    "Have you identified the interference source?",
    "What is the estimated interference strength?",
  ],
  other: [
    "Describe the issue in detail",
    "When did the issue first occur?",
    "Is the issue reproducible?",
    "What troubleshooting steps have been taken?",
    "Are there any error logs available?",
  ],
};

export default function TriageWorkflow({ terminalId }: TriageWorkflowProps) {
  const [problemNature, setProblemNature] = useState<ProblemNature | "">("");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<"open" | "in-progress" | "escalated">(
    "open"
  );
  const [showForm, setShowForm] = useState(false);

  const questions = problemNature
    ? guidedQuestions[problemNature as ProblemNature]
    : [];

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  const handleSubmit = () => {
    if (problemNature && Object.keys(answers).length > 0) {
      setStatus("in-progress");
      // In a real app, this would save to a backend
      console.log("Triage submitted:", {
        terminalId,
        problemNature,
        answers,
      });
    }
  };

  const handleEscalate = () => {
    setStatus("escalated");
  };

  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="w-full bg-orange-600 hover:bg-orange-700 text-white"
      >
        <AlertCircle size={16} className="mr-2" />
        Start Triage Workflow
      </Button>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-cyan-400 font-mono">
          PROBLEM TRIAGE
        </h3>
        <Badge
          variant="outline"
          className={`text-xs font-mono ${
            status === "open"
              ? "border-cyan-400 text-cyan-400"
              : status === "in-progress"
                ? "border-yellow-400 text-yellow-400"
                : "border-red-400 text-red-400"
          }`}
        >
          {status.toUpperCase()}
        </Badge>
      </div>

      {/* Problem Nature Selection */}
      <div>
        <label className="text-xs text-gray-400 block mb-2">
          Problem Nature
        </label>
        <Select
          value={problemNature}
          onValueChange={(value) => {
            setProblemNature(value as ProblemNature);
            setAnswers({});
          }}
          disabled={status !== "open"}
        >
          <SelectTrigger className="h-9 text-sm bg-gray-900 border-gray-700">
            <SelectValue placeholder="Select problem type..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-700">
            {Object.entries(problemNatures).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Guided Questions */}
      {problemNature && questions.length > 0 && (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          <p className="text-xs text-gray-400 font-mono">
            GUIDED QUESTIONS
          </p>
          {questions.map((question, index) => (
            <div key={index}>
              <label className="text-xs text-gray-300 block mb-1">
                {index + 1}. {question}
              </label>
              <Input
                placeholder="Enter response..."
                value={answers[index] || ""}
                onChange={(e) => handleAnswerChange(index, e.target.value)}
                disabled={status !== "open"}
                className="h-8 text-xs bg-gray-900 border-gray-700 text-cyan-400 placeholder-gray-600"
              />
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {status === "open" && (
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!problemNature || Object.keys(answers).length === 0}
            className="flex-1 h-8 text-xs bg-lime-600 hover:bg-lime-700 text-white"
          >
            <ChevronRight size={14} className="mr-1" />
            Submit Triage
          </Button>
          <Button
            onClick={() => setShowForm(false)}
            variant="outline"
            className="flex-1 h-8 text-xs border-gray-700"
          >
            Cancel
          </Button>
        </div>
      )}

      {status === "in-progress" && (
        <div className="space-y-2">
          <div className="bg-green-400/10 border border-green-400 rounded p-2">
            <p className="text-xs text-green-400 font-mono">
              ✓ Triage submitted. Escalate if needed.
            </p>
          </div>
          <Button
            onClick={handleEscalate}
            className="w-full h-8 text-xs bg-red-600 hover:bg-red-700 text-white"
          >
            Escalate to Support
          </Button>
        </div>
      )}

      {status === "escalated" && (
        <div className="bg-red-400/10 border border-red-400 rounded p-2">
          <p className="text-xs text-red-400 font-mono">
            ⚠ Escalated to support team. Ticket created.
          </p>
        </div>
      )}
    </div>
  );
}
