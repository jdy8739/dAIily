"use server";

import { getCurrentUser } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";
import { updateProfileSchema, type UpdateProfileData } from "../schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const updateProfile = async (data: UpdateProfileData) => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, error: "Not authenticated" };
    }

    const validatedData = updateProfileSchema.parse(data);

    // Check if email is already taken by another user
    if (validatedData.email !== currentUser.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: validatedData.email,
          NOT: {
            id: currentUser.id,
          },
        },
      });

      if (existingUser) {
        return { success: false, error: "Email is already in use" };
      }
    }

    // Convert comma-separated strings to arrays
    const currentSkillsArray = validatedData.currentSkills
      ? validatedData.currentSkills
          .split(",")
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0)
      : [];

    const targetSkillsArray = validatedData.targetSkills
      ? validatedData.targetSkills
          .split(",")
          .map(skill => skill.trim())
          .filter(skill => skill.length > 0)
      : [];

    const currentGoalsArray = validatedData.currentGoals
      ? validatedData.currentGoals
          .split(",")
          .map(goal => goal.trim())
          .filter(goal => goal.length > 0)
      : [];

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        bio: validatedData.bio,
        currentRole: validatedData.currentRole,
        experienceLevel: validatedData.experienceLevel,
        industry: validatedData.industry,
        yearsOfExperience: validatedData.yearsOfExperience,
        currentSkills: currentSkillsArray,
        targetSkills: targetSkillsArray,
        currentGoals: currentGoalsArray,
      },
    });

    revalidatePath("/profile");

    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, error: "Failed to update profile" };
  }
};

export const deleteAccount = async () => {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return { success: false, error: "Not authenticated" };
    }

    // Delete user - cascade will automatically delete all posts, replies, likes, etc.
    await prisma.user.delete({
      where: { id: currentUser.id },
    });

    // Clear session cookie
    const cookieStore = await cookies();
    cookieStore.delete("session");

    return { success: true };
  } catch (error) {
    console.error("Account deletion error:", error);
    return { success: false, error: "Failed to delete account" };
  }
};
