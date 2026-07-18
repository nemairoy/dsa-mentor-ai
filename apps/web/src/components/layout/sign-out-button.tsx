"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function SignOutButton() {
  const router = useRouter();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={async () => {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => router.push("/sign-in"),
          },
        });
      }}
    >
      <LogOut aria-hidden="true" size={16} />
      Sign out
    </Button>
  );
}

