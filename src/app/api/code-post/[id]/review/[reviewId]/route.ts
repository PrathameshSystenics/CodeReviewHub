import { getOptionalServerSession } from "@/auth";
import { reviewSchema } from "@/schemas";
import { acceptReviewForPost, deleteReviewForPost, ReviewServiceError, updateReviewForPost } from "@/services/review.service";
import { APIResponse } from "@/types";
import { Review } from "@generated/prisma/client";
import status from "http-status";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function DELETE(_request: NextRequest, ctx: RouteContext<'/api/code-post/[id]/review/[reviewId]'>) {
    try {
        const { reviewId } = await ctx.params

        const user = await getOptionalServerSession()
        const deletedReview = await deleteReviewForPost(reviewId, user!)

        return NextResponse.json<APIResponse<Review>>({
            message: "Deleted Review Successfully",
            status: "success",
            data: deletedReview
        }, { status: status.OK })
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
        }
        else {
            return NextResponse.json<APIResponse>({
                status: "error",
                message: "Failed to delete the review"
            }, {
                status: status.INTERNAL_SERVER_ERROR
            })
        }
    }
}

export async function PATCH(request: NextRequest, ctx: RouteContext<'/api/code-post/[id]/review/[reviewId]'>) {
    try {
        const { reviewId } = await ctx.params

        const updateBody = await request.json()
        const updateSchema = reviewSchema.parse(updateBody)

        const user = await getOptionalServerSession();
        const updatedReview = await updateReviewForPost(reviewId, updateSchema.content, user!)

        return NextResponse.json<APIResponse<Review>>({
            message: "Updated the Review successfully",
            status: "success",
            data: updatedReview
        }, {
            status: status.OK
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
                message: "Failed to update the review"
            }, {
                status: status.INTERNAL_SERVER_ERROR
            })
        }
    }
}

export async function POST(_request: NextRequest, ctx: RouteContext<'/api/code-post/[id]/review/[reviewId]'>) {
    try {
        const { reviewId } = await ctx.params

        const user = await getOptionalServerSession()
        const acceptedReview = await acceptReviewForPost(reviewId, user!)

        return NextResponse.json<APIResponse<Review>>({
            message: "Review Accepted Successfully",
            status: "success",
            data: acceptedReview
        }, { status: status.OK })
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
        }
        else {
            return NextResponse.json<APIResponse>({
                status: "error",
                message: "Failed to accept the review"
            }, {
                status: status.INTERNAL_SERVER_ERROR
            })
        }
    }
}
