"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        className="w-full"
        disabled={isLoading}
        onClick={async () => {
          setIsLoading(true);
          setError(null);

          const result = await authClient.signIn.social({
            provider: "google",
            callbackURL: "/dashboard",
          });

          if (result.error) {
            setError(result.error.message ?? "Google sign in failed");
            setIsLoading(false);
          }
        }}
      >
        <LogIn aria-hidden={true} size={18} />
        {isLoading ? "Opening Google..." : "Continue with Google"}
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
