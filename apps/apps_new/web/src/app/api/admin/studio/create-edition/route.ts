import { NextResponse } from "next/server";
import { StudioDataBridge } from "@/lib/bridges/studio-bridge";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  try {
    const newEdition = await StudioDataBridge.createEdition(data);
    return NextResponse.json({ success: true, id: newEdition.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
