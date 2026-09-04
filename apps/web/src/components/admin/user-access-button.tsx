"use client";

import { useState } from "react";

type UserAccessButtonProps = {
  blocked: boolean;
  userId: string;
  userName: string;
};

export function UserAccessButton({ blocked, userId, userName }: UserAccessButtonProps) {
  const [pending, setPending] = useState(false);
  const action = blocked ? "unblock" : "block";

  return (
    <form
      action={`/api/owner-admin/users/${encodeURIComponent(userId)}`}
      method="post"
      onSubmit={(event) => {
        if (!window.confirm(`Are you sure you want to ${action} ${userName}?`)) {
          event.preventDefault();
          return;
        }
        setPending(true);
      }}
    >
      <input type="hidden" name="blocked" value={blocked ? "false" : "true"} />
      <button
        type="submit"
        disabled={pending}
        className={`h-8 rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
          blocked
            ? "border-emerald-500/40 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-300"
            : "border-red-500/40 text-red-700 hover:bg-red-500/10 dark:text-red-300"
        }`}
      >
        {pending ? "Saving…" : blocked ? "Unblock" : "Block"}
      </button>
    </form>
  );
}
