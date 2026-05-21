import { getOptionalServerSession } from "@/auth";
import { replySchema } from "@/schemas/comment";
import {
    deleteCommentOrReply,
    PostCommentServiceError,
    replyOnComment,
    updateCommentOrReplyContent,
} from "@/services/comment.service";
import { APIResponse } from "@/types";
import { CommentUpdatedResponse } from "@/types/comment";
import status from "http-status";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function DELETE(
    _request: NextRequest,
    ctx: RouteContext<"/api/code-post/[id]/review/[reviewId]/comment/[commentId]">,
) {
    try {
        const { commentId } = await ctx.params;

        const user = await getOptionalServerSession();
        const deletedId = await deleteCommentOrReply(commentId, user!);

        return NextResponse.json<APIResponse<string>>(
            {
                message: "Deleted Review Comment Successfully",
                status: "success",
                data: deletedId,
            },
            { status: status.OK },
        );
    } catch (error) {
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
                    message: "Failed to delete the review comment",
                },
                {
                    status: status.INTERNAL_SERVER_ERROR,
                },
            );
        }
    }
}

export async function PATCH(
    request: NextRequest,
    ctx: RouteContext<"/api/code-post/[id]/review/[reviewId]/comment/[commentId]">,
) {
    try {
        const { commentId } = await ctx.params;

        const updateCommentBody = await request.json();
        const updateSchema = replySchema.parse(updateCommentBody);

        const user = await getOptionalServerSession();
        const updatedComment = await updateCommentOrReplyContent(
            commentId,
            updateSchema,
            user!,
        );

        return NextResponse.json<APIResponse<CommentUpdatedResponse>>(
            {
                message: "Updated the Review Comment successfully",
                status: "success",
                data: updatedComment,
            },
            {
                status: status.OK,
            },
        );
    } catch (error) {
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
                    message: "Failed to update the review comment",
                },
                {
                    status: status.INTERNAL_SERVER_ERROR,
                },
            );
        }
    }
}

export async function POST(
    request: NextRequest,
    ctx: RouteContext<"/api/code-post/[id]/review/[reviewId]/comment/[commentId]">,
) {
    try {
        const { commentId } = await ctx.params;

        const body = await request.json();
        const replycomment = replySchema.parse(body);

        const user = await getOptionalServerSession();

        const reply = await replyOnComment(
            commentId,
            replycomment.content,
            user!.user.id,
        );

        return NextResponse.json<APIResponse<string>>(
            {
                message: "Added the Reply to the review comment",
                status: "success",
                data: reply,
            },
            {
                status: status.OK,
            },
        );
    } catch (error) {
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
                    message: "Failed to add the reply to the review comment",
                },
                {
                    status: status.INTERNAL_SERVER_ERROR,
                },
            );
        }
    }
}
