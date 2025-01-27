import UserController from "@/app/lib/userController";

export async function GET() {
    const tasks = await UserController.getTasks();
    return Response.json({ tasks: tasks });
}

