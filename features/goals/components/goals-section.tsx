"use client";

import { useState, useEffect } from "react";
import GoalCard from "./goal-card";
import GoalForm from "./goal-form";
import Button from "../../../components/atoms/button";
import { getGoals, createGoal, updateGoal } from "../lib/actions";
import { Goal as PrismaGoal, GoalStatus } from "@prisma/client";

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
  const [selectedTab, setSelectedTab] = useState<"active" | "achieved">("active");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("DAILY");
  const [showForm, setShowForm] = useState(false);
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);

  // Fetch goals on mount and when tab changes
  useEffect(() => {
    loadGoals();
  }, [selectedTab]);

  const loadGoals = async () => {
    try {
      const status = selectedTab === "active" ? "ACTIVE" : "COMPLETED";
      const result = await getGoals(status);
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

  const handleRemove = async (id: string) => {
    await updateGoalStatus(id, "ABANDONED");
  };

  const handleReactivate = async (id: string) => {
    await updateGoalStatus(id, "ACTIVE");
  };

  const handleEdit = (id: string) => {
    setEditingGoalId(id);
    setShowForm(true);
  };

  const getGoalsForPeriod = (period: string) => {
    const status = selectedTab === "active" ? GoalStatus.ACTIVE : GoalStatus.COMPLETED;
    return goals.filter(g => g.period === period && g.status === status);
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
      {/* Header with Collapse */}
      <div
        className="p-6 flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          🎯 Your Goals
        </h2>
        <button className="text-muted-foreground hover:text-foreground">
          {collapsed ? "▼" : "▲"}
        </button>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="px-6 pb-6 space-y-4">
          {/* Tab Switcher */}
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => {
                setSelectedTab("active");
                setShowForm(false);
                setEditingGoalId(null);
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors relative cursor-pointer ${
                selectedTab === "active"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🎯 Active Goals
              {selectedTab === "active" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
            <button
              onClick={() => {
                setSelectedTab("achieved");
                setShowForm(false);
                setEditingGoalId(null);
              }}
              className={`px-4 py-2 text-sm font-medium transition-colors relative cursor-pointer ${
                selectedTab === "achieved"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🏆 Achieved Goals
              {selectedTab === "achieved" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
              )}
            </button>
          </div>

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
              const existingGoals = getGoalsForPeriod(selectedPeriod);
              const editingGoal = editingGoalId
                ? goals.find(g => g.id === editingGoalId)
                : undefined;

              // Show form for editing
              if (showForm && editingGoalId) {
                return (
                  <GoalForm
                    period={selectedPeriod}
                    goal={editingGoal}
                    onSubmit={createOrUpdateGoal}
                    onCancel={() => {
                      setShowForm(false);
                      setEditingGoalId(null);
                    }}
                  />
                );
              }

              // Show form for creating new goal
              if (showForm && !editingGoalId) {
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

              // Show existing goals
              return (
                <div className="space-y-3">
                  {existingGoals.length > 0 ? (
                    existingGoals.map(goal => (
                      <GoalCard
                        key={goal.id}
                        goal={goal}
                        onComplete={handleComplete}
                        onRemove={handleRemove}
                        onEdit={handleEdit}
                        onReactivate={selectedTab === "achieved" ? handleReactivate : undefined}
                      />
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm text-center py-4">
                      {selectedTab === "active"
                        ? `No active ${periodLabels[selectedPeriod].toLowerCase()} goals yet`
                        : `No achieved ${periodLabels[selectedPeriod].toLowerCase()} goals yet`}
                    </p>
                  )}

                  {/* Add new goal button - only show in active tab when not in form mode */}
                  {selectedTab === "active" && !showForm && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full border border-dashed border-border rounded-lg p-4 text-muted-foreground hover:text-foreground hover:border-accent transition-colors text-sm cursor-pointer"
                    >
                      + Add {periodLabels[selectedPeriod]} Goal
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalsSection;
