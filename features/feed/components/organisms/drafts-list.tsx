"use client";

import Link from "next/link";
import InfiniteScroll from "../../../../components/atoms/infinite-scroll";
import DeleteDraftButton from "../molecules/delete-draft-button";
import ClientDate from "../../../../components/atoms/client-date";

type DraftPost = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author: {
    name: string | null;
  };
  _count: {
    likes: number;
    replies: number;
  };
};

type DraftsListProps = {
  initialDrafts: DraftPost[];
  loadMore: (page: number) => Promise<{ items: DraftPost[]; hasMore: boolean }>;
};

const DraftsList = ({ initialDrafts, loadMore }: DraftsListProps) => {
  return (
    <InfiniteScroll
      items={initialDrafts}
      renderItem={draft => (
        <div
          key={draft.id}
          className="bg-card rounded-lg shadow-sm border border-border p-6 hover:shadow-md hover:border-border transition-all duration-200"
        >
          <div className="flex items-start justify-between">
            <Link
              href={`/feed/${draft.id}/edit`}
              className="flex-1 cursor-pointer"
            >
              <div className="flex items-center space-x-2 mb-2">
                <span className="px-2 py-1 text-xs font-medium bg-success/20 text-success rounded">
                  DRAFT
                </span>
                <span className="text-sm text-secondary">
                  <ClientDate date={draft.createdAt} />
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
      )}
      onLoadMore={loadMore}
      endMessage={<p>No more drafts</p>}
      className="space-y-6"
    />
  );
};

export default DraftsList;
