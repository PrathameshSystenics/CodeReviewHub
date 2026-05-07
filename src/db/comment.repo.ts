import { prisma } from "@/prisma";

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

export async function getComments(postid: string, parentcommentId?: string) {
    try {
        return await prisma.comment.findMany({
            where: {
                postId: postid,
                ...(parentcommentId !== undefined && {
                    parentId: parentcommentId,
                })
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