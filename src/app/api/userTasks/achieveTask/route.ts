import { NextRequest } from "next/server";
import UserController from "@/app/lib/userController";

export async function POST(req: NextRequest) {
    const { taskId, telegramId } = await req.json();
    try {
        const result = await UserController.achieveTask(taskId, telegramId);
        return Response.json({ success: true, user: result.user });
    } catch (error) {
        return Response.json({ error: (error as Error).message });
    }
}