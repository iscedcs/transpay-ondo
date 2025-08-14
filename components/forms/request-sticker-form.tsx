"use client";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { NextResponse } from "next/server";
import { LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RequestStickerForm({ asin, name, plateNumber }: { asin: string | undefined; name: string | undefined; plateNumber: string | undefined }) {
     const [isLoading, setIsLoading] = useState(false);
     const router = useRouter()
     const onSubmit = async (data: {asin: string,
                    plateNumber: string}) => {
           const createRequest = {
               asin: data.asin,
               plateNumber: data.plateNumber,
          };
          setIsLoading(true);
          try {
            const createStickerResponse = await fetch("/api/request-sticker", {
              method: "POST",
              body: JSON.stringify(createRequest),
            });
            const result = await createStickerResponse.json();
            if (
              createStickerResponse.status > 199 &&
              createStickerResponse.status < 299
            ) {
              toast.success("Sticker Requested Successfully");
              setIsLoading(false);
              router.refresh();
              return NextResponse.json(result);
            } else {
              setIsLoading(false);
              toast.error("Sticker Not Requested");
              return null;
            }
          } catch (error) {
            setIsLoading(false);
            toast.error("Something Went Wrong");
          }
     };
     const requestStickerSchema = z.object({
          name: z
               .string()
               .min(2, {
                    message: "Name must be at least 2 characters.",
               })
               .max(50, {
                    message: "name must not be longer than 50 characters.",
               }),
          plateNumber: z
               .string()
               .min(2, {
                    message: "Plate Number must be at least 2 characters.",
               })
               .max(30, {
                    message: "Plate Number must not be longer than 30 characters.",
               }),
          asin: z
               .string()
               .min(6, {
                    message: "Username must be at least 6 characters.",
               })
               .max(13, {
                    message: "Username must not be longer than 13 characters.",
               }),
     });
     type RequestValidation = z.infer<typeof requestStickerSchema>;
     const defaultValues: Partial<RequestValidation> = {
          name: name,
          asin: asin,
          plateNumber: plateNumber,
     };

     const form = useForm<RequestValidation>({
          resolver: zodResolver(requestStickerSchema),
          defaultValues,
          mode: "onChange",
     });

     return (
          <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                         name="name"
                         control={form.control}
                         render={({ field }) => (
                              <FormItem>
                                   <FormLabel>Name:</FormLabel>
                                   <FormControl>
                                        <Input disabled {...field} />
                                   </FormControl>
                              </FormItem>
                         )}
                    />
                    <FormField
                         name="plateNumber"
                         control={form.control}
                         render={({ field }) => (
                              <FormItem>
                                   <FormLabel>Phone Number:</FormLabel>
                                   <FormControl>
                                        <Input disabled {...field} />
                                   </FormControl>
                              </FormItem>
                         )}
                    />
                    <FormField
                         name="asin"
                         control={form.control}
                         render={({ field }) => (
                              <FormItem>
                                   <FormLabel>ASIN:</FormLabel>
                                   <FormControl>
                                        <Input
                                             //  onBlur={handleChange}
                                             {...field}
                                        />
                                   </FormControl>
                                   <FormMessage />
                              </FormItem>
                         )}
                    />
                    <Button className="mt-[20px]" type="submit" variant="default" disabled={isLoading}>
                         {isLoading? <LoaderIcon className="animate-spin h-4 w-4" /> : "Submit"}
                    </Button>
               </form>
          </Form>
     );
}
