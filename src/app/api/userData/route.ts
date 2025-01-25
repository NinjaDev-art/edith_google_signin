import { NextRequest, NextResponse } from "next/server";
import UserController from "@/app/lib/userController";

export async function POST(req: NextRequest) {
    const { user_id, refer_code } = await req.json();
    const user = await UserController.initiateOrFetchUser({ user_id, refer_code });
    if (user.success) {
        return NextResponse.json(user);
    } else {
        return NextResponse.json({ message: "User Not Found", success: false });
    }
}