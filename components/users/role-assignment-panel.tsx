"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Shield, Edit, Save, X } from "lucide-react"
import type { SystemUser } from "@/types/users"
import type { UserPermissions } from "@/lib/user-permissions"

interface RoleAssignmentPanelProps {
  user: SystemUser
  permissions: UserPermissions
  onUpdate: (data: Partial<SystemUser>) => Promise<void>
}

export function RoleAssignmentPanel({ user, permissions, onUpdate }: RoleAssignmentPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    role: user.role,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onUpdate({ role: editData.role })
      setIsEditing(false)
    } catch (error) {
      // TODO: Handle error (e.g., show toast or alert)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData({ role: user.role })
    setIsEditing(false)
  }

  const getRoleDisplayName = (role: string) => {
    return role
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getRoleDescription = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Full system access across all states"
      case "admin":
        return "State-level management and oversight"
      case "lga_admin":
        return "Local Government Area administration"
      case "lga_agent":
        return "Field operations and vehicle registration"
      case "lga_compliance":
        return "Compliance monitoring and enforcement"
      case "vehicle_owner":
        return "Vehicle ownership and payment management"
      default:
        return "Standard user access"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Assignment
          </CardTitle>
          {permissions.canChangeRole && !isEditing && (
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
          <Label>Current Role</Label>
          {isEditing && permissions.canChangeRole ? (
            <Select value={editData.role} onValueChange={(value) => setEditData({ ...editData, role: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {permissions.editableRoles.map((role) => (
                  <SelectItem key={role} value={role}>
                    {getRoleDisplayName(role)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-3 bg-muted rounded-md">
              <div className="font-medium">{getRoleDisplayName(user.role)}</div>
              <div className="text-sm text-muted-foreground mt-1">{getRoleDescription(user.role)}</div>
              {!permissions.canChangeRole && (
                <div className="text-xs text-muted-foreground mt-2">
                  You don't have permission to change this user's role.
                </div>
              )}
            </div>
          )}
        </div>

        {permissions.canChangeRole && permissions.editableRoles.length > 0 && (
          <div className="space-y-2">
            <Label>Available Roles</Label>
            <div className="text-sm text-muted-foreground">You can assign the following roles to this user:</div>
            <div className="space-y-1">
              {permissions.editableRoles.map((role) => (
                <div key={role} className="text-sm">
                  <span className="font-medium">{getRoleDisplayName(role)}</span>
                  <span className="text-muted-foreground ml-2">- {getRoleDescription(role)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
