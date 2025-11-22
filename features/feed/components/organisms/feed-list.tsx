"use client";

import Link from "next/link";
import { MessageCircle, Share2 } from "lucide-react";
import InfiniteScroll from "../../../../components/atoms/infinite-scroll";
import LikeButton from "../molecules/like-button";
import ClientDate from "../../../../components/atoms/client-date";

type FeedPost = {
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

type FeedListProps = {
  initialPosts: FeedPost[];
  loadMore: (page: number) => Promise<{ items: FeedPost[]; hasMore: boolean }>;
};

const FeedListSkeleton = () => (
  <div className="space-y-4 container">
    {[1, 2, 3].map(i => (
      <div
        key={i}
        className="bg-card rounded-lg border border-border/50 p-6 container"
      >
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 rounded-full skeleton" />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-3">
              <div className="h-4 w-24 rounded skeleton" />
              <div className="h-3 w-16 rounded skeleton" />
            </div>
            <div className="h-5 w-3/4 rounded skeleton mb-2" />
            <div className="space-y-2 mb-4">
              <div className="h-4 w-full rounded skeleton" />
              <div className="h-4 w-5/6 rounded skeleton" />
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-4 w-12 rounded skeleton" />
              <div className="h-4 w-12 rounded skeleton" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const FeedList = ({ initialPosts, loadMore }: FeedListProps) => {
  return (
    <InfiniteScroll
      items={initialPosts}
      renderItem={post => (
        <Link key={post.id} href={`/feed/${post.id}`} className="block">
          <div className="bg-card rounded-lg border border-border/50 p-6 hover:border-border transition-colors cursor-pointer">
            <div className="flex items-start space-x-3">
              <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-foreground font-medium text-xs">
                  {post.author.name
                    ?.split(" ")
                    .map(n => n[0])
                    .join("") || "??"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <h3 className="font-medium text-foreground text-sm">
                    {post.author.name}
                  </h3>
                  <span className="text-secondary">·</span>
                  <ClientDate
                    date={post.createdAt}
                    className="text-xs text-secondary"
                  />
                </div>
                <h4 className="font-medium text-foreground text-sm mb-1.5">
                  {post.title}
                </h4>
                <p className="text-muted-foreground text-sm mb-3 whitespace-pre-wrap line-clamp-3">
                  {post.content}
                </p>
                <div className="flex items-center space-x-4 text-muted-foreground">
                  <LikeButton
                    postId={post.id}
                    initialLiked={false}
                    initialLikeCount={post._count.likes}
                  />
                  <span className="flex items-center space-x-1.5 text-xs hover:text-foreground transition-colors">
                    <MessageCircle className="w-4 h-4" />
                    <span>{post._count.replies}</span>
                  </span>
                  <span className="flex items-center space-x-1.5 text-xs hover:text-foreground transition-colors">
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      )}
      onLoadMore={loadMore}
      loader={<FeedListSkeleton />}
      endMessage={
        <p className="text-center text-sm text-muted-foreground py-4">
          No more posts to load
        </p>
      }
      className="space-y-4"
    />
  );
};

export default FeedList;
