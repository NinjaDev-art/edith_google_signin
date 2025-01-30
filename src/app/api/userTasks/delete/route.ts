import { NextRequest } from "next/server";
import UserController from "@/app/lib/userController";

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();
    try {
        const result = await UserController.deleteTask(id);
        return Response.json({ tasks: result, success: true });
    } catch (error) {
        console.log(error);
        return Response.json({ tasks: [], success: false });
    }
}
