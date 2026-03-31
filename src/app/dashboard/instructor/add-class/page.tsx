"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Loader2, PlusCircle } from "lucide-react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod/v4";
import { classesApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const schema = z.object({
  className: z.string().min(3, "Class name must be at least 3 characters"),
  classImage: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must be less than 1000 characters"),
  totalSeats: z.number().int().min(1, "Must have at least 1 seat"),
  price: z.number().min(0, "Price must be 0 or more"),
});

export default function AddClassPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: classesApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["instructor-classes"] });
      setSuccess(true);
      setTimeout(() => router.push("/dashboard/instructor/my-classes"), 1500);
    },
    onError: (err: unknown) => {
      if (err instanceof AxiosError) {
        const apiMessage = err.response?.data?.message;
        setError(apiMessage || `Failed to create class: ${err.message}`);
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to create class.",
        );
      }
    },
  });

  const form = useForm({
    defaultValues: {
      className: "",
      classImage: "",
      description: "",
      totalSeats: 30,
      price: 0,
    },
    onSubmit: async ({ value }) => {
      if (!user) return;
      setError("");
      console.log("SUBMIT VALUES:", value);
      mutation.mutate({
        className: value.className,
        classImage: value.classImage || undefined,
        description: value.description,
        instructorName: user.name,
        instructorEmail: user.email,
        instructorPhoto: user.photo ?? undefined,
        totalSeats: value.totalSeats,
        price: value.price,
      });
    },
  });

  const fields = [
    {
      name: "className" as const,
      label: "Class Name",
      type: "text",
      placeholder: "e.g. Guitar for Beginners",
    },
    {
      name: "classImage" as const,
      label: "Class Image URL (optional)",
      type: "url",
      placeholder: "https://example.com/image.jpg",
    },
    {
      name: "description" as const,
      label: "Description",
      type: "textarea",
      placeholder: "Describe your class in detail...",
    },
    {
      name: "totalSeats" as const,
      label: "Total Seats",
      type: "number",
      placeholder: "30",
    },
    {
      name: "price" as const,
      label: "Price (USD)",
      type: "number",
      placeholder: "0",
    },
  ];

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="text-center p-10 border-2 border-primary/20">
          <CardContent className="space-y-3">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <PlusCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-black">Class Submitted!</h2>
            <p className="text-muted-foreground text-sm">
              Your class is pending admin approval. Redirecting…
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-black">Add New Class</h1>
        <p className="text-muted-foreground mt-1">
          Submit a new class for admin review.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Details</CardTitle>
          <CardDescription>
            Fill in the information below. Your class will be reviewed before
            going live.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
            className="space-y-5"
          >
            {fields.map(({ name, label, type, placeholder }) => (
              <form.Field
                key={name}
                name={name}
                validators={{
                  onChange: ({ value }) => {
                    if (name === "className") {
                      const r = schema.shape.className.safeParse(value);
                      return r.success ? undefined : r.error.issues[0]?.message;
                    }
                    if (name === "description") {
                      const r = schema.shape.description.safeParse(value);
                      return r.success ? undefined : r.error.issues[0]?.message;
                    }
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div className="space-y-1.5">
                    <Label>{label}</Label>
                    {type === "textarea" ? (
                      <Textarea
                        placeholder={placeholder}
                        value={String(field.state.value)}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                        className={
                          field.state.meta.errors.length
                            ? "border-destructive"
                            : ""
                        }
                      />
                    ) : (
                      <Input
                        type={type}
                        placeholder={placeholder}
                        value={String(field.state.value)}
                        onChange={(e) => {
                          const v =
                            type === "number"
                              ? isNaN(e.target.valueAsNumber)
                                ? 0
                                : e.target.valueAsNumber
                              : e.target.value;
                          field.handleChange(v as never);
                        }}
                        onBlur={field.handleBlur}
                        className={
                          field.state.meta.errors.length
                            ? "border-destructive"
                            : ""
                        }
                        min={type === "number" ? 0 : undefined}
                      />
                    )}
                    {field.state.meta.errors[0] && (
                      <p className="text-xs text-destructive">
                        {field.state.meta.errors[0]}
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            ))}

            {error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <form.Subscribe selector={(s) => [s.isSubmitting]}>
              {([isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting || mutation.isPending}
                >
                  {isSubmitting || mutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Submitting…
                    </>
                  ) : (
                    <>
                      <PlusCircle className="mr-2 h-4 w-4" /> Submit Class
                    </>
                  )}
                </Button>
              )}
            </form.Subscribe>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
