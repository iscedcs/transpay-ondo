"use client";

import { loadingSpinner } from "@/lib/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { useToast } from "../ui/use-toast";
import { Eye, EyeOff } from "lucide-react";

const agentFormSchema = z.object({
  email: z
    .string({
      required_error: "Please enter an email.",
    })
    .email(),
  password: z.string(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

// This can come from your database or API.
const defaultValues: Partial<AgentFormValues> = {
  email: "",
  password: "",
};

export function AdminLoginForm({ error }: { error?: string }) {
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const router = useRouter();
  const [showPassword, setShowPassword] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues,
    mode: "onChange",
  });

  async function onSubmit(data: AgentFormValues) {
    setIsLoading(true);
    try {
      const signInResponse = await signIn("credentials", {
        email: data.email,
        password: data.password,
        role: "admin",
        redirect: true,
        callbackUrl: "/dashboard",
      });
      router.push("/dashboard");
      return signInResponse;
    } catch (error: any) {
      toast({
        title: error?.message || "Check Internet",
      });
      setIsLoading(false);
      throw new Error(error);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="mb-5 flex flex-col gap-5">
        <div className="grid gap-5">
          {error && (
            <div className="text-center text-xs text-destructive-foreground">
              {error}
            </div>
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter Password"
                        {...field}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-2.5 text-muted-foreground hover:text-primary focus:outline-none">
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <div className="flex items-center space-x-2">
            <Checkbox id="remember" />
            <label
              htmlFor="remember"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Remember Me
            </label>
          </div>
        </div>
        <div className="grid gap-2">
          <Button disabled={isLoading} type="submit">
            {isLoading ? loadingSpinner : "Login"}
          </Button>
          <div className="flex items-center gap-2 text-xs md:text-base">
            Forgot your password?{" "}
            <Link href="/reset-password">Reset your Password</Link>
          </div>
        </div>
      </form>
    </Form>
  );
}
