"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Inter, Space_Grotesk } from "next/font/google";
import { VscCommentDiscussion } from "react-icons/vsc";
import SortReviewSelect from "./SortReviewSelect";
import { SortReview } from "@/types/review";
import { useInfiniteQuery } from "@tanstack/react-query";
import { getReviewsForPostApi } from "@/api/review";
import { Spinner } from "@/components/UI/spinner";
import ReviewItemComponent from "./ReviewItem";
import { CodeStatus } from "@generated/prisma/enums";
import InfiniteScroll from "react-infinite-scroll-component";

interface ReviewsProps {
  postId: string;
  currentUserId: string | undefined;
  postOwnerId: string;
  postStatus: CodeStatus;
}

//#region Font Declaration
const inter = Inter({ subsets: ["latin"] });
const space_grotesk = Space_Grotesk({ subsets: ["latin"] });
//#endregion

const Reviews = ({
  postId,
  currentUserId,
  postOwnerId,
  postStatus,
}: ReviewsProps) => {
  //#region Use State Hooks
  const [sortBy, setSortBy] = useState<SortReview>("newest");
  //#endregion

  //#region React Query Hooks
  const { data, isLoading, isError, hasNextPage, isFetching, fetchNextPage } =
    useInfiniteQuery({
      queryKey: ["reviews", postId, sortBy],
      queryFn: ({ pageParam }) => {
        return getReviewsForPostApi(postId, pageParam, 2, sortBy);
      },
      select: (data) => data.pages,
      initialPageParam: 1,
      getNextPageParam: (lastpage) =>
        lastpage.data?.hasNextPage ? lastpage.data.currentPage + 1 : undefined,
    });
  //#endregion

  const allReviews = data?.flatMap((page) => page.data?.reviews ?? []) ?? [];

  return (
    <div className="mt-5">
      {/* Reviews Header */}
      <div className="flex flex-row justify-between flex-wrap">
        <div className="flex flex-row gap-2 items-center">
          <VscCommentDiscussion size={20} className="text-primary-dark" />
          <span
            className={cn(
              space_grotesk.className,
              "text-sm text-slate-200 font-semibold",
            )}
          >
            Reviews
          </span>
          <span
            className={cn(
              inter.className,
              "text-xs text-slate-200 bg-gray-800 rounded-full p-1",
            )}
          >
            {data ? data[0].data?.totalCount : 0}
          </span>
        </div>
        <SortReviewSelect value={sortBy} onValueChange={setSortBy} />
      </div>

      {/* Review Items */}
      <div className="mt-4 flex flex-col gap-3">
        {/* Initial loading state */}
        {isLoading && isFetching && (
          <div className="flex flex-row justify-center items-center gap-1">
            <Spinner className="text-slate-300 size-5" />
            <span className={cn(inter.className, "text-slate-300 text-sm")}>
              Fetching Reviews
            </span>
          </div>
        )}

        {/* Error state */}
        {!isLoading && !isFetching && isError && (
          <div className="text-center w-full">
            <span
              className={cn(
                inter.className,
                "text-sm text-red-500 text-center w-full",
              )}
            >
              Error occured when fetching the reviews. Please try again later
            </span>
          </div>
        )}

        {/* Infinite scroll list */}
        {!isLoading && !isError && (
          <InfiniteScroll
            dataLength={allReviews.length}
            next={fetchNextPage}
            hasMore={hasNextPage ?? false}
            loader={
              <div className="flex flex-row justify-center items-center gap-1.5 py-4">
                <Spinner className="text-primary size-4" />
                <span className={cn(inter.className, "text-slate-400 text-xs")}>
                  Loading more reviews…
                </span>
              </div>
            }
            endMessage={
              allReviews.length > 0 && (
                <p
                  className={cn(
                    inter.className,
                    "text-center text-xs text-slate-600 py-3",
                  )}
                >
                  You&apos;ve seen all reviews
                </p>
              )
            }
            className="flex flex-col gap-3"
          >
            {allReviews.map((review) => (
              <ReviewItemComponent
                key={review.id}
                postStatus={postStatus}
                review={review}
                currentUserId={currentUserId}
                postOwnerId={postOwnerId}
              />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </div>
  );
};

export default Reviews;
