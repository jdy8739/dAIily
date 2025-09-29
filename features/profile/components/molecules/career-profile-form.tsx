"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "../../lib/actions";
import type { User } from "@prisma/client";
import Input from "../../../../components/atoms/input";
import Textarea from "../../../../components/atoms/textarea";
import Dropdown from "../../../../components/atoms/dropdown";

interface CareerProfileFormProps {
  user: User;
}

const CareerProfileForm = ({ user }: CareerProfileFormProps) => {
  const [currentRole, setCurrentRole] = useState(user.currentRole || "");
  const [experienceLevel, setExperienceLevel] = useState(user.experienceLevel || "JUNIOR");
  const [industry, setIndustry] = useState(user.industry || "");
  const [yearsOfExperience, setYearsOfExperience] = useState(user.yearsOfExperience || 0);
  const [currentSkills, setCurrentSkills] = useState(user.currentSkills?.join(", ") || "");
  const [targetSkills, setTargetSkills] = useState(user.targetSkills?.join(", ") || "");
  const [currentGoals, setCurrentGoals] = useState(user.currentGoals?.join(", ") || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const hasChanges =
    currentRole.trim() !== (user.currentRole || "").trim() ||
    experienceLevel !== user.experienceLevel ||
    industry.trim() !== (user.industry || "").trim() ||
    yearsOfExperience !== (user.yearsOfExperience || 0) ||
    currentSkills.trim() !== (user.currentSkills?.join(", ") || "") ||
    targetSkills.trim() !== (user.targetSkills?.join(", ") || "") ||
    currentGoals.trim() !== (user.currentGoals?.join(", ") || "");

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
        currentSkills: currentSkills.trim(),
        targetSkills: targetSkills.trim(),
        currentGoals: currentGoals.trim(),
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
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Career Information
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
            onChange={e => setExperienceLevel(e.target.value)}
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
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Skills & Goals
        </h3>

        <div>
          <Input
            label="Current Skills"
            type="text"
            value={currentSkills}
            onChange={e => setCurrentSkills(e.target.value)}
            placeholder="e.g., React, TypeScript, Python (separate with commas)"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate skills with commas
          </p>
        </div>

        <div>
          <Input
            label="Skills I Want to Learn"
            type="text"
            value={targetSkills}
            onChange={e => setTargetSkills(e.target.value)}
            placeholder="e.g., GraphQL, Machine Learning, AWS (separate with commas)"
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate skills with commas
          </p>
        </div>

        <div>
          <Textarea
            label="Current Goals"
            value={currentGoals}
            onChange={e => setCurrentGoals(e.target.value)}
            placeholder="e.g., Get promoted to senior developer, Learn React Native, Complete AWS certification (separate with commas)"
            rows={3}
            disabled={isSubmitting}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate goals with commas
          </p>
        </div>
      </div>

      <div className="pt-4">
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