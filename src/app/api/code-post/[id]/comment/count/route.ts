import { getCommentCountsOnPost } from "@/services/comment.service";
import { APIResponse } from "@/types";
import status from "http-status";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest, ctx: RouteContext<'/api/code-post/[id]/comment/count'>) {
    try {
        const { id } = await ctx.params;

        const commentcount = await getCommentCountsOnPost(id);
        return NextResponse.json({
            message: "comment counts loaded",
            status: "success",
            data: commentcount
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json<APIResponse>({
            status: "error",
            message: "Failed to add the comment on the post"
        }, {
            status: status.INTERNAL_SERVER_ERROR
        })
    }
}