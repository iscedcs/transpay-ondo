import { Button } from "@/components/ui/button";
import { UnblockRequestForm } from "@/components/unblock-request-form";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RequestUnblockPage() {
  return (
    <div className="bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link href="/blocked">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blocked Page
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Request Account Unblocking
          </h1>
          <p className="text-gray-600">
            Please provide the required information to request unblocking of
            your agent account.
          </p>
        </div>

        <UnblockRequestForm />
      </div>
    </div>
  );
}
