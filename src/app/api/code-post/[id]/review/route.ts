import { getOptionalServerSession } from "@/auth";
import { reviewSchema } from "@/schemas";
import { addReviewForPost, ReviewServiceError } from "@/services/review.service";
import { APIResponse } from "@/types";
import { Review } from "@generated/prisma/client";
import status from "http-status";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest, ctx: RouteContext<'/api/code-post/[id]/review'>) {
    try {
        const { id } = await ctx.params

        const reviewBody = await request.json()
        const reviewBodySchema = reviewSchema.parse(reviewBody)

        const user = await getOptionalServerSession()

        const review = await addReviewForPost(id, user!, reviewBodySchema)

        return NextResponse.json<APIResponse<Review>>({
            status: "success",
            message: "Successfully added the review for the Post",
            data: review
        })
    } catch (error) {
        if (error instanceof ReviewServiceError) {
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
                message: "Failed to add the review for the post"
            }, {
                status: status.INTERNAL_SERVER_ERROR
            })
        }
    }
}