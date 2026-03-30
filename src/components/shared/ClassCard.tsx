"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Users, BookOpen, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
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
  const { user } = useAuthStore();
  const isInstructor = user?.role === "Instructor" || user?.role === "Admin";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="group h-full"
    >
      <Card
        className={`overflow-hidden border h-full flex flex-col transition-all duration-300 ${
          isEnrolled
            ? "border-emerald-200 bg-emerald-50/30"
            : isSelected
              ? "border-blue-200 bg-blue-50/30"
              : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
        }`}
      >
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden bg-linear-to-br from-slate-200 to-slate-100">
          {cls.classImage ? (
            <img
              src={cls?.classImage}
              alt={cls?.className}
              className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-linear-to-br from-primary/10 to-primary/5">
              <BookOpen className="h-16 w-16 text-primary/30" />
            </div>
          )}

          {/* Status Overlay Gradient */}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {isInstructor && (
              <Badge
                variant={
                  cls.status === "Approved"
                    ? "success"
                    : cls.status === "Denied"
                      ? "destructive"
                      : "warning"
                }
                className="font-semibold"
              >
                {cls.status}
              </Badge>
            )}
          </div>

          {(isSelected || isEnrolled) && (
            <div className="absolute top-3 right-3">
              <Badge
                variant={isEnrolled ? "destructive" : "secondary"}
                className="text-xs font-semibold"
              >
                {isEnrolled ? "Enrolled" : "Selected"}
              </Badge>
            </div>
          )}

          {isFull && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-lg">Class Full</span>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-5 space-y-4 flex-1 flex flex-col">
          {/* Title & Instructor */}
          <div>
            <h3 className="font-bold text-base leading-snug line-clamp-2 mb-2">
              <Link
                href={`/classes/${cls.id}`}
                className="text-slate-900 hover:text-primary transition-colors duration-200"
              >
                {cls.className}
              </Link>
            </h3>
            {cls.instructorName && (
              <p className="text-xs text-slate-600 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-primary/15 inline-flex items-center justify-center text-[9px] font-bold text-primary shrink-0">
                  {cls.instructorName[0].toUpperCase()}
                </span>
                <span className="truncate">{cls.instructorName}</span>
              </p>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-100">
            <div className="flex items-center gap-1.5 text-xs">
              <Users className="h-4 w-4 text-primary/70 shrink-0" />
              <span className="text-slate-700 font-medium">
                {cls.availableSeats} seats
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400 shrink-0" />
              <span className="text-slate-700 font-medium">
                {cls.ratings.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Footer with Price & Action */}
          <div className="flex items-end justify-between gap-3 mt-auto pt-2">
            <div>
              <p className="text-xs text-slate-500 mb-1">Starting at</p>
              <span className="text-lg font-black bg-linear-to-r from-primary to-emerald-600 bg-clip-text text-transparent">
                {formatPrice(cls.price)}
              </span>
            </div>
            {showSelectBtn && (
              <Button
                size="sm"
                variant={
                  isEnrolled ? "secondary" : isSelected ? "outline" : "default"
                }
                disabled={isFull || isEnrolled || cls.status !== "Approved"}
                onClick={() => onSelect?.(cls)}
                className="rounded-lg font-semibold text-xs"
              >
                {isEnrolled ? "Enrolled" : isSelected ? "Selected" : "Select"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
