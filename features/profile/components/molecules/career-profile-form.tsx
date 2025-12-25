"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "../../lib/actions";
import type { User } from "@prisma/client";
import { Briefcase, Code, RotateCcw } from "lucide-react";
import Input from "../../../../components/atoms/input";
import Dropdown from "../../../../components/atoms/dropdown";
import ChipList from "../../../../components/atoms/chip-list";
import Button from "../../../../components/atoms/button";

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

  const handleRevert = () => {
    setCurrentRole(user.currentRole || "");
    setExperienceLevel(user.experienceLevel || "JUNIOR");
    setIndustry(user.industry || "");
    setYearsOfExperience(user.yearsOfExperience || 0);
    setCurrentSkills(user.currentSkills || []);
    setTargetSkills(user.targetSkills || []);
    setCurrentGoals(user.currentGoals || []);
    setError(null);
    setSuccess(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-accent/10 border border-accent/30 text-accent px-4 py-3 rounded-md">
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
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Briefcase className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Career Information
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Input
            label="Current Role"
            type="text"
            value={currentRole}
            onChange={e => setCurrentRole(e.target.value)}
            description="e.g., Frontend Developer, Product Manager"
            maxLength={100}
            disabled={isSubmitting}
          />

          <Input
            label="Industry"
            type="text"
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            description="e.g., Technology, Healthcare, Finance"
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
            description="Select your current experience level"
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
            description="Enter the number of years you've been working"
            min={0}
            max={50}
            disabled={isSubmitting}
          />
        </div>
      </div>

      {/* Skills & Goals */}
      <div className="space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Code className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Skills & Goals
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChipList
            label="Current Skills"
            items={currentSkills}
            onChange={setCurrentSkills}
            description="e.g., React, TypeScript, Python..."
            disabled={isSubmitting}
            variant="primary"
            maxItems={20}
          />

          <ChipList
            label="Skills I Want to Learn"
            items={targetSkills}
            onChange={setTargetSkills}
            description="e.g., GraphQL, Machine Learning, AWS..."
            disabled={isSubmitting}
            variant="secondary"
            maxItems={20}
          />
        </div>

        <ChipList
          label="Current Goals"
          items={currentGoals}
          onChange={setCurrentGoals}
          description="e.g., Get promoted to senior developer, Learn React Native..."
          disabled={isSubmitting}
          variant="accent"
          maxItems={15}
        />
      </div>

      <div className="pt-6 flex gap-3">
        {hasChanges && (
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleRevert}
            disabled={isSubmitting}
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Revert
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          disabled={isSubmitting || !hasChanges}
          className="flex-1"
        >
          {isSubmitting ? "Updating..." : "Update Career Information"}
        </Button>
      </div>
    </form>
  );
};

export default CareerProfileForm;
