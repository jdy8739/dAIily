"use client";

import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import InfiniteScroll from "../../../../components/atoms/infinite-scroll";
import ClientDate from "../../../../components/atoms/client-date";

type UserPost = {
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

type UserFeedListProps = {
  initialPosts: UserPost[];
  loadMore: (page: number) => Promise<{ items: UserPost[]; hasMore: boolean }>;
};

const UserFeedList = ({ initialPosts, loadMore }: UserFeedListProps) => {
  return (
    <InfiniteScroll
      items={initialPosts}
      renderItem={(post) => (
        <Link
          key={post.id}
          href={`/feed/${post.id}`}
          className="block p-6 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/5 transition-all"
        >
          <h4 className="font-semibold text-foreground mb-2">{post.title}</h4>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {post.content}
          </p>
          <div className="flex items-center space-x-4 text-sm text-secondary">
            <ClientDate date={post.createdAt} />
            <span className="flex items-center gap-1">
              <Heart className="w-4 h-4" /> {post._count.likes}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> {post._count.replies}
            </span>
          </div>
        </Link>
      )}
      onLoadMore={loadMore}
      endMessage={<p>No more posts</p>}
      className="space-y-4"
    />
  );
};

export default UserFeedList;
