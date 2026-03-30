"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Search, SlidersHorizontal } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { classesApi, selectedClassesApi } from "@/lib/api";
import ClassCard from "@/components/shared/ClassCard";
import SectionTitle from "@/components/shared/SectionTitle";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";
import type { Class } from "@/types";

export default function ClassesPage() {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("-enrolledStudents");
  const { showToast } = useToast();

  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["classes", { search, sort }],
    queryFn: () =>
      classesApi.getAll({
        status: "Approved",
        search: search || undefined,
        sort,
      }),
  });

  const { data: selectedData } = useQuery({
    queryKey: ["selected-classes", user?.email],
    queryFn: () => selectedClassesApi.getAll(user?.email),
    enabled: !!user?.email,
  });

  const selectedIds = new Set(
    selectedData?.data?.map((sc) => sc.classID) ?? [],
  );

  const { data: enrolledData } = useQuery({
    queryKey: ["enrolled-users", user?.email],
    queryFn: async () => {
      const { enrolledUsersApi } = await import("@/lib/api");
      return enrolledUsersApi.getAll(user?.email);
    },
    enabled: !!user?.email,
  });

  const enrolledIds = new Set(
    enrolledData && enrolledData.data && enrolledData.data.map
      ? enrolledData.data.map((eu) => eu.classID)
      : [],
  );

  const handleSelect = async (cls: Class) => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (user?.role !== "Student") return;

    if (selectedIds.has(cls.id)) {
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
      showToast("Class added to your selected list.", "success");
      await qc.invalidateQueries({ queryKey: ["selected-classes"] });
      // keep class query in sync, so selected button updates immediately
      await qc.invalidateQueries({ queryKey: ["classes", { search, sort }] });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Could not select the class. Please try again.";
      showToast(message, "error");
    }
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-16">
      <SectionTitle
        tag="All Courses"
        title="Explore Our Classes"
        subtitle="Browse through all available music courses and find the perfect fit for your journey."
        className="mb-10"
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search classes…"
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={sort} onValueChange={setSort}>
          <SelectTrigger className="w-full sm:w-48">
            <SlidersHorizontal className="h-4 w-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="-enrolledStudents">Most Popular</SelectItem>
            <SelectItem value="-ratings">Highest Rated</SelectItem>
            <SelectItem value="price">Price: Low to High</SelectItem>
            <SelectItem value="-price">Price: High to Low</SelectItem>
            <SelectItem value="-createdAt">Newest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-muted-foreground mb-6">
          Showing{" "}
          <span className="font-bold text-foreground">
            {data?.results ?? 0}
          </span>{" "}
          classes
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border">
                <Skeleton className="h-48" />
                <div className="p-5 space-y-3">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-9" />
                </div>
              </div>
            ))
          : data?.data?.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                showSelectBtn={user?.role === "Student"}
                isSelected={selectedIds.has(cls.id)}
                isEnrolled={enrolledIds.has(cls.id)}
                onSelect={handleSelect}
              />
            ))}
      </div>

      {!isLoading && !data?.data?.length && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">
            No classes found. Try a different search.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => setSearch("")}
          >
            Clear Search
          </Button>
        </div>
      )}
    </div>
  );
}
