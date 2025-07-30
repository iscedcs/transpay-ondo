"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ReactNode, useEffect } from "react";
import { toast } from "sonner";

const POLL_INTERVAL = 30000; // 30 seconds

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("You need to sign in to access this page.");
      router.replace("/sign-in");
      return;
    }

    if (status === "authenticated") {
      const expiresAt = new Date(
        Number(session?.user.expires) * 1000
      ).getTime();

      const now = Date.now();
      if (now > expiresAt) {
        toast.error("Session expired, please sign in again.");
        router.replace("/sign-in");
      }
    }

    const interval = setInterval(() => {
      update(); // manually refresh session
    }, POLL_INTERVAL);

    return () => clearInterval(interval);
  }, [status, session, update, router]);

  //   if (status === "loading") return <div>Loading...</div>;

  return <>{children}</>;
}
