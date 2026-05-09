import { prisma } from "@/prisma";
import { CommentWithAuthor } from "@/types/comment";

export async function addComment(postid: string, startline: number, content: string, userid: string, endline?: number | null) {
    try {
        const comment = await prisma.comment.create({
            data: {
                content: content,
                authorId: userid,
                postId: postid,
                startlineno: startline,
                endlineno: endline
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

export async function getComments(postid: string, startlineno: number, parentcommentId?: string): Promise<CommentWithAuthor[]> {
    try {
        return await prisma.comment.findMany({
            orderBy: {
                createdAt: "desc"
            },
            where: {
                postId: postid,
                startlineno: startlineno,
                ...(parentcommentId !== undefined && {
                    parentId: parentcommentId,
                })
            },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        image: true
                    }
                }
            }
        })
    } catch (error) {
        console.error(error)
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