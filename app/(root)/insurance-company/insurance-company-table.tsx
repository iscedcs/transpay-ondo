import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MoreHorizontal, Eye, CheckCircle, XCircle, Clock, FileText, DollarSign, Currency } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { InsuranceClaim } from "../insurance/types"

interface InsuranceCompanyTableProps {
  claims: InsuranceClaim[]
}

export function InsuranceCompanyTable({ claims }: InsuranceCompanyTableProps) {
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "default"
      case "PAID":
        return "default"
      case "PENDING":
        return "secondary"
      case "UNDER_REVIEW":
        return "secondary"
      case "REJECTED":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getClaimTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "FIRE":
        return "destructive"
      case "THEFT":
        return "secondary"
      case "ACCIDENT":
        return "default"
      case "OTHER":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "UNDER_REVIEW":
        return <Eye className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (claims.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold">No claims found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {claims.map((claim) => (
        <Card key={claim.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm font-medium bg-primary/10">
                    {claim.plateNumber.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {claim.claimNumber}
                    {getStatusIcon(claim.status)}
                  </CardTitle>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant={getClaimTypeBadgeVariant(claim.claimType)}>{claim.claimType}</Badge>
                    <Badge variant={getStatusBadgeVariant(claim.status)}>{claim.status}</Badge>
                    <span className="text-sm text-muted-foreground">{claim.plateNumber}</span>
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {claim.status === "PENDING" && (
                    <>
                      <DropdownMenuItem>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Claim
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Claim
                      </DropdownMenuItem>
                    </>
                  )}
                  {claim.status === "APPROVED" && (
                    <DropdownMenuItem>
                      <Currency className="h-4 w-4 mr-2" />
                      Mark as Paid
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <FileText className="h-4 w-4 mr-2" />
                    View Documents
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Description:</span>
                </div>
                <p className="text-sm pl-6">{claim.description}</p>

                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Incident Date:</span>
                  <span>{formatDate(claim.incidentDate)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Reported:</span>
                  <span>{formatDate(claim.reportedDate)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Currency className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Claim Amount:</span>
                  <span className="font-medium">{formatCurrency(claim.claimAmount)}</span>
                </div>

                {claim.approvedAmount && (
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Approved Amount:</span>
                    <span className="font-medium text-green-600">{formatCurrency(claim.approvedAmount)}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Documents:</span>
                  <span>{claim.documents.length} file(s)</span>
                </div>

                {claim.notes && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Notes: </span>
                    <span className="italic">{claim.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {(claim.status === "PENDING" || claim.status === "UNDER_REVIEW") && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button size="sm" variant="destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Review
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
