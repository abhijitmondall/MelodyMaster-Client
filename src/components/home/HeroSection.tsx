"use client";

import Link from "next/link";
import { ArrowRight, Music, Star, Users, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: BookOpen, value: "200+", label: "Classes" },
  { icon: Users, value: "5,000+", label: "Students" },
  { icon: Star, value: "4.9", label: "Avg Rating" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-white text-slate-900">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-8 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-1/3 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto py-24 md:py-28">
        <motion.div
          className="mx-auto max-w-3xl text-center space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-100/80 px-4 py-2 text-sm font-semibold text-teal-600 shadow-sm">
            <Music className="h-4 w-4" />
            Trusted by students worldwide
          </p>

          <h1 className="text-4xl font-bold leading-tight md:text-5xl">
            Learn music, feel confident, and create your own sound.
          </h1>

          <p className="mx-auto max-w-lg text-base text-slate-600">
            MelodyMasters makes modern music learning effortless with structured
            courses, expert mentors, and a simple interface built for progress.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              asChild
              className="rounded-xl bg-primary text-white px-8 hover:bg-teal-600"
            >
              <Link href="/classes">
                Browse Classes <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="rounded-xl border border-slate-300 px-8 text-slate-700 hover:bg-slate-100"
            >
              <Link href="/instructors">Meet Instructors</Link>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center gap-5 border-t border-slate-200 pt-6 text-sm text-slate-500">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-base font-bold text-slate-800">{value}</p>
                  <p>{label}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
