import UserController from "@/app/lib/userController";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { twitterId, telegramId } = await req.json();
    const user = await UserController.registerTwitterId({ twitterId, telegramId });
    if (user.success) {
        return NextResponse.json({ message: "Followed successfully", success: true, user: user.user });
    } else {
        return NextResponse.json({ message: user.error ?? "Register failed", success: false });
    }
}