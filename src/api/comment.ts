import { CommentInputs } from "@/schemas/comment";
import { APIResponse } from "@/types";
import { CommentCountOnPost, CommentWithAuthor } from "@/types/comment";

export async function addCommentOnPostApi(postid: string, commentbody: CommentInputs): Promise<APIResponse<string>> {
    const response = await fetch(`/api/code-post/${postid}/comment`, {
        body: JSON.stringify(commentbody),
        method: "POST"
    })
    return response.json()
}

export async function getCommentsOnPostApi(postid: string, startlineno: number): Promise<APIResponse<CommentWithAuthor[] | null>> {
    const response = await fetch(`/api/code-post/${postid}/comment?startlineno=${startlineno}`, {
        method: "GET"
    })
    return response.json()
}

export async function getCommentCountOnPostApi(postid: string): Promise<APIResponse<CommentCountOnPost[] | null>> {
    const response = await fetch(`/api/code-post/${postid}/comment/count`, {
        method: "GET"
    })
    return response.json()
}

// export async function deleteCommentApi(postid: string, commentId: string): Promise<APIResponse<string>> {
//     const response = await fetch(`/api/code-post/${postid}/comment/${commentId}`, {
//         method: "DELETE"
//     })
//     return response.json()
// }

// export async function editCommentApi(postid: string, commentId: string, content: string): Promise<APIResponse<string>> {
//     const response = await fetch(`/api/code-post/${postid}/comment/${commentId}`, {
//         body: JSON.stringify({ content }),
//         method: "PATCH"
//     })
//     return response.json()
// }