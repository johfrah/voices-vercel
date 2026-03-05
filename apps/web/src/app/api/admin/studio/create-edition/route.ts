import { NextResponse } from "next/server";
import { StudioDataBridge } from "@/lib/bridges/studio-bridge";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";

export async function POST(req: Request) {
  const user = await getServerUser();
  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const payload = { ...data } as Record<string, any>;

  if (typeof payload.date === 'string' || typeof payload.date === 'number') {
    const parsed = new Date(payload.date);
    if (Number.isNaN(parsed.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }
    payload.date = parsed;
  }

  if (payload.endDate !== undefined && payload.endDate !== null) {
    const parsedEnd = new Date(payload.endDate);
    if (Number.isNaN(parsedEnd.getTime())) {
      return NextResponse.json({ error: 'Invalid endDate' }, { status: 400 });
    }
    payload.endDate = parsedEnd;
  }

  try {
    const newEdition = await StudioDataBridge.createEdition(payload);
    return NextResponse.json({ success: true, id: newEdition.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
