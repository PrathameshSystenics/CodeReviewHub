import z from "zod";

export const reviewSchema = z.object({
    content: z.string("Body is required for adding the Review")
})

export type ReviewInput = z.infer<typeof reviewSchema>;