import { prisma } from "@/prisma";
import { Prisma } from "@generated/prisma/client";
import { CommentWithAuthorAndReplyCount } from "@/types/comment";

export async function addComment(postid: string, startline: number | null, content: string, userid: string, endline?: number | null, commentId?: string | null, reviewId?: string | null) {
    try {
        const comment = await prisma.comment.create({
            data: {
                content: content,
                authorId: userid,
                postId: postid,
                startlineno: startline,
                endlineno: endline,
                parentId: commentId,
                reviewId: reviewId
            }, select: {
                id: true
            }
        })
        return comment.id

    } catch (error) {
        console.error(error)
        throw error;
    }
}

export async function getComment(commentId: string) {
    try {
        return await prisma.comment.findFirst({
            where: {
                id: commentId
            }, include: {
                author: {
                    select: {
                        id: true,
                        email: true
                    }
                },
                post: {
                    select: {
                        status: true,
                        published: true,
                        requireComments: true,
                    }
                }
            }
        })
    } catch (error) {
        console.error(error)
        throw error
    }
}

export async function getComments(
    postid: string,
    startlineno: number | null,
    parentcommentId?: string,
    reviewId?: string
): Promise<CommentWithAuthorAndReplyCount[]> {
    try {
        const where: Prisma.CommentWhereInput = {
            postId: postid,
            startlineno,
        };

        if (parentcommentId) {
            where.parentId = parentcommentId;
        }

        if (reviewId) {
            where.reviewId = reviewId;
            where.parentId = null;
        }

        const comments = await prisma.comment.findMany({
            orderBy: {
                createdAt: "desc",
            },
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        replies: true,
                    },
                },
            },
        });

        return comments.map(({ _count, ...rest }) => ({
            ...rest,
            replyCount: _count.replies,
        }));
    } catch (error) {
        console.error(error);
        throw error;
    }
}

export async function getCommentCount(postid: string) {
    try {
        return await prisma.comment.groupBy({
            by: "startlineno",
            where: {
                postId: postid,
                parentId: null
            },
            orderBy: {
                startlineno: "asc"
            },
            _count: true,
        })
    } catch (error) {
        console.error(error)
        throw error;
    }
}

export async function deleteComment(commentId: string) {
    const deleted = await prisma.comment.delete({
        where: {
            id: commentId
        },
        select: {
            id: true
        }
    })
    return deleted.id
}

export async function updateComment(commentId: string, content: string) {
    const comment = await prisma.comment.update({
        where: {
            id: commentId
        }, data: {
            content: content
        }, select: {
            id: true,
            content: true
        }
    })
    return comment;
}