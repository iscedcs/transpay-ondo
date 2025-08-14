"use client";
import { toast } from "sonner";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DeleteCompanyButton({ id }: { id: string }) {
  const [deleted, setIsDeleted] = useState(false);
  const router = useRouter();

  const deleteOnclick = async () => {
    setIsDeleted(false);
    try {
      const url = "/api/add-company";
      const response = await fetch(url, {
        method: "PATCH",
        body: JSON.stringify({
          id,
        }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        toast.error("Company has not been deleted", {
          description: "There was a problem with deleting this company.",
        });
      } else {
        setIsDeleted(!deleted);
        router.refresh();
        toast.success("Company deleted successfully", {
          description:
            "Ths commpany has been deleted successfully, you can still restore the record.",
        });
      }
    } catch (e) {
      toast.error("Something went wrong", {
        description: "There was a problem with deleting this company.",
      });
    } finally {
      setIsDeleted(!deleted);
    }
  };
  return (
    <div className="text-destructive-foreground">
      <p
        onClick={deleteOnclick}
        className=" cursor-pointer flex gap-3 items-center"
      >
        <Trash2 className="h-4 w-4" /> Delete Company
      </p>
    </div>
  );
}
