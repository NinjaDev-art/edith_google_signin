import UserController from "@/app/lib/userController";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const { user_id } = await req.json();
    const user = await UserController.getActivity(user_id);
    if (user.success) {
        return Response.json({ activities: user.activities, user: user.user, success: true });
    } else {
        return Response.json({ message: "User Not Found", success: false });
    }
}