"use client";

import FormError from "@/components/shared/FormError";
import { Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect } from "react";

export default function RoleGateClient({
  children,
  opts,
}: {
  children: React.ReactNode;
  opts: RoleGateOptions;
}) {
  const {
    allowedRole,
    rejectedRole,
    displayError = true,
    redirectToSignIn = false,
    errorMessage = "Access Denied",
  } = opts;

  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const role = session?.user?.role as Role | undefined;

  useEffect(() => {
    if (!isLoading && (!session || !session.user) && redirectToSignIn) {
      router.push("/api/auth/signin");
    }
  }, [isLoading, session, redirectToSignIn, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session || !session.user) {
    if (displayError) {
      return <FormError message={errorMessage} />;
    }
    return null;
  }

  if (!role) {
    if (displayError) {
      return <FormError message={errorMessage} />;
    }
    return null;
  }

  if (allowedRole && !allowedRole.includes(role)) {
    if (displayError) {
      return <FormError message={errorMessage} />;
    }
    return null;
  }

  if (rejectedRole && rejectedRole.includes(role)) {
    if (displayError) {
      return <FormError message={errorMessage} />;
    }
    return null;
  }

  return <>{children}</>;
}
