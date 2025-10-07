"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "../../lib/actions";
import type { User } from "@prisma/client";
import Input from "../../../../components/atoms/input";
import Dropdown from "../../../../components/atoms/dropdown";
import ChipList from "../../../../components/atoms/chip-list";

interface CareerProfileFormProps {
  user: User;
}

const CareerProfileForm = ({ user }: CareerProfileFormProps) => {
  const [currentRole, setCurrentRole] = useState(user.currentRole || "");
  const [experienceLevel, setExperienceLevel] = useState(
    user.experienceLevel || "JUNIOR"
  );
  const [industry, setIndustry] = useState(user.industry || "");
  const [yearsOfExperience, setYearsOfExperience] = useState(
    user.yearsOfExperience || 0
  );
  const [currentSkills, setCurrentSkills] = useState(user.currentSkills || []);
  const [targetSkills, setTargetSkills] = useState(user.targetSkills || []);
  const [currentGoals, setCurrentGoals] = useState(user.currentGoals || []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const hasChanges =
    currentRole.trim() !== (user.currentRole || "").trim() ||
    experienceLevel !== user.experienceLevel ||
    industry.trim() !== (user.industry || "").trim() ||
    yearsOfExperience !== (user.yearsOfExperience || 0) ||
    JSON.stringify(currentSkills) !==
      JSON.stringify(user.currentSkills || []) ||
    JSON.stringify(targetSkills) !== JSON.stringify(user.targetSkills || []) ||
    JSON.stringify(currentGoals) !== JSON.stringify(user.currentGoals || []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasChanges) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateProfile({
        // Keep existing basic profile data
        name: user.name || "",
        email: user.email,
        bio: user.bio || "",
        // Update career data
        currentRole: currentRole.trim(),
        experienceLevel: experienceLevel as
          | "INTERN"
          | "JUNIOR"
          | "MID_LEVEL"
          | "SENIOR"
          | "LEAD"
          | "MANAGER"
          | "DIRECTOR"
          | "VP"
          | "C_LEVEL",
        industry: industry.trim(),
        yearsOfExperience: Number(yearsOfExperience),
        currentSkills: currentSkills.join(", "),
        targetSkills: targetSkills.join(", "),
        currentGoals: currentGoals.join(", "),
      });

      if (result.success) {
        setSuccess(true);
        router.refresh();
      } else {
        setError(result.error || "Failed to update career information");
      }
    } catch (error) {
      console.error("Career update error:", error);
      setError("Failed to update career information");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-md">
          Career information updated successfully!
        </div>
      )}

      {/* Career Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
          <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            Career Information
          </span>
        </h3>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="Current Role"
            type="text"
            value={currentRole}
            onChange={e => setCurrentRole(e.target.value)}
            placeholder="e.g., Frontend Developer, Product Manager"
            maxLength={100}
            disabled={isSubmitting}
          />

          <Input
            label="Industry"
            type="text"
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            placeholder="e.g., Technology, Healthcare, Finance"
            maxLength={100}
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Dropdown
            label="Experience Level"
            value={experienceLevel}
            onChange={e =>
              setExperienceLevel(
                e.target.value as
                  | "INTERN"
                  | "JUNIOR"
                  | "MID_LEVEL"
                  | "SENIOR"
                  | "LEAD"
                  | "MANAGER"
                  | "DIRECTOR"
                  | "VP"
                  | "C_LEVEL"
              )
            }
            disabled={isSubmitting}
            options={[
              { value: "INTERN", label: "Intern" },
              { value: "JUNIOR", label: "Junior" },
              { value: "MID_LEVEL", label: "Mid Level" },
              { value: "SENIOR", label: "Senior" },
              { value: "LEAD", label: "Lead" },
              { value: "MANAGER", label: "Manager" },
              { value: "DIRECTOR", label: "Director" },
              { value: "VP", label: "VP" },
              { value: "C_LEVEL", label: "C-Level" },
            ]}
          />

          <Input
            label="Years of Experience"
            type="number"
            value={yearsOfExperience}
            onChange={e => setYearsOfExperience(Number(e.target.value))}
            placeholder="Years of experience"
            min={0}
            max={50}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Skills & Goals */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2 flex items-center gap-2">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Skills & Goals
          </span>
        </h3>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChipList
            label="Current Skills"
            items={currentSkills}
            onChange={setCurrentSkills}
            placeholder="e.g., React, TypeScript, Python..."
            disabled={isSubmitting}
            variant="primary"
            maxItems={20}
          />

          <ChipList
            label="Skills I Want to Learn"
            items={targetSkills}
            onChange={setTargetSkills}
            placeholder="e.g., GraphQL, Machine Learning, AWS..."
            disabled={isSubmitting}
            variant="secondary"
            maxItems={20}
          />
        </div>

        <ChipList
          label="Current Goals"
          items={currentGoals}
          onChange={setCurrentGoals}
          placeholder="e.g., Get promoted to senior developer, Learn React Native..."
          disabled={isSubmitting}
          variant="accent"
          maxItems={15}
        />
      </div>

      <div className="pt-6">
        <button
          type="submit"
          disabled={isSubmitting || !hasChanges}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
        >
          {isSubmitting ? "Updating..." : "Update Career Information"}
        </button>
      </div>
    </form>
  );
};

export default CareerProfileForm;
