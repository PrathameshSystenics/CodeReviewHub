import { Prisma } from "@generated/prisma/client";

export interface CommentCountOnPost {
    count: number;
    startlineno: number
}

export type CommentWithAuthorAndReplyCount = Omit<Prisma.CommentGetPayload<{
    include: {
        author: {
            select: {
                id: true;
                name: true;
                image: true;
            };
        };
        _count: {
            select: {
                replies: true;
            };
        };
    };
}>, "_count"> & {
    replyCount: number;
}