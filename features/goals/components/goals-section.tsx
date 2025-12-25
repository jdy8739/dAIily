"use client";

import { useState, useEffect } from "react";
import { Target, Trophy, Sparkles, TrendingUp } from "lucide-react";
import { useCsrf } from "../../../components/providers/csrf-provider";
import GoalCard from "./goal-card";
import GoalForm from "./goal-form";
import Skeleton from "../../../components/atoms/skeleton";
import Button from "../../../components/atoms/button";
import { getGoals, createGoal, updateGoal, deleteGoal } from "../lib/actions";
import { Goal as PrismaGoal, GoalStatus } from "@prisma/client";

type Goal = PrismaGoal;

const GOAL_PERIODS = ["DAILY", "WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"];

const GOAL_PERIOD_LABELS: Record<string, string> = {
  DAILY: "Daily",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
  QUARTERLY: "Quarterly",
  YEARLY: "Yearly",
};

const GoalsSection = () => {
  const { token: csrfToken } = useCsrf();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"active" | "achieved">(
    "active"
  );
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
    const result = await deleteGoal(id, csrfToken ?? undefined);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Refresh goals
    await loadGoals();
  };

  const handleReactivate = async (id: string) => {
    await updateGoalStatus(id, "ACTIVE");
  };

  const handleEdit = (id: string) => {
    setEditingGoalId(id);
    setShowForm(true);
  };

  const getGoalsForPeriod = (period: string) => {
    const status =
      selectedTab === "active" ? GoalStatus.ACTIVE : GoalStatus.COMPLETED;
    return goals.filter(g => g.period === period && g.status === status);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-card via-card to-success/5 rounded-2xl border border-border/30 p-8 shadow-lg">
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-card via-card to-success/5 rounded-2xl border border-border/30 shadow-lg overflow-hidden backdrop-blur-sm">
      {/* Modern Header with Gradient */}
      <div
        className="bg-gradient-to-r from-success/20 via-primary/10 to-accent/10 p-6 cursor-pointer hover:from-success/25 hover:via-primary/15 hover:to-accent/15 transition-all duration-300 border-b border-border/20"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-success/30">
              <Target className="w-5 h-5 text-success" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                Your Goals
              </h3>
              <p className="text-xs text-muted-foreground">
                Track your professional milestones
              </p>
            </div>
          </div>
          <button className="text-muted-foreground hover:text-foreground transition-transform duration-300 transform hover:scale-110">
            <span className="text-xl">{collapsed ? "▼" : "▲"}</span>
          </button>
        </div>
      </div>

      {/* Content */}
      {!collapsed && (
        <div className="p-6 space-y-6">
          {/* Modern Tab Switcher - Pill Style */}
          <div className="relative bg-muted/30 rounded-xl p-1.5 backdrop-blur-sm border border-border/20">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  setSelectedTab("active");
                  setShowForm(false);
                  setEditingGoalId(null);
                }}
                className={`
                  relative px-4 py-3 rounded-lg transition-all duration-300 ease-out
                  flex items-center justify-center gap-2 border cursor-pointer
                  ${
                    selectedTab === "active"
                      ? "bg-gradient-to-br from-success/20 to-success/5 shadow-md scale-105 border-border/40"
                      : "border-transparent hover:bg-background/40"
                  }
                `}
              >
                <Target
                  className={`w-4 h-4 transition-all duration-300 ${
                    selectedTab === "active"
                      ? "scale-110 text-success"
                      : "opacity-60"
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-all ${
                    selectedTab === "active"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Active Goals
                </span>
              </button>
              <button
                onClick={() => {
                  setSelectedTab("achieved");
                  setShowForm(false);
                  setEditingGoalId(null);
                }}
                className={`
                  relative px-4 py-3 rounded-lg transition-all duration-300 ease-out
                  flex items-center justify-center gap-2 border cursor-pointer
                  ${
                    selectedTab === "achieved"
                      ? "bg-gradient-to-br from-warning/20 to-warning/5 shadow-md scale-105 border-border/40"
                      : "border-transparent hover:bg-background/40"
                  }
                `}
              >
                <Trophy
                  className={`w-4 h-4 transition-all duration-300 ${
                    selectedTab === "achieved"
                      ? "scale-110 text-warning"
                      : "opacity-60"
                  }`}
                />
                <span
                  className={`text-sm font-medium transition-all ${
                    selectedTab === "achieved"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Achieved
                </span>
              </button>
            </div>
          </div>

          {/* Period Selector - Modern Button Group */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary/60" />
              <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Time Period
              </label>
            </div>
            <div className="flex flex-wrap gap-2">
              {GOAL_PERIODS.map(period => (
                <Button
                  key={period}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedPeriod(period);
                    setShowForm(false);
                    setEditingGoalId(null);
                  }}
                  className={
                    selectedPeriod === period
                      ? "text-primary border-primary hover:border-primary hover:bg-primary/10"
                      : ""
                  }
                >
                  {GOAL_PERIOD_LABELS[period]}
                </Button>
              ))}
            </div>
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
                        onReactivate={
                          selectedTab === "achieved"
                            ? handleReactivate
                            : undefined
                        }
                      />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-border/30">
                        {selectedTab === "active" ? (
                          <Sparkles className="w-8 h-8 text-muted-foreground" />
                        ) : (
                          <Trophy className="w-8 h-8 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm font-medium mb-1">
                        {selectedTab === "active"
                          ? `No active ${GOAL_PERIOD_LABELS[selectedPeriod].toLowerCase()} goals yet`
                          : `No achieved ${GOAL_PERIOD_LABELS[selectedPeriod].toLowerCase()} goals yet`}
                      </p>
                      {selectedTab === "active" && (
                        <p className="text-xs text-muted-foreground/70">
                          Set a goal to start tracking your progress
                        </p>
                      )}
                    </div>
                  )}

                  {/* Add new goal button - only show in active tab when not in form mode */}
                  {selectedTab === "active" && !showForm && (
                    <button
                      onClick={() => setShowForm(true)}
                      className="w-full border-2 border-dashed border-border/50 rounded-xl p-5 text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-sm font-medium cursor-pointer group"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <span className="text-primary text-lg">+</span>
                        </div>
                        <span>
                          Add {GOAL_PERIOD_LABELS[selectedPeriod]} Goal
                        </span>
                      </div>
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
