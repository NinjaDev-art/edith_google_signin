import UserController from "@/app/lib/userController";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { targetUserId, loggedInUserId, telegramId } = await req.json();
    const user = await UserController.followTarget({ targetUserId, loggedInUserId, telegramId });
    if (user.success) {
        return NextResponse.json({ message: "Followed successfully", success: true, activity: user.activity, user: user.user });
    } else {
        return NextResponse.json({ message: "Follow failed", success: false });
    }
}