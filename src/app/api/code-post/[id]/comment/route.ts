import { getOptionalServerSession } from "@/auth";
import { commentSchema } from "@/schemas";
import { addCommentOnPost, getCommentsOnPost, getRepliesOnComment, PostCommentServiceError } from "@/services/comment.service";
import { APIResponse } from "@/types";
import { CommentWithAuthorAndReplyCount } from "@/types/comment";
import status from "http-status";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest, ctx: RouteContext<'/api/code-post/[id]/comment'>) {
    try {
        const { id } = await ctx.params;

        const user = await getOptionalServerSession();

        const body = await request.json()
        const commentschema = commentSchema.parse(body);

        const commentid = await addCommentOnPost(id, user!.user.id, commentschema.content, commentschema.startline, commentschema.endline)

        return NextResponse.json<APIResponse<string>>({
            message: "added the comment on the Post",
            status: "success",
            data: commentid
        })
    } catch (error) {
        console.error(error)
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
        else if (error instanceof ZodError) {
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
                message: "Failed to add the comment on the post"
            }, {
                status: status.INTERNAL_SERVER_ERROR
            })
        }
    }
}

export async function GET(request: NextRequest, ctx: RouteContext<'/api/code-post/[id]/comment'>) {
    try {
        const { id } = await ctx.params;

        const queryParams = request.nextUrl.searchParams;
        const hasStartLine = queryParams.has("startlineno");
        const hasParentComment = queryParams.has("parentcommentid");

        // Disallow providing both params at the same time
        if (hasStartLine && hasParentComment) {
            return NextResponse.json<APIResponse>({
                message: "Cannot provide both startlineno and parentcommentid",
                status: "invalid"
            }, {
                status: status.BAD_REQUEST
            })
        }

        // At least one must be provided
        if (!hasStartLine && !hasParentComment) {
            return NextResponse.json<APIResponse>({
                message: "Either startlineno or parentcommentid is required",
                status: "invalid"
            }, {
                status: status.BAD_REQUEST
            })
        }

        let comments: CommentWithAuthorAndReplyCount[];

        if (hasStartLine) {
            const startlineno = Number(queryParams.get("startlineno"))
            if (isNaN(startlineno)) {
                return NextResponse.json<APIResponse>({
                    message: "startlineno must be a number",
                    status: "invalid"
                }, {
                    status: status.BAD_REQUEST
                })
            }
            comments = await getCommentsOnPost(id, startlineno);
        } else {
            const parentcommentid = queryParams.get("parentcommentid")!;
            comments = await getRepliesOnComment(id, parentcommentid);
        }

        return NextResponse.json<APIResponse<CommentWithAuthorAndReplyCount[]>>({
            message: "Fetched the Comments Successfully",
            status: "success",
            data: comments
        })

    } catch (error) {
        console.error(error)
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
                message: "Failed to get the comment for the post"
            }, {
                status: status.INTERNAL_SERVER_ERROR
            })
        }
    }
}

