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