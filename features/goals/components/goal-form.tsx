"use client";

import { useState } from "react";
import Button from "../../../components/atoms/button";

type Goal = {
  id: string;
  title: string;
  period: string;
};

type GoalFormProps = {
  period: string;
  goal?: Goal; // Optional: if editing existing goal
  onSubmit: (title: string, period: string, goalId?: string) => Promise<void>;
  onCancel: () => void;
};

const GOAL_PERIOD_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

const GoalForm = ({ period, goal, onSubmit, onCancel }: GoalFormProps) => {
  const [title, setTitle] = useState(goal?.title || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isEditMode = !!goal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Goal title is required");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await onSubmit(title, period, goal?.id);
      if (!isEditMode) {
        setTitle("");
      }
    } catch (err: any) {
      setError(
        err.message || `Failed to ${isEditMode ? "update" : "create"} goal`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-border rounded-lg p-4 bg-card"
    >
      <h4 className="text-foreground font-medium mb-3">
        {isEditMode
          ? `Edit ${GOAL_PERIOD_LABELS[period]} Goal`
          : `Set ${GOAL_PERIOD_LABELS[period]} Goal`}
      </h4>

      <div className="space-y-3">
        <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What do you want to achieve?"
          className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
          disabled={loading}
          autoFocus
          rows={4}
        />

        {error && <p className="text-warning text-sm">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" variant="primary" size="sm" disabled={loading}>
            {loading
              ? isEditMode
                ? "Updating..."
                : "Setting..."
              : isEditMode
                ? "Update Goal"
                : "Set Goal"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
};

export default GoalForm;
