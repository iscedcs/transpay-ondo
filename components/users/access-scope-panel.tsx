"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { MapPin, Edit, Save, X } from "lucide-react"
import { STATE_CONFIG } from "@/lib/constants"
import type { SystemUser } from "@/types/users"
import type { UserPermissions } from "@/lib/user-permissions"

interface AccessScopePanelProps {
  user: SystemUser
  permissions: UserPermissions
  onUpdate: (data: Partial<SystemUser>) => Promise<void>
}

export function AccessScopePanel({ user, permissions, onUpdate }: AccessScopePanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    stateId: user.stateId || "",
    lgaId: user.lgaId || "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const canEdit = permissions.canChangeLGA || permissions.canChangeState

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await onUpdate({
        stateId: editData.stateId,
        lgaId: editData.lgaId,
        stateName: STATE_CONFIG.name,
        lgaName: STATE_CONFIG.lgas.find((lga) => lga.id === editData.lgaId)?.name,
      })
      setIsEditing(false)
    } catch (error) {
      // TODO: Handle error (e.g., show toast or alert)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditData({
      stateId: user.stateId || "",
      lgaId: user.lgaId || "",
    })
    setIsEditing(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Access Scope
          </CardTitle>
          {canEdit && !isEditing && (
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
          <Label>State Assignment</Label>
          {isEditing && permissions.canChangeState ? (
            <Select value={editData.stateId} onValueChange={(value) => setEditData({ ...editData, stateId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{STATE_CONFIG.name}</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="p-2 bg-muted rounded-md">
              <span>{user.stateName || "No state assigned"}</span>
              {!permissions.canChangeState && <span className="text-xs text-muted-foreground ml-2">(Read-only)</span>}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>LGA Assignment</Label>
          {isEditing && permissions.canChangeLGA ? (
            <Select value={editData.lgaId} onValueChange={(value) => setEditData({ ...editData, lgaId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select LGA" />
              </SelectTrigger>
              <SelectContent>
                {STATE_CONFIG.lgas.map((lga) => (
                  <SelectItem key={lga.id} value={lga.id}>
                    {lga.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="p-2 bg-muted rounded-md">
              <span>{user.lgaName || "No LGA assigned"}</span>
              {!permissions.canChangeLGA && <span className="text-xs text-muted-foreground ml-2">(Read-only)</span>}
            </div>
          )}
        </div>

        {!canEdit && (
          <div className="text-xs text-muted-foreground">
            You don't have permission to modify this user's access scope.
          </div>
        )}
      </CardContent>
    </Card>
  )
}
