import { prisma } from "@/prisma";
import { SortReview } from "@/types/review";

export async function addReview(userId: string, content: string, postId: string) {
    const newReview = await prisma.review.create({
        data: {
            content: content,
            postId: postId,
            reviewerId: userId,
            isAccepted: false,
        }
    })

    return newReview;
}

export async function getReviewByUserId(userId: string, postId: string) {
    const userReview = await prisma.review.findFirst({
        where: {
            postId: postId,
            reviewerId: userId

        }
    })
    return userReview
}

export async function getReviewById(reviewId: string) {
    const review = await prisma.review.findUnique({
        where: {
            id: reviewId
        }
    })
    return review
}

export async function getReviews(postId: string, page: number, pageSize: number, sort: SortReview) {
    // Get all the Reviews respecting the pagination
    const reviews = prisma.review.findMany({
        where: {
            postId: postId
        },
        include: {
            reviewer: {
                select: {
                    id: true,
                    image: true,
                    name: true,

                }
            },
            _count: {
                select: {
                    comments: true
                }
            }
        },
        take: pageSize,
        skip: Math.max((page - 1) * pageSize, 0),
        orderBy: {
            createdAt: sort === "newest" ? "desc" : "asc"
        }
    })

    // Get the total count of the review related to that postid.
    const counts = prisma.review.count({
        where: {
            postId: postId
        }
    })

    const [reviews_paginated, totalcount] = await Promise.all([
        reviews, counts
    ])
    return [reviews_paginated, totalcount] as const
}

export async function deleteReviewById(reviewId: string) {
    const deletedReview = await prisma.review.delete({
        where: {
            id: reviewId
        }
    })
    return deletedReview
}

export async function updateReviewContent(reviewId: string, content: string) {
    const updatedReview = await prisma.review.update({
        where: {
            id: reviewId
        },
        data: {
            content: content
        }
    })
    return updatedReview
}

export async function acceptReviewById(reviewId: string) {
    const acceptedReview = await prisma.review.update({
        where: {
            id: reviewId
        },
        data: {
            isAccepted: true
        }
    })

    // Also update the post to set acceptedReviewId
    await prisma.post.update({
        where: {
            id: acceptedReview.postId
        },
        data: {
            acceptedReviewId: acceptedReview.id,
            status: "ACCEPTED"
        }
    })

    return acceptedReview
}