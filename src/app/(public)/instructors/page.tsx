"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { usersApi } from "@/lib/api";
import InstructorCard from "@/components/shared/InstructorCard";
import SectionTitle from "@/components/shared/SectionTitle";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

export default function InstructorsPage() {
  const [search, setSearch] = useState("");

  const { data: instructors = [], isLoading } = useQuery({
    queryKey: ["instructors"],
    queryFn: () => usersApi.getInstructors(),
  });

  const filtered = search
    ? instructors.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.email.toLowerCase().includes(search.toLowerCase()))
    : instructors;

  return (
    <div className="container mx-auto px-4 lg:px-8 py-16">
      <SectionTitle tag="Our Team" title="Meet the Instructors" subtitle="Discover passionate musicians and educators committed to helping you reach your full potential." className="mb-10" />

      <div className="relative max-w-sm mx-auto mb-10">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search instructors…" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-2xl p-8 border bg-card space-y-4">
                <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                <Skeleton className="h-5 w-3/4 mx-auto" />
                <Skeleton className="h-4 w-1/2 mx-auto" />
              </div>
            ))
          : filtered.map((instructor) => <InstructorCard key={instructor.id} instructor={instructor} />)}
      </div>

      {!isLoading && !filtered.length && (
        <div className="text-center py-16">
          <p className="text-muted-foreground">No instructors found matching "{search}"</p>
        </div>
      )}
    </div>
  );
}
