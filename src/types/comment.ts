import { Prisma } from "@generated/prisma/client";

export interface CommentCountOnPost {
    count: number;
    startlineno: number
}

export type CommentWithAuthor = Prisma.CommentGetPayload<{
    include: {
        author: {
            select: {
                id: true;
                name: true;
                image: true;
            };
        };
    };
}>