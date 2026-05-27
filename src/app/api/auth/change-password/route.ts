import { getOptionalServerSession } from "@/auth";
import { changePasswordSchema } from "@/schemas/password";
import {
  changePassword,
  PasswordServiceError,
} from "@/services/password.service";
import { APIResponse } from "@/types";
import status from "http-status";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const session = await getOptionalServerSession();

    if (!session?.user?.id) {
      return NextResponse.json<APIResponse>(
        { status: "invalid", message: "Unauthorized" },
        { status: status.UNAUTHORIZED },
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    await changePassword(session.user.id, currentPassword, newPassword);

    return NextResponse.json<APIResponse>(
      { status: "success", message: "Password changed successfully" },
      { status: status.OK },
    );
  } catch (error) {
    if (error instanceof PasswordServiceError) {
      return NextResponse.json<APIResponse>(
        { status: "invalid", message: error.message },
        { status: error.statusCode },
      );
    } else if (error instanceof ZodError) {
      return NextResponse.json<APIResponse>(
        {
          status: "invalid",
          message: error.issues.at(0)?.message ?? "Invalid input",
        },
        { status: status.UNPROCESSABLE_ENTITY },
      );
    }
    return NextResponse.json<APIResponse>(
      { status: "error", message: "Internal Server Error" },
      { status: status.INTERNAL_SERVER_ERROR },
    );
  }
}
