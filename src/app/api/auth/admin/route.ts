import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const { username, password } = await request.json();
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        return Response.json({ success: true });
    }
    return Response.json({ success: false });
}

