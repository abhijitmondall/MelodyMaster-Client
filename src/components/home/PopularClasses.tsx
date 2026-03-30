"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { classesApi } from "@/lib/api";
import ClassCard from "@/components/shared/ClassCard";
import SectionTitle from "@/components/shared/SectionTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function PopularClasses() {
  const { data, isLoading } = useQuery({
    queryKey: ["popular-classes"],
    queryFn: () => classesApi.getAll({ status: "Approved", sort: "-enrolledStudents", limit: 6 }),
  });

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <SectionTitle
            align="left"
            tag="Top Rated"
            title="Popular Classes"
            subtitle="Discover our most-loved music courses taught by expert instructors."
          />
          <Button variant="outline" asChild className="rounded-xl shrink-0">
            <Link href="/classes">View All Classes <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden">
                  <Skeleton className="h-48 rounded-none" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              ))
            : data?.data?.slice(0, 6).map((cls) => (
                <ClassCard key={cls.id} cls={cls} />
              ))}
        </div>
      </div>
    </section>
  );
}
