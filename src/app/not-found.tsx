import Link from "next/link";
import { Music, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 text-white p-6 text-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="relative space-y-8 max-w-md">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/20 border border-primary/30 mx-auto">
          <Music className="h-10 w-10 text-primary" />
        </div>

        <div className="space-y-3">
          <h1 className="text-8xl font-black tracking-tighter text-primary">404</h1>
          <h2 className="text-2xl font-bold">Page not found</h2>
          <p className="text-slate-400 leading-relaxed">
            Looks like this note is out of tune. The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="rounded-2xl px-8">
            <Link href="/"><Home className="mr-2 h-4 w-4" /> Go Home</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-2xl px-8 border-white/20 bg-white/5 hover:bg-white/10 text-white">
            <Link href="/classes"><ArrowLeft className="mr-2 h-4 w-4" /> Browse Classes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
