import { getOptionalServerSession } from "@/auth";
import { replySchema } from "@/schemas/comment";
import {
    addCommentOnReview,
    getCommentsOnReview,
    PostCommentServiceError,
} from "@/services/comment.service";
import { APIResponse } from "@/types";
import { CommentWithAuthorAndReplyCount } from "@/types/comment";
import status from "http-status";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(
    request: NextRequest,
    ctx: RouteContext<"/api/code-post/[id]/review/[reviewId]/comment">,
) {
    try {
        const { reviewId } = await ctx.params;

        const user = await getOptionalServerSession();

        const body = await request.json();
        const commentbody = replySchema.parse(body);

        const commentId = await addCommentOnReview(
            reviewId,
            user!.user.id,
            commentbody.content,
        );

        return NextResponse.json<APIResponse<string>>({
            message: "Added the comment on the Review",
            status: "success",
            data: commentId,
        });
    } catch (error) {
        console.error(error);
        if (error instanceof PostCommentServiceError) {
            return NextResponse.json<APIResponse>(
                {
                    message: error.message,
                    status: "invalid",
                },
                {
                    status: error.statusCode,
                },
            );
        } else if (error instanceof ZodError) {
            return NextResponse.json<APIResponse<string>>(
                {
                    message: error.issues.at(0)?.message ?? "",
                    status: "invalid",
                },
                {
                    status: status.UNPROCESSABLE_ENTITY,
                },
            );
        } else {
            return NextResponse.json<APIResponse>(
                {
                    status: "error",
                    message: "Failed to add the comment on the review",
                },
                {
                    status: status.INTERNAL_SERVER_ERROR,
                },
            );
        }
    }
}

export async function GET(
    ctx: RouteContext<"/api/code-post/[id]/review/[reviewId]/comment">,
) {
    try {
        const { id, reviewId } = await ctx.params;

        const comments = await getCommentsOnReview(id, reviewId);

        return NextResponse.json<APIResponse<CommentWithAuthorAndReplyCount[]>>({
            message: "Fetched the Review Comments Successfully",
            status: "success",
            data: comments,
        });
    } catch (error) {
        console.error(error);
        if (error instanceof PostCommentServiceError) {
            return NextResponse.json<APIResponse>(
                {
                    message: error.message,
                    status: "invalid",
                },
                {
                    status: error.statusCode,
                },
            );
        } else {
            return NextResponse.json<APIResponse>(
                {
                    status: "error",
                    message: "Failed to get the comments for the review",
                },
                {
                    status: status.INTERNAL_SERVER_ERROR,
                },
            );
        }
    }
}
