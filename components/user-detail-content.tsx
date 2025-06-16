"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  User,
  FileText,
  Users,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { User as UserType } from "@/actions/users";
import {
  cn,
  formatAddress,
  formatDate,
  formatRoleName,
  parseAddress,
} from "@/lib/utils";
import Link from "next/link";

interface UserDetailContentProps {
  user: UserType;
}

export function UserDetailContent({ user }: UserDetailContentProps) {
  const router = useRouter();
  const [showSensitiveInfo, setShowSensitiveInfo] = useState(false);

  // Get user initials
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get user status
  const getUserStatus = (user: UserType) => {
    if (user.deletedAt)
      return {
        label: "Deleted",
        variant: "destructive" as const,
        color: "text-red-600",
      };
    if (user.blacklisted)
      return {
        label: "Blacklisted",
        variant: "destructive" as const,
        color: "text-red-600",
      };
    return {
      label: "Active",
      variant: "default" as const,
      color: "text-green-600",
    };
  };

  const status = getUserStatus(user);
  const address = parseAddress(user.address as any);

  return (
    <div className="mx-auto p-5 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-muted-foreground">User Profile & Information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/users/${user.id}/edit`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "flex items-center gap-2"
            )}
          >
            <Edit className="h-4 w-4" />
            Edit User
          </Link>
          <Button variant="destructive" className="flex items-center gap-2">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Profile Card */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage
                    src={`https://avatar.iran.liara.run/public/job/doctor/${
                      user?.gender?.toLowerCase() || "male"
                    }`}
                    alt={`${user.firstName} ${user.lastName}`}
                  />
                  <AvatarFallback className="text-lg">
                    {getUserInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>

                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold">
                    {user.firstName} {user.lastName}
                  </h2>
                  <Badge variant={"outline"} className="text-sm">
                    {formatRoleName(user.role)}
                  </Badge>
                  <Badge variant={status.variant} className="text-sm">
                    {status.label}
                  </Badge>
                </div>

                <Separator />

                {/* Quick Contact Info */}
                <div className="w-full space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                  {address && (
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-xs leading-relaxed">
                        {formatAddress(user.address as any) ||
                          "No address provided"}
                      </span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Account Dates */}
                <div className="w-full space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center justify-between">
                    <span>Created:</span>
                    <span>{formatDate(String(user.createdAt))}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Updated:</span>
                    <span>{formatDate(String(user.updatedAt))}</span>
                  </div>
                  {user.deletedAt && (
                    <div className="flex items-center justify-between text-red-600">
                      <span>Deleted:</span>
                      <span>{formatDate(String(user.deletedAt))}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push(`/users/${user.id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                {user.blacklisted ? "Unblacklist User" : "Blacklist User"}
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                View Activity Log
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Detailed Information */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="personal" className="space-y-6">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Basic personal details and identification
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        First Name
                      </Label>
                      <p className="text-sm">{user.firstName}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Last Name
                      </Label>
                      <p className="text-sm">{user.lastName}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Gender
                      </Label>
                      <p className="text-sm">
                        {user.gender || "Not specified"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Marital Status
                      </Label>
                      <p className="text-sm">
                        {user.marital_status || "Not specified"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Maiden Name
                      </Label>
                      <p className="text-sm">
                        {user.maiden_name || "Not specified"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        User ID
                      </Label>
                      <p className="text-xs font-mono bg-muted px-2 py-1 rounded">
                        {user.id}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Identification Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Identification
                  </CardTitle>
                  <CardDescription>
                    Identity verification and documentation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Identification Type
                      </Label>
                      <p className="text-sm">
                        {(user.identification as any) || "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Identification Number
                      </Label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-mono">
                          {showSensitiveInfo
                            ? (user.identification
                                ? JSON.parse(user.identification).value
                                : null) || "Not provided"
                            : "Hidden for security"}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowSensitiveInfo(!showSensitiveInfo)
                          }
                          className="h-6 w-6 p-0"
                        >
                          {showSensitiveInfo ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Contact Information
                  </CardTitle>
                  <CardDescription>
                    Phone numbers and communication details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Email Address
                      </Label>
                      <p className="text-sm">{user.email}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Phone Number
                      </Label>
                      <p className="text-sm">{user.phone}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        WhatsApp Number
                      </Label>
                      <p className="text-sm">
                        {user.whatsapp || "Not provided"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Address Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Address Information
                  </CardTitle>
                  <CardDescription>
                    Residential and location details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {address ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Street Address
                        </Label>
                        <p className="text-sm">
                          {address.text || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Unit/Apartment
                        </Label>
                        <p className="text-sm">
                          {address.unit || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-muted-foreground">
                          City
                        </Label>
                        <p className="text-sm">
                          {address.city || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-muted-foreground">
                          State
                        </Label>
                        <p className="text-sm">
                          {address.state || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Postal Code
                        </Label>
                        <p className="text-sm">
                          {address.postal_code}; || {"Not provided"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Country
                        </Label>
                        <p className="text-sm">
                          {address.country || "Not provided"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-muted-foreground">
                          LGA
                        </Label>
                        <p className="text-sm">
                          {address.lga || "Not assigned"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <Label className="text-sm font-medium text-muted-foreground">
                          LGA Assignment
                        </Label>
                        <p className="text-sm">
                          {user.lga ? user.lga.name : "Not assigned"}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No address information provided
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Next of Kin Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Next of Kin
                  </CardTitle>
                  <CardDescription>
                    Emergency contact information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Name
                      </Label>
                      <p className="text-sm">
                        {user.nok_name || "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Phone Number
                      </Label>
                      <p className="text-sm">
                        {user.nok_phone || "Not provided"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Relationship
                      </Label>
                      <p className="text-sm">
                        {user.nok_relationship || "Not provided"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Account Security
                  </CardTitle>
                  <CardDescription>
                    Security settings and account status
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Account Status
                      </Label>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Role
                      </Label>
                      <Badge variant={"outline"}>
                        {formatRoleName(user.role)}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Blacklisted
                      </Label>
                      <Badge
                        variant={user.blacklisted ? "destructive" : "default"}
                      >
                        {user.blacklisted ? "Yes" : "No"}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Last Login
                      </Label>
                      <p className="text-sm">
                        {user.lastLogin
                          ? formatDate(String(user.lastLogin))
                          : "Never"}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Created By
                      </Label>
                      <p className="text-sm">{user.createdBy || "System"}</p>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">
                        LGA Assignment
                      </Label>
                      <div className="flex flex-col gap-1">
                        <p className="text-sm">
                          {user.lga ? user.lga.name : "Not assigned"}
                        </p>
                        {user.lga && (
                          <p className="text-xs text-muted-foreground font-mono">
                            ID: {user.lga.id}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Security Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Actions</CardTitle>
                  <CardDescription>
                    Manage user security and access
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" size="sm">
                      Reset Password
                    </Button>
                    <Button variant="outline" size="sm">
                      {user.blacklisted ? "Remove Blacklist" : "Blacklist User"}
                    </Button>
                    <Button variant="outline" size="sm">
                      Force Logout
                    </Button>
                    <Button variant="outline" size="sm">
                      Change Role
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Account Activity
                  </CardTitle>
                  <CardDescription>
                    Recent activity and audit trail
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Account Created</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(String(user.createdAt))}
                        </p>
                      </div>
                      <Badge variant="outline">System</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Profile Updated</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(String(user.updatedAt))}
                        </p>
                      </div>
                      <Badge variant="outline">User</Badge>
                    </div>

                    {user.lastLogin && (
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Last Login</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(String(user.lastLogin))}
                          </p>
                        </div>
                        <Badge variant="outline">Login</Badge>
                      </div>
                    )}

                    {user.deletedAt && (
                      <div className="flex items-center justify-between p-3 border rounded-lg border-red-200">
                        <div>
                          <p className="text-sm font-medium text-red-600">
                            Account Deleted
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(String(user.deletedAt))}
                          </p>
                        </div>
                        <Badge variant="destructive">Deleted</Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function Label({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <label className={className}>{children}</label>;
}
