import { NextRequest } from "next/server";
import UserController from "@/app/lib/userController";

export async function POST(req: NextRequest) {
    const { user_id, refer_code } = await req.json();
    const user = await UserController.initiateOrFetchUser({ user_id, refer_code });
    if (user.success) {
        return Response.json(user);
    } else {
        return Response.json({ message: "User Not Found", success: false });
    }
}