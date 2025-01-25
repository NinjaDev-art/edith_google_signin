import UserController from "@/app/lib/userController";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { targetUserId, loggedInUserId } = await req.json();
    const user = await UserController.followTarget({ targetUserId, loggedInUserId });
    if (user.success) {
        return NextResponse.json({ message: "Followed successfully", success: true });
    } else {
        return NextResponse.json({ message: "Follow failed", success: false });
    }
}