// components/authenticated-scan-wrapper.tsx
"use client";

import AuthenticatedScanView from "@/components/authenticated-scan-view";

export function AuthenticatedScanWrapper({
  qrid,
  user,
}: {
  qrid: string;
  user: any;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <AuthenticatedScanView qrId={qrid} user={user} />
      </div>
    </div>
  );
}
