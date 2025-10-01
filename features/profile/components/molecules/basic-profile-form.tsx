"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile } from "../../lib/actions";
import type { User } from "@prisma/client";
import Input from "../../../../components/atoms/input";
import Textarea from "../../../../components/atoms/textarea";
import ClientDate from "../../../../components/atoms/client-date";

interface BasicProfileFormProps {
  user: User;
}

const BasicProfileForm = ({ user }: BasicProfileFormProps) => {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email);
  const [bio, setBio] = useState(user.bio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const hasChanges =
    name.trim() !== (user.name || "").trim() ||
    email.trim() !== user.email.trim() ||
    bio.trim() !== (user.bio || "").trim();

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
        // Keep existing career data
        currentRole: user.currentRole || "",
        experienceLevel: user.experienceLevel || "JUNIOR",
        industry: user.industry || "",
        yearsOfExperience: user.yearsOfExperience || 0,
        currentSkills: user.currentSkills?.join(", ") || "",
        targetSkills: user.targetSkills?.join(", ") || "",
        currentGoals: user.currentGoals?.join(", ") || "",
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-md">
          Profile updated successfully!
        </div>
      )}

      <Input
        label="Name *"
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Enter your full name"
        maxLength={100}
        disabled={isSubmitting}
        required
      />

      <Input
        label="Email Address *"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Enter your email address"
        disabled={isSubmitting}
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
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground mt-1">
          {bio.length}/500 characters
        </p>
      </div>

      <div className="pt-2 text-center">
        <p className="text-sm text-muted-foreground">
          Account created: <ClientDate date={user.createdAt} />
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={
            isSubmitting ||
            !hasChanges ||
            !name.trim() ||
            !email.trim()
          }
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </div>
    </form>
  );
};

export default BasicProfileForm;