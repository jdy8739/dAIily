"use client";

import { useState, useEffect } from "react";
import DeleteReplyButton from "./delete-reply-button";
import EditReplyForm from "./edit-reply-form";

interface Reply {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  author: {
    id: string;
    name: string | null;
  };
}

interface ReplyListProps {
  replies: Reply[];
  currentUserId?: string;
  postAuthorId: string;
}

const ReplyList = ({
  replies,
  currentUserId,
  postAuthorId,
}: ReplyListProps) => {
  const [deletedReplies, setDeletedReplies] = useState<Set<string>>(new Set());
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleReplyDeleted = (replyId: string) => {
    setDeletedReplies(prev => new Set([...prev, replyId]));
  };

  const handleEditClick = (replyId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingReplyId(replyId);
  };

  const handleEditCancel = () => {
    setEditingReplyId(null);
  };

  const handleEditSuccess = () => {
    setEditingReplyId(null);
  };

  const visibleReplies = replies.filter(reply => !deletedReplies.has(reply.id));

  if (visibleReplies.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No replies yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleReplies.map(reply => {
        const isReplyAuthor = currentUserId === reply.author.id;
        const isPostOwner = currentUserId === postAuthorId;
        const canDelete = isReplyAuthor || isPostOwner;

        return (
          <div
            key={reply.id}
            className="bg-muted/30 rounded-lg p-4 border border-border/50"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-semibold text-xs">
                    {reply.author.name
                      ?.split(" ")
                      .map(n => n[0])
                      .join("") || "??"}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm">
                    {reply.author.name}
                    {reply.author.id === postAuthorId && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-accent text-accent-foreground rounded-full">
                        Author
                      </span>
                    )}
                  </h4>
                  {isClient && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(reply.createdAt).toLocaleString()}
                      {reply.updatedAt !== reply.createdAt && (
                        <span className="ml-1 text-muted-foreground/70">
                          (edited)
                        </span>
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {isReplyAuthor && (
                  <button
                    onClick={e => handleEditClick(reply.id, e)}
                    className="px-2 py-1 text-xs text-muted-foreground hover:text-accent transition-colors rounded hover:bg-accent/10 cursor-pointer"
                    title="Edit reply"
                  >
                    ✏️
                  </button>
                )}
                {canDelete && (
                  <DeleteReplyButton
                    replyId={reply.id}
                    onDeleted={() => handleReplyDeleted(reply.id)}
                  />
                )}
              </div>
            </div>

            <div className="ml-11">
              {editingReplyId === reply.id ? (
                <EditReplyForm
                  replyId={reply.id}
                  initialContent={reply.content}
                  onCancel={handleEditCancel}
                  onSuccess={handleEditSuccess}
                />
              ) : (
                <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                  {reply.content}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ReplyList;
