import { prisma } from "@/prisma";

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

export async function getReviews(postId: string, page: number, pageSize: number, sort: "asc" | "desc") {
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
            createdAt: sort
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