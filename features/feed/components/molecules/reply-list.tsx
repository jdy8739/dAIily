"use client";

import { useState, useEffect } from "react";
import { Pencil } from "lucide-react";
import DeleteReplyButton from "./delete-reply-button";
import EditReplyForm from "./edit-reply-form";
import ClientDate from "../../../../components/atoms/client-date";

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
      <div className="text-center py-8 text-muted-foreground text-sm">
        <p>No replies yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visibleReplies.map(reply => {
        const isReplyAuthor = currentUserId === reply.author.id;
        const isPostOwner = currentUserId === postAuthorId;
        const canDelete = isReplyAuthor || isPostOwner;

        return (
          <div
            key={reply.id}
            className="bg-muted/30 rounded-lg p-4 border border-border/50"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-foreground font-medium text-xs">
                    {reply.author.name
                      ?.split(" ")
                      .map(n => n[0])
                      .join("") || "??"}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground text-sm flex items-center">
                    {reply.author.name}
                    {reply.author.id === postAuthorId && (
                      <span className="ml-2 px-1.5 py-0.5 text-xs bg-accent/20 text-accent rounded">
                        Author
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-secondary">
                    <ClientDate date={reply.createdAt} />
                    {reply.updatedAt !== reply.createdAt && (
                      <span className="ml-1 text-secondary/70">(edited)</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                {isReplyAuthor && (
                  <button
                    onClick={e => handleEditClick(reply.id, e)}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-accent cursor-pointer"
                    title="Edit reply"
                  >
                    <Pencil className="w-3.5 h-3.5" />
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

            <div className="ml-9">
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
