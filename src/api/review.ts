import { ReviewInput } from "@/schemas/review";
import { APIResponse } from "@/types";
import { Review } from "@generated/prisma/client";

export async function addReviewForPostApi(postId: string, contentbody: ReviewInput): Promise<APIResponse<Review | null>> {
    const response = await fetch(`/api/code-post/${postId}/review`, {
        method: "POST",
        body: JSON.stringify(contentbody)
    })
    return response.json()
}