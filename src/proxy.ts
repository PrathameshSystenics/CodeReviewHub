import { NextRequest, NextResponse, ProxyConfig } from "next/server";
import { getOptionalServerSession } from "./auth";
import { APIResponse } from "./types";
import status from "http-status";

export default async function proxy(request: NextRequest) {
    const user = await getOptionalServerSession();

    if (request.nextUrl.pathname.includes('api') && !user) {
        return NextResponse.json<APIResponse<string>>(
            {
                message: "User not Found",
                status: "invalid",
            },
            {
                status: status.UNAUTHORIZED,
            },
        );
    }
    if (!user) {
        return NextResponse.redirect(new URL("/", request.url))
    }
}

export const config: ProxyConfig = {
    matcher: [
        '/profile/:path*',
        '/post/:path*',
        '/api/code-post',
        '/api/code-post/:path*',
    ]
}