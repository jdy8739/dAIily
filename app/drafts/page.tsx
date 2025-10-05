import Link from "next/link";
import AuthLayout from "../../components/templates/auth-layout";
import { getCurrentUser } from "../../lib/auth";
import { getUserDraftPosts } from "../../features/feed/lib/queries";
import { redirect } from "next/navigation";
import DeleteDraftButton from "../../features/feed/components/molecules/delete-draft-button";

const DraftsPage = async () => {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/auth/login");
  }

  const drafts = await getUserDraftPosts(currentUser.id);

  return (
    <AuthLayout>
      <div className="bg-gradient-to-br from-accent/20 via-primary/10 to-info/20 min-h-[calc(100vh-73px)]">
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-accent to-info p-6 rounded-xl mb-8">
            <h1 className="text-3xl font-bold text-accent-foreground mb-2">
              My Drafts
            </h1>
            <p className="text-accent-foreground/90">
              Continue working on your unfinished posts
            </p>
          </div>

          <div className="space-y-6">
            {drafts.length !== 0 &&
              drafts.map(draft => (
                <div
                  key={draft.id}
                  className="bg-card rounded-lg shadow-sm border border-accent/30 p-6 hover:shadow-md hover:border-accent/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between">
                    <Link
                      href={`/feed/${draft.id}/edit`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-2 py-1 text-xs font-medium bg-muted text-muted-foreground rounded">
                          DRAFT
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(draft.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <h4 className="font-medium text-foreground mb-2 hover:text-primary transition-colors">
                        {draft.title}
                      </h4>
                      <p className="text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                        {draft.content}
                      </p>
                    </Link>
                    <div className="ml-4 flex items-center space-x-2">
                      <DeleteDraftButton postId={draft.id} />
                    </div>
                  </div>
                </div>
              ))}

            <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/30 rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium text-foreground mb-2">
                Ready to write something new?
              </h3>
              <p className="text-muted-foreground mb-4">
                Share your professional journey with the community
              </p>
              <Link
                href="/write"
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Write New Entry
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default DraftsPage;
