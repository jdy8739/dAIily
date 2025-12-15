import Link from "next/link";
import AuthLayout from "../../components/templates/auth-layout";
import { getCurrentUser } from "../../lib/auth";
import { getUserDraftPosts } from "../../features/feed/lib/queries";
import { loadMoreDraftPosts } from "../../features/feed/lib/actions";
import { redirect } from "next/navigation";
import DraftsList from "../../features/feed/components/organisms/drafts-list";

const DraftsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  const drafts = await getUserDraftPosts(currentUser.id);

  return (
    <AuthLayout>
      <div className="min-h-[calc(100vh-73px)] bg-background">
        <div className="max-w-4xl mx-auto">
          <div className="px-4 sm:px-6 py-6 sm:py-8 border-b border-border">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
              My Drafts
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Continue working on your unfinished posts
            </p>
          </div>

          <div className="px-4 sm:px-6 py-6 sm:py-8">

          <div className="space-y-6">
            {drafts.length !== 0 && (
              <DraftsList
                initialDrafts={drafts}
                loadMore={loadMoreDraftPosts}
              />
            )}

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Ready to write something new?
              </h3>
              <p className="text-muted-foreground mb-4">
                Share your professional journey with the community
              </p>
              <Link
                href="/write"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/90 transition-colors"
              >
                Write New Entry
              </Link>
            </div>
          </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default DraftsPage;
