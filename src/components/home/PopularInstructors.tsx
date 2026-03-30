"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { usersApi } from "@/lib/api";
import InstructorCard from "@/components/shared/InstructorCard";
import SectionTitle from "@/components/shared/SectionTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function PopularInstructors() {
  const { data: instructors = [], isLoading } = useQuery({
    queryKey: ["popular-instructors"],
    queryFn: () => usersApi.getInstructors(6),
  });

  return (
    <section className="py-24">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <SectionTitle
            align="left"
            tag="Expert Teachers"
            title="Meet Our Instructors"
            subtitle="Learn from passionate musicians who are dedicated to your growth."
          />
          <Button variant="outline" asChild className="rounded-xl shrink-0">
            <Link href="/instructors">All Instructors <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-8 border bg-card space-y-4">
                  <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                  <Skeleton className="h-5 w-3/4 mx-auto" />
                  <Skeleton className="h-4 w-1/2 mx-auto" />
                </div>
              ))
            : instructors.map((instructor) => (
                <InstructorCard key={instructor.id} instructor={instructor} />
              ))}
        </div>
      </div>
    </section>
  );
}
