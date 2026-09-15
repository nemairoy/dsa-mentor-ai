"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { markSessionActivity } from "@/lib/session-activity";
import { cn } from "@/lib/utils";

type GoogleSignInButtonProps = {
  className?: string;
};

export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <Button
        type="button"
        className={cn("w-full", className)}
        disabled={isLoading}
        onClick={async () => {
          setIsLoading(true);
          setError(null);

          try {
            markSessionActivity();
            const result = await authClient.signIn.social({
              provider: "google",
              callbackURL: new URL("/dashboard", window.location.origin).toString(),
            });

            if (result.error) {
              setError(result.error.message ?? "Google sign in failed. Please check the OAuth configuration.");
              setIsLoading(false);
            }
          } catch {
            setError("Google sign in could not start. Check the production auth environment.");
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
