import status from "http-status";
import { getPostByIdService } from "./postCode.service";
import { addComment, getCommentCount, getComments } from "@/db/comment.repo";
import { CommentCountOnPost } from "@/types/comment";

export class PostCommentServiceError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
    ) {
        super(message);
        this.name = "PostCommentServiceError";
    }
}

export async function addCommentOnPost(postId: string, userId: string, content: string, startline: number, endline?: number | null) {
    try {
        const post = await getPostByIdService(postId, {})

        // Own user cannot add the comment on his post
        if (post.authorId === userId) {
            throw new PostCommentServiceError("Author Cannot comment on their own post", status.BAD_REQUEST)
        }

        // Disallow on adding the comment on accepted or closed post.
        if (post.status === "ACCEPTED" || post.status === "CLOSED") {
            throw new PostCommentServiceError("Cannot comment on Closed/Accepted Post", status.BAD_REQUEST)
        }

        const commentid = await addComment(post.id, startline, content, userId, endline)
        return commentid
    } catch (error) {
        console.error(error)
        throw error;
    }
}

export async function getCommentsOnPost(postId: string, startLineNo: number) {
    try {
        return await getComments(postId, startLineNo)
    } catch (error) {
        {
            console.error(error)
            throw error;
        }
    }
}

export async function getCommentCountsOnPost(postId: string): Promise<CommentCountOnPost[]> {
    try {
        const commentcounts = await getCommentCount(postId)
        const commentCountData: CommentCountOnPost[] = commentcounts.map(
            (value) => ({
                count: value._count,
                startlineno: value.startlineno,
            })
        );
        return commentCountData
    } catch (error) {
        console.error(error)
        throw error;
    }
}