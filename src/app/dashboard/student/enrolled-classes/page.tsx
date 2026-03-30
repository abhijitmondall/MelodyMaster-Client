"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { GraduationCap, BookOpen, Star } from "lucide-react";
import { enrolledUsersApi } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, formatDate } from "@/lib/utils";

export default function EnrolledClassesPage() {
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["enrolled-users", user?.email],
    queryFn: () => enrolledUsersApi.getAll(user?.email),
    enabled: !!user?.email,
  });

  const enrolledClasses = data?.data ?? [];
  const paidEnrollments = enrolledClasses.filter((e) => e.status === "Paid");

  const totalSpent =
    paidEnrollments.length > 0
      ? paidEnrollments.reduce((s, e) => s + e.price, 0)
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black">Enrolled Classes</h1>
          <p className="text-muted-foreground mt-1">
            All classes you are actively enrolled in.
          </p>
        </div>
        {enrolledClasses.length > 0 && (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total invested</p>
            <p className="text-2xl font-black text-primary">
              {formatPrice(totalSpent)}
            </p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-44 w-full rounded-none" />
              <CardContent className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : paidEnrollments.length === 0 ? (
        <Card className="text-center py-20">
          <CardContent>
            <GraduationCap className="h-14 w-14 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-bold text-lg">No enrollments yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Select a class and complete payment to start learning.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paidEnrollments.map((eu) => (
            <Card
              key={eu.id}
              className="group overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Class image */}
              <div className="relative h-44 bg-gradient-to-br from-teal-50 to-emerald-100 overflow-hidden">
                {eu.classImage ? (
                  <Image
                    src={eu.classImage}
                    alt={eu.className}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <BookOpen className="h-12 w-12 text-primary/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-3">
                  <Badge variant="success" className="text-xs shadow-sm">
                    {eu.status}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                <div>
                  <h3 className="font-bold text-base leading-snug">
                    {eu.className}
                  </h3>
                  {eu.userName && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {eu.userName}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  <span>Enrolled {formatDate(eu.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Paid
                    </p>
                    <p className="text-lg font-black text-primary">
                      {formatPrice(eu.price)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      Transaction
                    </p>
                    <p className="text-xs font-mono text-muted-foreground truncate max-w-[100px]">
                      {eu.transactionId}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
