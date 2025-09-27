import { getCurrentUser } from "../../lib/auth";
import { redirect } from "next/navigation";
import AuthLayout from "../../components/templates/auth-layout";
import UserEditForm from "../../features/profile/components/organisms/user-edit-form";

const ProfilePage = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AuthLayout>
      <div className="bg-gradient-to-br from-primary/20 via-accent/10 to-success/20 min-h-screen">
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-primary to-accent p-6 rounded-xl">
              <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                Profile Settings
              </h1>
              <p className="text-primary-foreground/90">
                Update your personal information
              </p>
            </div>
          </div>

          {/* User Edit Form */}
          <div className="bg-card rounded-lg shadow-sm border border-primary/30 p-8">
            <UserEditForm user={user} />
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default ProfilePage;