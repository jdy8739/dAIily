"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProfile, deleteAccount } from "../../lib/actions";
import type { User } from "@prisma/client";

interface UserEditFormProps {
  user: User;
}

const UserEditForm = ({ user }: UserEditFormProps) => {
  const [firstName, setFirstName] = useState(user.firstName || "");
  const [lastName, setLastName] = useState(user.lastName || "");
  const [email, setEmail] = useState(user.email);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const hasChanges =
    firstName.trim() !== (user.firstName || "").trim() ||
    lastName.trim() !== (user.lastName || "").trim() ||
    email.trim() !== user.email.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      setError("All fields are required");
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
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
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
        <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-success/10 border border-success/30 text-success px-4 py-3 rounded-md">
          Profile updated successfully!
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
            First Name
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="Enter your first name"
            maxLength={50}
            disabled={isSubmitting || isDeleting}
            required
          />
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
            Last Name
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            placeholder="Enter your last name"
            maxLength={50}
            disabled={isSubmitting || isDeleting}
            required
          />
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          placeholder="Enter your email address"
          disabled={isSubmitting || isDeleting}
          required
        />
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isDeleting || !hasChanges || !firstName.trim() || !lastName.trim() || !email.trim()}
          className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
        >
          {isSubmitting ? "Updating..." : "Update Profile"}
        </button>
      </div>

      <div className="pt-2 text-center">
        <p className="text-sm text-muted-foreground">
          Account created: {new Date(user.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Danger Zone */}
      <div className="mt-12 pt-8 border-t border-destructive/30">
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-destructive mb-2">
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. All your posts, replies, and likes will be permanently deleted.
          </p>
          <button
            type="button"
            onClick={handleDeleteAccount}
            disabled={isSubmitting || isDeleting}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors font-medium"
          >
            {isDeleting ? "Deleting Account..." : "Delete Account"}
          </button>
        </div>
      </div>
    </form>
  );
};

export default UserEditForm;