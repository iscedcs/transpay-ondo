import { getUserById } from "@/actions/users";
import { auth } from "@/auth";
import { UserDetailContent } from "@/components/user-detail-content";
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

interface UserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: UserPageProps): Promise<Metadata> {
  try {
    const result = await getUserById((await params).id);

    if (!result) {
      return {
        title: "User Not Found",
        description: "The requested user could not be found.",
      };
    }

    const user = result;
    const fullName = `${user.firstName} ${user.lastName}`;

    return {
      title: `${fullName} - User Profile`,
      description: `View profile and details for ${fullName} (${
        user.email
      }). Role: ${user.role.replace("_", " ")}`,
      openGraph: {
        title: `${fullName} - User Profile`,
        description: `User profile for ${fullName}`,
        type: "profile",
      },
      twitter: {
        card: "summary",
        title: `${fullName} - User Profile`,
        description: `User profile for ${fullName}`,
      },
    };
  } catch (error) {
    return {
      title: "User Profile",
      description: "View user profile and details",
    };
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const session = await auth();
  const result = await getUserById((await params).id);

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!result) notFound();

  return <UserDetailContent sessionUser={session?.user} user={result} />;
}
