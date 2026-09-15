import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/session";

export default async function SignInPage() {
  redirect((await getCurrentSession()) ? "/dashboard" : "/");
}
