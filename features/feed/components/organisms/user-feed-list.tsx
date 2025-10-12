"use client";

import Link from "next/link";
import InfiniteScroll from "../../../../components/atoms/infinite-scroll";

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
          className="block p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/5 transition-all"
        >
          <h4 className="font-semibold text-foreground mb-2">{post.title}</h4>
          <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
            {post.content}
          </p>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
            <span>❤️ {post._count.likes}</span>
            <span>💬 {post._count.replies}</span>
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
