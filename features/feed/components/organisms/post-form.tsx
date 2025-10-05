"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPostSchema, type CreatePostData } from "../../schemas/post";
import { createPost } from "../../lib/actions";
import Button from "../../../../components/atoms/button";
import Input from "../../../../components/atoms/input";
import Textarea from "../../../../components/atoms/textarea";

const PostForm = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreatePostData>({
    resolver: zodResolver(createPostSchema),
  });

  const onSubmit = async (data: CreatePostData) => {
    const confirmed = window.confirm(
      "Are you sure you want to share your growth story?"
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    try {
      const result = await createPost(data, "PUBLISHED");
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        reset();
        router.push("/feed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onSaveDraft = async () => {
    const data = {
      title: (document.getElementById("title") as HTMLInputElement)?.value || "",
      content:
        (document.getElementById("content") as HTMLTextAreaElement)?.value ||
        "",
    };

    if (!data.title.trim() || !data.content.trim()) {
      setError("Title and content are required to save draft");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await createPost(data, "DRAFT");
      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        reset();
        router.push("/feed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 rounded-md bg-warning/10 border border-warning/30">
          <p className="text-sm text-warning font-medium">{error}</p>
        </div>
      )}

      <Input
        {...register("title")}
        id="title"
        type="text"
        label="Title"
        placeholder="What did you accomplish today?"
        error={errors.title?.message}
        className="px-4 py-3"
      />

      <Textarea
        {...register("content")}
        id="content"
        label="Content"
        rows={12}
        placeholder="Share your experiences, learnings, and achievements from today..."
        error={errors.content?.message}
        className="px-4 py-3"
      />

      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center space-x-4">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onSaveDraft}
          >
            Save Draft
          </Button>

          <Button type="button" variant="ai" disabled={loading}>
            ✨ AI Correct
          </Button>
        </div>

        <Button type="submit" variant="primary" size="lg" disabled={loading}>
          {loading ? "Sharing..." : "Share Growth"}
        </Button>
      </div>
    </form>
  );
};

export default PostForm;
