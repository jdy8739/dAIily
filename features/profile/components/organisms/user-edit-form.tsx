"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, deleteAccount } from "../../lib/actions";
import type { User } from "@prisma/client";
import Input from "../../../../components/atoms/input";
import Textarea from "../../../../components/atoms/textarea";
import Dropdown from "../../../../components/atoms/dropdown";
import ClientDate from "../../../../components/atoms/client-date";

interface UserEditFormProps {
  user: User;
}

const UserEditForm = ({ user }: UserEditFormProps) => {
  // Basic information
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || "");

  // Career information
  const [currentRole, setCurrentRole] = useState(user.currentRole || "");
  const [experienceLevel, setExperienceLevel] = useState(
    user.experienceLevel || "JUNIOR"
  );
  const [industry, setIndustry] = useState(user.industry || "");
  const [yearsOfExperience, setYearsOfExperience] = useState(
    user.yearsOfExperience || 0
  );

  // Skills and goals (convert arrays to comma-separated strings for display)
  const [currentSkills, setCurrentSkills] = useState(
    user.currentSkills?.join(", ") || ""
  );
  const [targetSkills, setTargetSkills] = useState(
    user.targetSkills?.join(", ") || ""
  );
  const [currentGoals, setCurrentGoals] = useState(
    user.currentGoals?.join(", ") || ""
  );

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const hasChanges =
    name.trim() !== (user.name || "").trim() ||
    email.trim() !== user.email.trim() ||
    bio.trim() !== (user.bio || "").trim() ||
    currentRole.trim() !== (user.currentRole || "").trim() ||
    experienceLevel !== user.experienceLevel ||
    industry.trim() !== (user.industry || "").trim() ||
    yearsOfExperience !== (user.yearsOfExperience || 0) ||
    currentSkills.trim() !== (user.currentSkills?.join(", ") || "") ||
    targetSkills.trim() !== (user.targetSkills?.join(", ") || "") ||
    currentGoals.trim() !== (user.currentGoals?.join(", ") || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !email.trim()) {
      setError("Name and email are required");
      return;
    }

    if (!hasChanges) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await updateProfile({
        name: name.trim(),
        email: email.trim(),
        bio: bio.trim(),
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
        setError(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setError("Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone. All your posts, replies, and likes will be permanently deleted."
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const result = await deleteAccount();

      if (result.success) {
        // Redirect to home page after successful deletion
        window.location.href = "/";
      } else {
        setError(result.error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Account deletion error:", error);
      setError("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
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
          Profile updated successfully!
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Basic Information
        </h3>

        <Input
          label="Name *"
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter your full name"
          maxLength={100}
          disabled={isSubmitting || isDeleting}
          required
        />

        <Input
          label="Email Address *"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter your email address"
          disabled={isSubmitting || isDeleting}
          required
        />

        <div>
          <Textarea
            label="Bio"
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            maxLength={500}
            rows={3}
            disabled={isSubmitting || isDeleting}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {bio.length}/500 characters
          </p>
        </div>
      </div>

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
            disabled={isSubmitting || isDeleting}
          />

          <Input
            label="Industry"
            type="text"
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            placeholder="e.g., Technology, Healthcare, Finance"
            maxLength={100}
            disabled={isSubmitting || isDeleting}
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
            disabled={isSubmitting || isDeleting}
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
            disabled={isSubmitting || isDeleting}
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
            disabled={isSubmitting || isDeleting}
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
            disabled={isSubmitting || isDeleting}
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
            disabled={isSubmitting || isDeleting}
          />
          <p className="text-xs text-muted-foreground mt-1">
            Separate goals with commas
          </p>
        </div>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={
            isSubmitting ||
            isDeleting ||
            !hasChanges ||
            !name.trim() ||
            !email.trim()
          }
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-semibold"
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </div>

      <div className="pt-2 text-center">
        <p className="text-sm text-muted-foreground">
          Account created: <ClientDate date={user.createdAt} />
        </p>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t border-accent/30">
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-accent mb-2">
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. All your
            posts, replies, and likes will be permanently deleted.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isSubmitting || isDeleting}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
          >
            {isDeleting ? "Deleting Account..." : "Delete Account"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default UserEditForm;
