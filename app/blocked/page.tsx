"use client";

import { getMe, User } from "@/actions/users";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, Mail } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function BlockedPage() {
  const [user, setUser] = useState<User | undefined | null>(undefined);

  useEffect(() => {
    async function getUserClient() {
      const userClient = await getMe();
      setUser(userClient.user);
    }

    getUserClient();
  }, []);

  useEffect(() => {
    if (user?.status === "ACTIVE") {
      toast.info("You are no longer blocked");
      redirect("/dashboard");
    }
  }, [user]);

  return (
    <div className="bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">
            Account Blocked
          </CardTitle>
          <CardDescription className="text-gray-600">
            Your agent account has been temporarily blocked due to policy
            violations or suspicious activity.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">
              Why was my account blocked?
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• You scanned outside your jurisdiction</li>
              <li>• Suspicious account activity</li>
              <li>• Multiple failed authentication attempts</li>
              <li>• Reported inappropriate behavior</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link href="/request-unblock" className="w-full">
              <Button className="w-full" size="lg">
                <Mail className="mr-2 h-4 w-4" />
                Request Account Unblocking
              </Button>
            </Link>

            <p className="text-xs text-gray-500 text-center">
              Need immediate assistance?{" "}
              <Link href="/contact" className="text-blue-600 hover:underline">
                Contact Support
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
