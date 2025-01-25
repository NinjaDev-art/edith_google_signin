import UserController from "@/app/lib/userController";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { user_id } = await req.json();
    const user = await UserController.getActivity(user_id);
    if (user.success) {
        return NextResponse.json({ activities: user.activities, success: true });
    } else {
        return NextResponse.json({ message: "User Not Found", success: false });
    }
}