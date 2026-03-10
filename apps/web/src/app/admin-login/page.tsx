import { redirect } from "next/navigation";
import { getServerUser, isAdminUser } from "@/lib/auth/server-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginRedirectPage() {
  const user = await getServerUser();

  if (user && isAdminUser(user)) {
    redirect("/admin/mobile");
  }

  redirect("/account/login?redirect=/admin/mobile&source=pwa");
}
