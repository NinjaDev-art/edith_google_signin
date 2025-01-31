import UserController from "@/app/lib/userController";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { targetUserId, loggedInUserId, telegramId, taskId } = await req.json();
    console.log(">>targetUserId", targetUserId, "::: loggedInUserId", loggedInUserId, "::: telegramId", telegramId);
    const user = await UserController.followTarget({ targetUserId, loggedInUserId, telegramId, taskId });
    if (user.success) {
        return NextResponse.json({ message: "Followed successfully", success: true, activity: user.activity, user: user.user, level: user.level });
    } else {
        return NextResponse.json({ message: "Follow failed", success: false });
    }
}