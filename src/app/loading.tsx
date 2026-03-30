import { Music } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Music className="h-8 w-8 text-primary" />
          </div>
          <div className="absolute inset-0 rounded-2xl border-2 border-primary/30 animate-ping" />
        </div>
        <p className="text-sm text-muted-foreground font-medium animate-pulse">Loading…</p>
      </div>
    </div>
  );
}
