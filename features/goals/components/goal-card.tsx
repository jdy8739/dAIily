"use client";

import { useState, useEffect } from "react";
import { Pencil, Check, X, RotateCcw } from "lucide-react";
import Button from "../../../components/atoms/button";
import { Goal as PrismaGoal } from "@prisma/client";

type Goal = PrismaGoal;

type GoalCardProps = {
  goal: Goal;
  onComplete: (id: string) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  onEdit: (id: string) => void;
  onReactivate?: (id: string) => Promise<void>;
};

const GoalCard = ({
  goal,
  onComplete,
  onRemove,
  onEdit,
  onReactivate,
}: GoalCardProps) => {
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleComplete = async () => {
    setLoading(true);
    try {
      await onComplete(goal.id);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this goal? This action cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    try {
      await onRemove(goal.id);
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async () => {
    setLoading(true);
    try {
      await onReactivate?.(goal.id);
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
    <div className="border border-border rounded-lg p-6 bg-card">
      <div className="flex flex-col gap-3">
        <div className="flex-1">
          <h4 className="text-foreground font-medium mb-2 whitespace-pre-wrap break-words">
            {goal.title}
          </h4>
          {isClient && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>Started: {formatDate(goal.startDate)}</span>
              <span>•</span>
              <span className={isOverdue ? "text-accent" : ""}>
                Due: {formatDate(goal.deadline)}
                {isOverdue && " (Overdue)"}
              </span>
            </div>
          )}
        </div>

        {goal.status === "ACTIVE" && (
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(goal.id)}
              disabled={loading}
              className="text-primary border-primary hover:border-primary hover:bg-primary/10"
            >
              <Pencil className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleComplete}
              disabled={loading}
              className="text-success border-success hover:border-success hover:bg-success/10"
            >
              <Check className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Complete</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={loading}
              className="text-accent border-accent hover:border-accent hover:bg-accent/10"
            >
              <X className="w-4 h-4 sm:mr-1" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        )}

        {goal.status === "COMPLETED" && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-success text-sm font-medium flex items-center gap-1">
              <Check className="w-4 h-4" /> Completed
            </span>
            <div className="grid grid-cols-2 gap-2">
              {onReactivate && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReactivate}
                  disabled={loading}
                  className="text-primary border-primary hover:border-primary hover:bg-primary/10"
                >
                  <RotateCcw className="w-4 h-4 sm:mr-1" />
                  <span className="hidden sm:inline">Reactivate</span>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemove}
                disabled={loading}
                className="text-accent border-accent hover:border-accent hover:bg-accent/10"
              >
                <X className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoalCard;
