"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CalendarDays, Star, Users } from "lucide-react";
import { classesApi, selectedClassesApi, paymentApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import type { Class } from "@/types";

export default function ClassDetailsPage() {
  const params = useParams();
  const classId = params?.classId as string | undefined;
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  const [cls, setCls] = useState<Class | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!classId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await classesApi.getById(classId);
        setCls(data);
        setError("");
      } catch (e) {
        setError("Unable to load class details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [classId]);

  const handleSelect = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!user || !cls) return;

    try {
      await selectedClassesApi.create({
        userEmail: user.email,
        instructorEmail: cls.instructorEmail ?? "",
        classID: cls.id,
        classImage: cls.classImage ?? undefined,
        className: cls.className,
        price: cls.price,
        enrolledStudents: cls.enrolledStudents,
      });
      showToast("Class added to selected classes", "success");
      router.push("/dashboard/student/selected-classes");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unable to select class";
      showToast(msg, "error");
    }
  };

  const handlePayNow = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!user || !cls) return;

    setIsPaying(true);

    try {
      let selectedClass = null;

      try {
        selectedClass = await selectedClassesApi.create({
          userEmail: user.email,
          instructorEmail: cls.instructorEmail ?? "",
          classID: cls.id,
          classImage: cls.classImage ?? undefined,
          className: cls.className,
          price: cls.price,
          enrolledStudents: cls.enrolledStudents,
        });
      } catch (createError: unknown) {
        const msg =
          createError instanceof Error
            ? createError.message
            : "Unable to add class to selected";

        if (msg.toLowerCase().includes("already selected")) {
          const existing = await selectedClassesApi.getAll(user.email);
          selectedClass =
            existing.data.find((item) => item.classID === cls.id) ?? null;
        } else {
          throw createError;
        }
      }

      if (!selectedClass) {
        throw new Error(
          "Unable to create or retrieve selected class for checkout.",
        );
      }

      const { paymentUrl } = await paymentApi.createCheckout(selectedClass.id);
      window.location.assign(paymentUrl);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to create checkout session";
      showToast(msg, "error");
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 grid grid-cols-1 gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent>
              <Skeleton className="h-6 w-3/4 mb-4" />
              <Skeleton className="h-40" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !cls) {
    return (
      <div className="p-8">
        <p className="text-destructive font-bold">
          {error || "Class not found."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <Button
        variant="ghost"
        size="sm"
        className="inline-flex items-center gap-2"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4" /> Back to classes
      </Button>

      <Card className="shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3">
          <div className="relative h-72 lg:h-full">
            {cls.classImage ? (
              <img
                src={cls.classImage}
                alt={cls.className}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full grid place-items-center bg-muted">
                <BookOpen className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
          </div>
          <CardContent className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black">{cls.className}</h1>
              <Badge
                variant={cls.status === "Approved" ? "success" : "warning"}
              >
                {cls.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              By {cls.instructorName ?? "Unknown"}
            </p>

            <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" /> {cls.enrolledStudents ?? 0}{" "}
                enrolled
              </span>
              <span className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" /> {cls.availableSeats} seats
                left
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-2xl font-black">
                {formatPrice(cls.price)}
              </span>
              <span className="text-sm text-muted-foreground">
                {cls.ratings.toFixed(1)} / 5{" "}
              </span>
              <Star className="h-4 w-4 text-amber-400" />
            </div>

            <div className="border-t pt-4 text-sm text-muted-foreground">
              <p>
                {cls.description ?? "No description available for this class."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleSelect}
                disabled={
                  cls.status !== "Approved" || (cls.availableSeats ?? 0) === 0
                }
              >
                Add to Selection
              </Button>

              <Button
                variant="secondary"
                onClick={handlePayNow}
                disabled={
                  cls.status !== "Approved" ||
                  (cls.availableSeats ?? 0) === 0 ||
                  isPaying
                }
              >
                {isPaying ? "Redirecting…" : "Pay Now"}
              </Button>
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
