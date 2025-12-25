import Link from "next/link";
import AuthLayout from "../../components/templates/auth-layout";
import WriteNewEntryLink from "../../components/atoms/write-new-entry-link";
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
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
            <div className="px-4 py-3 sm:px-6 sm:py-4">
              <Link
                href="/feed"
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                ← Back to Feed
              </Link>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-6 sm:py-8">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                My Drafts
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Continue working on your unfinished posts
              </p>
            </div>

            <div className="space-y-6">
              {drafts.length !== 0 && (
                <DraftsList
                  initialDrafts={drafts}
                  loadMore={loadMoreDraftPosts}
                />
              )}

              <div className="bg-gradient-to-br from-card via-card to-accent/5 rounded-2xl border border-border/30 p-8 shadow-lg">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Ready to write something new?
                </h3>
                <p className="text-muted-foreground mb-6">
                  Share your professional journey with the community
                </p>
                <WriteNewEntryLink />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default DraftsPage;
