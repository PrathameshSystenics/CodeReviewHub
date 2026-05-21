import { ReplyCommentInputs } from "@/schemas/comment";
import { APIResponse } from "@/types";
import {
    CommentUpdatedResponse,
    CommentWithAuthorAndReplyCount,
} from "@/types/comment";

export async function addCommentOnReviewApi(
    postId: string,
    reviewId: string,
    body: ReplyCommentInputs,
): Promise<APIResponse<string>> {
    const response = await fetch(
        `/api/code-post/${postId}/review/${reviewId}/comment`,
        {
            method: "POST",
            body: JSON.stringify(body),
        },
    );
    return response.json();
}

export async function getCommentsOnReviewApi(
    postId: string,
    reviewId: string,
): Promise<APIResponse<CommentWithAuthorAndReplyCount[] | null>> {
    const response = await fetch(
        `/api/code-post/${postId}/review/${reviewId}/comment`,
        {
            method: "GET",
            next: {
                revalidate: 60
            }
        },
    );
    return response.json();
}

export async function deleteReviewCommentApi(
    postId: string,
    reviewId: string,
    commentId: string,
): Promise<APIResponse<string | null>> {
    const response = await fetch(
        `/api/code-post/${postId}/review/${reviewId}/comment/${commentId}`,
        {
            method: "DELETE",
        },
    );
    return response.json();
}

export async function updateReviewCommentApi(
    postId: string,
    reviewId: string,
    commentId: string,
    body: ReplyCommentInputs,
): Promise<APIResponse<CommentUpdatedResponse | null>> {
    const response = await fetch(
        `/api/code-post/${postId}/review/${reviewId}/comment/${commentId}`,
        {
            method: "PATCH",
            body: JSON.stringify(body),
        },
    );
    return response.json();
}

export async function replyOnReviewCommentApi(
    postId: string,
    reviewId: string,
    commentId: string,
    body: ReplyCommentInputs,
): Promise<APIResponse<string | null>> {
    const response = await fetch(
        `/api/code-post/${postId}/review/${reviewId}/comment/${commentId}`,
        {
            method: "POST",
            body: JSON.stringify(body),
        },
    );
    return response.json();
}
