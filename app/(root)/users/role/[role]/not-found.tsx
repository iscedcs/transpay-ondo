import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserX, ArrowLeft } from "lucide-react"

export default function UserNotFound() {
  return (
    <div className="container mx-auto py-16">
      <Card className="max-w-md mx-auto text-center">
        <CardHeader>
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <UserX className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">User Not Found</CardTitle>
          <CardDescription>The user you're looking for doesn't exist or may have been deleted.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">This could happen if:</p>
          <ul className="text-sm text-muted-foreground text-left space-y-1">
            <li>• The user ID is incorrect</li>
            <li>• The user has been deleted</li>
            <li>• You don't have permission to view this user</li>
          </ul>
          <div className="flex gap-2 justify-center pt-4">
            <Link href="/users">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Users
              </Button>
            </Link>
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
