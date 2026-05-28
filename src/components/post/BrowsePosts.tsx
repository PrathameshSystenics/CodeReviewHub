"use client";

import { getRecentPosts } from "@/api/postcode";
import { cn } from "@/lib/utils";
import { CodeStatus, Sort } from "@/types/browse";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Inter, Space_Grotesk } from "next/font/google";
import { useSearchParams } from "next/navigation";
import InfiniteScroll from "react-infinite-scroll-component";
import { Spinner } from "../UI/spinner";
import PostShort from "./PostShort";

//#region Font Declaration
const inter = Inter({ subsets: ["latin"] });
//#endregion

const BrowsePosts = () => {
  //#region State and Hooks
  const searchparams = useSearchParams();
  //#endregion

  const Page_Size = 6;
  const currentSort = (searchparams.get("sort") as Sort) || "newest";
  const poststatus = (searchparams.get("codestatus") as CodeStatus) || "all";

  //#region React Query
  const { data, isError, isFetching, fetchNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: ["browse-posts", currentSort, poststatus],
      initialPageParam: 0,
      queryFn: ({ pageParam }) => {
        return getRecentPosts(
          pageParam,
          Page_Size,
          currentSort,
          poststatus,
          false,
        );
      },
      staleTime: 1000 * 60 * 3,
      getNextPageParam: (lastpage, pages) => {
        const itemCount = lastpage.data?.length ?? 0;
        return itemCount === Page_Size ? pages.length * Page_Size : undefined;
      },
      select: (data) => data.pages,
    });

  const allPosts = data?.flatMap((value) => value.data ?? []) ?? [];
  //#endregion

  return (
    <div>
      {isLoading && isFetching && (
        <div className="flex flex-row justify-center items-center gap-1">
          <Spinner className="text-slate-300 size-5" />
          <span className={cn(inter.className, "text-slate-300 text-sm")}>
            Fetching Posts
          </span>
        </div>
      )}

      {isError && (
        <div className="text-sm text-red-400">
          Failed to load posts. Please try again.
        </div>
      )}
      {data?.length === 0 && !isLoading && (
        <div className="text-sm text-slate-500 text-center">
          No posts to display.
        </div>
      )}

      <InfiniteScroll
        className="flex flex-col gap-3"
        dataLength={allPosts.length}
        next={fetchNextPage}
        hasMore={(data?.[data.length - 1]?.data?.length ?? 0) === Page_Size}
        loader={
          <div className="flex flex-row justify-center items-center gap-1.5 py-4">
            <Spinner className="text-primary size-4" />
            <span className={cn(inter.className, "text-slate-400 text-xs")}>
              Loading more posts…
            </span>
          </div>
        }
        endMessage={
          allPosts.length > 0 && (
            <p
              className={cn(
                inter.className,
                "text-center text-xs text-slate-600 py-3",
              )}
            >
              You&apos;ve seen all posts
            </p>
          )
        }
      >
        {allPosts.map((post) => {
          return (
            <PostShort
              key={post.id}
              id={post.id}
              authorId={post.authorId}
              code={post.code ?? ""}
              description={post.description ?? ""}
              createdTime={new Date(post.createdAt)}
              language={post.language}
              published={post.published}
              requireComments={post.requireComments}
              requireReview={post.requireReview}
              status={post.status}
              tag={post.postTags.map((value) => value.tag.name)}
              title={post.title}
              commentsCount={post._count.comments}
              reviewCount={post._count.reviews}
              author={{
                id: post.author.id,
                image: post.author.image,
                name: post.author.name,
              }}
              viewsCount={post._count.postViews}
            />
          );
        })}
      </InfiniteScroll>
    </div>
  );
};

export default BrowsePosts;
