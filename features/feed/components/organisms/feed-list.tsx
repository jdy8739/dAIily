"use client";

import Link from "next/link";
import InfiniteScroll from "../../../../components/atoms/infinite-scroll";
import LikeButton from "../molecules/like-button";

type FeedPost = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  author: {
    name: string | null;
  };
  likes: {
    userId: string;
  }[];
  _count: {
    likes: number;
    replies: number;
  };
};

type FeedListProps = {
  initialPosts: FeedPost[];
  currentUserId: string | null;
  loadMore: (page: number) => Promise<{ items: FeedPost[]; hasMore: boolean }>;
};

const FeedList = ({ initialPosts, currentUserId, loadMore }: FeedListProps) => {
  return (
    <InfiniteScroll
      items={initialPosts}
      renderItem={(post) => (
        <Link key={post.id} href={`/feed/${post.id}`} className="block">
          <div className="bg-card rounded-lg shadow-sm border border-accent/30 p-6 hover:shadow-md hover:border-accent/50 transition-all duration-200 cursor-pointer">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-semibold text-sm">
                  {post.author.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "??"}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-foreground">
                    {post.author.name}
                  </h3>
                  <span className="text-sm text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h4 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h4>
                <p className="text-muted-foreground mb-3 whitespace-pre-wrap">
                  {post.content}
                </p>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <LikeButton
                    postId={post.id}
                    initialLiked={
                      currentUserId
                        ? post.likes.some((like) => like.userId === currentUserId)
                        : false
                    }
                    initialLikeCount={post._count.likes}
                  />
                  <span className="hover:text-accent transition-colors">
                    💬 {post._count.replies}
                  </span>
                  <span className="hover:text-accent transition-colors">
                    🔄 Share
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}
      onLoadMore={loadMore}
      endMessage={<p>No more posts to load</p>}
      className="space-y-6"
    />
  );
};

export default FeedList;
