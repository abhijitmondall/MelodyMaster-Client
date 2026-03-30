"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, Users, BookOpen, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { Class } from "@/types";

interface ClassCardProps {
  cls: Class;
  onSelect?: (cls: Class) => void;
  showSelectBtn?: boolean;
  isSelected?: boolean;
  isEnrolled?: boolean;
}

export default function ClassCard({
  cls,
  onSelect,
  showSelectBtn,
  isSelected,
  isEnrolled,
}: ClassCardProps) {
  const isFull = cls.availableSeats === 0;

  return (
    <Card
      className={`group overflow-hidden transition-all duration-300 hover:-translate-y-1 ${
        isEnrolled
          ? "border-emerald-300 shadow-lg"
          : isSelected
            ? "border-blue-300 shadow-md"
            : "hover:shadow-xl"
      }`}
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-teal-100 to-emerald-100">
        {cls.classImage ? (
          <img
            src={cls?.classImage}
            alt={cls?.className}
            // fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-16 w-16 text-primary/30" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <Badge
            variant={
              cls.status === "Approved"
                ? "success"
                : cls.status === "Denied"
                  ? "destructive"
                  : "warning"
            }
          >
            {cls.status}
          </Badge>
        </div>
        {(isSelected || isEnrolled) && (
          <div className="absolute top-3 right-3">
            <Badge
              variant={isEnrolled ? "destructive" : "secondary"}
              className="text-xs"
            >
              {isEnrolled ? "Enrolled" : "Selected"}
            </Badge>
          </div>
        )}
        {isFull && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Class Full</span>
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="font-bold text-lg leading-tight line-clamp-1">
            <Link
              href={`/classes/${cls.id}`}
              className="text-slate-900 hover:text-primary hover:underline"
            >
              {cls.className}
            </Link>
          </h3>
          {cls.instructorName && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-primary/10 inline-flex items-center justify-center text-[10px] font-bold text-primary">
                {cls.instructorName[0]}
              </span>
              {cls.instructorName}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="h-3.5 w-3.5 text-primary" />
            <span>{cls.availableSeats} seats left</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            <span>{cls.ratings.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-border">
          <span className="text-xl font-black text-primary">
            {formatPrice(cls.price)}
          </span>
          {showSelectBtn && (
            <Button
              size="sm"
              variant={
                isEnrolled ? "secondary" : isSelected ? "outline" : "default"
              }
              disabled={isFull || isEnrolled || cls.status !== "Approved"}
              onClick={() => onSelect?.(cls)}
              className="rounded-xl"
            >
              {isEnrolled ? "Enrolled" : isSelected ? "Selected" : "Select"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
