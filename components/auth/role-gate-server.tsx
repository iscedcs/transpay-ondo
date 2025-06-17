import FormError from "@/components/shared/FormError";
import { redirect } from "next/navigation";
import type React from "react";
import { auth } from "@/auth";
import { Role } from "@prisma/client";

export const revalidate = 0;

export default async function RoleGateServer({
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

  const session = await auth();

  if (!session || !session.user) {
    if (redirectToSignIn) {
      redirect("/signin");
    }

    if (displayError) {
      return <FormError message={errorMessage} />;
    }

    return null;
  }

  const role = session?.user.role as Role;

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
