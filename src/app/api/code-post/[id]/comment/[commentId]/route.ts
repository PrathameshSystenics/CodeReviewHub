import { getOptionalServerSession } from "@/auth";
import { APIResponse } from "@/types";
import status from "http-status";
import { NextRequest, NextResponse } from "next/server";
import { PostCommentServiceError, replyOnComment } from "@/services/comment.service";
import { replySchema } from "@/schemas/comment";
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