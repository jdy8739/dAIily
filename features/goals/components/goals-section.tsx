"use client";

import { useState, useEffect } from "react";
import GoalCard from "./goal-card";
import GoalForm from "./goal-form";
import Button from "../../../components/atoms/button";
import { getGoals, createGoal, updateGoal } from "../lib/actions";
import { Goal as PrismaGoal } from "@prisma/client";

type Goal = PrismaGoal;

const PERIODS = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];

const periodLabels: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

const GoalsSection = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("DAILY");
  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Fetch goals on mount
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const result = await getGoals("ACTIVE");
      if ("goals" in result) {
        setGoals(result.goals);
      }
    } catch (error) {
      console.error("Failed to fetch goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const createOrUpdateGoal = async (
    title: string,
    period: string,
    goalId?: string
  ) => {
    if (goalId) {
      // Edit existing goal
      const result = await updateGoal(goalId, { title });

      if (!result.success) {
        throw new Error(result.error);
      }
    } else {
      // Create new goal
      const result = await createGoal(title, period);

      if (!result.success) {
        throw new Error(result.error);
      }
    }

    // Refresh goals and close form
    await loadGoals();
    setShowForm(false);
    setEditingGoalId(null);
  };

  const updateGoalStatus = async (id: string, status: string) => {
    const result = await updateGoal(id, { status });

    if (!result.success) {
      throw new Error(result.error);
    }

    // Refresh goals
    await loadGoals();
  };

  const handleComplete = async (id: string) => {
    await updateGoalStatus(id, "COMPLETED");
  };

  const handleAbandon = async (id: string) => {
    await updateGoalStatus(id, "ABANDONED");
  };

  const handleEdit = (id: string) => {
    setEditingGoalId(id);
    setShowForm(true);
  };

  const getGoalForPeriod = (period: string) => {
    return goals.find(g => g.period === period && g.status === "ACTIVE");
  };

  if (loading) {
    return (
      <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-6">
        <p className="text-muted-foreground">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg shadow-sm border border-accent/30 overflow-hidden">
      {/* Header */}
      <div
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          🎯 Your Active Goals
        </h2>
        <button className="text-muted-foreground hover:text-foreground">
          {collapsed ? "▼" : "▲"}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="px-6 pb-6 space-y-4">
          {/* Period Selector */}
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-foreground">
              Period:
            </label>
            <select
              value={selectedPeriod}
              onChange={e => {
                setSelectedPeriod(e.target.value);
                setShowForm(false);
                setEditingGoalId(null);
              }}
              className="flex-1 px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {PERIODS.map(period => (
                <option key={period} value={period}>
                  {periodLabels[period]}
                </option>
              ))}
            </select>
          </div>

          {/* Goal Display or Form */}
          <div>
            {(() => {
              const existingGoal = getGoalForPeriod(selectedPeriod);

              // Show form for editing
              if (showForm && editingGoalId) {
                return (
                  <GoalForm
                    period={selectedPeriod}
                    goal={existingGoal}
                    onSubmit={createOrUpdateGoal}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingGoalId(null);
                    }}
                  />
                );
              }

              // Show existing goal
              if (existingGoal && !showForm) {
                return (
                  <GoalCard
                    goal={existingGoal}
                    onComplete={handleComplete}
                    onAbandon={handleAbandon}
                    onEdit={handleEdit}
                  />
                );
              }

              // Show form for creating new goal
              if (showForm) {
                return (
                  <GoalForm
                    period={selectedPeriod}
                    onSubmit={createOrUpdateGoal}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingGoalId(null);
                    }}
                  />
                );
              }

              // Show "Set Goal" button
              return (
                <button
                  onClick={() => setShowForm(true)}
                  className="w-full border border-dashed border-border rounded-lg p-4 text-muted-foreground hover:text-foreground hover:border-accent transition-colors text-sm"
                >
                  + Set Goal for {periodLabels[selectedPeriod]}
                </button>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsSection;
