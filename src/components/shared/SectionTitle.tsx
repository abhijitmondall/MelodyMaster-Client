import { cn } from "@/lib/utils";

interface SectionTitleProps {
  tag?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export default function SectionTitle({ tag, title, subtitle, align = "center", className }: SectionTitleProps) {
  return (
    <div className={cn("space-y-3", align === "center" ? "text-center" : "text-left", className)}>
      {tag && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {tag}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">{title}</h2>
      {subtitle && <p className="text-muted-foreground max-w-2xl mx-auto text-base leading-relaxed">{subtitle}</p>}
    </div>
  );
}
