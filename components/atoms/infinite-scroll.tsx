"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Spinner from "./spinner";

interface InfiniteScrollProps<T> {
  /**
   * Array of items to render
   */
  items: T[];
  /**
   * Function to render each item
   */
  renderItem: (item: T, index: number) => React.ReactNode;
  /**
   * Function to load more items (typically a Server Action)
   * Should return the new items and whether there are more to load
   */
  onLoadMore: (
    currentPage: number
  ) => Promise<{ items: T[]; hasMore: boolean }>;
  /**
   * Optional loading component to show while fetching more items
   */
  loader?: React.ReactNode;
  /**
   * Optional component to show when no more items are available
   */
  endMessage?: React.ReactNode;
  /**
   * Distance from bottom (in pixels) to trigger loading more items
   * @default 200
   */
  threshold?: number;
  /**
   * Initial page number
   * @default 1
   */
  initialPage?: number;
  /**
   * Optional className for the container
   */
  className?: string;
  /**
   * Optional error handler
   */
  onError?: (error: Error) => void;
}

const InfiniteScroll = <T,>({
  items: initialItems,
  renderItem,
  onLoadMore,
  loader,
  endMessage,
  threshold = 200,
  initialPage = 1,
  className = "",
  onError,
}: InfiniteScrollProps<T>) => {
  const [items, setItems] = useState<T[]>(initialItems);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Update items when initialItems change (e.g., from server-side refresh)
  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;

    setLoading(true);

    try {
      const result = await onLoadMore(page + 1);
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Error loading more items:", error);
      if (onError && error instanceof Error) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, onLoadMore, onError]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      {
        rootMargin: `${threshold}px`,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMore, hasMore, loading, threshold]);

  return (
    <div className={className}>
      {items.map((item, index) => (
        <div key={index}>{renderItem(item, index)}</div>
      ))}

      {loading && (
        <div className="flex justify-center py-8">
          {loader || (
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <span className="text-sm text-muted-foreground font-medium">
                Loading more...
              </span>
            </div>
          )}
        </div>
      )}

      {!loading && !hasMore && endMessage && (
        <div className="flex justify-center py-4 text-muted-foreground text-sm">
          {endMessage}
        </div>
      )}

      {/* Intersection observer target */}
      <div ref={observerTarget} className="h-px" />
    </div>
  );
};

export default InfiniteScroll;
