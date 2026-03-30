import Link from "next/link";
import { ArrowRight, Music, Star, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { icon: BookOpen, value: "200+", label: "Classes" },
  { icon: Users, value: "5,000+", label: "Students" },
  { icon: Star, value: "4.9", label: "Avg Rating" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 lg:px-8 py-28 md:py-36">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-sm font-semibold backdrop-blur-sm">
            <Music className="h-4 w-4 text-teal-400" />
            <span>World-Class Music Education</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none">
            Experience the{" "}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
              Magic
            </span>{" "}
            of Music
          </h1>

          <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-xl mx-auto">
            Unlock your musical potential with MelodyMasters. Learn from world-class instructors and discover your unique sound.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button size="lg" asChild className="rounded-2xl bg-primary hover:brightness-110 shadow-xl shadow-primary/30 text-base px-8">
              <Link href="/classes">
                Explore Classes <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-2xl border-white/20 bg-white/5 hover:bg-white/10 text-white text-base px-8">
              <Link href="/instructors">Meet Instructors</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-6 border-t border-white/10">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                  <Icon className="h-5 w-5 text-teal-400" />
                </div>
                <div className="text-left">
                  <div className="text-xl font-black">{value}</div>
                  <div className="text-xs text-slate-400">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
