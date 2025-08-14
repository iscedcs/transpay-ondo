'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { getGroupById } from '@/actions/groups'
import { API, URLS } from '@/lib/const'

interface DeleteVehicleButtonProps {
  vehicle: any
}

export function DeleteVehicleButton({ vehicle }: DeleteVehicleButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleDeleteVehicle = async () => {
    setIsLoading(true)
    
    return new Promise(async (resolve, reject) => {
      try {
        const group = await getGroupById(vehicle.groupId)
        if (!group) {
          reject(new Error('Vehicle has no company or business or group does not exist'))
          return
        }
        
        const url = `${API}${URLS.group.all}/${group.id}`
        const newVehicleIds = Array.isArray(group.groupName)
          ? group.groupName.map((v: any) => v.id).filter((id: string) => id !== vehicle.id)
          : []

        const deleteResponse = await fetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vehicleIds: newVehicleIds
          }),
        })
        const result = await deleteResponse.json()

        if (result.status) {
          resolve(result)
          router.refresh()
        } else {
          reject(new Error(result.errors?.message || "An unknown error occurred"))
        }
      } catch (error) {
        reject(error)
      } finally {
        setIsLoading(false)
      }
    })
  }

  const handleDeleteWithToast = () => {
    toast.promise(handleDeleteVehicle(), {
      loading: 'Removing vehicle...',
      success: () => 'Vehicle removed from company successfully',
      error: (err) => err.message || 'An unknown error occurred',
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="w-full">
          <Trash2 className="h-4 w-4 mr-2" />
          Remove Vehicle
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently remove the vehicle
            from the company or business.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className='gap-3'>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteWithToast} disabled={isLoading}>
            {isLoading ? "Removing..." : "Remove Vehicle"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
