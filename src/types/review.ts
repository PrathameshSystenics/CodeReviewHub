import { Prisma } from "@generated/prisma/client";

export type ReviewWithAuthorAndCommentCount = Prisma.ReviewGetPayload<{
    include: {
        reviewer: {
            select: {
                id: true;
                image: true;
                name: true;
            };
        };
        _count: {
            select: {
                comments: true;
            };
        };
    };
}>;

export type ReviewItem = Omit<ReviewWithAuthorAndCommentCount, "_count"> & {
    commentCount: number;
};

export interface PaginatedReviewsResponse {
    reviews: ReviewItem[];
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
}
