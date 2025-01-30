import { NextRequest } from "next/server";
import UserController from "@/app/lib/userController";

export async function POST(req: NextRequest) {
    const { task } = await req.json();
    try {
        const result = await UserController.saveTask(task);
        return Response.json({ tasks: result, success: true });
    } catch (error) {
        console.log(error);
        return Response.json({ tasks: [], success: false });
    }
}