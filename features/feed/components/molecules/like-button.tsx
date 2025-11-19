"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { likePost, unlikePost } from "../../lib/actions";

interface LikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
}

const LikeButton = ({
  postId,
  initialLiked,
  initialLikeCount,
}: LikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLoading, setIsLoading] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isLoading) return;

    setIsLoading(true);

    try {
      if (isLiked) {
        const result = await unlikePost(postId);
        if (result.success) {
          setIsLiked(false);
          setLikeCount(prev => prev - 1);
        } else {
          console.error("Unlike failed:", result.error);
        }
      } else {
        const result = await likePost(postId);
        if (result.success) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
        } else {
          console.error("Like failed:", result.error);
        }
      }
    } catch (error) {
      console.error("Like/unlike error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center space-x-1.5 text-xs transition-colors ${
        isLiked
          ? "text-accent hover:text-accent/80"
          : "text-muted-foreground hover:text-foreground"
      } disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer`}
      title={isLiked ? "Unlike this post" : "Like this post"}
    >
      <Heart
        className={`w-4 h-4 transition-transform ${isLoading ? "scale-110" : ""} ${
          isLiked ? "fill-current" : ""
        }`}
      />
      <span className="font-medium">{likeCount}</span>
    </button>
  );
};

export default LikeButton;
