"use client";

import type React from "react";

import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Search,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { SearchVehicles } from "@/components/search-vehicles";
import { type Vehicle } from "@/actions/vehicles";
import {
  generateFundingVirtualAccount,
  confirmFundingPayment,
  type FundingSession,
  type VirtualAccountDetails,
} from "@/actions/funding";
import { formatCurrencyFull } from "@/lib/utils";

interface FundingStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: FundingStep[] = [
  {
    id: 1,
    title: "Search Vehicle",
    description: "Find the vehicle you want to fund",
    icon: <Search className="h-5 w-5" />,
  },
  {
    id: 2,
    title: "Confirm Details",
    description: "Verify vehicle information and enter amount",
    icon: <CheckCircle className="h-5 w-5" />,
  },
  {
    id: 3,
    title: "Generate Account",
    description: "Create temporary virtual account for payment",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: 4,
    title: "Make Payment",
    description: "Transfer funds and confirm payment",
    icon: <Wallet className="h-5 w-5" />,
  },
];

export function FundVehicleFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [fundingAmount, setFundingAmount] = useState("");
  const [fundingSession, setFundingSession] = useState<FundingSession | null>(
    null
  );
  const [virtualAccount, setVirtualAccount] =
    useState<VirtualAccountDetails | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Countdown timer effect
  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            toast.error(
              "Virtual account has expired. Please generate a new one."
            );
            setVirtualAccount(null);
            setCurrentStep(2);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining]);

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setCurrentStep(2);
    toast.success(`Selected vehicle: ${vehicle.plateNumber}`);
  };

  const handleConfirmDetails = async () => {
    if (
      !selectedVehicle ||
      !fundingAmount ||
      Number.parseFloat(fundingAmount) <= 0
    ) {
      toast.error("Please enter a valid funding amount");
      return;
    }

    setIsProcessing(true);
    try {
      // Generate virtual account for funding
      const account = await generateFundingVirtualAccount({
        vehicleId: selectedVehicle.id,
        amount: Number.parseFloat(fundingAmount),
        purpose: "WALLET_FUNDING",
      });

      setVirtualAccount(account.virtualAccount);
      setFundingSession(account.session);
      setTimeRemaining(account.expiryInSeconds);
      setCurrentStep(3);
      toast.success("Virtual account generated successfully!");
    } catch (error) {
      toast.error("Failed to generate virtual account. Please try again.");
      console.error("Virtual account generation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePaymentConfirmation = async () => {
    if (!fundingSession) {
      toast.error("No active funding session found");
      return;
    }

    setIsProcessing(true);
    try {
      const result = await confirmFundingPayment({
        sessionId: fundingSession.id,
        confirmedByUser: true,
      });

      if (result.success) {
        setPaymentConfirmed(true);
        setCurrentStep(4);
        toast.success("Payment confirmed successfully!");
      } else {
        toast.error(result.message || "Payment confirmation failed");
      }
    } catch (error) {
      toast.error("Failed to confirm payment. Please try again.");
      console.error("Payment confirmation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const resetFlow = () => {
    setCurrentStep(1);
    setSelectedVehicle(null);
    setFundingAmount("");
    setFundingSession(null);
    setVirtualAccount(null);
    setTimeRemaining(0);
    setPaymentConfirmed(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStep) return "completed";
    if (stepId === currentStep) return "current";
    return "upcoming";
  };

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Progress</CardTitle>
          <CardDescription>
            Follow these steps to fund your vehicle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      getStepStatus(step.id) === "completed"
                        ? "bg-primary border-primary text-primary-foreground"
                        : getStepStatus(step.id) === "current"
                        ? "border-primary text-primary"
                        : "border-muted-foreground text-muted-foreground"
                    }`}
                  >
                    {getStepStatus(step.id) === "completed" ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className="text-sm font-medium">{step.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      getStepStatus(step.id) === "completed"
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search for Vehicle
            </CardTitle>
            <CardDescription>
              Enter the vehicle's plate number, VIN, or owner information to
              find the vehicle you want to fund
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SearchVehicles
              enableAdvancedSearch={true}
              onVehicleSelect={handleVehicleSelect}
              maxResults={10}
              showResultsCount={true}
            />
          </CardContent>
        </Card>
      )}

      {currentStep === 2 && selectedVehicle && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Confirm Vehicle Details
            </CardTitle>
            <CardDescription>
              Verify the vehicle information and enter the amount you want to
              fund
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Vehicle Details */}
            <div className="flex items-start gap-4 p-4 border rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage
                  src={selectedVehicle.image || undefined}
                  alt={selectedVehicle.plateNumber}
                />
                <AvatarFallback>
                  <Search className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-xl font-semibold">
                    {selectedVehicle.plateNumber}
                  </h3>
                  <Badge
                    variant={
                      selectedVehicle.blacklisted ? "destructive" : "default"
                    }
                  >
                    {selectedVehicle.blacklisted
                      ? "Blacklisted"
                      : selectedVehicle.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Category</p>
                    <p className="font-medium">{selectedVehicle.category}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Color</p>
                    <p className="font-medium">{selectedVehicle.color}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Owner</p>
                    <p className="font-medium">
                      {selectedVehicle.owner?.firstName}{" "}
                      {selectedVehicle.owner?.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">LGA</p>
                    <p className="font-medium">
                      {selectedVehicle.registeredLga?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Wallet Balance */}
            {selectedVehicle.wallet && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Current Wallet Balance</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Available Balance</p>
                    <p className="text-lg font-semibold text-green-600">
                      {formatCurrencyFull(selectedVehicle.wallet.walletBalance)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Amount Owed</p>
                    <p className="text-lg font-semibold text-red-600">
                      {formatCurrencyFull(selectedVehicle.wallet.amountOwed)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Funding Amount */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="amount">Funding Amount (₦)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount to fund"
                  value={fundingAmount}
                  onChange={(e) => setFundingAmount(e.target.value)}
                  min="100"
                  step="100"
                  className="text-lg"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Minimum funding amount is ₦100
                </p>
              </div>

              {fundingAmount && Number.parseFloat(fundingAmount) > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900">Funding Summary</h4>
                  <div className="mt-2 space-y-1 text-sm text-blue-800">
                    <div className="flex justify-between">
                      <span>Amount to fund:</span>
                      <span className="font-medium">
                        {formatCurrencyFull(fundingAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Transaction fee:</span>
                      <span className="font-medium">₦0.00</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between font-semibold">
                      <span>Total to pay:</span>
                      <span>{formatCurrencyFull(fundingAmount)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Search
              </Button>
              <Button
                onClick={handleConfirmDetails}
                disabled={
                  !fundingAmount ||
                  Number.parseFloat(fundingAmount) <= 0 ||
                  isProcessing
                }
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Generating Account...
                  </>
                ) : (
                  <>
                    Generate Virtual Account
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 3 && virtualAccount && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Virtual Account Generated
            </CardTitle>
            <CardDescription>
              Use the account details below to make your transfer. This account
              will expire in{" "}
              <span className="font-semibold text-destructive">
                {formatTime(timeRemaining)}
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Countdown Timer */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <h4 className="font-medium text-orange-900">
                  Account Expires In
                </h4>
              </div>
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {formatTime(timeRemaining)}
              </div>
              <Progress
                value={(timeRemaining / (15 * 60)) * 100}
                className="h-2"
              />
              <p className="text-sm text-orange-700 mt-2">
                Complete your transfer before the account expires
              </p>
            </div>

            {/* Account Details */}
            <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-4">
                Transfer Details
              </h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-blue-700">Bank Name</Label>
                    <p className="text-lg font-semibold text-blue-900">
                      {virtualAccount.bankName}
                    </p>
                  </div>
                  <div>
                    <Label className="text-blue-700">Account Number</Label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-mono font-semibold text-blue-900">
                        {virtualAccount.accountNumber}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(
                            virtualAccount.accountNumber
                          );
                          toast.success("Account number copied!");
                        }}
                      >
                        Copy
                      </Button>
                    </div>
                  </div>
                </div>
                <div>
                  <Label className="text-blue-700">Account Name</Label>
                  <p className="text-lg font-semibold text-blue-900">
                    {virtualAccount.accountName}
                  </p>
                </div>
                <div>
                  <Label className="text-blue-700">Amount to Transfer</Label>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrencyFull(virtualAccount.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-blue-700">Reference</Label>
                  <p className="text-sm font-mono text-blue-800">
                    {virtualAccount.reference}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Important Instructions:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>
                    Transfer the exact amount:{" "}
                    {formatCurrencyFull(virtualAccount.amount)}
                  </li>
                  <li>Use the account details provided above</li>
                  <li>
                    Complete the transfer within {formatTime(timeRemaining)}
                  </li>
                  <li>
                    Click "I have made the transfer" button after completing
                    your transfer
                  </li>
                  <li>Do not close this page until payment is confirmed</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Action Button */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Details
              </Button>
              <Button
                onClick={handlePaymentConfirmation}
                disabled={isProcessing}
                className="flex-1"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent mr-2" />
                    Confirming Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />I have made the
                    transfer
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {currentStep === 4 && paymentConfirmed && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Payment Successful!
            </CardTitle>
            <CardDescription>
              Your vehicle funding has been processed successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Success Message */}
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                Funding Completed!
              </h3>
              <p className="text-green-700">
                {formatCurrencyFull(fundingAmount)} has been successfully added
                to vehicle{" "}
                <span className="font-semibold">
                  {selectedVehicle?.plateNumber}
                </span>
              </p>
            </div>

            {/* Transaction Summary */}
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-3">Transaction Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span className="font-medium">
                    {selectedVehicle?.plateNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Amount Funded:</span>
                  <span className="font-medium">
                    {formatCurrencyFull(fundingAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction ID:</span>
                  <span className="font-mono text-xs">
                    {fundingSession?.id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date().toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button variant="outline" onClick={resetFlow} className="flex-1">
                Fund Another Vehicle
              </Button>
              <Button onClick={() => window.print()} variant="outline">
                Print Receipt
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
