'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from 'sonner'
import { Plus, Loader2 } from 'lucide-react'
import { API, URLS } from '@/lib/const'
import { getGroups } from '@/actions/groups'

interface Group {
  id: string
  groupName: string
}

interface AddVehicleToGroupProps {
  vehicleId: string
}

export function AddVehicleToGroup({ vehicleId }: AddVehicleToGroupProps) {
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string|undefined>(undefined)
  const [newGroupName, setNewGroupName] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingNewGroup, setIsCreatingNewGroup] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const groups = await getGroups();

      if (groups && groups.length > 0) {
        setGroups(groups);
      } else {
        throw new Error("Failed to fetch groups");
      }
    } catch (error) {
      toast.error("Failed to load groups");
    }
  };

  const handleAddToGroup = async () => {
    setIsLoading(true);
    try {
      let groupId = selectedGroup;

      if (isCreatingNewGroup) {
        // Create new group
        const createGroupResponse = await fetch(`${API}${URLS.group.all}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            groupName: newGroupName,
            vehicleIds: [vehicleId],
          }),
        });
        const createGroupData = await createGroupResponse.json();
        if (!createGroupData.status) {
          throw new Error(
            createGroupData.message || "Failed to create new group"
          );
        }
        groupId = createGroupData.data.id;
      }

      // Add vehicle to group
      const addToGroupResponse = await fetch(
        `${API}${URLS.group.all}/${groupId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            vehicleIds: [vehicleId],
          }),
        }
      );
      const addToGroupData = await addToGroupResponse.json();
      if (!addToGroupData.status) {
        throw new Error(
          addToGroupData.message || "Failed to add vehicle to group"
        );
      }

      toast.success("Vehicle added to group successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error("Failed to add vehicle to group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add to Company/Business
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Vehicle to Company/Business</DialogTitle>
          <DialogDescription>
            Choose an existing company/business or create a new one to add this vehicle to.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isCreatingNewGroup ? (
            <div className="grid items-center gap-4">
              <Label htmlFor="new-group-name" className="text-left">
                New Company/Business Name
              </Label>
              <Input
                id="new-group-name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="col-span-3"
              />
            </div>
          ) : (
            <div className="grid items-center gap-4">
              <Label htmlFor="group" className="text-left">
                Company/Business
              </Label>
              <Select onValueChange={setSelectedGroup} value={selectedGroup}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.groupName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button
            variant="outline"
            onClick={() => setIsCreatingNewGroup(!isCreatingNewGroup)}
          >
            {isCreatingNewGroup ? 'Select Existing Company/Business' : 'Create New Company/Business'}
          </Button>
        </div>
        <DialogFooter>
          <Button onClick={handleAddToGroup} disabled={isLoading || (!selectedGroup && !newGroupName)}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            {isLoading ? 'Adding...' : 'Add to Company'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
