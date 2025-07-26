"use client";

import type React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface FormData {
  agentId: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  reasonForBlock: string;
  explanation: string;
  agreedToTerms: boolean;
}

export function UnblockRequestForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    agentId: "",
    email: "",
    fullName: "",
    phoneNumber: "",
    reasonForBlock: "",
    explanation: "",
    agreedToTerms: false,
  });

  const handleInputChange = (
    field: keyof FormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreedToTerms) {
      toast.error("Please agree to the terms and conditions");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Simulate success/failure
      const success = Math.random() > 0.3; // 70% success rate for demo

      if (success) {
        toast.success("Unblock request submitted successfully!", {
          description:
            "We'll review your request within 24-48 hours and contact you via email.",
        });

        // Reset form
        setFormData({
          agentId: "",
          email: "",
          fullName: "",
          phoneNumber: "",
          reasonForBlock: "",
          explanation: "",
          agreedToTerms: false,
        });
      } else {
        toast.error("Failed to submit request", {
          description: "Please try again later or contact support directly.",
        });
      }
    } catch (error) {
      toast.error("An error occurred", {
        description: "Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unblock Request Form</CardTitle>
        <CardDescription>
          Fill out all required fields to submit your unblocking request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agentId">Agent ID *</Label>
              <Input
                id="agentId"
                placeholder="Enter your agent ID"
                value={formData.agentId}
                onChange={(e) => handleInputChange("agentId", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reasonForBlock">Reason for Block *</Label>
            <Select
              value={formData.reasonForBlock}
              onValueChange={(value) =>
                handleInputChange("reasonForBlock", value)
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the reason for blocking" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="outside-jurisdiction">
                  Scanned Outside Jurisdiction
                </SelectItem>
                <SelectItem value="policy-violation">
                  Policy Violation
                </SelectItem>
                <SelectItem value="suspicious-activity">
                  Suspicious Activity
                </SelectItem>
                <SelectItem value="failed-authentication">
                  Failed Authentication
                </SelectItem>
                <SelectItem value="reported-behavior">
                  Reported Inappropriate Behavior
                </SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="explanation">Explanation *</Label>
            <Textarea
              id="explanation"
              placeholder="Please explain your situation and why you believe your account should be unblocked..."
              className="min-h-[120px]"
              value={formData.explanation}
              onChange={(e) => handleInputChange("explanation", e.target.value)}
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={formData.agreedToTerms}
              onCheckedChange={(checked) =>
                handleInputChange("agreedToTerms", checked as boolean)
              }
            />
            <Label htmlFor="terms" className="text-sm">
              I agree to the{" "}
              <a href="/terms" className="text-blue-600 hover:underline">
                terms and conditions
              </a>{" "}
              and confirm that all information provided is accurate.
            </Label>
          </div>

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Unblock Request
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
