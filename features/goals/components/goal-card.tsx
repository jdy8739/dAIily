"use client";

import { useState } from "react";
import Button from "../../../components/atoms/button";
import { Goal as PrismaGoal } from "@prisma/client";

type Goal = PrismaGoal;

type GoalCardProps = {
  goal: Goal;
  onComplete: (id: string) => Promise<void>;
  onAbandon: (id: string) => Promise<void>;
  onEdit: (id: string) => void;
};

const GoalCard = ({ goal, onComplete, onAbandon, onEdit }: GoalCardProps) => {
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await onComplete(goal.id);
    } finally {
      setLoading(false);
    }
  };

  const handleAbandon = async () => {
    setLoading(true);
    try {
      await onAbandon(goal.id);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = new Date(goal.deadline) < new Date();

  return (
    <div className="border border-border rounded-lg p-4 bg-card">
      <div className="flex flex-col gap-3">
        <div className="flex-1">
          <h4 className="text-foreground font-medium mb-2 whitespace-pre-wrap break-words">
            {goal.title}
          </h4>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Started: {formatDate(goal.startDate)}</span>
            <span>•</span>
            <span className={isOverdue ? "text-warning" : ""}>
              Due: {formatDate(goal.deadline)}
              {isOverdue && " (Overdue)"}
            </span>
          </div>
        </div>

        {goal.status === "ACTIVE" && (
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(goal.id)}
              disabled={loading}
              className="text-foreground border-border hover:bg-muted"
            >
              ✎ Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleComplete}
              disabled={loading}
              className="text-success border-success hover:bg-success/10"
            >
              ✓ Complete
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAbandon}
              disabled={loading}
              className="text-warning border-warning hover:bg-warning/10"
            >
              ✕ Abandon
            </Button>
          </div>
        )}

        {goal.status === "COMPLETED" && (
          <span className="text-success text-sm font-medium">✓ Completed</span>
        )}

        {goal.status === "ABANDONED" && (
          <span className="text-muted-foreground text-sm">✕ Abandoned</span>
        )}
      </div>
    </div>
  );
};

export default GoalCard;
