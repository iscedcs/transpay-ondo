"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Mail, Phone, Calendar, User, Edit, Save, X } from "lucide-react"
import type { SystemUser } from "@/types/users"
import type { UserPermissions } from "@/lib/user-permissions"

interface UserInfoCardProps {
  user: SystemUser
  permissions: UserPermissions
  onUpdate: (data: Partial<SystemUser>) => Promise<void>
}

export function UserInfoCard({ user, permissions, onUpdate }: UserInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onUpdate(editData)
      setIsEditing(false)
    } catch (error) {
      // TODO: Handle error (e.g., show toast or alert)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      name: user.name,
      email: user.email,
      phone: user.phone || "",
    })
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          {permissions.canEdit && !isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Full Name</Label>
          {isEditing ? (
            <Input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              placeholder="Enter full name"
            />
          ) : (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{user.name}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Email Address</Label>
          {isEditing ? (
            <Input
              type="email"
              value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              placeholder="Enter email address"
            />
          ) : (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{user.email}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Phone Number</Label>
          {isEditing ? (
            <Input
              value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              placeholder="Enter phone number"
            />
          ) : (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{user.phone || "Not provided"}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Account Created</Label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{user.createdAt.toLocaleDateString()}</span>
          </div>
        </div>

        {user.lastLogin && (
          <div className="space-y-2">
            <Label>Last Login</Label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{user.lastLogin.toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
