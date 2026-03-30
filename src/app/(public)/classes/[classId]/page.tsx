"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, CalendarDays, Star, Users } from "lucide-react";
import {
  classesApi,
  selectedClassesApi,
  paymentApi,
  enrolledUsersApi,
} from "@/lib/api";
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

  const getErrorMessage = (err: unknown, fallback: string): string => {
    let msg = fallback;

    if (err instanceof Error) {
      msg = err.message;
    }

    if (typeof err === "object" && err !== null && "response" in err) {
      const resp = (err as { response?: { data?: { message?: string } } })
        .response;
      if (resp?.data?.message) {
        msg = resp.data.message;
      }
    }

    return msg;
  };

  const isStudent = user?.role === "Student";

  const { data: selectedClassesData } = useQuery({
    queryKey: ["selected-classes", user?.email],
    queryFn: () => selectedClassesApi.getAll(user?.email),
    enabled: isStudent && !!user?.email,
  });

  const { data: enrolledData } = useQuery({
    queryKey: ["enrolled-users", user?.email],
    queryFn: () => enrolledUsersApi.getAll(user?.email),
    enabled: isStudent && !!user?.email,
  });

  const selectedForThisClass =
    cls?.id && Array.isArray(selectedClassesData?.data)
      ? (selectedClassesData.data.find((sc) => sc.classID === cls.id) ?? null)
      : null;

  const isEnrolledForThisClass =
    cls?.id && Array.isArray(enrolledData?.data)
      ? enrolledData.data.some(
          (eu) => eu.classID === cls.id && eu.status === "Paid",
        )
      : false;

  useEffect(() => {
    if (!classId) return;

    const load = async () => {
      setIsLoading(true);
      try {
        const data = await classesApi.getById(classId);
        setCls(data);
        setError("");
      } catch {
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

    if (user.role !== "Student") {
      showToast("Only students can select classes.", "error");
      return;
    }

    if (cls.status !== "Approved" || (cls.availableSeats ?? 0) === 0) return;
    if (selectedForThisClass) {
      showToast("This class is already in your selected list.", "error");
      return;
    }

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
      const msg = getErrorMessage(err, "Unable to select class");

      if (msg.toLowerCase().includes("already selected")) {
        showToast("This class is already in your selected list.", "error");
        router.push("/dashboard/student/selected-classes");
        return;
      }

      showToast(msg, "error");
    }
  };

  const handlePayNow = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!user || !cls) return;

    if (user.role !== "Student") {
      showToast("Only students can enroll in classes.", "error");
      return;
    }

    if (isEnrolledForThisClass) {
      showToast("You are already enrolled in this class.", "error");
      return;
    }

    if (cls.status !== "Approved" || (cls.availableSeats ?? 0) === 0) return;

    setIsPaying(true);

    try {
      let selectedClass = selectedForThisClass;

      if (!selectedClass) {
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
          const msg = getErrorMessage(
            createError,
            "Unable to add class to selected",
          );

          if (msg.toLowerCase().includes("already selected")) {
            const existing = await selectedClassesApi.getAll(user.email);
            selectedClass =
              existing.data.find((item) => item.classID === cls.id) ?? null;
          } else {
            throw createError;
          }
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
      const msg = getErrorMessage(err, "Unable to create checkout session");
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
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="py-8 flex flex-col items-center gap-2 text-center">
            <p className="text-destructive font-bold text-lg">
              {error || "Class not found."}
            </p>
            <p className="text-sm text-muted-foreground">
              The class you are looking for may have been removed or is
              temporarily unavailable.
            </p>
            <Button
              variant="outline"
              className="mt-2"
              onClick={() => router.push("/classes")}
            >
              Back to Classes
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-slate-50">
      <div className="border-b bg-linear-to-r from-primary/5 via-emerald-50 to-transparent">
        <div className="container mx-auto px-4 lg:px-8 py-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              className="inline-flex items-center gap-2 rounded-full"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-4 w-4" /> Back to classes
            </Button>
            <Badge
              variant={cls.status === "Approved" ? "success" : "warning"}
              className="text-xs font-semibold"
            >
              {cls.status}
            </Badge>
          </div>
          <div className="text-right text-xs text-muted-foreground hidden sm:block">
            <p className="font-semibold uppercase tracking-wider">
              Premium music course
            </p>
            <p>Curated by MelodyMasters instructors</p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] gap-6 lg:gap-8 items-start">
          {/* Left column: image + description */}
          <Card className="overflow-hidden border-slate-200 shadow-sm">
            <div className="relative h-64 sm:h-80 bg-linear-to-br from-slate-200 to-slate-100">
              {cls.classImage ? (
                <img
                  src={cls.classImage}
                  alt={cls.className}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="h-16 w-16 text-primary/30" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black/45 via-black/20 to-transparent" />

              <div className="absolute bottom-4 left-5 right-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">
                    MelodyMasters Class
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-black text-white leading-snug">
                    {cls.className}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-100/80 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] sm:text-xs font-semibold">
                      <Users className="h-3 w-3" />
                      {cls.enrolledStudents ?? 0} enrolled
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] sm:text-xs font-semibold">
                      <CalendarDays className="h-3 w-3" />
                      {cls.availableSeats} seats left
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-0.5 text-[10px] sm:text-xs font-semibold">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {cls.ratings.toFixed(1)} / 5
                    </span>
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] uppercase tracking-wider text-slate-200">
                    Tuition
                  </p>
                  <p className="text-2xl sm:text-3xl font-black bg-linear-to-r from-primary to-emerald-400 bg-clip-text text-transparent drop-shadow-sm">
                    {formatPrice(cls.price)}
                  </p>
                </div>
              </div>
            </div>

            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Instructor
                  </p>
                  <p className="text-sm font-bold text-foreground">
                    {cls.instructorName ?? "Unknown"}
                  </p>
                  {cls.instructorEmail && (
                    <p className="text-xs text-muted-foreground">
                      {cls.instructorEmail}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  About this class
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {cls.description ??
                    "No description available for this class yet. Check back soon for more details."}
                </p>
              </div>

              {(user?.role === "Instructor" || user?.role === "Admin") &&
                cls.feedback && (
                  <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 space-y-1.5">
                    <p className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                      Admin Feedback
                    </p>
                    <p className="text-sm text-amber-900/90 whitespace-pre-line">
                      {cls.feedback}
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Right column: enrollment panel */}
          <Card className="border-slate-200 shadow-sm sticky top-24">
            <CardContent className="p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Enroll in this class
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Secure checkout powered by Stripe.
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                    Seats left
                  </p>
                  <p className="text-lg font-black">
                    {cls.availableSeats ?? 0}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                  <Users className="h-3 w-3 text-primary" />
                  {cls.enrolledStudents ?? 0} enrolled
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  Rated {cls.ratings.toFixed(1)}/5
                </span>
              </div>

              <div className="space-y-3">
                {!isAuthenticated ? (
                  <Button
                    className="w-full rounded-xl"
                    onClick={() => router.push("/auth/login")}
                  >
                    Sign in to enroll
                  </Button>
                ) : user?.role !== "Student" ? (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-muted-foreground">
                    Only students can select and enroll in classes. Switch to a
                    student account to proceed.
                  </div>
                ) : isEnrolledForThisClass ? (
                  <Button
                    className="w-full rounded-xl"
                    variant="secondary"
                    disabled
                  >
                    Enrolled
                  </Button>
                ) : (
                  <>
                    <Button
                      className="w-full rounded-xl cursor-pointer"
                      onClick={handleSelect}
                      disabled={
                        cls.status !== "Approved" ||
                        (cls.availableSeats ?? 0) === 0 ||
                        !!selectedForThisClass
                      }
                    >
                      {selectedForThisClass ? "Selected" : "Add to Selection"}
                    </Button>

                    <Button
                      className="w-full rounded-xl cursor-pointer"
                      variant="outline"
                      onClick={handlePayNow}
                      disabled={
                        cls.status !== "Approved" ||
                        (cls.availableSeats ?? 0) === 0 ||
                        isPaying ||
                        isEnrolledForThisClass
                      }
                    >
                      {isPaying ? "Redirecting…" : "Pay Now"}
                    </Button>
                  </>
                )}
              </div>

              {isStudent && cls.status !== "Approved" && (
                <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-muted-foreground">
                  This class is not approved for enrollment yet. You can explore
                  other available classes on the{" "}
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto px-0 py-0 align-baseline text-xs"
                    onClick={() => router.push("/classes")}
                  >
                    Classes
                  </Button>{" "}
                  page.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
