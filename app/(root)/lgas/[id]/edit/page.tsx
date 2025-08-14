import { getLGAById } from "@/actions/lga";
import { auth } from "@/auth";
import { LGAEditForm } from "@/components/lga-edit-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SUPER_ADMIN_ROLES } from "@/lib/const";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";

interface LGAEditPageProps {
  params: Promise<{ id: string }>;
}

async function LGAEditContent({ id }: { id: string }) {
  try {
    const lga = await getLGAById(id);

    return (
      <div className="px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Edit LGA</h1>
            <p className="text-muted-foreground">
              Update the details for {lga.name}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>LGA Information</CardTitle>
            <CardDescription>
              Update the name, fees, and boundary coordinates for this LGA.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LGAEditForm lga={lga} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    notFound();
  }
}

function LGAEditSkeleton() {
  return (
    <div className="px-4 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-4">
            <Skeleton className="h-6 w-24" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="grid grid-cols-2 gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full" />
          </div>

          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function LGAEditPage({ params }: LGAEditPageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/sign-in");
  }
  if (!SUPER_ADMIN_ROLES.includes(session?.user.role)) {
    redirect("/unauthorized");
  }
  const id = (await params).id;
  return (
    <Suspense fallback={<LGAEditSkeleton />}>
      <LGAEditContent id={id} />
    </Suspense>
  );
}
