import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";
import AuthLayout from "../../components/templates/auth-layout";
import BasicProfileForm from "../../features/profile/components/molecules/basic-profile-form";
import CareerProfileForm from "../../features/profile/components/molecules/career-profile-form";
import DeleteAccountSection from "../../features/profile/components/molecules/delete-account-section";
import AvatarInitials from "../../features/profile/components/atoms/avatar-initials";
import ProfileTabs from "../../features/profile/components/atoms/profile-tabs";

const ProfilePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const tabItems = [
    {
      id: "profile",
      label: "Profile",
      content: (
        <div className="space-y-6">
          <BasicProfileForm user={user} />
          <DeleteAccountSection />
        </div>
      ),
    },
    {
      id: "career",
      label: "Career & Goals",
      content: <CareerProfileForm user={user} />,
    },
  ];

  return (
    <AuthLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="px-4 sm:px-6 py-6 sm:py-8 border-b border-border">
            <div className="flex items-start gap-4">
              <AvatarInitials name={user.name || "User"} size="lg" />
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                  {user.name || "Profile"}
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Manage your personal information and career goals
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-6 sm:py-8">
            {/* Tabbed Content */}
            <div className="bg-card rounded-lg shadow-sm border border-border p-8">
              <ProfileTabs
                items={tabItems}
                defaultTab="profile"
                queryParam="tab"
              />
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ProfilePage;
