import { getOptionalServerSession } from "@/auth";
import { replySchema } from "@/schemas/comment";
import { deleteCommentOrReply, PostCommentServiceError, replyOnComment, updateCommentOrReplyContent } from "@/services/comment.service";
import { APIResponse } from "@/types";
import { CommentUpdatedResponse } from "@/types/comment";
import status from "http-status";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest, ctx: RouteContext<'/api/code-post/[id]/comment/[commentId]'>) {
    try {
        const { commentId } = await ctx.params;

        const body = await request.json()
        const replycomment = replySchema.parse(body);

        const user = await getOptionalServerSession()

        const reply = await replyOnComment(commentId, replycomment.content, user!.user.id)

        return NextResponse.json<APIResponse<string>>({
            message: "Added the Reply to the comment",
            status: "success",
            data: reply
        }, {
            status: status.OK
        })
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
            return NextResponse.json<APIResponse<string>>({
                message: error.issues.at(0)?.message ?? "",
                status: "invalid",
            }, {
                status: status.UNPROCESSABLE_ENTITY
            })
        }
        else {
            return NextResponse.json<APIResponse>({
                status: "error",
                message: "Failed to add the reply to the comment"
            }, {
                status: status.INTERNAL_SERVER_ERROR
            })
        }
    }
}

export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/code-post/[id]/comment/[commentId]'>) {
    try {
        const { commentId } = await ctx.params

        const user = await getOptionalServerSession()
        const deletedId = await deleteCommentOrReply(commentId, user!)

        return NextResponse.json<APIResponse<string>>({
            message: 'Deleted Comment Successfully',
            status: "success",
            data: deletedId
        }, { status: status.OK })
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
        }
        else {
            return NextResponse.json<APIResponse>({
                status: "error",
                message: "Failed to delete the comment"
            }, {
                status: status.INTERNAL_SERVER_ERROR
            })
        }
    }
}

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/code-post/[id]/comment/[commentId]'>) {
    try {
        const { commentId } = await ctx.params

        
        const updatecommentbody = await request.json()
        
        const updateSchema = replySchema.parse(updatecommentbody)
        
        const user = await getOptionalServerSession();
        const updatedComment = await updateCommentOrReplyContent(commentId, updateSchema, user!)

        return NextResponse.json<APIResponse<CommentUpdatedResponse>>({
            message: "Updated the Comment/reply successfully",
            status: "success",
            data: updatedComment
        }, {
            status: status.OK
        })

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
            return NextResponse.json<APIResponse<string>>({
                message: error.issues.at(0)?.message ?? "",
                status: "invalid",
            }, {
                status: status.UNPROCESSABLE_ENTITY
            })
        }
        else {
            return NextResponse.json<APIResponse>({
                status: "error",
                message: "Failed to update the reply to the comment"
            }, {
                status: status.INTERNAL_SERVER_ERROR
            })
        }
    }
}