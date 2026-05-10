import z from "zod";

export const commentSchema = z.object({
    content: z.string("Content is required for adding the comment"),
    startline: z.number("Start Line is required for adding the comment on the line"),
    endline: z.number().nullable()
})

export const replySchema = z.object({
    content: z.string("Reply is required for adding the comment")
})

export type ReplyCommentInputs = z.infer<typeof replySchema>;
export type CommentInputs = z.infer<typeof commentSchema>;