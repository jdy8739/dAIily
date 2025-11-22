import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";
import AuthLayout from "../../components/templates/auth-layout";
import Tabs from "../../components/atoms/tabs";
import BasicProfileForm from "../../features/profile/components/molecules/basic-profile-form";
import CareerProfileForm from "../../features/profile/components/molecules/career-profile-form";
import DeleteAccountSection from "../../features/profile/components/molecules/delete-account-section";

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
      <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-success/20 min-h-screen">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-xl">
              <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                Profile Settings
              </h1>
              <p className="text-primary-foreground/90">
                Manage your personal information and career goals
              </p>
            </div>
          </div>

          {/* Tabbed Content */}
          <div className="bg-card rounded-lg shadow-sm border border-border p-8">
            <Tabs items={tabItems} defaultTab="profile" queryParam="tab" />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ProfilePage;
