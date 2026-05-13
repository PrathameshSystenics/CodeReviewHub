import { addReview } from "@/db/review.repo";
import { ReviewInput } from "@/schemas/review";
import status from "http-status";
import { Session } from "next-auth";
import { getPostByIdService } from "./postCode.service";

export class ReviewServiceError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
    ) {
        super(message);
        this.name = "ReviewServiceError";
    }
}


export async function addReviewForPost(postId: string, user: Session, reviewSchema: ReviewInput) {
    try {
        const post = await getPostByIdService(postId, {})

        if (!post) {
            throw new ReviewServiceError("Post not Found", status.NOT_FOUND)
        }

        if (post.authorId === user.user.id) {
            throw new ReviewServiceError("Author Cannot Review thier Own Post", status.NOT_ACCEPTABLE)
        }

        if (!reviewSchema.content.trim()) {
            throw new ReviewServiceError("Review cannot be empty", status.BAD_REQUEST)
        }

        const review = await addReview(user.user.id, reviewSchema.content, postId)
        return review
    } catch (error) {
        console.error(error)
        throw error;
    }
}